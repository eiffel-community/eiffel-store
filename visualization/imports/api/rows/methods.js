'use strict';
import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Rows} from "./rows";
import {EventSequences} from "../eventSequences/event-sequences";
import {setProperty} from "../properties/methods";
import {getConfidenceLevelEventName, getTestCaseEventName, getTestSuiteEventName} from "../events/event-types";

function getRowsVersion() {
    return '2.0';
}

function getRowsVersionPropertyName() {
    return 'rows.version';
}

function setRowsVersionPropertyName() {
    setProperty.call({propertyName: getRowsVersionPropertyName(), propertyValue: getRowsVersion()})
}

function invalidateRowsVersionPropertyName() {
    setProperty.call({propertyName: getRowsVersionPropertyName(), propertyValue: undefined})
}

export const rowsVersion = new ValidatedMethod({
    name: 'rowsVersion',
    validate: null,
    run(){
        return getRowsVersion();
    }
});

export const rowsVersionPropertyName = new ValidatedMethod({
    name: 'rowsVersionPropertyName',
    validate: null,
    run(){
        return getRowsVersionPropertyName();
    }
});

export const populateRowsCollection = new ValidatedMethod({
    name: 'populateRowsCollection',
    validate: null,
    run(){
        // return;

        let VALUE_UNDEFINED = '-';

        console.log("Removing old rows collection.");
        invalidateRowsVersionPropertyName();
        Rows.remove({});

        let total = EventSequences.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' sequences from database. Please wait.');
        let sequences = EventSequences.find().fetch();

        _.each(sequences, (sequence) => {
            _.each(sequence.events, (event) => {

                let verdict = VALUE_UNDEFINED;
                if (event.data.outcome !== undefined && event.data.outcome.verdict !== undefined) {
                    verdict = event.data.outcome.verdict
                } else if (event.type === getConfidenceLevelEventName()) {
                    verdict = event.data.value;
                }

                let conclusion = VALUE_UNDEFINED;
                if (event.data.outcome !== undefined && event.data.outcome.conclusion !== undefined) {
                    conclusion = event.data.outcome.conclusion
                } else if (event.type === getConfidenceLevelEventName()) {
                    conclusion = event.data.name;
                }

                Rows.insert({
                    name: event.name,
                    type: event.type,
                    id: event.id,
                    sequenceId: sequence.id,
                    time: event.time,
                    timeExecution: event.time.finished - event.time.started,
                    verdict: verdict,
                    conclusion: conclusion,
                    dev: {
                        // version: getRowsVersion()
                    }
                });
            });


            done++;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Populating rows progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });
        setRowsVersionPropertyName();
        let print = Math.floor((done / total) * 100);
        console.log("Rows collection is populated. [" + print + "%] (" + done + "/" + total + ")");
    }
});

export const getDetailedPlots = new ValidatedMethod({
    name: 'getDetailedPlots',
    validate: null,
    run({eventName, eventType, sequenceIds}){
        if (Meteor.isServer) {
            if (eventName === undefined || eventType === undefined || sequenceIds === undefined) {
                return undefined;
            }

            let rows = Rows.find({name: eventName, sequenceId: {$in: (sequenceIds)}}).fetch();

            rows = rows.sort(function (a, b) {
                return a.time.finished - b.time.finished;
            });

            return {
                plotPassFail: getPassFailPlot(rows, eventType),
                plotExecTime: getExecTimePlot(rows),
            }
        }
    }
});

function getPassFailPlot(rows, eventType) {
    let passString = undefined;
    let failString = undefined;

    if (eventType === getTestCaseEventName() || eventType === getTestSuiteEventName()) {
        passString = 'PASSED';
        failString = 'FAILED';
    } else if (eventType === getConfidenceLevelEventName()) {
        passString = 'SUCCESS';
        failString = 'FAILURE';
    } else {
        return undefined;
    }

    let data = {
        time: {
            start: getTimeString(rows[0].time.started),
            end: getTimeString(rows[rows.length - 1].time.finished),
        }
    };
    // console.log(data);

    let gP = 0;
    let gF = 1;
    let gG = 2;
    let gR = 3;

    let items = [];
    let pass = undefined;
    let fail = undefined;
    let lastPass = undefined;
    let lastFail = undefined;

    items.push({
        x: getTimeString(data.time.start),
        y: 0,
        group: gG,
    });

    _.each(rows, (row) => {
        let y;
        switch (row.verdict) {
            case passString:
                y = 1;
                pass = 1;
                fail = 0;
                break;
            case failString:
                y = -1;
                pass = 0;
                fail = -1;
                break;
            default:
                y = 0;
                pass = 0;
                fail = 0;
                break;
        }
        if (lastPass === undefined) {
            lastPass = pass;
            items.push({
                x: getTimeString(row.time.finished),
                y: lastPass,
                group: gP
            });
        }
        if (lastFail === undefined) {
            lastFail = fail;
            items.push({
                x: getTimeString(row.time.finished),
                y: lastFail,
                group: gF
            });
        }

        items.push({
            x: getTimeString(row.time.finished),
            y: y,
            group: gR
        });

        if (pass !== lastPass) {
            items.push({
                x: getTimeString(row.time.finished),
                y: lastPass,
                group: gP
            });
            items.push({
                x: getTimeString(row.time.finished),
                y: pass,
                group: gP
            });
            lastPass = pass;
        }
        if (fail !== lastFail) {
            items.push({
                x: getTimeString(row.time.finished),
                y: lastFail,
                group: gF
            });
            items.push({
                x: getTimeString(row.time.finished),
                y: fail,
                group: gF
            });
            lastFail = fail;
        }
    });

    items.push({
        x: getTimeString(data.time.end),
        y: lastPass,
        group: gP
    });
    items.push({
        x: getTimeString(data.time.end),
        y: lastFail,
        group: gF
    });

    items.push({
        x: getTimeString(data.time.end),
        y: 0,
        group: gG,
    });

    data.items = items;
    // console.log(data);
    return data;
}

function getExecTimePlot(rows) {
    let data = {
        time: {
            start: getTimeString(rows[0].time.started),
            end: getTimeString(rows[rows.length - 1].time.finished),
        }
    };

    let highest = 1;

    let items = [];

    _.each(rows, (row) => {
        let avgTime = (row.time.finished - row.time.started);
        if (avgTime > highest) {
            highest = avgTime;
        }
        items.push({
            x: getTimeString(row.time.finished),
            y: Math.floor((((Math.random() * 0.1) + 0.9) * avgTime)), // For testing // TODO: remove this
            // y: avgTime,
            group: 0
        });
    });

    data.range = {
        max: highest
    };
    data.items = items;
    return data;
}

function getTimeString(long) {
    // return moment(long).format();
    // return '2014-06-11';
    return new Date(long);
}
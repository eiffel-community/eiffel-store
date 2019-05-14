'use strict';

import { ValidatedMethod } from "meteor/mdg:validated-method";
import { EiffelEvents } from "../eiffelevents/eiffelevents";
import { Events } from "../events/events";
import { getActivityEventName, getRedirectName, getTestCaseEventName, getTestSuiteEventName } from "./event-types";
import {
    isEiffelActivityCanceled,
    isEiffelActivityExecution,
    isEiffelActivityFinished,
    isEiffelActivityStarted,
    isEiffelActivityTriggered,
    isEiffelTestCaseExecution,
    isEiffelTestCaseTriggered,
    isEiffelTestCaseFinished,
    isEiffelTestCaseStarted,
    isEiffelTestSuiteFinished,
    isEiffelTestSuiteStarted
} from "../eiffelevents/eiffeleventTypes";
import { setProperty } from "../properties/methods";

function getEventVersion() {
    return '2.0';
}
function getEventVersionPropertyName() {
    return 'events.version';
}

function setEventVersionProperty() {
    setProperty.call({ propertyName: getEventVersionPropertyName(), propertyValue: getEventVersion() })
}

function invalidateEventVersionProperty() {
    setProperty.call({ propertyName: getEventVersionPropertyName(), propertyValue: undefined })
}

export const eventVersion = new ValidatedMethod({
    name: 'eventVersion',
    validate: null,
    run() {
        return getEventVersion();
    }
});

export const eventVersionPropertyName = new ValidatedMethod({
    name: 'eventVersionPropertyName',
    validate: null,
    run() {
        return getEventVersionPropertyName();
    }
});

export const populateEventsCollection = new ValidatedMethod({
    name: 'populateEventsCollection',
    validate: null,
    run() {
        console.log("Removing old events collection.");
        invalidateEventVersionProperty();
        Events.remove({});

        let total = EiffelEvents.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' eiffel events from database. Please wait.' )
        let events = EiffelEvents.find().fetch();
        let toBePared = {};

        function isToBePared(type) {
            return isEiffelTestCaseStarted(type) || isEiffelTestCaseTriggered(type) || isEiffelTestSuiteStarted(type) || isEiffelActivityTriggered(type);
        }

        _.each(events, (event) => {
            // console.log("The fetched events are: " + event.meta.type)
            if (isToBePared(event.meta.type)) {
                toBePared[event.meta.id] = event;
            }
        });

        _.each(events, (event) => {
<<<<<<< HEAD
             // above event is an object and contain complete event including some additional information of MongoDB
            // we can print this object using console.log(event);
            var EventName=''; // This is temporary variable to hold names of events such as ArtC, TCS5
            // custom data actually represents activity such as ArtC for ArtifectCreated Event. If it is not 
            // explicitely provided in event, we need to write if-else to distinguish events to be able to printed
            // otherwise we can use use name: event.data.customData[0].value
            if(event.meta.type=="EiffelAnnouncementPublishedEvent")
                {
                    EventName="AnnP-".concat(event.data.severity);
                }
            else if (event.meta.type=="EiffelArtifactCreatedEvent")
                {
                    EventName="ArtC3-".concat(event.data.identity);
                }
            else if(event.meta.type=="EiffelArtifactPublishedEvent")
                {
                    EventName="ArtP";
                }
            else if(event.meta.type=="EiffelTestExecutionRecipeCollectionCreatedEvent")
                {
                    EventName="TestExeRecipColl";
                }
            else if(event.meta.type=="EiffelEnvironmentDefinedEvent")
                {
                    EventName="EDef2";
                } 
            else if(event.meta.type=="EiffelActivityTriggeredEvent")
                {
                    EventName="ActT-".concat(event.data.name);
                }
            else if(event.meta.type=="EiffelActivityStartedEvent")
                {
                    EventName="ActS";
                }
            else if(event.meta.type=="EiffelActivityFinishedEvent")
                {
                    EventName="ActF";
                }
            else if(event.meta.type=="EiffelTestSuiteStartedEvent")
                {
                    EventName="TSS";
                }
            else if(event.meta.type=="EiffelTestSuiteFinishedEvent")
                {
                    EventName="TSF";
                }    
            else if(event.meta.type=="EiffelConfidenceLevelModifiedEvent")
                {
                    EventName="CLM";
                }    
            else if(event.meta.type=="EiffelTestCaseStartedEvent")
                {
                    EventName="TCS";
                } 
            else if(event.meta.type=="EiffelTestCaseFinishedEvent")
                {
                    EventName="TCF";
                } 
            else if(event.meta.type=="EiffelTestCaseTriggeredEvent")
                {
                    EventName="TCT";
                }
            else if(event.meta.type=="EiffelActivityCanceledEvent")
                {
                    EventName="ActC";
                }   
            // if (isEiffelTestCaseFinished(event.meta.type)) {
            //     let startEvent = toBePared[event.links[0].target];
            //     // console.log('The eventis-------------------------------: ' + event.links[0].target)
            //     if (startEvent === undefined) {
            //         console.log(startEvent);
            //     }

            //     let regex = /^(\D+)\D(\d)+$/g;
            //     let str = event.data.customData[0].value;
            //     let match = regex.exec(str);

            //     Events.insert({
            //         type: getTestCaseEventName(), // *
            //         name: match[1] + match[2], // *
            //         id: event.meta.id, // *
            //         links: startEvent.links, // *
            //         source: startEvent.meta.source, //*
            //         time: {
            //             started: startEvent.meta.time,
            //             finished: event.meta.time,
            //         },
            //         data: Object.assign(startEvent.data, event.data), // *
            //         dev: {},

            //         startEvent: startEvent.meta.id,
            //         finishEvent: event.meta.id,
            //     })
            // } else 
=======
>>>>>>> 446c3e0d22d0baef45660890b60900ed1203dd47
            if (isEiffelTestSuiteFinished(event.meta.type)) {
                let startEvent = toBePared[event.links[0].target];
                if (startEvent === undefined) {
                    console.log(startEvent);
                }

                let regex = /^(\D+)\D(\d)+$/g;
                let str = EventName;
                let match = regex.exec(str);

                Events.insert({
                    type: getTestSuiteEventName(), // *
                    name: EventName, // *
                    id: event.meta.id, // *
                    version: event.meta.version, // *
                    time: {
                        started: startEvent.meta.time,
                        finished: event.meta.time,
                    },
                    links: startEvent.links, // *
                    source: startEvent.meta.source, //*
                    data: Object.assign(startEvent.data, event.data), // *
                    dev: {},

                    startEvent: startEvent.meta.id,
                    finishEvent: event.meta.id,
                });

                Events.insert({
                    type: getRedirectName(), // *
                    id: startEvent.meta.id,
                    dev: {},
                    version: event.meta.version,
                    target: event.meta.id
                });
            }
            else if (isEiffelActivityCanceled(event.meta.type)) {
                let mergingEvent = toBePared[event.links[0].target];

                let regex = /^(\D+)\D(\d)+$/g;
<<<<<<< HEAD
                let str = EventName;
                console.log("The customData is: " + mergingEvent.data.customData[0].value)
=======
                let str = mergingEvent.data.customData[0].value;
                // console.log("The customData is: " + mergingEvent.data.customData[0].value)
>>>>>>> 446c3e0d22d0baef45660890b60900ed1203dd47
                let match = regex.exec(str);

                Events.insert({
                    type: getActivityEventName(), // *
                    name: EventName, // *
                    id: mergingEvent.meta.id, // *
                    version: event.meta.version, // *
                    links: mergingEvent.links, // *
                    source: mergingEvent.meta.source, //*
                    time: {
                        triggered: mergingEvent.meta.time,
                        canceled: event.meta.time,
                    },
                    data: Object.assign(mergingEvent.data, event.data), // *
                    dev: {},
                });

                Events.insert({
                    type: getRedirectName(), // *
                    id: event.meta.id,
                    dev: {},
                    version: event.meta.version,
                    target: mergingEvent.meta.id
                });
            }
            else if (isEiffelActivityExecution(event.meta.type)) {
                let mergingEvent = toBePared[event.links[0].target]; // We need to check the type of link not take the first link in the list
                // console.log("Activity Margin event: " + mergingEvent.event + " " + event.meta.type + " " + event.meta.id)
                if (mergingEvent.event === undefined) {

                    let regex = /^(\D+)\D(\d)+$/g;
                    let str = EventName;
                    let match = regex.exec(str);

                    mergingEvent.event = {
                        type: getActivityEventName(), // *
                        name: EventName, // *
                        id: mergingEvent.meta.id, // *
                        version: event.meta.version,
                        links: mergingEvent.links, // *
                        source: mergingEvent.meta.source, //*
                        time: {
                            triggered: mergingEvent.meta.time,
                        },
                        data: Object.assign(mergingEvent.data, event.data), // *
                        dev: {},
                    };
                } else {
                    mergingEvent.event.data = Object.assign(mergingEvent.event.data, event.data)
                }

                if (isEiffelActivityStarted(event.meta.type)) {
                    mergingEvent.event.time.started = event.meta.time;
                    mergingEvent.event.startEvent = event.meta.id;
                } else if (isEiffelActivityFinished(event.meta.type)) {
                    mergingEvent.event.time.finished = event.meta.time;
                    mergingEvent.event.finishEvent = event.meta.id;
                }

                Events.insert({
                    type: getRedirectName(), // *
                    id: event.meta.id,
                    dev: {},
                    version: event.meta.version,
                    target: mergingEvent.meta.id
                });

                if (mergingEvent.event.startEvent !== undefined && mergingEvent.event.finishEvent !== undefined) {
                    Events.insert(mergingEvent.event);
                }

            } else if (isEiffelTestCaseExecution(event.meta.type)) {
                let mergingEvent = toBePared[event.links[0].target];
                // console.log("Test Margin event: " + mergingEvent.event + " " + event.meta.type + " " + event.meta.id)
                if (mergingEvent.event === undefined) {

                    let regex = /^(\D+)\D(\d)+$/g;
                    let str = EventName;
                    let match = regex.exec(str);

                    mergingEvent.event = {
                        type: getTestCaseEventName(), // *
                        name: EventName, // *
                        id: mergingEvent.meta.id, // *
                        version: event.meta.version,
                        links: mergingEvent.links, // *
                        source: mergingEvent.meta.source, //*
                        time: {
                            triggered: mergingEvent.meta.time,
                        },
                        data: Object.assign(mergingEvent.data, event.data), // *
                        dev: {},
                    };
                } else {
                    mergingEvent.event.data = Object.assign(mergingEvent.event.data, event.data)
                }

                if (isEiffelTestCaseStarted(event.meta.type)) {
                    // console.log("It should be the testcasestarted event: " + event.meta.type + " " + event.meta.time + " margin " + mergingEvent.event.data)
                    mergingEvent.event.time.started = event.meta.time;
                    mergingEvent.event.startEvent = event.meta.id;
                } else if (isEiffelTestCaseFinished(event.meta.type)) {
                    mergingEvent.event.time.finished = event.meta.time;
                    mergingEvent.event.finishEvent = event.meta.id;
                }

                Events.insert({
                    type: getRedirectName(), // *
                    id: event.meta.id,
                    dev: {},
                    version: event.meta.version,
                    target: mergingEvent.meta.id
                });

                if (mergingEvent.event.startEvent !== undefined && mergingEvent.event.finishEvent !== undefined) {
                    Events.insert(mergingEvent.event);
                }
            }
            else if (isToBePared(event.meta.type)) {
                // No
            }
            else {
                console.log("You are in Event Else");
               // console.log(" and value is " + event.data.customData[0].value);
                Events.insert({
                    type: event.meta.type, // *
                    name: EventName, // *
                    id: event.meta.id, // *
                    version: event.meta.version, // *
                    time: {
                        started: event.meta.time,
                        finished: event.meta.time,
                    },
                    links: event.links, // *
                    source: event.meta.source, // *
                    data: event.data, // *
                    dev: {},
                });
            }

            done++;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Populating events progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        setEventVersionProperty();
        let print = Math.floor((done / total) * 100);
        console.log("Events collection is populated. [" + print + "%] (" + done + "/" + total + ")");
    }
});
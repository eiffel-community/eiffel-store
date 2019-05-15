'use strict';
import {Template} from "meteor/templating";
import {renderGraph} from "./graph.js";

import "./aggregation.html";

import {getAggregatedGraph, getSequenceCount, getTimeSpan} from "/imports/api/eventSequences/methods";

import {Session} from "meteor/session";
import vis from "vis";

let aggregationLock = false;
let aggregationQueued = undefined;
let today = new Date;
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

Template.aggregation.rendered = () => {

    // Runs when document is ready
    $(() => {
        $("time.timeago").timeago();

        let fromInput = $('#date-from'),
            toInput = $('#date-to'),
            limitInput = $('#limit'),
            datepickers = $('.datepicker'),
            defaultLimit = 500,
            defaultFrom = '2015-01-01',
            defaultTo = date,
            fromTimeline = 1420070400000,// from: 1420070400000 2015
            toTimeline = today.getTime();

        // Set default input values
        fromInput.val(defaultFrom);
        toInput.val(defaultTo);
        limitInput.val(defaultLimit);


        // Set up datepicker;
        datepickers.datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: "yy-mm-dd"
        });

        /* TIMELINE */
        let container = document.getElementById('aggregation_time_line');
        // Timebars in the timeline
        let data = new vis.DataSet([{
            id: '1',
            content: 'Start',
            start: defaultFrom
        }, {
            id: '2',
            content: 'End',
            start: defaultTo
        }]);
        let options = {
            height: '150px',
            zoomMin: 3600000, // Setting 10 minutes as minimum zoom
            itemsAlwaysDraggable: true,
            editable: {updateTime: true},
            selectable: true,
            onMoving: function (item, callback) {
                item.content = item.content.replace(/\./g, ' ')
                callback(item);
            },
            onMove: function (item, callback) {
                let limit = parseInt(limitInput.val());
                if (item.id === 1) {
                    if (item.start > options.max || item.start < options.min) {
                        item.start = options.min;
                        item.content = '.......Start';
                    }
                    if (item.start.toLocaleDateString('sv') === fromInput.val()) {
                        callback(item);
                        return;                 //doesnt aggregate if it was changed to the same date
                    }
                    let from = Date.parse(item.start),
                        to = toTimeline;
                    fromInput.val(new Date(item.start).toLocaleDateString('sv'));
                    fromTimeline = Date.parse(item.start);
                    showAggregation(from, to, limit);
                } else if (item.id === 2) {
                    if (item.start > options.max || item.start < options.min) {
                        item.start = options.max;
                        item.content = 'End.......';
                    }
                    if (item.start.toLocaleDateString('sv') === toInput.val()) {
                        callback(item);
                        return;                 //doesnt aggregate if it was changed to the same date
                    }
                    let from = fromTimeline,
                        to = Date.parse(item.start);
                    toInput.val(new Date(item.start).toLocaleDateString('sv'));
                    toTimeline = Date.parse(item.start);
                    showAggregation(from, to, limit);
                }
                callback(item);
            }
        };
        let timeline = new vis.Timeline(container, data, options);
        /*---------------*/

        // Gets the time span for sequences.
        getTimeSpan.call({}, function (error, times) {
            if (error) {
                console.log(error);
            } else {
                options.min = new Date(times.started);
                options.max = new Date(times.finished);
                data.clear();
                data.add({
                    id: 1,
                    content: '.......Start',
                    start: options.min
                });
                data.add({
                    id: 2,
                    content: 'End.......',
                    start: options.max
                });
                timeline.destroy();
                timeline = new vis.Timeline(container, data, options);
                fromInput.val((options.min).toLocaleDateString('sv'));
                toInput.val((options.max).toLocaleDateString('sv'));
            }
        });

        //Aggregates new graph when datepicker changes values
        $('#date-from').change(
            function () {
                let limit = parseInt(limitInput.val());
                fromTimeline = Date.parse(fromInput.val());
                if ((fromTimeline > options.max.getTime()) || (options.min.getTime() > fromTimeline)) {
                    fromTimeline = options.min.getTime();
                    fromInput.val(options.min.toLocaleDateString('sv'));
                }
                let lastToTimeline = data.get(2).start;
                data.clear();
                data = new vis.DataSet([{
                    id: 1,
                    content: 'Start',
                    start: fromTimeline
                }, {
                    id: 2,
                    content: 'End',
                    start: lastToTimeline
                }]);
                timeline.setItems(data);
                showAggregation(fromTimeline, toTimeline, limit);
            });

        $('#date-to').change(
            function () {
                let limit = parseInt(limitInput.val());
                toTimeline = Date.parse(toInput.val());
                if ((options.max.getTime() < toTimeline) || (toTimeline < options.min.getTime())) {
                    toTimeline = options.max.getTime();
                    toInput.val(options.max.toLocaleDateString('sv'));
                }
                let lastFromTimeline = data.get(1).start;
                data.clear();
                data = new vis.DataSet([{
                    id: 1,
                    content: 'Start',
                    start: lastFromTimeline
                }, {
                    id: 2,
                    content: 'End',
                    start: toTimeline
                }]);
                timeline.setItems(data);
                showAggregation(fromTimeline, toTimeline, limit);
            });

        $('#limit').change(
            function () {
                let limit = parseInt(limitInput.val());
                showAggregation(fromTimeline, toTimeline, limit);
            });

        let from = Date.parse(fromInput.val()),
            to = Date.parse(toInput.val()),
            limit = parseInt(limitInput.val());

        showAggregation(from, to, limit);

        // Trigger on change to fetch and render graph
        //fromInput.trigger('change');
    });
};

function showNon() {
    $('#level1_heading_loading').hide();
    $('#level1_heading_updated').hide();

    $('#aggregation_loader').hide();
}

function show(state) {
    showNon();

    switch (state) {
        case 1:
            break;
        case 2:
            $('#aggregation_loader').show();

            $('#level1_heading_loading').show();

            $('#sequences_showing').val('0');
            break;
        case 3:
            $("time#aggregation_updated_time").timeago("update", new Date());

            $('#level1_heading_updated').show();

            $('#sequences_showing').val(Session.get('displayedSequenceIds').length);
            break;
        default:
            break;
    }
}

// Attempt to asynchronously fetch graph from server
function showAggregation(from, to, limit) {
    if (aggregationLock) {
        aggregationQueued = {
            from: from,
            to: to,
            limit: limit,
        };
        return;
    } else {
        aggregationQueued = undefined;
    }
    aggregationLock = true;
    show(2);
    $('html, body').animate({
        scrollTop: $("#aggregation").offset().top - 10
    }, "slow");
    getAggregatedGraph.call({from: from, to: to, limit: limit}, function (error, graph) {
        if (error) {
            console.log(error);
        } else {
            let container = $('#cy-aggregation');
            Session.set('displayedSequenceIds', graph.sequences);
            renderGraph(graph, container, 'aggregation');
            showSequenceCount(graph.sequences.length);
            show(3);
        }
        aggregationLock = false;
        if (aggregationQueued !== undefined) {
            showAggregation(aggregationQueued.from, aggregationQueued.to, aggregationQueued.limit);
        }
    });
}

function showSequenceCount(limit) {
    let container = $('#additional-sequences');
    getSequenceCount.call({}, function (error, count) {
        if (error) {
            console.log(error);
        } else {
            container.val(count - limit);
        }
    });
}
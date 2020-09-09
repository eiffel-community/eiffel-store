'use strict';
import {Template} from "meteor/templating";
import {renderGraph} from "./graph.js";

import "./aggregation.html";

import {getAggregatedGraph, getSequenceCount, getTimeSpan} from "/imports/api/eventSequences/methods";
import {getEventFilterLastSelect, getEventFilter} from "/imports/api/eventFilter/methods";

import {Session} from "meteor/session";
import vis from "vis";

let aggregationLock = false;
let aggregationQueued = undefined;
let today = new Date;
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
let aggregationFilter = {};
let filterLock = false;
let aggregationTimes = {};
let currentNodes = [];
let eventFilters = [];
let eventClash = "include";

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

        // default filter values
        aggregationFilter = {};
        aggregationTimes = {start: fromTimeline, end: toTimeline};

        // Retrieve event filter structure from server.
        getEventFilter.call({}, (error, filters) => {
            if (error) {
                console.log("Error retrieving event filter structure!", error);
            } else {
                eventFilters = filters;
                console.log("Event Filter Structure Retrieved", eventFilters);
            }
        });

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
                    aggregationTimes = {start: from, end: to};
                    showAggregation(from, to, limit, aggregationFilter);
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
                    aggregationTimes = {start: from, end: to};
                    filterLock = false;
                    showAggregation(from, to, limit, aggregationFilter);
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
                console.log("getTimeSpan", times);
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
                aggregationTimes = {start: times.started, end: times.finished};
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
                aggregationTimes = {start: fromTimeline, end: toTimeline};
                filterLock = false;
                showAggregation(fromTimeline, toTimeline, limit, aggregationFilter);
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
                aggregationTimes = {start: fromTimeline, end: toTimeline};
                filterLock = false;
                showAggregation(fromTimeline, toTimeline, limit, aggregationFilter);
            });

        $('#limit').change(
            function () {
                let limit = parseInt(limitInput.val());
                aggregationTimes = {start: fromTimeline, end: toTimeline};
                filterLock = false;
                showAggregation(fromTimeline, toTimeline, limit, aggregationFilter);
            });

        let from = Date.parse(fromInput.val()),
            to = Date.parse(toInput.val()),
            limit = parseInt(limitInput.val());

        aggregationTimes = {start: from, end: to};
        showAggregation(from, to, limit, aggregationFilter);

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
function showAggregation(from, to, limit, filter) {
    if (aggregationLock) {
        aggregationQueued = {
            from: from,
            to: to,
            limit: limit,
            filter: filter,
        };
        return;
    } else {
        aggregationQueued = undefined;
    }
    aggregationLock = true;
    console.log("showAggregation data", {from: from, to: to, limit: limit, filter: filter});
    show(2);
    $('html, body').animate({
        scrollTop: $("#aggregation").offset().top - 10
    }, "slow");
    getAggregatedGraph.call({from: from, to: to, limit: limit, filter: filter}, function (error, graph) {
        if (error) {
            console.log(error);
        } else {
            showSelects(graph.nodes);
            console.log("Graph data", graph);

            // If the "EventWithDiffValue" warn is issued we handle it here by either
            // add the warning or remove it fro the page.
            if (graph.detectedEventWithDiffValue) {
                if (graph.conflicts) {
                    showEventWithDiffValueWarn(graph.conflicts);
                }
            } else {
                let aggWarn = $('#aggregation-warnings');
                aggWarn.empty();
                aggWarn.css({"margin-top": "0px", "margin-bottom": "0px"});
                $('.aggregation-filtering').css("padding-bottom", "10px");
                eventClash = "include";
            }

            let container = $('#cy-aggregation');
            Session.set('displayedSequenceIds', graph.sequences);
            if ((graph.conflicts) && (graph.conflicts.ids) && (filter.eventClash)) {
                Session.set('conflictEvents', graph.conflicts.ids);
                Session.set('conflictLevel', filter.eventClash);
            }
            renderGraph(graph, container, 'aggregation');
            showSequenceCount(graph.sequences.length);
            show(3);
        }
        aggregationLock = false;
        if (aggregationQueued !== undefined) {
            showAggregation(aggregationQueued.from, aggregationQueued.to, aggregationQueued.limit, aggregationQueued.filter);
        }
    });
}

/**
 * Function to show (or update) the "EventWithDiffValue" warning.
 *
 * @param conflicts    object containing at least a values array member and an initial member
 */
function showEventWithDiffValueWarn(conflicts) {
    let options = [{value: "include", text: "Include event(s)"}, {value: "exclude", text: "Exclude event(s)"}, {value: "discard", text: "Discard sequence(s)"}];
    let aggWarn = $('#aggregation-warnings');

    if (document.getElementById("event-diff-warning")) {
        // Exists already, update the value.
        let value = $('#event-diff-warning').val();
        let old = eventClash;
        eventClash = value;
        $('#event-diff-warning-explanation').remove();
        aggWarn.append(createExplanation(conflicts));
        if (eventClash !== old) {
            setFilter(aggregationFilter.chain, aggregationFilter.value);
        }

    } else {
        // Create the warning.
        eventClash = "include";
        aggWarn.css({"background-color": "#f7ebeb", "margin-bottom": "10px", "margin-top": "10px"});
        aggWarn.append(createSelect("event-diff-warning", "Same event type with different values detected in sequence(s)", options));
        aggWarn.children(":first").css({"margin-bottom": "10px", "margin-top": "10px"});
        $('#event-diff-warning').change(() => {
            eventClash = $('#event-diff-warning').val();
            setFilter(aggregationFilter.chain, aggregationFilter.value);
        });
        aggWarn.append(createExplanation(conflicts));
        $('#event-diff-warning-explanation').css({"margin-top": "10px"});
        $('.aggregation-filtering').css("padding-bottom", "0px");
    }
}

/**
 * Function to create the explanation from the conflict structure and return the appropriate HTML code.
 *
 * @param conflicts    object containing at least a values array member and an initial member
 * @return             explanation for the conflict in HTML code
 */
function createExplanation(conflicts) {
    let start = `
        <div id="event-diff-warning-explanation" class="form-group col-md-9" style="margin-top:10px;">
            <p>This warning is caused by events in a sequence of the same type that have different values on the selected attribute above.<br>
            For example, if there is multiple TestCase events in a sequence and each have different outcomes.</p>`;
    let middle = "";
    if (conflicts.values.length > 0) {
        let conflictString = conflicts.values.join("\", \"");
        middle += `<b>These are the current conflicts: [ "${conflictString}" ] with value: "${conflicts.initial}".</b>`;
    }
    if (conflicts.isArray) {
        middle += `<br><b>The selected path ends with an array and the value is not present in some event(s) in the sequence(s). </b>`;
    }
    let end = `
            <p>Include => no change, Remove => removes the conflicting events, Discard => removes the whole sequence.</p>
        </div>`;
    return start + middle + end;
}

/**
 * Function to initialize the select buttons.
 *
 * It reads the nodes and creates the first select button for all the available types.
 * If something significant is changed like limits or a time interval, this function should be called again
 * to re-initialize the first select and only show the available types.
 * This is done automatically by the showAggregation function.
 *
 * @param data  containing nodes in data.label to be used in the first select
 */
function showSelects(data) {
    // Lock to not run this function when it is not needed.
    if (filterLock) {
        return;
    }
    filterLock = true;

    // Sort the nodes.
    let sorted = data.sort((a,b) => {
        let x = a.data.label.toLowerCase();
        let y = b.data.label.toLowerCase();
        return x < y ? - 1 : x > y ? 1 : 0;
    });

    // Check if the nodes have new nodes in the data.
    if ((currentNodes.length === sorted.length) ||
        (JSON.stringify(currentNodes) === JSON.stringify(sorted))) {
        // We already have the nodes, do nothing.
        return;
    }

    // New nodes.
    currentNodes = sorted;
    console.log("New Select Nodes", sorted);

    // Setup the first select.
    let options = [{value: "", text: "Choose..."}];
    sorted.forEach((item) => {
        options.push({value: item.data.id, text : item.data.label});
    });

    // Add the first select.
    $('#aggregation-selects').html(createSelect("type-select", "Type", options));

    // On type select change.
    let select = $('#type-select');
    select.change(() => {
        // Remove all other selects after the first (if any).
        $('#aggregation-selects').children().not(':first').remove();

        // Get the selected value.
        let value = select.val();

        // Reset the graph if value is empty.
        if (value === "") {
            setFilter([]);
            return;
        }

        // Forward the select to the correct function.
        if (value in eventFilters) {
            setFilter([value], null);
            parseEventFilter(value, eventFilters[value], "Filter by", [value], 1);
        }
    });
}

/**
 * Function to parse the structure containing the chainable filters.
 *
 * This function is designed to be recursive and allows for an unlimited amount
 * of chained selects (until the the index value overflows or the stack is full).
 * The structure contained in the data parameter must have at minimum a name member.
 * If the object has a nested member the function will be called again to use that as
 * the new base (which should again contain a new text member).
 *
 * The filter chain (filter parameter) will be correctly updated when an item
 * should either be removed or added and applied to the graph when needed.
 *
 * The index parameter is used to know when to actually remove an element from
 * the chain and also to ensure that a unique HTML id is used in the selects.
 *
 * @param event     name of the selected event (first select)
 * @param data      object containing the chainable structure
 * @param text      text above the select
 * @param filter    array of the current filter chain
 * @param index     current depth of the filtering process
 */
function parseEventFilter(event, data, text, filter, index) {
    // Create options for new select.
    // These are assumed to be in alphabetical order and therefore not sorted here.
    let options = [{value: "", text: "Choose..."}];
    data.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
    for (const item of data) {
        options.push({value: item.name, text: item.name});
    }

    // Create unique select ID and the HTML code for it.
    const id = event + "-" + index.toString() + "-select";
    $('#aggregation-selects').append(createSelect(id, text, options));

    // When the select value is changed.
    $('#' + id).change(() => {
        // Remove redundant selects.
        $('#aggregation-selects div:gt(' + index + ')').remove();

        // Get new value and interpret it.
        const value = $('#' + id).val();
        if (value !== "") {
            for (const item of data) {
                if (item.name === value) {
                    // Remove redundant values from the filter chain.
                    if (filter.length > index) {
                        filter = filter.slice(0, index);
                    }

                    // Add new filter value and apply it.
                    filter.push(value);
                    setFilter(filter, null, ('value' in aggregationFilter));

                    // Depending if there are more nested selects we either call this function again or assume the data
                    // is the last to put in the "value" select (last select to be displayed).
                    // By doing this we can support infinite amount of nested selects if we want to.
                    if (item.nested) {
                        parseEventFilter(event, item.nested, value.toString(), filter, index + 1);
                    } else {
                        addLastSelect(filter, index + 1);
                    }
                    break;
                }
            }
        } else {
            // A value should be pushed before this else is reached (empty is the default value).
            // The index value could be used to check if something is pushed and verify it here.
            filter.pop();
            setFilter(filter, null);
        }
    });
}

/**
 * Function to add and handle the last select button.
 *
 * The selected value before this function is called (last item in filter array) should be used
 * to gather the values for this select. This function gather the information, displays it to
 * the user and handles the event if a value is selected.
 *
 * Note: The function is not intended to be called recursively as the function above and should
 * only be used as the last select.
 *
 * @param filter    array of the current filter chain
 * @param index     current depth of the filtering process
 */
function addLastSelect(filter, index) {
    callbackHelper(getEventFilterLastSelect, {filter: filter}, (list) => {
        let sortedData = list.data.slice().sort((a, b) => {
            if (a > b)
                return 1;
            if (a < b)
                return -1;
            return 0;
        });

        const id = filter.join("-").replace(/ /g, '-');
        let options = [{value: "", text: "Choose..."}];
        for (const item of sortedData) {
            options.push({value: item, text: item});
        }
        $('#aggregation-selects').append(createSelect(id, filter[filter.length - 1], options));
        $('#' + id).change(() => {
            const value = $('#' + id).val();
            if (value !== "") {
                let useVal = value;
                for (let i = 0; i < list.data.length; ++i) {
                    const strVal = list.data[i].toString();
                    if ((strVal === value) && (typeof list.data[i] === 'number')) {
                        useVal = list.data[i];
                        console.log("VALUE IS A NUMBER", strVal);
                        break;
                    }
                }
                if (filter.length > index) {
                    filter = filter.slice(0, index);
                }
                setFilter(filter, useVal);
            } else {
                // A value should be pushed before this else is reached (empty is the default value).
                // The index value could be used to check if something is pushed and verify it here.
                setFilter(filter, null);
            }
        });
    });
}

/**
 * Helper function to easier call the server functions that are dependent on time interval and limits.
 *
 * It gathers the times and limits and makes it easier and results in lower amounts of code.
 * If the callback fails the error will be printed in the console in the browser and if success the third parameter
 * will be called with the resulting data as a parameter.
 *
 * @param func        function to call
 * @param args        arguments besides interval and limit to be used
 * @param callback    function to call if the callback succeeded
 */
function callbackHelper(func, args, callback) {
    args.from = aggregationTimes.start;
    args.to = aggregationTimes.end;
    args.limit = parseInt($('#limit').val());
    func.call(args, (error, data) => {
        if (error) {
            console.log("callbackHelper error (" + func.name + ")", error);
        } else {
            console.log(func.name + " data (callbackHelper)", data);
            callback(data);
        }
    });
}

/**
 * Function to set the new filter which has been selected and to be applied.
 *
 * It creates the structure to be used as a filter and makes sure that the same filter already has been applied.
 * If the filter is new the graph will be updated with the aforementioned filter.
 *
 * @param filter    chain of filters to be applied
 * @param value     the value to filter for
 * @param update    should the graph be updated
 */
function setFilter(filter, value, update = true) {
    let obj = {};
    obj.chain = filter.slice();
    if (value) {
        obj.value = value;
        obj.eventClash = eventClash;
    }

    if (update) {
        aggregationFilter = obj;
        let limit = parseInt($('#limit').val());
        showAggregation(aggregationTimes.start, aggregationTimes.end, limit, aggregationFilter);
    }
}

/**
 * Function to make it easier to create HTML selects.
 *
 * Make sure that the id is unique!
 * That will not be checked by this function at all and is really up to the user to check.
 *
 * Note: The options should be an array of objects with value and text.
 *
 * @param id        Unique id of the select
 * @param label     Text above the select
 * @param options   Values to be used as options in the select.
 * @return          Appropriate HTML code for the select.
 */
function createSelect(id, label, options) {
    let start = `
        <div class="form-group col-md-3">
            <label for="${id}">${label}</label>
            <select class="form-control" id="${id}">`;
    let data = ``;
    for (let i = 0; i < options.length; ++i) {
        let option = options[i];
        data += `<option value="${option.value}" ${i === 0 ? `selected` : ""}>${option.text}</option>`;
    }
    let end = `
            </select>
        </div>`;

    return start + data + end;
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

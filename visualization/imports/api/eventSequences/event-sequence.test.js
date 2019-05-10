/**
 * Created by seba on 2017-04-27.
 */
import {Meteor} from "meteor/meteor";
import {resetDatabase} from "meteor/xolvio:cleaner";

import {EventSequences} from "./event-sequences";
import {getAggregatedGraph, getSequenceCount} from "./methods";

if (Meteor.isServer) {

    describe('getAggregatedGraph', function () {

        beforeEach(function () {
            resetDatabase();
        });

        it('only aggregates events inside time span', function () {
            let from = Date.parse('02/01/2010'),
                to = Date.parse('02/01/2020'),
                limit = 10;

            // Insert event inside time span
            EventSequences.insert({
                id: 1,
                "time.started": from + 1,
                events: [{
                    name: 'name',
                    targets: []

                }]
            });

            // Insert event outside time span
            EventSequences.insert({
                id: 2,
                "time.started": from - 1,
                events: [{
                    name: 'name',
                    targets: []
                }]
            });
            // Call function under test and extract the aggregated events
            let graph = getAggregatedGraph.call({from: from, to: to, limit: limit});
            assert.isTrue(_.contains(graph.sequences, 1));
            assert.isFalse(_.contains(graph.sequences, 2));
        });

        it('does not aggregate over the limit', function () {
            let from = Date.parse('02/01/2010'),
                to = Date.parse('02/01/2020'),
                limit = 10,
                aboveLimit = 11;

            // Insert dummy events into collection
            _.times(aboveLimit, () => EventSequences.insert({
                id: 1,
                "time.started": from + 1,
                events: []
            }));

            // Call function under test and extract the aggregated events
            let graph = getAggregatedGraph.call({from: from, to: to, limit: limit});

            // There are more events then the limit, so the limit should be reached
            assert.equal(graph.sequences.length, limit);
        });

        it('returns empty on an invalid time span', function () {
            let to = Date.parse('02/01/2010'),
                from = Date.parse('02/01/2020'),
                limit = 10;

            EventSequences.insert({
                id: 1,
                "time.started": from + 1,
                events: []
            });

            // Call function under test and extract the aggregated events
            let graph = getAggregatedGraph.call({from: from, to: to, limit: limit});
            assert(graph.sequences.length === 0);
        });
    });

    describe('getSequenceCount', function () {

        beforeEach(function () {
            resetDatabase();
        });

        it('returns correct count', function () {
            let from = Date.parse('02/01/2010'),
                to = Date.parse('02/01/2020'),
                expectedEventCount = 25;

            // Insert events inside time span
            _.times(expectedEventCount, () => EventSequences.insert({
                id: 1,
                "time.started": from + 1,
                events: []
            }));

            let eventCount = getSequenceCount.call();
            assert.equal(eventCount, expectedEventCount);
        });

        it('correctly returns empty when there are no events', function () {
            let from = Date.parse('02/01/2010'),
                to = Date.parse('02/01/2020');

            let eventCount = getSequenceCount.call({from: from, to: to});
            assert.equal(eventCount, 0);
        })
    });
}
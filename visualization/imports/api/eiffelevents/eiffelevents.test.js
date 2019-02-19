'use strict';
/**
 * Created by seba on 2017-03-24.
 */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { faker } from 'meteor/practicalmeteor:faker';

import { EiffelEvents } from './eiffelevents.js';

import {
    isTestEiffelEvent,
    isConfidenceLevelEiffelEvent,
    isFinishedEiffelEvent}
    from './eiffeleventTypes.js';

if (Meteor.isServer) {

    describe('isTestEiffelEvent', function () {
        it('returns true for events containing tests', function () {
            let events = [
                'EiffelTestCaseFinishedEvent',
                'EiffelTestSuiteFinishedEvent'
            ];

            let result = _.every(events, isTestEiffelEvent);
            assert.isTrue(result);
        });


        it('returns false for events not containing tests', function () {
            let events = [
                'EiffelActivityTriggeredEvent',
                'EiffelActivityCanceledEvent',
                'EiffelActivityStartedEvent',
                'EiffelActivityFinishedEvent',
                'EiffelArtifactCreatedEvent',
                'EiffelArtifactPublishedEvent',
                'EiffelArtifactReusedEvent',
                'EiffelConfidenceLevelModifiedEvent',
                'EiffelEnvironmentDefinedEvent',
                'EiffelCompositionDefinedEvent',
                'EiffelSourceChangeCreatedEvent',
                'EiffelSourceChangeSubmittedEvent',
                'EiffelFlowContextDefinedEvent',
                'EiffelTestCaseTriggeredEvent',
                'EiffelTestCaseCanceledEvent',
                'EiffelTestCaseStartedEvent',
                'EiffelTestCaseFinishedEvent',
                'EiffelTestSuiteStartedEvent',
                'EiffelTestSuiteFinishedEvent',
                'EiffelIssueVerifiedEvent',
                'EiffelTestExecutionRecipeCollectionCreatedEvent',
                'EiffelAnnouncementPublishedEvent'
            ];

            let result = _.every(events, !isTestEiffelEvent);
            assert.isTrue(result);
        });
    });

    describe('isConfidenceLevelEiffelEvent', function () {
        it('returns true for confidence level modified event', function () {
            let event = 'EiffelConfidenceLevelModifiedEvent';
            let result = isConfidenceLevelEiffelEvent(event);
            assert.isTrue(result);
        });

        it('returns false for events not being confidence level changed events', function () {
            let events = [
                'EiffelActivityTriggeredEvent',
                'EiffelActivityCanceledEvent',
                'EiffelActivityStartedEvent',
                'EiffelActivityFinishedEvent',
                'EiffelArtifactCreatedEvent',
                'EiffelArtifactPublishedEvent',
                'EiffelArtifactReusedEvent',
                'EiffelEnvironmentDefinedEvent',
                'EiffelCompositionDefinedEvent',
                'EiffelSourceChangeCreatedEvent',
                'EiffelSourceChangeSubmittedEvent',
                'EiffelFlowContextDefinedEvent',
                'EiffelTestCaseTriggeredEvent',
                'EiffelTestCaseCanceledEvent',
                'EiffelTestCaseStartedEvent',
                'EiffelTestCaseFinishedEvent',
                'EiffelTestSuiteStartedEvent',
                'EiffelTestSuiteFinishedEvent',
                'EiffelIssueVerifiedEvent',
                'EiffelTestExecutionRecipeCollectionCreatedEvent',
                'EiffelAnnouncementPublishedEvent'
            ];

            let result = _.every(events, !isConfidenceLevelEiffelEvent);
            assert.isTrue(result);
        });
    });


    describe('isFinishedEiffelEvent', function () {
        it('returns true for events that signal that something finished', function () {
            let events = [
                'EiffelActivityFinishedEvent',
                'EiffelTestCaseFinishedEvent',
                'EiffelTestSuiteFinishedEvent'
            ];
            let result = _.every(events, !isFinishedEiffelEvent);
            assert.isTrue(result);
        });

        it('returns false for events not signaling that something finished', function () {
            let events = [
                'EiffelActivityTriggeredEvent',
                'EiffelActivityCanceledEvent',
                'EiffelActivityStartedEvent',
                'EiffelArtifactCreatedEvent',
                'EiffelArtifactPublishedEvent',
                'EiffelArtifactReusedEvent',
                'EiffelEnvironmentDefinedEvent',
                'EiffelCompositionDefinedEvent',
                'EiffelSourceChangeCreatedEvent',
                'EiffelSourceChangeSubmittedEvent',
                'EiffelFlowContextDefinedEvent',
                'EiffelTestCaseTriggeredEvent',
                'EiffelTestCaseCanceledEvent',
                'EiffelTestCaseStartedEvent',
                'EiffelTestSuiteStartedEvent',
                'EiffelIssueVerifiedEvent',
                'EiffelTestExecutionRecipeCollectionCreatedEvent',
                'EiffelAnnouncementPublishedEvent'
            ];

            let result = _.every(events, !isFinishedEiffelEvent);
            assert.isTrue(result);
        });
    });
}
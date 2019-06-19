'use strict';
export const isTestEiffelEvent = function (eventType) {
    let eventTypesWithTests = [
        'EiffelTestCaseFinishedEvent',
        'EiffelTestSuiteFinishedEvent'
    ];
    return _.contains(eventTypesWithTests, eventType);
};

export const isConfidenceLevelEiffelEvent = function (eventType) {
    return eventType === 'EiffelConfidenceLevelModifiedEvent';
};

export const isFinishedEiffelEvent = function (eventType) {
    let finishedEventTypes = [
        'EiffelActivityFinishedEvent',
        'EiffelTestCaseFinishedEvent',
        'EiffelTestSuiteFinishedEvent'
    ];
    return _.contains(finishedEventTypes, eventType);
};

// TestCase Events
export const isEiffelTestCaseTriggered = function (eventType) {
    let eventTypes = [
        'EiffelTestCaseTriggeredEvent'
    ];
    return _.contains(eventTypes, eventType);
};
export const isEiffelTestCaseStarted = function (eventType) {
    let eventTypes = [
        'EiffelTestCaseStartedEvent'
    ];
    return _.contains(eventTypes, eventType);
};
export const isEiffelTestCaseFinished = function (eventType) {
    let eventTypes = [
        'EiffelTestCaseFinishedEvent'
    ];
    return _.contains(eventTypes, eventType);
};
export const isEiffelTestCaseExecution = function (eventType) {
    let eventTypes = [
        'EiffelTestCaseStartedEvent',
        'EiffelTestCaseFinishedEvent'
    ];
    return _.contains(eventTypes, eventType);
};

// TestSuite Events
export const isEiffelTestSuiteStarted = function (eventType) {
    let eventTypes = [
        'EiffelTestSuiteStartedEvent'
    ];
    return _.contains(eventTypes, eventType);
};
export const isEiffelTestSuiteFinished = function (eventType) {
    let eventTypes = [
        'EiffelTestSuiteFinishedEvent'
    ];
    return _.contains(eventTypes, eventType);
};

// Activity Events
export const isEiffelActivityTriggered = function (eventType) {
    let eventTypes = [
        'EiffelActivityTriggeredEvent'
    ];
    return _.contains(eventTypes, eventType);
};
export const isEiffelActivityCanceled = function (eventType) {
    let eventTypes = [
        'EiffelActivityCanceledEvent'
    ];
    return _.contains(eventTypes, eventType);
};
export const isEiffelActivityStarted = function (eventType) {
    let eventTypes = [
        'EiffelActivityStartedEvent'
    ];
    return _.contains(eventTypes, eventType);
};
export const isEiffelActivityFinished = function (eventType) {
    let eventTypes = [
        'EiffelActivityFinishedEvent'
    ];
    return _.contains(eventTypes, eventType);
};
export const isEiffelActivityExecution = function (eventType) {
    let eventTypes = [
        'EiffelActivityStartedEvent',
        'EiffelActivityFinishedEvent'
    ];
    return _.contains(eventTypes, eventType);
};
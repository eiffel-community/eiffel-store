'use strict';
import {Meteor} from "meteor/meteor";

import {ValidatedMethod} from "meteor/mdg:validated-method";
import {EventFilter} from "./event-filter";
import {EventSequences} from "../eventSequences/event-sequences";

/**
 * Settings object to contain all the various settings and manipulators.
 *
 * include: array of keys that are allowed in the event. keys can be chained with "."
 * to allowed sub-objects in objects.
 *
 * exclude: array of keys that should not be included, chainable keys are available here
 * as well. excludes are checked after include, so sub-levels can be excluded if unwanted
 * in the include.
 *
 * collapse: Included keys can be moved or renamed to be more flexible. This supports chainable
 * keys and (or) end with a ".*" that can move all the content of that sub-level to another
 * location. The empty string "" is the top-level. Each object in the array needs a from and a
 * member to use.
 *
 * nameModifier: Depending on the event JSON the keys might start with a lower case, with the
 * change function the name can be transformed to something else and translated back with the
 * translate function. Current modifier is to uppercase the first letter for a better frontend
 * experience.
 */
const settings = {
    include: ["source", "time.diff", "data"],
    exclude: ["data.outcome.description"],
    collapse: [
        {from: "time.diff", to: "executionTime"},
        {from: "data.*", to: ""},
        {from: "customData.*", to: ""}],
    nameModifier: {
        change: (name) => {
            return name.charAt(0).toUpperCase() + name.slice(1);
        },
        translate: (key) => {
            return key.charAt(0).toLowerCase() + key.slice(1);
        }
    }
};

///////////////////////////////////////////////////////////////////////////////

/**
 * Function for retrieving the available event filter chain structure.
 *
 * The objects in the array will at minimum have a name member and if the chain is nestable the
 * nested member is present which contains the same object structure as explained here. It can
 * thus be handled recursively.
 *
 * @return    array of available event filters
 */
export const getEventFilter = new ValidatedMethod({
    name: 'getEventFilter',
    validate: null,
    run({}){
        let filters = EventFilter.find().fetch();
        if (!filters) {
            throw new Meteor.Error(500, 'Error 500: Not found', 'No such filter exist for ' + name + '!');
        }

        let filterChain = {};
        _.each(filters, (filter) => {
            let chain = [];
            for (const key of Object.keys(filter.options)) {
                chain.push(createEventChainHelper(filter.options, key));
            }
            filterChain[filter.name] = chain;
        });

        return filterChain;
    }
});

/**
 * Function for retrieving the available event filter chain structure.
 *
 * The objects in the array will at minimum have a name member and if the chain is nestable the
 * nested member is present which contains the same object structure as explained here. It can
 * thus be handled recursively.
 *
 * @return    array of available event filters
 */
export const getEventFilterLastSelect = new ValidatedMethod({
    name: 'getEventFilterLastSelect',
    validate: null,
    run({filter, from, to, limit}){
        if (Meteor.isServer) {
            // filter is an array. ex ["ArtP", "Release", "Category"]
            let validate = validateEventFilterChain.call({filter: filter});
            if (!validate.status) {
                throw new Meteor.Error(500, 'Error 500: Not found', validate.msg);
            }

            let data = [];
            const eventName = filter[0];
            let query = {events: {$elemMatch: {name: eventName}}};
            let filterField = validate.data.filterBy;
            query["time.started"] = {$gte: parseInt(from), $lte: parseInt(to)};
            let fields = {"events.name": 1};
            fields["events." + filterField] = 1;
            const options = { sort: { "time.finished": -1 }, limit: limit, fields: fields };

            let sequences = EventSequences.find(query, options).fetch();
            for (const sequence of sequences) {
                for (const event of sequence.events) {
                    let val = getNestedObjValue.call({obj: event, path: filterField});
                    if (val && (event.name === eventName)) {
                        data.push(val);
                    }
                }
            }

            return { data: _.uniq(_.flatten(data)) };
        }
    }
});

/**
 * Function for validating the filter chain.
 *
 * Filter chain must have a size greater or equal to two (2), if the condition is met the rest
 * of the chain will be evaluated with the collection structure (if found).
 *
 * @param filter    array of the filter chain (ex. ["ArtP", "Release", "Category"])
 * @return          object with status member, data, and msg (if status is false)
 */
export const validateEventFilterChain = new ValidatedMethod({
    name: 'validateEventFilterChain',
    validate: null,
    run({filter}){
        if (filter.length < 2) {
            return {status: false, msg: "not enough items in filter chain!"};
        }
        const filterForName = EventFilter.findOne({name: filter[0]}, {});
        if (filterForName) {
            let chain = filter.slice(1, filter.length);
            for (let i = 0; i < chain.length; ++i) {
                chain[i] = settings.nameModifier.translate(chain[i]);
            }
            const data = checkNestedObjKey(filterForName.options, chain.join("."));
            if (data) {
                return {status: true, data: data};
            }
        }

        return {status: false, msg: "no such item exist"};
    }
});

/**
 * Function for retrieving the value at a specific path in an object.
 *
 * Note: This function is special in that it can gather values that are nested in a
 * complex way with either arrays, objects or values. Check the examples below. Use
 * another implementation if this behaviour is unwanted.
 *
 * All examples have a path = "t1.t2.t3.t4".
 * 1. { t1: { t2: { t3: { t4: ["1", "2", "3"] } } } } => ["1", "2", "3"]
 * 2. { t1: { t2: { t3: [ {t4: "11"}, {t4: "21"}, {t4: "31"}] } } } => ["11", "21", "31"]
 * 3. { t1: { t2: [ {t3: [ {t4: "11"}, {t4: "12"}, {t4: "13"} ]}, {t3: [ {t4: "21"}, {t4: "22"}, {t4: "23"} ]} ] } }
 *        => ["11", "12", "13", "21", "22", "23"]
 *
 * @param filter    object to be used
 * @param path      path in "form", ex. "graph.nodes"
 * @return          array of values, if no values are found the array is empty.
 */
export const getNestedObjValue = new ValidatedMethod({
    name: 'getNestedObjValue',
    validate: null,
    run({obj, path}){
        return getNestedObjValueHelper(obj, path);
    }
});

/**
 * Function for searching event sequences to populate the eventFilter collection.
 *
 * Events that are searched must contain a name (like "ActS") other things get
 * collected by the querying the settings global constant and the event.
 *
 * Note: Before calling the function make sure that the eventSequences collection
 * is populated. i.e. run this function (sometime) after populateEventSequences.
 */
export const populateEventFilter = new ValidatedMethod({
    name: 'populateEventFilter',
    validate: null,
    run() {
        console.log("Removing old event filters.");
        EventFilter.remove({});

        let total = EventSequences.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' events from database. Please wait.' )
        let sequences = EventSequences.find().fetch();
        let filters = {};
        _.each(sequences, (sequence) => {
            _.each(sequence.events, (event) => {
                if (("name" in event) && (event.name !== "")) {
                    if (!(event.name in filters)) {
                        filters[event.name] = {};
                        filters[event.name].name = event.name;
                        filters[event.name].options = {};
                    }

                    filters[event.name].options = merge(filters[event.name].options, parseData(event));
                }
            });

            let print = Math.floor((++done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Searching for event filters " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        _.each(filters, (filter) => {
            EventFilter.insert(filter);
        });

        let print = Math.floor((done / total) * 100);
        console.log("Event Filter is populated. [" + print + "%] (" + done + "/" + total + ")");
    }
});

///////////////////////////////////////////////////////////////////////////////

/**
 * Helper function to form the event chain structure.
 *
 * @param obj    object to create the structure from
 * @param key    key to use
 * @return       object chain structure from obj and key
 */
function createEventChainHelper(obj, key) {
    let data = { name: settings.nameModifier.change(key) };
    if (_.isObject(obj[key])) {
        let nestedData = [];
        let objAtKey = obj[key];
        for (const nestedKey of Object.keys(objAtKey)) {
            if (_.isObject(objAtKey[nestedKey])) {
                nestedData.push(createEventChainHelper(obj[key], nestedKey));
            }
        }
        if (nestedData.length > 0) {
            data.nested = nestedData;
        }
    }
    return data;
}

/**
 * Helper function to merge two objects.
 *
 * Since the structure of the filter object is simple and no arrays or other things are
 * present we can get by with a simple helper function to merge with.
 *
 * @param target    destination object
 * @param source    object to be merged
 * @return          merged object
 */
function merge(target, source) {
    Object.keys(source).forEach((key) => {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], merge(target[key], source[key]));
        }
    });

    Object.assign(target || {}, source);
    return target;
}

/**
 * Function for parsing the event and returning a relevant structure for finding members.
 *
 * Note: The settings variable containing the lists is a global constant declared in the
 * top of this file.
 *
 * @param data    event object to be examined
 * @return        relevant object for finding members
 */
function parseData(data) {
    let arr = [];
    Object.keys(data).forEach((key) => {
        arr.push(parseHelper(data[key], key, false));
    });

    let uniqArr = _.flatten(arr.filter((v, i, a) => a.indexOf(v) === i));

    // We need a deep copy here, and since slice is a shallow copy, we need to use another method.
    // The data is guarantied to be transformable to a JSON object since it arrives that way.
    // Javascript specific things, such as, functions are also not likely to be contained in a data object anyways, so this should be fine.
    let locations = JSON.parse(JSON.stringify(uniqArr));

    for (let i = 0; i < uniqArr.length; ++i) {
        settings.collapse.forEach((rule) => {
            if (!rule.from.endsWith("*")) {
                if (uniqArr[i].filterBy.startsWith(rule.from)) {
                    uniqArr[i].filterBy = rule.to + uniqArr[i].filterBy.substring(rule.from.length, uniqArr[i].filterBy.length);
                }
            } else if (rule.from.endsWith(".*") && rule.from.length > 2) {
                let location = rule.from.substring(0, rule.from.length - 2);
                if (uniqArr[i].filterBy.startsWith(location)) {
                    uniqArr[i].filterBy = rule.to + uniqArr[i].filterBy.substring(location.length, uniqArr[i].filterBy.length);
                    if (uniqArr[i].filterBy.charAt(0) === "." && uniqArr[i].filterBy.length > 1) {
                        uniqArr[i].filterBy = uniqArr[i].filterBy.substring(1, uniqArr[i].filterBy.length);
                    }
                }
            }
        });
    }

    let final = {};
    uniqArr.forEach((item, index) => {
        createNestedObjPath(final, item.filterBy, locations[index]);
    });

    return final;
}

/**
 * Function to check if the path is allowed.
 *
 * The path is to be in "dot" form, each nested value should have a dot between them.
 * Ex: { first: { second: { third: { } } } } will be translated to "first.second.third".
 *
 * Note: The settings variable containing the lists is a global constant declared in the
 * top of this file.
 *
 * @param path    path to be examined.
 * @return        true if allowed
 */
function allowPath(path) {
    let allow = false;
    settings.include.forEach((include) => {
        if (!(path.length < include.length)) {
            if (path.startsWith(include)) {
                allow = true;
            }
        }
    });

    settings.exclude.forEach((exclude) => {
        if (!(path.length < exclude.length)) {
            if (path.startsWith(exclude)) {
                allow = false;
            }
        }
    });

    return allow;
}

/**
 * Helper Function to parse an event.
 *
 * The way of finding the keys is quite versatile in that it can search through
 * multiple levels of arrays and create a path to find them. This means that
 * paths might be brought together, in this case it is fine and is the expected
 * behaviour we want from it.
 * Ex. { t1: [ {t2: "1"}, {t3: "1"}] } => { name: "t1", nested: [ { name: "t2" }, { name: "t3" } ] }
 *
 * Note: Be sure to check the behaviour of this function, it is quite unique.
 *
 * The returned array will contain all the possible event chain filter structure.
 * Each object will have a name member and (or) a nested member containing the same structure,
 * the structure is can thus be used recursively.
 *
 * @param data           data to query
 * @param currentPath    the current path
 * @param isArray        specifies if the value in data is an array
 * @return               relevant object for finding members
 */
function parseHelper(data, currentPath, isArray) {
    let arr = [];
    if (_.isArray(data)) {
        data.forEach((item) => {
            arr.push(parseHelper(item, currentPath, true))
        });
    } else if (_.isObject(data)) {
        Object.keys(data).forEach((key) => {
            if (_.isArray(data[key])) {
                data[key].forEach((item) => {
                    arr.push(parseHelper(item, currentPath + "." + key, true))
                });
            } else if (_.isObject(data[key])) {
                arr.push(parseHelper(data[key], currentPath + "." + key, false));
            } else {
                if (allowPath(currentPath + "." + key)) {
                    arr.push({filterBy: currentPath + "." + key, isArray: _.isArray(data[key])});
                }
            }
        });
    } else {
        if (allowPath(currentPath)) {
            arr.push({filterBy: currentPath,  isArray: isArray});
        }
    }
    return arr;
}

/**
 * Helper Function for creating a path in a simple object.
 *
 * Note: The object can only contain other objects and values at the deepest
 * level. Unlike the getNestedObjValueHelper arrays cannot be searched through
 * to create the paths. It basically only for use with the event chain structure.
 *
 * @param obj     object to search
 * @param path    path in "dot" form to check (ex. "graph.nodes")
 * @param data    optional data object to place at path
 */
function createNestedObjPath(obj, path, data = {}) {
    path = path.replace(/\[(\w+)\]/g, '.$1');
    path = path.replace(/^\./, '');
    const arr = path.split('.');
    let nest = obj;
    for (let i = 0; i < arr.length; ++i) {
        let key = arr[i];
        if (key in nest) {
            nest = nest[key];
        } else {
            nest[key] =  (i === arr.length-1) ? data : {};
            nest = nest[key];
        }
    }
}

/**
 * Helper Function for checking if a key exist in an object.
 *
 * Note: The object can only contain other object members, all other
 * types are not supported. It is only supposed to work with the event
 * filter chain structure where the last nested key can have other
 * value types.
 *
 * @param obj     object to search
 * @param path    path in "dot" form to check (ex. "graph.nodes")
 * @return        values at path or null
 */
function checkNestedObjKey(obj, path) {
    path = path.replace(/\[(\w+)\]/g, '.$1');
    path = path.replace(/^\./, '');
    const arr = path.split('.');
    let nest = obj;
    for (let i = 0; i < arr.length; ++i) {
        let key = arr[i];
        if (key in nest) {
            nest = nest[key];
        } else {
            return null;
        }
    }
    return nest;
}

/**
 * Function for retrieving the value at a specific path in an object.
 *
 * Note: See explanation of getNestedObjValue for full details!
 *
 * @param obj       object to be used
 * @param path      path in "form", ex. "graph.nodes"
 * @return          array of values, if no values are found the array is empty.
 */
function getNestedObjValueHelper(obj, path) {
    path = path.replace(/\[(\w+)\]/g, '.$1');
    path = path.replace(/^\./, '');
    const arr = path.split('.');
    let data = [];
    let nest = obj;
    for (let i = 0; i < arr.length; ++i) {
        const key = arr[i];
        if (key in nest) {
            nest = nest[key];
            if ((i === (arr.length - 1))) {
                // Last element is a special case.
                // It is a key in nest so we must handle it here.
                if (_.isArray(nest)) {
                    // Check if the values in the array are objects or values.
                    for (const value of nest) {
                        if (_.isObject(value)) {
                            data.push(getNestedObjValueHelper(value, arr.slice(i).join(".")));
                        } else {
                            data.push(value);
                        }
                    }
                } else if (!(_.isObject(nest))) {
                    // Push only values, not objects (arrays are objects and should be handled above).
                    data.push(nest);
                }
            }
        } else {
            // Key does not exist in the nest object.
            // Is nest an array?
            if (_.isArray(nest)) {
                for (const nestedObj of nest) {
                    data.push(getNestedObjValueHelper(nestedObj, arr.slice(i).join(".")));
                }
                break;
            } else {
                // No value found.
                break;
            }
        }
    }
    return _.uniq(_.flatten(data));
}

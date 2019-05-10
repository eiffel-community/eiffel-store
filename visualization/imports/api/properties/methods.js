'use strict';
import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Properties} from "../properties/properties";


export const getProperties = new ValidatedMethod({
    name: 'getProperties',
    validate: null,
    run(){
        let properties = Properties.findOne();
        if (properties === undefined) {
            properties = {};
            Properties.insert(properties);
        }
        return properties;
    }
});

export const setProperties = new ValidatedMethod({
    name: 'setProperties',
    validate: null,
    run({properties}){
        Properties.remove({});
        Properties.insert(properties);
    }
});

export const getProperty = new ValidatedMethod({
    name: 'getProperty',
    validate: null,
    run({propertyName}){
        let property = getProperties.call();

        let propertyNames = propertyName.split(".");

        for (let i = 0; i < propertyNames.length; i++) {
            if (property[propertyNames[i]] === undefined) {
                return undefined;
            }
            property = property[propertyNames[i]]
        }
        // console.log(property);
        return property;
    }
});

export const setProperty = new ValidatedMethod({
    name: 'setProperty',
    validate: null,
    run({propertyName, propertyValue}){
        let properties = getProperties.call();

        let property = properties;

        let propertyNames = propertyName.split(".");

        for (let i = 0; i < propertyNames.length; i++) {
            if (i + 1 === propertyNames.length) {
                property[propertyNames[i]] = propertyValue;
            } else {
                if (property[propertyNames[i]] === undefined) {
                    property[propertyNames[i]] = {};
                }
                property = property[propertyNames[i]]
            }
        }
        setProperties.call({properties: properties})
    }
});
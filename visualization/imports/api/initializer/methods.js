'use strict';
import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Events} from "../events/events";
import {EventFilter} from "../eventFilter/event-filter";
import {EiffelEvents} from "../eiffelevents/eiffelevents";
import {Rows} from "../rows/rows";
import {populateRowsCollection, rowsVersion, rowsVersionPropertyName} from "../rows/methods";
import {eventVersion, eventVersionPropertyName, populateEventsCollection} from "../events/methods";
import {
    eventSequenceVersion,
    eventSequenceVersionPropertyName,
    populateEventSequences
} from "../eventSequences/methods";
import {EventSequences} from "../eventSequences/event-sequences";
import {getProperty} from "../properties/methods";
import {populateEventFilter} from "../eventFilter/methods";

Meteor.startup(function () {
    switch (true) {
        case (getProperty.call({propertyName: eventVersionPropertyName.call()}) !== eventVersion.call() || Events.find().count() === 0):
            populateEventsCollection.call();
        case (getProperty.call({propertyName: eventSequenceVersionPropertyName.call()}) !== eventSequenceVersion.call() || EventSequences.find().count() === 0):
            populateEventSequences.call();
            populateEventFilter.call();
        case (getProperty.call({propertyName: rowsVersionPropertyName.call()}) !== rowsVersion.call() || Rows.find().count() === 0):
            populateRowsCollection.call();
        default:
            break;
    }


    // Uncomment to force repopulate collections

(function() {
  var initializing = true;
  EiffelEvents.find().observeChanges({
    added: function(id, doc) {
      if (!initializing) {
         //console.log(doc);
            populateEventsCollection.call();
    populateEventSequences.call();
    populateEventFilter.call();
    populateRowsCollection.call();
      }
    },
    changed:function(id,doc){
        if (!initializing) {
        populateEventsCollection.call();
    populateEventSequences.call();
    populateEventFilter.call();
    populateRowsCollection.call();
    }
},
removed:function(id,doc){
    if (!initializing) {
    console.log('EiffelEvents observe removed value function');
       populateEventsCollection.call();
    populateEventSequences.call();
    populateEventFilter.call();
    populateRowsCollection.call();
   }

}

  });
  initializing = false;
})();

var amqp = require('amqp');

var connection = amqp.createConnection({ host: 'localhost:15672' });

process.on('uncaughtException', function(err) {
  console.error(err.stack);
});

connection.on('ready', function () {
    // Use the default 'amq.topic' exchange
    connection.queue('vici', function(q){
        q.bind('#');

        q.subscribe(function (message) {
            console.log(message.data.toString('utf8'));
        });
    });
});
});



export const generateAll = new ValidatedMethod({
    name: 'generateAll',
    validate: null,
    run(){
        populateEventsCollection.call();
        populateEventSequences.call();
        populateEventFilter.call();
        populateRowsCollection.call();
    }
});
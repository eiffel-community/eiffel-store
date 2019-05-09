'use strict';
import {Template} from "meteor/templating";
import "./details.html";
import "./button-row.html";

import {$} from "meteor/jquery";
import dataTablesBootstrap from "datatables.net-bs";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import {Session} from "meteor/session";
import {getDetailedPlots} from "../../api/rows/methods";
import {renderExecTimePlot, renderPassFailPlot} from "./detailed-plots";


dataTablesBootstrap(window, $);

let table = undefined;
let plotPassFail = undefined;
let plotExecTime = undefined;
let plotContainer = undefined;
let loader = undefined;
let graph2dPassFail = undefined;
let graph2dExecTime = undefined;
let waitLock = false;
let plotsLoaded = false;

Template.details.rendered = () => {
    // Runs when document is ready
    $(() => {
        table = $('#details_table');

        plotContainer = $('#plot_container');
        plotPassFail = $('#plot_pass_fail');
        plotExecTime = $('#plot_exec_time');

        loader = $('#details_loader');

        table.show();
        plotContainer.hide();

        loader.hide();

        $(function () {
            $('#details_toggle').change(function () {
                if ($(this).prop('checked')) {
                    table.hide();
                    plotContainer.show();

                    if (waitLock === false && plotsLoaded === false) {
                        renderPlots();
                    }
                } else {
                    table.show();
                    plotContainer.hide();
                }
            });
        });
    });
};

Template.aggregation.events({
    'click .aggregation-tt-btn': function (event) {
        let eventSplit = (event.target.value).split(';');
        Session.set('nodeNameFilter', eventSplit[0]);
        Session.set('nodeTypeFilter', eventSplit[1]);
        $('#table-level2-heading').html(Session.get('nodeNameFilter') + ' ' + Session.get('nodeTypeFilter'),);

        if (graph2dPassFail !== undefined) {
            graph2dPassFail.destroy();
            graph2dPassFail = undefined;
        }
        if (graph2dExecTime !== undefined) {
            graph2dExecTime.destroy();
            graph2dExecTime = undefined;
        }
        plotsLoaded = false;

        $('#details_toggle').prop('checked', false).change();

        $('html, body').animate({
            scrollTop: $("#details").offset().top - 10
        }, "slow");
    }
});

Template.details.onCreated(function () {
    Session.set('nodeTypeFilter');
    Session.set('nodeNameFilter');
    Session.set('displayedSequenceIds');
});
Template.details.helpers({
    selector() {
        return {name: Session.get('nodeNameFilter'), sequenceId: {$in: (Session.get('displayedSequenceIds'))}}
    }
});

function renderPlots() {
    // console.log(Session.get('nodeTypeFilter'));
    waitLock = true;

    plotPassFail.hide();
    plotExecTime.hide();
    loader.show();

    getDetailedPlots.call({
        eventName: Session.get('nodeNameFilter'),
        eventType: Session.get('nodeTypeFilter'),
        sequenceIds: Session.get('displayedSequenceIds')
    }, function (error, data) {
        if (error) {
            console.log(error);
            waitLock = false;
            plotsLoaded = false;
        } else {
            // console.log(data);
            if (data !== undefined) {
                graph2dPassFail = renderPassFailPlot(plotPassFail, data.plotPassFail);
                graph2dExecTime = renderExecTimePlot(plotExecTime, data.plotExecTime);

                if (graph2dPassFail !== undefined) {
                    plotPassFail.show();
                }
                if (graph2dExecTime !== undefined) {
                    plotExecTime.show();
                }
            }
            loader.hide();

            waitLock = false;
            plotsLoaded = true;
        }
    });
}
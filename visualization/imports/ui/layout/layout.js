'use strict';
import "./layout.html";
import "../components/aggregation.html";
import "../components/details.html";
import "../components/eventchain.html";
import "../components/help.html";

import {Meteor} from "meteor/meteor";

$(document).ready(function () {
    $(document.body).attr('data-spy', 'scroll');
    $(document.body).attr('data-target', '#navscrollspy');
    $(document.body).scrollspy({offset: 200});
    $('[data-spy="scroll"]').each(function () {
        $(this).scrollspy('refresh');
    });

});


//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $(document).on('click', 'a.page-scroll', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 10
        }, 300, 'easeInOutExpo');
        event.preventDefault();
    });
});


/**
 *  Meteor event handler to handle events in the layout-template
 */
Template.layout.events({});

let hasShownConnectionInfo = false;

Meteor.autorun(function () {
        let reason = undefined;
        let reconnectTimer = undefined;

        if (!hasShownConnectionInfo && !(Meteor.status().status === "connected")) {
            $('#lost-connection-modal').modal('show');
            hasShownConnectionInfo = true;
            reconnectTimer = setInterval(Meteor.reconnect(), 1000);
            let reason;
            if (Meteor.status().reason === undefined) {
                reason = "<i>Could not resolve reason. You have probably lost your network connection. </i>"
            } else {
                reason = Meteor.status().reason;
            }
            $('#connectionStatus').html('<a href="#" data-toggle="modal" data-target="#lost-connection-modal"><span class="glyphicon glyphicon-ban-circle" aria-hidden="true" style = "color:red"></span></a>');
            $('#lost_connection_modal_body').html("<p> Connection to server lost! Please check your network settings and try again. <br> <br> " + reason + "</p>");
            $('#lost_connection_modal_title').html('<span class="glyphicon glyphicon-remove-circle" aria-hidden="true" style="color:red"></span> Connection error');
        } else if (Meteor.status().status === "connected") {
            clearInterval(reconnectTimer);
            hasShownConnectionInfo = false;
            $('#connectionStatus').html('<a href="#" data-toggle="modal" data-target="#lost-connection-modal"><span class="glyphicon glyphicon-ok-sign" aria-hidden="true" style = "color:green"></span></a>');
            $('#lost_connection_modal_body').html("<p> You are connected to the server. </p>");
            $('#lost_connection_modal_title').html('<span class="glyphicon glyphicon-ok-circle" aria-hidden="true" style="color:green"></span> Connected to server');
        }
    }
);

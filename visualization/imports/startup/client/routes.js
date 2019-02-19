'use strict';
import "../../ui/layout/layout.js";
import "../../ui/pages/home.js";


Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', {
    template: 'home'
});
'use strict';
import cytoscape from "cytoscape";
import cydagre from "cytoscape-dagre";

import "cytoscape-panzoom/cytoscape.js-panzoom.css";
import panzoom from "cytoscape-panzoom";
import cyqtip from "cytoscape-qtip";

cydagre(cytoscape); // register extension
panzoom(cytoscape, $); // register extension
cyqtip(cytoscape); // register extension


/**
 * Renders a graph using Cytoscape, with provided graph
 * in the provided DOM element.
 * Expects provided graph to be in Cytoscape syntax.
 *
 * See http://js.cytoscape.org/ on notes
 * on how to to use Cytoscape.
 */
const PASS_COLOR = '#22b14c';
const FAIL_COLOR = '#af0020';
const ELSE_COLOR = '#666';
function renderGraph(graph, container, level) {
    let cy = cytoscape({

        container: container,

        elements: {
            nodes: graph.nodes,
            edges: graph.edges
        },

        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': ELSE_COLOR,
                    'border-color': '#000',
                    'border-width': '1px',
                    'border-style': 'solid',
                    'label': 'data(label)'
                }
            },

            {
                selector: 'edge',
                style: {
                    'width': 3,
                    // 'line-color': '#ccc',
                    'line-color': '#aeaeae', // TODO: remove this
                    'curve-style': 'bezier', // To make sure edge arrows are supported
                    // 'target-arrow-color': '#ccc',
                    'target-arrow-color': '#aeaeae', // TODO: remove this
                    'target-arrow-shape': 'triangle'
                }
            },
            {
                selector: 'edge[label = "dangerous"]',
                style: {
                    'line-style': 'dashed',
                }
            },

            {
                selector: 'node[label ^= "Act"]', // All nodes with ID Activity
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.95 -0.77 -0.9 -0.82 -0.85 -0.87 -0.8 -0.91 -0.74 -0.94 -0.68 -0.97 -0.62 -0.98 -0.56 -1 -0.5 -1 -0.44 -1 -0.38 -0.98 -0.32 -0.97 -0.26 -0.94 -0.2 -0.91 -0.15 -0.87 -0.1 -0.82 -0.05 -0.77 0.05 -0.67 0.1 -0.62 0.15 -0.57 0.2 -0.53 0.26 -0.5 0.32 -0.47 0.38 -0.46 0.44 -0.44 0.5 -0.44 0.56 -0.44 0.62 -0.46 0.68 -0.47 0.74 -0.5 0.8 -0.53 0.85 -0.57 0.9 -0.62 0.95 -0.67 0.95 0.77 0.9 0.82 0.85 0.87 0.8 0.91 0.74 0.94 0.68 0.97 0.62 0.98 0.56 1 0.5 1 0.44 1 0.38 0.98 0.32 0.97 0.26 0.94 0.2 0.91 0.15 0.87 0.1 0.82 0.05 0.77 -0.05 0.67 -0.1 0.62 -0.15 0.57 -0.2 0.53 -0.26 0.5 -0.32 0.47 -0.38 0.46 -0.44 0.44 -0.5 0.44 -0.56 0.44 -0.62 0.46 -0.68 0.47 -0.74 0.5 -0.8 0.53 -0.85 0.57 -0.9 0.62 -0.95 0.67',
                    'height': 60,
                    'width': 100,
                    'background-color': FAIL_COLOR,
                    'background-position-x': '0px',
                    'background-image': '/images/green.png',
                    'background-height': '100%',
                    'background-width': function (ele) {
                        return (ele.data("successful") * 100 / ele.data("length") ).toString() + '%';
                    }
                }
            },

            {
                selector: 'node[label ^= "AP"]', // All nodes with ID Announcement Published
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.1 0.99 -0.27 0.96 -0.43 0.9 -0.58 0.81 -0.72 0.7 -0.83 0.56 -0.91 0.41 -0.97 0.25 -1 0.07 -0.99 -0.1 -0.96 -0.27 -0.9 -0.43 -0.81 -0.58 -0.7 -0.72 -0.56 -0.83 -0.41 -0.91 -0.25 -0.97 -0.07 -1 0.1 -0.99 0.27 -0.96 0.43 -0.9 0.58 -0.81 0.72 -0.7 0.83 -0.56 0.91 -0.41 0.97 -0.25 1 -0.07 1 0 0.98 0.17 0.94 0.34 0.87 0.5 0.77 0.64 0.64 0.77 0.5 0.87 0.34 0.94 0.17 0.98 0 1 -0.33 0.07 0.51 0.16 0.45 0.1 0.4 0.05 0.29 -0.16 0.22 -0.3 0.19 -0.42 0.17 -0.5 0.16 -0.6 0.17 -0.7 0.18 -0.78 0.26 -0.7 0.3 -0.66 0.35 -0.6 0.41 -0.5 0.47 -0.4 0.49 -0.3 0.52 -0.2 0.53 -0.1 0.54 0 0.52 0.1 0.51 0.16 0.45 0.1 0.4 0.05 0.29 -0.16 0.22 -0.3 0.19 -0.42 0.17 -0.5 0.16 -0.6 0.17 -0.7 0.18 -0.78 -0.46 -0.09 -0.61 -0.05 -0.57 0.13 -0.41 0.09',
                    'height': 90,
                    'width': 90,
                }
            },

            {
                selector: 'node[label ^= "Art"]', // All nodes with ID starting with Art (Artifact)
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '1 -0.4 0 -0.8 -1 -0.4 0 0 1 -0.4 1 0.6 0 1 0 0 0 1 -1 0.6 -1 -0.4 0 0 1 -0.4',
                    'height': 60,
                    'width': 50,
                }
            },

            {
                selector: 'node[label ^= "ArtC"]', // All nodes with ID Artifact Created
                style: {
                    'background-color': '#557e62',
                }
            },

            {
                selector: 'node[label ^= "ArtP"]', // All nodes with ID Artifact Published
                style: {
                    'background-color': '#5a617e',
                }
            },

            {
                selector: 'node[label ^= "ArtR"]', // All nodes with ID Artifact Reused
                style: {
                    'background-color': '#7e5344',
                }
            },

            {
                selector: 'node[label ^= "CDef"]', // All nodes with ID Composition Defined
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '1 0 1 0.6 0.5 0.8 0 0.6 -0.5 0.8 -1 0.6 -1 0 -0.5 -0.2 -0.5 -0.8 0 -1 0.5 -0.8 0.5 -0.2 1 0  0.5 0.2 0.5 0.8 0.5 0.2 0 0 0 0.6 0 0 -0.5 0.2 -0.5 0.8 -0.5 0.2 -1 0 -0.5 -0.2 0 0 0.5 -0.2 0 0 0 -0.6 -0.5 -0.8 0 -0.6 0.5 -0.8 0.5 -0.2 1 0',
                    'height': 70,
                    'width': 70,
                }
            },

            {
                selector: 'node[label ^= "CLM"]', // All nodes with ID Confidence Level
                style: {
                    'background-color': '#fff',
                    'width': '70px',
                    'height': '70x',
                    'pie-size': '100%',
                    'pie-1-background-size': function (ele) {
                        return (ele.data("passed") * 100 / ele.data("length") ).toString() + '%';
                    },
                    'pie-1-background-color': PASS_COLOR,
                    'pie-2-background-size': function (ele) {
                        return (ele.data("failed") * 100 / ele.data("length") ).toString() + '%';
                    },
                    'pie-2-background-color': FAIL_COLOR,
                    'pie-3-background-size': function (ele) {
                        return (ele.data("inconclusive") * 100 / ele.data("length") ).toString() + '%';
                    },
                    'pie-3-background-color': ELSE_COLOR
                }
            },

            {
                selector: 'node[label ^= "CA"]', // All nodes with ID Configuration Applied
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.1 1 -0.17 0.77 -0.32 0.72 -0.53 0.87 -0.68 0.77 -0.6 0.53 -0.68 0.38 -0.94 0.39 -1 0.22 -0.79 0.08 -0.79 -0.08 -1 -0.22 -0.94 -0.39 -0.68 -0.38 -0.6 -0.53 -0.68 -0.77 -0.53 -0.87 -0.32 -0.72 -0.17 -0.77 -0.1 -1 0.1 -1 0.17 -0.77 0.32 -0.72 0.53 -0.87 0.68 -0.77 0.6 -0.53 0.68 -0.38 0.94 -0.39 1 -0.22 0.79 -0.08 0.79 0.08 1 0.22 0.94 0.39 0.68 0.38 0.6 0.53 0.68 0.77 0.53 0.87 0.32 0.72 0.17 0.77 0.1 1',
                    'height': 70,
                    'width': 70,
                    'pie-size': '40%',
                    'pie-1-background-size': '100%',
                    'pie-1-background-color': '#fff',
                }
            },

            {
                selector: 'node[label ^= "EDef"]', // All nodes with ID Environment Defined
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '1 0 0.97 -0.26 0.87 -0.5 0.71 -0.71 0.5 -0.87 0.26 -0.97 ' +
                    '0 -1 -0.26 -0.97 -0.5 -0.87 -0.71 -0.71 -0.87 -0.5 -0.6 -0.6 0 -0.7 0.6 -0.6 0.87 -0.5 0.6 -0.6 0 -0.7 -0.6 -0.6 -0.87 -0.5 -0.97 -0.26 ' +
                    '-1 0 1 0 -1 0 -0.97 0.26 -0.87 0.5 -0.6 0.6 0 0.7 0.6 0.6 0.87 0.5 0.6 0.6 0 0.7 -0.6 0.6 -0.87 0.5 -0.71 0.71 -0.5 0.87 -0.6 0.6 -0.7 0 -0.6 -0.6 -0.5 -0.87 -0.6 -0.6 -0.7 0 -0.6 0.6 -0.5 0.87 -0.26 0.97 ' +
                    '0 1 0 -1 0 1 0.26 0.97 0.5 0.87 0.6 0.6 0.7 0 0.6 -0.6 0.5 -0.87 0.6 -0.6 0.7 0 0.6 0.6 0.5 0.87 0.71 0.71 0.87 0.5 0.97 0.26 1 0',
                    'height': 50,
                    'width': 50,
                    'border-width': '2px',
                }
            },

            {
                selector: 'node[label ^= "SCC"]', // All nodes with ID Source Change Created
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.33 -0.8 -0.35 -0.81 -0.37 -0.83 -0.39 -0.85 -0.4 -0.87 -0.4 -0.9 -0.4 -0.93 -0.39 -0.95 -0.37 -0.97 -0.35 -0.99 -0.33 -1 -0.3 -1 -0.27 -1 -0.25 -0.99 -0.23 -0.97 -0.21 -0.95 -0.2 -0.93 -0.2 -0.9 -0.2 -0.9 -0.2 -0.87 -0.21 -0.85 -0.23 -0.83 -0.25 -0.81 -0.27 -0.8 -0.27 -0.64 0.25 -0.09 0.27 -0.1 0.3 -0.1 0.33 -0.1 0.35 -0.09 0.37 -0.07 0.39 -0.05 0.4 -0.03 0.4 0 0.4 0 0.4 0.03 0.39 0.05 0.37 0.07 0.35 0.09 0.33 0.1 0.3 0.1 0.27 0.1 0.25 0.09 0.23 0.07 0.21 0.05 0.2 0.03 0.2 0 -0.27 -0.5 -0.27 0.5 -0.12 0.5 -0.3 0.7 -0.48 0.5 -0.33 0.5',
                    'height': 70,
                    'width': 70,
                }
            },

            {
                selector: 'node[label ^= "SCS"]', // All nodes with ID Source Change Submitted
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.33 -0.8 -0.35 -0.81 -0.37 -0.83 -0.39 -0.85 -0.4 -0.87 -0.4 -0.9 -0.4 -0.93 -0.39 -0.95 -0.37 -0.97 -0.35 -0.99 -0.33 -1 -0.3 -1 -0.27 -1 -0.25 -0.99 -0.23 -0.97 -0.21 -0.95 -0.2 -0.93 -0.2 -0.9 -0.2 -0.9 -0.2 -0.87 -0.21 -0.85 -0.23 -0.83 -0.25 -0.81 -0.27 -0.8 -0.27 -0.64 0.25 -0.09 0.27 -0.1 0.3 -0.1 0.33 -0.1 0.35 -0.09 0.37 -0.07 0.39 -0.05 0.4 -0.03 0.4 0 0.4 0 0.4 0.03 0.39 0.05 0.37 0.07 0.35 0.09 0.33 0.1 0.3 0.1 0.27 0.1 0.25 0.09 0.25 0.09 -0.27 0.38 -0.27 0.28 0.2 0 -0.27 -0.5 -0.27 0.5 -0.12 0.5 -0.3 0.7 -0.48 0.5 -0.33 0.5',
                    'height': 70,
                    'width': 70,
                }
            },
            {
                selector: 'node[label ^= "ISD"]', // All nodes with ID Source Change Submitted
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '0.6 0.6 -0.87 0.5 -0.71 0.71 -0.5 0.87 -0.6 0.6 -0.7 0 -0.6 -0.6 -0.5 -0.87 -0.6 -0.6 -0.7 0 -0.6 0.6 -0.5 0.87 -0.26 0.97 ' +
                    '0 1 0 -1 0 1 0.26 0.97 0.5 0.87 0.6 0.6 0.7',
                    'height': 70,
                    'width': 70,
                }
            },

            {
                selector: 'node[label ^= "TC"]', // All nodes with ID Test Case
                style: {
                    'background-color': FAIL_COLOR,
                    'shape': 'rectangle',
                    'height': 50,
                    'width': 100,
                    'background-image': '/images/green.png',
                    'background-height': '100%',
                    'background-width': function (ele) {
                        return (ele.data("passed") * 100 / ele.data("length") ).toString() + '%';
                    },
                    'background-position-x': '0px'
                }
            },

            {
                selector: 'node[label ^= "TS"]', // All nodes with ID Test Suite
                style: {
                    'shape': 'rectangle',
                    'border-style': 'double', // solid, dotted, dashed, or double.
                    'border-width': '6px', // The size of the node’s border.
                    'height': 50,
                    'width': 100,
                    'background-color': FAIL_COLOR,
                    'background-position-x': '0px',
                    'background-image': '/images/green.png',
                    'background-height': '100%',
                    'background-width': function (ele) {
                        return (ele.data("passed") * 100 / ele.data("length") ).toString() + '%';
                    },
                }
            },


            {
                selector: 'node[extra = "highlight"]', // Clicked node från navigation from table to event chain
                style: {
                    'border-width': '8px', // The size of the node’s border.
                    'border-color': '#ffea22',
                }
            },
            {
                selector: 'node[extra = "hidden"]', // All nodes that should be hidden
                style: {
                    'opacity': 0
                }
            }
        ],

        layout: {
            name: 'dagre',
            rankDir: 'RL'
        },

        // Higher = faster zoom
        wheelSensitivity: 0.075,
    });

    function toHMS(ms_num) {
        let hours = Math.floor(ms_num / 3600000);
        let minutes = Math.floor((ms_num - (hours * 3600000)) / 60000);
        let seconds = Math.floor((ms_num - (hours * 3600000) - (minutes * 60000)) / 1000);
        let ms = Math.floor(ms_num - (hours * 3600000) - (minutes * 60000) - (seconds * 1000));

        return hours + 'h ' + minutes + 'm ' + seconds + 's ' + ms + 'ms';
    }

    function getTooltipContent(nodeData) {
        let nodeLabel = nodeData.label;
        switch (true) {
            case /Act/.test(nodeLabel):
                return '<h4>' + nodeLabel + '</h4>' +
                    getTooltipButton(nodeData) +
                    '<table class="table table-bordered">' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' + // table header
                    '<tr class="success"><td>Successful</td><td class="td-right">' + nodeData.successful + '</td><td class="td-right">' + Math.round(10 * (nodeData.successful / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Unsuccessful</td><td class="td-right">' + nodeData.unsuccessful + '</td><td class="td-right">' + Math.round(10 * (nodeData.unsuccessful / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Failed</td><td class="td-right">' + nodeData.failed + '</td><td class="td-right">' + Math.round(10 * (nodeData.failed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Aborted</td><td class="td-right">' + nodeData.aborted + '</td><td class="td-right">' + Math.round(10 * (nodeData.aborted / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Timed out</td><td class="td-right">' + nodeData.timedOut + '</td><td class="td-right">' + Math.round(10 * (nodeData.timedOut / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.round(10 * (nodeData.inconclusive / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '<tr class="info"><td>Avg queue time</td><td colspan="2" class="td-right">' + toHMS(nodeData.avgQueueTime) + '</td></tr>' +
                    '<tr class="info"><td>Avg run time</td><td colspan="2" class="td-right">' + toHMS(nodeData.avgRunTime) + '</td></tr>' +
                    '</table>';
            case /AP/.test(nodeLabel):
                return '<h4>' + nodeLabel + '</h4>' +
                    getTooltipButton(nodeData) +
                    '<table class="table table-bordered">' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' + // table header
                    '<tr><td>Minor</td><td class="td-right">' + nodeData.minor + '</td><td class="td-right">' + Math.round(10 * (nodeData.minor / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Major</td><td class="td-right">' + nodeData.major + '</td><td class="td-right">' + Math.round(10 * (nodeData.major / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Critical</td><td class="td-right">' + nodeData.critical + '</td><td class="td-right">' + Math.round(10 * (nodeData.critical / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Blocker</td><td class="td-right">' + nodeData.blocker + '</td><td class="td-right">' + Math.round(10 * (nodeData.blocker / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Closed</td><td class="td-right">' + nodeData.closed + '</td><td class="td-right">' + Math.round(10 * (nodeData.closed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Canceled</td><td class="td-right">' + nodeData.canceled + '</td><td class="td-right">' + Math.round(10 * (nodeData.canceled / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>';
            case /CLM/.test(nodeLabel):
                return '<h4>' + nodeLabel + '</h4>' +
                    getTooltipButton(nodeData) +
                    '<table class="table table-bordered">' +
                    '<tr><td colspan="3"><em>' + nodeData.name + '</em></td></tr>' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' + // table header
                    '<tr class="success"><td>Passed</td><td class="td-right">' + nodeData.passed + '</td><td class="td-right">' + Math.round(10 * (nodeData.passed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr class="danger"><td>Failed</td><td class="td-right">' + nodeData.failed + '</td><td class="td-right">' + Math.round(10 * (nodeData.failed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.round(10 * (nodeData.inconclusive / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>';
            case /IV/.test(nodeLabel):
                return '<h4>' + nodeLabel + '</h4>' +
                    getTooltipButton(nodeData) +
                    '<table class="table table-bordered">' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' + // table header
                    '<tr class="info"><td>Success</td><td class="td-right">' + nodeData.success + '</td><td class="td-right">' + Math.round(10 * (nodeData.passed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr class="info"><td>Failure</td><td class="td-right">' + nodeData.failure + '</td><td class="td-right">' + Math.round(10 * (nodeData.failure / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr class="info"><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.round(10 * (nodeData.inconclusive / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Bug</td><td class="td-right">' + nodeData.bug + '</td><td class="td-right">' + Math.round(10 * (nodeData.bug / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Improvement</td><td class="td-right">' + nodeData.improvement + '</td><td class="td-right">' + Math.round(10 * (nodeData.improvement / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Feature</td><td class="td-right">' + nodeData.feature + '</td><td class="td-right">' + Math.round(10 * (nodeData.feature / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Work Item</td><td class="td-right">' + nodeData.workItem + '</td><td class="td-right">' + Math.round(10 * (nodeData.workItem / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Requirement</td><td class="td-right">' + nodeData.requirement + '</td><td class="td-right">' + Math.round(10 * (nodeData.requirement / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Other</td><td class="td-right">' + nodeData.other + '</td><td class="td-right">' + Math.round(10 * (nodeData.other / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>';
            case /TC/.test(nodeLabel):                                              // Checks if node_id starts with 'TSF'
                return '<h4>' + nodeLabel + '</h4>' +           // Tooltip-header (Node-ID)
                    getTooltipButton(nodeData) +          // Button will take user to level 2 - 'details'
                    '<table class="table table-bordered">' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' +    // Table-header
                    '<tr class="success"><td>Passed</td><td class="td-right">' + nodeData.passed + '</td><td class="td-right">' + Math.round(10 * (nodeData.passed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr class="danger"><td>Failed</td><td class="td-right">' + nodeData.failed + '</td><td class="td-right">' + Math.round(10 * (nodeData.failed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.round(10 * (nodeData.inconclusive / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '<tr class="info"><td>Avg queue time</td><td colspan="2" class="td-right">' + toHMS(nodeData.avgQueueTime) + '</td></tr>' +
                    '<tr class="info"><td>Avg run time</td><td colspan="2" class="td-right">' + toHMS(nodeData.avgRunTime) + '</td></tr>' +
                    '</table>'; // Row 3 - OTHER
            case /TS/.test(nodeLabel):                                              // Checks if node_id starts with 'TSF'
                return '<h4>' + nodeLabel + '</h4>' +           // Tooltip-header (Node-ID)
                    getTooltipButton(nodeData) +          // Button will take user to level 2 - 'details'
                    '<table class="table table-bordered">' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' + // table header
                    '<tr class="success"><td>Passed</td><td class="td-right">' + nodeData.passed + '</td><td class="td-right">' + Math.round(10 * (nodeData.passed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr class="danger"><td>Failed</td><td class="td-right">' + nodeData.failed + '</td><td class="td-right">' + Math.round(10 * (nodeData.failed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.round(10 * (nodeData.inconclusive / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '<tr class="info"><td>Avg run time</td><td colspan="2" class="td-right">' + toHMS(nodeData.avgRunTime) + '</td></tr>' +
                    '</table>'; // Row 3 - OTHER
            default:
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    getTooltipButton(nodeData) +
                    '<table class="table table-bordered">' +
                    '<tr><td>Total no. of events</td><td class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>';

        }
    }

    function getLevelThreeContent(nodeData) {
        let nodeLabel = nodeData.label;
        let possible_jenkins = nodeData.eventData.executionUri;
        switch (true) {
            case /Act/.test(nodeLabel):
                let html = '<h4>' + nodeLabel + '</h4>' +
                    '<table class="table table-bordered">' +
                    '<tr><td>ID</td><td class="td-right">' + nodeData.id + '</td></tr>' +
                    '<tr><td>Conclusion</td><td>' + nodeData.conclusion + '</td></tr>' +
                    '<tr><td>Execution type</td><td>' + nodeData.executionType + '</td></tr>' +
                    '<tr><td>Queue time</td><td>' + toHMS(nodeData.timeStarted - nodeData.timeTriggered) + '</td></tr>' +
                    '<tr><td>Execution time</td><td>' + toHMS(nodeData.timeFinished - nodeData.timeStarted) + '</td></tr>';
                if (typeof possible_jenkins === 'string' || possible_jenkins instanceof String) {
                    //this should show a stringified link to a homepage once data exists
                    html += '<tr><td>Execution page</td><td>' + '<a target="_blank" href= "http://' +
                        possible_jenkins + '"> ' + possible_jenkins + '</a>' + '</td></tr>';
                }
                html += '<tr><td>No of triggers</td><td>' + nodeData.triggersLength + '</td></tr>' +
                    _.reduce(nodeData.triggers, (memo, trigger) => {
                        return memo + '<tr><td>Trigger type</td><td>' + trigger.type + '</td></tr>';
                    }, "");
                html += '<tr><td>Version</td><td class="td-right">' + nodeData.version + '</td></tr>' + '</table>'; // Row 3 - OTHER
                return html;
            case /AP/.test(nodeLabel):
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    '<table class="table table-bordered">' +
                    '<tr><td>ID</td><td class="td-right">' + nodeData.id + '</td></tr>' +
                    '<tr><th colspan="2">nodeData.heading</th></tr>' +
                    '<tr><td>Severity</td><td class="td-right">' + nodeData.severity + '</td></tr>' +
                    '<tr><td colspan="2">nodeData.body</td></tr>' +
                    '<tr><td>Version</td><td class="td-right">' + nodeData.version + '</td></tr>' +
                    '</table>';
            case /ArtC/.test(nodeLabel):
                if (nodeData.gav_groupId !== undefined) {
                    return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                        '<table class="table table-bordered">' +
                        '<tr><td>Name</td><td class="td-right">' + nodeData.name + '</td></tr>' +
                        '<tr><td>ID</td><td class="td-right">' + nodeData.id + '</td></tr>' +
                        '<tr><td>GAV Group ID</td><td class="td-right">' + nodeData.gav_groupId + '</td></tr>' +
                        '<tr><td>GAV Artifact ID</td><td class="td-right">' + nodeData.gav_artifactId + '</td></tr>' +
                        '<tr><td>GAV Version</td><td class="td-right">' + nodeData.gav_version + '</td></tr>' +
                        '</table>';
                } else {
                    return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                        '<table class="table table-bordered">' +
                        '<tr><td>Source Name</td><td class="td-right">' + nodeData.name + '</td></tr>' +
                        '<tr><td>ID</td><td class="td-right">' + nodeData.id + '</td></tr>' +
                        '<tr><td>Identity</td><td class="td-right">' + nodeData.identity + '</td></tr>' +
                        '<tr><td>Version</td><td class="td-right">' + nodeData.version + '</td></tr>' +
                        '</table>';
                }        
            case /ArtP/.test(nodeLabel):
                html = '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    '<table class="table table-bordered">' +
                    '<tr><td>ID</td><td class="td-right">' + nodeData.id + '</td></tr>' +
                    '<tr><th colspan="2">Locations</th></tr>';
                html += _.reduce(nodeData.locations, (memo, location) => {
                    return memo + '<tr><td>Type</td><td class="td-right">' + location.type + '</td></tr>';
                }, "");
                html += '<tr><td>No of locations</td><td class="td-right">' + nodeData.location_length + '</td></tr>'
                    + '</table>';
                return html;
            case /CDef/.test(nodeLabel):
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    '<table class="table table-bordered">' +
                    '<tr><td>Name</td><td class="td-right">' + nodeData.name + '</td></tr>' +
                    '<tr><td>ID</td><td class="td-right">' + nodeData.id + '</td></tr>' +
                    '<tr><td>Version</td><td class="td-right">' + nodeData.version + '</td></tr>' +
                    '</table>';
            case /CLM/.test(nodeLabel):
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    '<table class="table table-bordered">' +
                    '<tr><td>Name</td><td class="td-right">' + nodeData.name + '</td></tr>' +
                    '<tr><td>ID</td><td class="td-right">' + nodeData.id + '</td></tr>' +
                    '<tr><td>Value</td><td class="td-right">' + nodeData.value + '</td></tr>' +
                    '<tr><td>Issuer ID</td><td class="td-right">' + nodeData.issuer_id + '</td></tr>' +
                    '<tr><td>Version</td><td class="td-right">' + nodeData.version + '</td></tr>' +
                    '</table>';
            case /CA/.test(nodeLabel):
                html = '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    '<table class="table table-bordered">' +
                    '<tr><th colspan="2">Items</th></tr>' +
                    '<tr><th>Name</th><th>Type</th></tr>' +
                    '<tr><td>ID</td><td class="td">' + nodeData.id + '</td></tr>';
                html += _.each(nodeData.items, (item) => {
                    return '<tr><td>' + item.name + '</td><td>' + item.type + '</td></tr>';
                });
                html += '<tr><td>No of items</td><td class="td-right">' + nodeData.items_length + '</td></tr>'
                    + '<tr><td>Version</td><td class="td-right">' + nodeData.version + '</td></tr>' + '</table>';
                return html;
            case /EDef/.test(nodeLabel):
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    '<table class="table table-bordered">' +
                    '<tr><td>Name</td><td class="td-right">' + nodeData.name + '</td></tr>' +
                    '<tr><td>ID</td><td class="td-right">' + nodeData.id + '</td></tr>' +
                    '<tr><td>Version</td><td class="td-right">' + nodeData.version + '</td></tr>' +
                    '</table>';
            case /SCC/.test(nodeLabel):
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    '<table class="table table-bordered">' +
                    '<tr><td>Author name</td><td class="td-right">' + nodeData.authorName + '</td></tr>' +
                    '<tr><td>Author ID</td><td class="td-right">' + nodeData.authorId + '</td></tr>' +
                    '<tr><td>Author group</td><td class="td-right">' + nodeData.authorGroup + '</td></tr>' +
                    '<tr><td>Change tracker</td><td class="td-right">' + nodeData.changeTracker + '</td></tr>' +
                    '<tr><td>Change ID</td><td class="td-right">' + nodeData.changeId + '</td></tr>' +
                    '<tr><td>Git repository</td><td class="td-right">' + nodeData.gitRepoName + '</td></tr>' +
                    '<tr><td>Git branch</td><td class="td-right">' + nodeData.gitBranch + '</td></tr>' +
                    '<tr><td>Version</td><td class="td-right">' + nodeData.version + '</td></tr>' +
                    //'<tr><td>Git commit ID</td><td class="td-right">' + nodeData.gitCommitId + '</td></tr>' +
                    '</table>';
            case /SCS/.test(nodeLabel):
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    '<table class="table table-bordered">' +
                    '<tr><td>Submitter name</td><td class="td-right">' + nodeData.submitterName + '</td></tr>' +
                    '<tr><td>Submitter ID</td><td class="td-right">' + nodeData.submitterId + '</td></tr>' +
                    '<tr><td>Submitter group</td><td class="td-right">' + nodeData.submitterGroup + '</td></tr>' +
                    '<tr><td>Change tracker</td><td class="td-right">' + nodeData.changeTracker + '</td></tr>' +
                    '<tr><td>Change ID</td><td class="td-right">' + nodeData.changeId + '</td></tr>' +
                    '<tr><td>Git repository</td><td class="td-right">' + nodeData.gitRepoName + '</td></tr>' +
                    '<tr><td>Git branch</td><td class="td-right">' + nodeData.gitBranch + '</td></tr>' +
                    '<tr><td>Version</td><td class="td-right">' + nodeData.version + '</td></tr>' +
                    //'<tr><td>Git commit ID</td><td class="td-right">' + nodeData.gitCommitId + '</td></tr>' +
                    '</table>';
            case /TC/.test(nodeLabel):
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    '<table class="table table-bordered">' +
                    '<tr><td>ID</td><td class="td">' + nodeData.id + '</td></tr>' +
                    '<tr><td>Test Case ID</td><td>' + nodeData.testCaseId + '</td></tr>' +
                    '<tr><td>Verdict</td><td>' + nodeData.verdict + '</td></tr>' +
                    '<tr><td>Conclusion</td><td>' + nodeData.conclusion + '</td></tr>' +
                    '<tr><td>Executor</td><td>' + nodeData.executor + '</td></tr>' +
                    '<tr><td>Tracker</td><td>' + nodeData.tracker + '</td></tr>' +
                    '<tr><td>Execution type</td><td>' + nodeData.executionType + '</td></tr>' +
                    '<tr><td>Queue time</td><td>' + toHMS(nodeData.timeStarted - nodeData.timeTriggered) + '</td></tr>' +
                    '<tr><td>Execution time</td><td>' + toHMS(nodeData.timeFinished - nodeData.timeStarted) + '</td></tr>' +
                    '<tr><td>Description</td><td>' + nodeData.outcomeDescription + '</td></tr>' +
                    '<tr><td>Version</td><td class="td-right">' + nodeData.version + '</td></tr>' +
                    '</table>';
            case /TS/.test(nodeLabel):
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    '<table class="table table-bordered">' +
                    '<tr><td>Name</td><td>' + nodeData.name + '</td></tr>' +
                    '<tr><td>ID</td><td class="td">' + nodeData.id + '</td></tr>' +
                    '<tr><td>Verdict</td><td>' + nodeData.verdict + '</td></tr>' +
                    '<tr><td>Conclusion</td><td>' + nodeData.conclusion + '</td></tr>' +
                    '<tr><td>Description</td><td>' + nodeData.outcomeDescription + '</td></tr>' +
                    '<tr><td>Execution time</td><td>' + toHMS(nodeData.timeFinished - nodeData.timeStarted) + '</td></tr>' +
                    '<tr><td>Version</td><td class="td-right">' + nodeData.version + '</td></tr>' +
                    '</table>';

            default:
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    //getTooltipButton(nodeData.id) +
                    '<table class="table table-bordered">' +
                    '<tr><td>Total no. of events</td><td class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>';

        }
    }

    function getTooltipButton(nodeData) {
        return '<button type="button" class="btn btn-block btn-info aggregation-tt-btn" value="' + nodeData.id + ';' + nodeData.type + '"> Show all events </button>'
    }

    cy.nodes().qtip({
        content: function () {
            if (level === "aggregation") {
                return getTooltipContent(this.data()); // Ändra här för att ändra vad som ska vara i den
            } else if (level === "eventchain") {
                return getLevelThreeContent(this.data());
            }
        },
        position: {
            my: 'bottom center',
            at: 'top center',
            container: $('#aggregation-tt')
        },
        show: {
            //event: 'mouseover',
            event: 'click', //om den ska trigga på klick istället
            solo: true,
        },
        hide: {
            //event: 'mouseout'
            event: 'unfocus'
        },
        style: {
            classes: 'qtip-viswiz qtip-shadow',
            tip: {
                width: 16,
                height: 8
            }
        },
    });

    // Settings for panzoom
    let defaults = {
        zoomFactor: 0.05, // zoom factor per zoom tick
        zoomDelay: 45, // how many ms between zoom ticks
        minZoom: 0.1, // min zoom level
        maxZoom: 10, // max zoom level
        fitPadding: 50, // padding when fitting
        panSpeed: 10, // how many ms in between pan ticks
        panDistance: 10, // max pan distance per tick
        panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
        panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
        panInactiveArea: 8, // radius of inactive area in pan drag box
        panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
        zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
        fitSelector: undefined, // selector of elements to fit
        animateOnFit: function () { // whether to animate on fit
            return false;
        },
        fitAnimationDuration: 1000, // duration of animation on fit

        // icon class names
        sliderHandleIcon: 'fa fa-minus',
        zoomInIcon: 'fa fa-plus',
        zoomOutIcon: 'fa fa-minus',
        resetIcon: 'fa fa-expand'
    };

    cy.panzoom(defaults);

    // cy.nodes().ungrabify();     //Makes nodes ungrabbable
    cy.maxZoom(10); //same setting as panzoom for Krav 2
    cy.minZoom(0.1); //same setting as panzoom for Krav 2
}

export {renderGraph}
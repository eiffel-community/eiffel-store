import vis from "vis";

function renderPassFailPlot(graph, data) {
    if (graph === undefined || data === undefined) {
        return undefined;
    }

    let groups = new vis.DataSet();

    let borderWidth = 1;

    groups.add({
        id: 0,
        content: 'Passed',
        style: 'stroke:green;stroke-width:' + borderWidth + ';',
        options: {
            drawPoints: false,
            shaded: {
                orientation: 'zero',
                style: 'fill:green;'
            }
        }
    });

    groups.add({
        id: 1,
        content: 'Failed',
        style: 'stroke:red;stroke-width:' + borderWidth + ';',
        options: {
            drawPoints: false,
            shaded: {
                orientation: 'zero',
                style: 'fill:red;'
            }
        }
    });

    let groundColor = '#bfbfbf';

    groups.add({
        id: 2,
        content: 'Ground',
        style: 'stroke:' + groundColor + ';stroke-width:' + (borderWidth + 1) + ';',
        options: {
            drawPoints: false,
        }
    });

    groups.add({
        id: 3,
        content: 'Result',
        style: 'stroke:black;stroke-width:' + borderWidth + ';',
        options: {
            style: 'points',
            drawPoints: {
                styles: 'stroke:black;fill:none;',
                size: 4,
            }
        },
    });

    let container = graph[0];

    let dataset = new vis.DataSet(data.items);
    let options = {
        start: data.time.start,
        end: data.time.end,
        dataAxis: {
            left: {
                format: function (value) {
                    if (value === Math.floor(value)) {
                        switch (value) {
                            case -1:
                                return 'Failed';
                            case 0:
                                return 'Inconclusive';
                            case 1:
                                return 'Passed';
                            default:
                                break;
                        }
                    }
                    return '';
                },
                range: {
                    min: -1.25,
                    max: 1.25,
                }
            }
        },
        interpolation: false,
        sort: false,
        graphHeight: '200px',


    };
    let Graph2d = new vis.Graph2d(container, dataset, groups, options);
    // console.log(Graph2d);
    return Graph2d;
}

function renderExecTimePlot(graph, data) {
    if (graph === undefined || data === undefined) {
        return undefined;
    }

    if (data.items.length === 0) {
        return undefined;
    }

    let groups = new vis.DataSet();

    let borderWidth = 1;

    groups.add({
        id: 0,
        content: 'Execution time (ms)',
        style: 'stroke:black;stroke-width:' + borderWidth + ';',
        options: {
            drawPoints: {
                styles: 'stroke:black;fill:none;',
                size: 4,
            },
            shaded: {
                orientation: 'zero',
                style: 'fill:black;'
            }
        },
    });

    let container = graph[0];

    let dataset = new vis.DataSet(data.items);
    let options = {
        start: data.time.start,
        end: data.time.end,
        dataAxis: {
            left: {
                format: function (value) {
                    if (Math.floor(value) === value) {
                        return value;
                    }
                    return '';
                },
                range: {
                    max: (data.range.max * 1.15),
                    min: 0,
                }
            }
        },
        legend: {
            enabled: true,
        },
        sort: true,
        graphHeight: '400px',
    };
    let Graph2d = new vis.Graph2d(container, dataset, groups, options);
    // console.log(Graph2d);
    return Graph2d;
}

export {renderPassFailPlot, renderExecTimePlot}
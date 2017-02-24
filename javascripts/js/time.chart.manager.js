var idv = idv || {};
idv.timeChartManager = idv.timeChartManager || {};
idv.timeChartManager.timeChart = null;
idv.timeChartManager.dataColumnCount = 0;
idv.timeChartManager.chartTypes = {}; // {key=>type}
idv.timeChartManager.chartColumns = [];
idv.timeChartManager.charts = [
    {
        name: 'chart1',
        chartColumns: []
    }
];
idv.timeChartManager.xAxis = [
    'year'
];
idv.timeChartManager.wellAverage = {
    data: ['average'],
    color: '#000'

};
// idv.timeChartManager.xAxis = [
//     'year',
//     '2010-01-01', '1996-01-01', '1997-01-01', '1998-01-01', '1999-01-01', '2000-01-01', '2001-01-01', '2002-01-01',
//     '2003-01-01', '2004-01-01', '2005-01-01', '2006-01-01', '2007-01-01', '2008-01-01', '2009-01-01', '2010-01-01',
//     '2011-01-01', '2012-01-01', '2013-01-01', '2014-01-01', '2015-01-01', '2016-01-01'
// ];
idv.timeChartManager.measurementDates = {};
idv.timeChartManager.measurementDateCount = 0;

idv.timeChartManager.setupTimeAxis = function() {
    var myDates = [];
    var tmpDate;
    var parseDate = d3.time.format("%Y-%m-%d").parse;
    var format = d3.time.format("%Y-%m-%d");

    for(var key in idv.timeChartManager.measurementDates) {
        if (!idv.timeChartManager.measurementDates.hasOwnProperty(key)) {
            continue;
        }

        tmpDate = parseDate(key);
        myDates.push(tmpDate);
    }

    myDates.sort(function(a,b) {
        return a.getTime() - b.getTime();
    });

    var stringDates = myDates.map(function (d) {
        return format(d);
    });

    stringDates.unshift('year');
    idv.timeChartManager.xAxis = stringDates;
};

idv.timeChartManager.addMeasurementDate = function(date) {
    // var parseDate = d3.time.format("%Y-%m-%d").parse;

    if (!idv.timeChartManager.measurementDates.hasOwnProperty(date)) {
        idv.timeChartManager.measurementDates[date] = true;
        idv.timeChartManager.xAxis.push(date);
        // idv.timeChartManager.xAxis.sort(function(a,b) {
        //
        //     debugger;
        //     return parseDate(a).getTime() - parseDate(b).getTime();
        // });
        idv.timeChartManager.measurementDateCount ++;
    }
};

idv.timeChartManager.getColumns = function () {
    return idv.timeChartManager.chartColumns;
};

idv.timeChartManager.getAverageColumn = function () {
    return this.wellAverage.data;
};

idv.timeChartManager.setChartTypeForWell = function(wellName, type) {
    idv.timeChartManager.chartTypes[wellName] = type;
};

idv.timeChartManager.updateChartTypes = function() {
    idv.timeChartManager.chartTypes = this.getChartTypes();
};

idv.timeChartManager.getChartTypes = function() {
    var activeWells = idv.wellManager.getActiveWells();
    var chartTypes = {};
    activeWells.forEach(function (well) {
        var tmpWellObj = idv.wellMap[well];
        // chartTypes[tmpWellObj.getName()] = activeWells.length > 1 ? 'line' : 'area';
        chartTypes[tmpWellObj.getName()] = 'line';
    });

    return chartTypes;
};

idv.timeChartManager.updateAverageData = function (wells) {

    if (idv.timeChartManager.dataColumnCount < 2) {
        return;
    }
    var tmpColumn;
    var average = ['average'];

    var totalValueAllColumn;
    var myCols;
    if (!!wells) {
        myCols = wells.map(function (w) {
           return idv.timeChartManager.generateWellData(w);
        });
    }
    else {
        myCols = idv.timeChartManager.getColumns();
    }
    // var totalColumns = 0;
    var columnHasValueCount;
    for(var d=1; d< idv.timeChartManager.xAxis.length; d++) {
        totalValueAllColumn = 0;
        columnHasValueCount = 0;
        for(var i=0; i< myCols.length; i++) {
            tmpColumn = myCols[i];
            if (tmpColumn[0] == 'year' || tmpColumn[0] == 'average') {
                continue; // do not process for x axis or average data
            }

            // totalColumns ++;
            if (tmpColumn[d] != null) {
                columnHasValueCount ++;
                totalValueAllColumn += parseFloat(tmpColumn[d]);
            }
        }

        average.push(columnHasValueCount > 0 ? (totalValueAllColumn/columnHasValueCount) : null);
    }

    idv.timeChartManager.wellAverage.data = average;
};

idv.timeChartManager.addColumn = function(column) {

    var existed = this.hasColumn(column[0]);
    if (existed == true) {
        return;
    }

    idv.timeChartManager.chartColumns.push(column);
    if (column[0] == 'year' || column[0] == 'average') {
        return; // do not process for x axis or average data
    }

    this.dataColumnCount ++;
    // idv.timeChartManager.chartTypes[column[0]] = 'area';

    // this.updateChartTypes();
    // this.updateAverageData();

};

idv.timeChartManager.removeColumn = function(columnKey) {
    var columnIndex = -1;
    var tmpColumn;
    for(var i = 0; i < idv.timeChartManager.chartColumns.length; i++) {
        tmpColumn = idv.timeChartManager.chartColumns[i];
        if (tmpColumn.length < 1) {
            continue;
        }

        if (tmpColumn[0] == columnKey) {
            columnIndex = i;
            break;
        }
    }

    if (columnIndex > -1) {
        idv.timeChartManager.chartColumns.splice(columnIndex, 1);
    }

    if (this.dataColumnCount >0) {
        this.dataColumnCount --;
    }

    delete this.chartTypes[columnKey];

    // this.updateChartTypes();
    // this.updateAverageData();

};

/**
 * Plot the chart. If columns is undefined then we only have coordinate system
 *
 * @param bindToId
 * @param columns
 * @param colors
 * @param types
 */
idv.timeChartManager.generateTimeChart = function(bindToId, columns, colors, types) {

    console.log("generating chart for id#" + bindToId);
    var myCols = (columns == null || columns == undefined) ? [] : columns;
    var tmpCols = myCols.concat([idv.timeChartManager.xAxis]);
    var myColors = (colors == null || colors == undefined) ? {} : colors;
    var myTypes = (types == null || types == undefined) ? {} : types;
    var names = idv.wellCustomNames;
    var mW;

    var creatingData = idv.util.getTime();
    // for(var wId in idv.wellMap) {
    //     if (!idv.wellMap.hasOwnProperty(wId)) {
    //         continue;
    //     }
    //
    //     mW = idv.wellMap[wId];
    //     names[mW.getName()] = 'well ' + mW.id;
    // }



    var myData = {
        x: 'year',
        names: names,
        columns: tmpCols,
        colors: myColors,
        types: myTypes,
        regions: {
            'average': [{'style':'dashed'}] // currently 'dashed' style only
        }
    };

    var div = d3.select("body").append("div")
        .attr("class", "tooltip horizon-tooltip")
        .style("opacity", 0);

    var doneCreatingData = idv.util.getTime();

    console.log("creating data for time chart generation:" + (doneCreatingData-creatingData));

    var timeChart = c3.generate({
        bindto: ("#" + bindToId),
        size: {
            height: 360,
            width: 800
        },
        data: myData,
        line: {
            connectNull: true
        },
        axis: {
            y: {
                min: 0,
                padding: {top: 0, bottom: 0},

                tick: {
                    format: d3.format(",0f")
                     // count: 8
                },

                label: { // ADD
                    text: 'Saturated Thickness (ft)',
                    position: 'outer-middle'
                }
            },
            x: {
                min: '1995-01-15',
                padding: {left: 0, right: 0},
                type: 'timeseries',
                label: {
                    text: 'Year',
                    position: 'outer-right'
                },
                tick: {
                    values: ['1996-01-15', '1998-01-15', '2000-01-15', '2002-01-15', '2004-01-15', '2006-01-15',
                        '2008-01-15', '2010-01-15', '2012-01-15', '2014-01-15', '2016-01-15'],
                    // format: '%Y-%m-%d'
                    format: function (x) { return x.getFullYear(); }
                }
            }
        },
        point: {
            show: false
        },
        legend: {
            item: {
                onclick: function (id) {  },

                onmouseout: function(name) {
                    if (bindToId == 'wellTimeSeries') {
                        // idv.timeChartManager.resetWellChart();
                    }

                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                },
                onmouseover: function (name) {
                    if (bindToId == 'wellTimeSeries') {
                        console.log('mouse over');
                        console.log(name);

                        idv.timeChartManager.activateWellAsAreaChart(name);

                        idv.comparisonChart.generateAverageComparisonChart('average', name, false);

                        var wellId = idv.util.getWellIdFromItsName(name);
                        var d = idv.wellMap[wellId];
                        div.transition()
                            .duration(200)
                            .style("opacity", .95);
                        div.html("County: " + d.detail.county)
                            .style("left", (d3.event.pageX +20) + "px")
                            .style("top", (d3.event.pageY - 40) + "px");

                        // idv.timeChartManager.getColumnDataByKey(name);
                        // idv.timeChartManager.getColumnDataByKey('average');

                    }
                }
            }
        },
        tooltip: {
            format: {
                title: function(d) {
                    var formatTime = d3.timeFormat('%Y-%m-%d');
                    return "Date " + formatTime(d);
                },
                value: function (value, ratio, id) {
                    var format = d3.format(',.2f')
                    return format(value);
                }
            },
            contents: function (d, defaultTitleFormat, defaultValueFormat, color) {

                var $$ = this, config = $$.config,
                    titleFormat = config.tooltip_format_title || defaultTitleFormat,
                    nameFormat = config.tooltip_format_name || function (name) { return name; },
                    valueFormat = config.tooltip_format_value || defaultValueFormat,
                    text, i, title, value, name, bgcolor;
                var well;
                for (i = 0; i < d.length; i++) {
                    if (! (d[i] && (d[i].value || d[i].value === 0))) { continue; }

                    if (! text) {
                        title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                        text = "<table class='" + $$.CLASS.tooltip + " c3-tool-tip-background'>" + (title || title === 0 ? "<tr style='background-color: black'><th colspan='3' style='background-color: black;'>" + title + "</th></tr>" : "");
                        text += "<tr class='c3tooltipCustomHeader'>";
                        text += "<th>Well</th>";
                        text += "<th>S. Thickness</th>";
                        text += "<th>County</th>";
                        text += "</tr>";

                    }

                    name = nameFormat(d[i].name);
                    value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
                    bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);
                    well = idv.wellMap[ idv.util.getWellIdFromItsName(d[i].id)];
                    text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[i].id + "'>";
                    text += "<td class='name'>&nbsp;<span style='background-color:" + bgcolor + "'></span>" + name + "&nbsp;</td>";
                    text += "<td class='value'>" + value + "&nbsp; </td>";
                    text += "<td class='c3-align-left-text'>&nbsp;" + well.detail.county + "&nbsp;</td>";
                    text += "</tr>";
                }
                return text + "</table>";
            }
        }
    });

    var doneGenerateTimeSeries = idv.util.getTime();

    console.log("done creating time chart" + (doneGenerateTimeSeries-doneCreatingData));


    if (bindToId == 'wellTimeSeries') {

        // timeChart.resize();
        // timeChart.flush();

        idv.timeChartManager.timeChart = timeChart;
    }
    else {
        idv.timeChartManager.charts[bindToId] = timeChart;
    }


    d3.selectAll('.c3-axis-x-label')
        .attr("transform", "translate(" + 8 + "," + -5 + ")");

};

idv.timeChartManager.generateWellData = function(well) {
    var wellData = [];
    var label = 'well' + well.id;
    wellData.push(label);
    // var tmpDateInXAxis;
    // for (var i=1; i< idv.timeChartManager.xAxis.length; i++) {
    //     tmpDateInXAxis = idv.timeChartManager.xAxis[i];
    //     if (well.detail == null || well.undefined || !well.detail.hasOwnProperty(tmpDateInXAxis)) {
    //         //wellData.push(null);
    //         wellData.push(Math.round(Math.random()*1000) + 500);
    //         continue;
    //     }
    //
    //     wellData.push(well.detail[tmpDateInXAxis]);
    // }
    //
    // debugger;
    // wellData = [];
    // wellData.push(label);

    var interpolatedValue;
    var saturatedThickness;
    var dateData;

    for (var i=0; i< idv.timeChartManager.xAxis.length-1; i++) {
        dateData = idv.timeChartManager.xAxis[i+1];
        if (!!well.detail[dateData]) {
            wellData.push(well.detail[dateData]);
            continue;
        }

        interpolatedValue = well.interpolate[2*i];
        if (interpolatedValue == null || interpolatedValue == undefined) {
            wellData.push(null)
        }
        else {
            saturatedThickness = idv.util.getWaterElevationFromInterpolatedValue(interpolatedValue);
            wellData.push(saturatedThickness);
        }
    }

    return wellData;
};

/**
 *
 * @param well well to be add/removed and will affect to average value
 * @param refreshChart
 * @param unloads affect to rendering only
 */
idv.timeChartManager.updateTimeChartForWell = function(well, refreshChart, unloads){

    if (unloads != null && !Array.isArray(unloads)) {
        unloads = [unloads];
    }
    if (well.active == true) {
        var newColumn = idv.timeChartManager.generateWellData(well);
        this.addColumn(newColumn);
    }
    else {
        unloads = unloads != null ? unloads.push(well.id) : [well.id]
    }

    if (unloads != null) {
        unloads.forEach(function (unloadId) {
            var tmpWell = idv.wellMap[unloadId];
            tmpWell.setActive(false);
            idv.timeChartManager.removeColumn(tmpWell.getName());
        })
    }

    if (!!refreshChart) {
        this.refreshTimeChart(null, unloads);
    }

};

idv.timeChartManager.activateWellAsAreaChart = function(wellName) {
    this.updateChartTypes();
    this.setChartTypeForWell(wellName, 'area');
    this.fastRefreshTimeChart();
};

/**
 * reset well chart and also deactivate if deactivateWells exist
 * @param deactivateWells
 */
idv.timeChartManager.resetWellChart = function(deactivateWells) {

    this.updateChartTypes();

    this.refreshTimeChart(null, deactivateWells);
};

idv.timeChartManager.fastRefreshTimeChart = function(unloads) {
    if (unloads == null) {
        unloads = [];
    }
    unloads = unloads.map(function (id) {
        return idv.wellMap[id].getName();
    });

    var myColumns = this.getColumns();
    var tmpCols =  myColumns.concat([this.xAxis]);

    idv.timeChartManager.timeChart.load({
        columns: tmpCols,
        types: idv.timeChartManager.chartTypes,
        unload:  unloads == null ? [] : unloads
    });
};

idv.timeChartManager.refreshTimeChart = function(columns, unloads) {
    var myColumns = columns == null ? this.getColumns() : columns;
    var tmpCols =  myColumns.concat([this.xAxis]);
    var myColors = this.getChartColors();
    var myTypes = this.getChartTypes();
    // var myUnloads = [];
    if (unloads == null) {
        unloads = [];
    }
    unloads = unloads.map(function (id) {
        return idv.wellMap[id].getName();
    });


    // unloads.forEach(function (id) {
    //    myUnloads.push(idv.wellMap[id].getName());
    // });

    idv.timeChartManager.timeChart.load({
        columns: tmpCols,
        types: myTypes,
        unload:  unloads == null ? [] : unloads,
        colors: myColors

    });

    setTimeout(function () { idv.timeChartManager.timeChart.flush(); }, 500);

    // idv.timeChartManager.timeChart.resize({height: 360, width: 960});
    // idv.timeChartManager.timeChart.flush();
};

idv.timeChartManager.hideAverage = function() {

    idv.util.removeChildren('charts');
};

idv.timeChartManager.getChartColors = function() {
    var activeWells = idv.wellManager.getActiveWells();
    var colors = {};
    activeWells.forEach(function (well) {
        var tmpWellObj = idv.wellMap[well];
        if (tmpWellObj.color == null || tmpWellObj.color == undefined) {
            tmpWellObj.color = idv.colorManager.getUnusedColorKey();
        }

        colors[tmpWellObj.getName()] = tmpWellObj.getMyColor();
    });

    return colors;
};

idv.timeChartManager.showAverage = function() {
    // merge into one graph
    // d3.selectAll('body').selectAll("#charts").selectAll('div')
    //     .data([null, null, null])
    //     .enter().append("div")
    //         .attr("id", function(d, i) {
    //
    //             return idv.util.getChartId(i);
    //         })
    // ;


    var wells = idv.wellManager.getActiveWells();
    if (wells.length < 2) {
        alert("Expect to have more than one active well to show average");
        return;
    }

    // this.updateAverageData();
    var rootElement = document.getElementById("charts");
    var element;
    for(var i =0; i< wells.length; i++) {
        element = document.createElement("div");
        element.setAttribute("id", idv.util.getChartId(wells[i]));
        rootElement.appendChild(element)
    }

    d3.selectAll('body').selectAll("#charts").selectAll('div')
        .each(
            function () {
                var wellId = idv.util.getWellIdFromChartId(this.id);
                var wellName = idv.util.getWellNameFromChartId(this.id);
                var cols = idv.timeChartManager.getColumnDataByKey(wellName);
                var myWell = idv.wellMap[wellId];
                var myColors = {
                    'average': idv.timeChartManager.wellAverage.color
                };
                if (myWell.active === false) {
                    throw new Error("The well must be active");
                }

                myColors[wellName] = myWell.getMyColor();
                var types = {
                    'average': 'line'
                };
                types[wellName] = 'line';
                // var
                idv.timeChartManager.generateTimeChart(this.id, [cols, idv.timeChartManager.wellAverage.data], myColors, types);
            }
        )
    ;
};

idv.timeChartManager.isWellData = function (d) {
    if (d[0] == 'average' || d[0] == 'year') {
        return false;
    }
    return true;
};

/**
 * The key is "well" + wellId
 * @param key
 */
idv.timeChartManager.getColumnDataByKey = function(key) {
    if (key == 'average') {
        return this.getAverageColumn();
    }
    var myColumns = this.getColumns();
    var tmpCol;
    for(var i=0; i< myColumns.length; i++) {
        tmpCol = myColumns[i];
        if (tmpCol[0] == key) {
            return tmpCol;
        }
    }

    return null;
};

idv.timeChartManager.hasColumn = function(key) {
    var myColumns = this.getColumns();
    var tmpCol;
    for(var i=0; i< myColumns.length; i++) {
        tmpCol = myColumns[i];
        if (tmpCol[0] == key) {
            return true;
        }
    }

    return false;
};

idv.timeChartManager.getChartInstance = function(bindId) {

    if (!idv.controller.isAverageActivated()) {
        return this.timeChart;
    }

    return bindId == 'wellTimeSeries' ? this.timeChart : this.charts[bindId];
};


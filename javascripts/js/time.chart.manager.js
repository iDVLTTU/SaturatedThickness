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
    debugger;
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


idv.timeChartManager.updateChartTypes = function() {
    idv.timeChartManager.chartTypes = this.getChartTypes();
};

idv.timeChartManager.getChartTypes = function() {
    var activeWells = idv.wellManager.getActiveWells();
    var chartTypes = {};
    activeWells.forEach(function (well) {
        var tmpWellObj = idv.wellMap[well];
        chartTypes[tmpWellObj.getName()] = activeWells.length > 1 ? 'line' : 'area';
    });

    return chartTypes;
};

idv.timeChartManager.updateAverageData = function () {

    if (idv.timeChartManager.dataColumnCount < 2) {
        return;
    }
    var tmpColumn;
    var average = ['average'];

    var totalValueAllColumn;
    var myCols = idv.timeChartManager.getColumns();
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
    var myData = {
        x: 'year',
        columns: tmpCols,
        colors: myColors,
        types: myTypes,
        regions: {
            'average': [{'style':'dashed'}] // currently 'dashed' style only
        }
    };

    var timeChart = c3.generate({
        bindto: ("#" + bindToId),
        data: myData,
        line: {
            connectNull: true
        },
        axis: {
            y: {
                label: { // ADD
                    text: 'Water Elevation',
                    position: 'outer-middle'
                }
            },
            x: {
                type: 'timeseries',
                label: {
                    text: 'Year',
                    position: 'outer'
                },
                tick: {
                    // format: '%Y-%m-%d'
                    format: '%Y-%m'
                }
            }
        },
        point: {
            show: false
        },
        legend: {
            item: {
                onmouseout: function(id) {
                    if (bindToId == 'wellTimeSeries') {
                        idv.timeChartManager.resetWellChart();
                    }
                },
                onmouseover: function (name) {
                    if (bindToId == 'wellTimeSeries') {
                        idv.timeChartManager.activateWellAsAreaChart(name);
                        idv.comparisonChart.generateAverageComparisonChart('average', name);

                        var wellData = idv.timeChartManager.getColumnDataByKey(name);
                        console.log(wellData);
                        wellData = idv.timeChartManager.getColumnDataByKey('average');
                        console.log(wellData);

                    }
                }
            }
        }
    });

    if (bindToId == 'wellTimeSeries') {
        idv.timeChartManager.timeChart = timeChart;
    }
    else {
        idv.timeChartManager.charts[bindToId] = timeChart;
    }
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
    var waterElevation;
    for (var i=0; i< idv.timeChartManager.xAxis.length-1; i++) {
        interpolatedValue = well.interpolate[2*i];
        if (interpolatedValue == null || interpolatedValue == undefined) {
            wellData.push(null)
        }
        else {
            waterElevation = idv.util.getWaterElevationFromInterpolatedValue(interpolatedValue);
            wellData.push(waterElevation);

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
    this.chartTypes[wellName] = "area";

    this.refreshTimeChart();
};

/**
 * reset well chart and also deactivate if deactivateWells exist
 * @param deactivateWells
 */
idv.timeChartManager.resetWellChart = function(deactivateWells) {

    this.updateChartTypes();

    this.refreshTimeChart(null, deactivateWells);
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


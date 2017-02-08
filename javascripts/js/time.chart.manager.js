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

idv.timeChartManager.addMeasurementDate = function(date) {
    if (!idv.timeChartManager.measurementDates.hasOwnProperty(date)) {
        idv.timeChartManager.measurementDates[date] = true;
        idv.timeChartManager.xAxis.push(date);
        idv.timeChartManager.measurementDateCount ++;
    }
};

idv.timeChartManager.getColumns = function () {
    return idv.timeChartManager.chartColumns;
};

idv.timeChartManager.updateChartTypes = function() {
    for(var lbl in idv.timeChartManager.chartTypes) {
        if (!idv.timeChartManager.chartTypes.hasOwnProperty(lbl)) {
            continue;
        }

        idv.timeChartManager.chartTypes[lbl] = this.dataColumnCount > 1 ? "line" : "area";
    }
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
    for(var d=1; d< idv.timeChartManager.xAxis.length; d++) {
        totalValueAllColumn = 0;
        for(var i=0; i< myCols.length; i++) {
            tmpColumn = myCols[i];
            if (tmpColumn[0] == 'year' || tmpColumn[0] == 'average') {
                continue; // do not process for x axis or average data
            }

            // totalColumns ++;
            totalValueAllColumn += parseFloat(tmpColumn[d]);
        }

        average.push(totalValueAllColumn / idv.timeChartManager.dataColumnCount);
    }

    idv.timeChartManager.wellAverage.data = average;
};

idv.timeChartManager.addColumn = function(column) {
    idv.timeChartManager.chartColumns.push(column);
    if (column[0] == 'year' || column[0] == 'average') {
        return; // do not process for x axis or average data
    }

    this.dataColumnCount ++;
    idv.timeChartManager.chartTypes[column[0]] = 'area';

    this.updateChartTypes();
    this.updateAverageData();

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

    this.updateChartTypes();
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
        types: myTypes
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
                onmouseover: function (id) {
                    if (bindToId == 'wellTimeSeries') {
                        idv.timeChartManager.activateWellAsAreaChart(id);
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
    var tmpDateInXAxis;
    for (var i=1; i< idv.timeChartManager.xAxis.length; i++) {
        tmpDateInXAxis = idv.timeChartManager.xAxis[i];
        if (well.detail == null || well.undefined || !well.detail.hasOwnProperty(tmpDateInXAxis)) {
            // wellData.push(null);
            wellData.push(Math.round(Math.random()*1000) + 500);
            continue;
        }

        wellData.push(well.detail[tmpDateInXAxis]);
    }

    return wellData;
};

idv.timeChartManager.updateTimeChartForWell = function(well){

    var label = 'well' + well.id;
    var colors = {};

    if (well.active == true) {
        colors[label] = well.getMyColor();
        var newColumn = idv.timeChartManager.generateWellData(well);
        this.addColumn(newColumn);
    }
    else {
        this.removeColumn(label);
    }

    this.refreshTimeChart(colors, null, null, well.active === true ? [] : [label]);

};

idv.timeChartManager.activateWellAsAreaChart = function(wellId) {
    this.chartTypes[wellId] = "area";

    this.refreshTimeChart();
};

idv.timeChartManager.resetWellChart = function() {

    this.updateChartTypes();

    this.refreshTimeChart();
};

idv.timeChartManager.refreshTimeChart = function(colors, types, columns, unloads) {
    var myColumns = columns == null ? this.getColumns() : columns;
    var tmpCols =  myColumns.concat([this.xAxis]);
    idv.timeChartManager.timeChart.load({
        columns: tmpCols,
        types: types == null ? this.chartTypes : types,
        unload:  unloads == null ? [] : unloads,
        colors: colors == null ? [] : colors

    });
};

idv.timeChartManager.hideAverage = function() {

    var chartContainer = document.getElementById("charts");
    if (chartContainer != null) {
        while (chartContainer.firstChild) {
            chartContainer.removeChild(chartContainer.firstChild);
        }
    }
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
                    'average': 'area'
                };
                types[wellName] = 'area';
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

idv.timeChartManager.getChartInstance = function(bindId) {

    if (!idv.controller.isAverageActivated()) {
        return this.timeChart;
    }

    return bindId == 'wellTimeSeries' ? this.timeChart : this.charts[bindId];
};


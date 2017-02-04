var idv = idv || {};
idv.timeChartManager = idv.timeChartManager || {};
idv.timeChartManager.timeChart = null;
idv.timeChartManager.dataColumnCount = 0;
idv.timeChartManager.chartTypes = {}; // {key=>type}
idv.timeChartManager.chartColumns = [];
idv.timeChartManager.xAxis = [
    'year'
];
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


idv.timeChartManager.addColumn = function(column) {
    idv.timeChartManager.chartColumns.push(column);
    if (column[0] == 'year') {
        return; // do not process for x axis
    }

    this.dataColumnCount ++;
    idv.timeChartManager.chartTypes[column[0]] = 'area';

    this.updateChartTypes();

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



idv.timeChartManager.generateTimeChart = function() {

    var myData = {
        x: 'year',
        columns: [
            idv.timeChartManager.xAxis
        ],
        colors: {
        },
        types: {

        }
    };

    debugger;
    this.addColumn(idv.timeChartManager.xAxis);

    idv.timeChartManager.timeChart = c3.generate({
        bindto: '#wellTimeSeries',
        data: myData,
        // line: {
        //     connect_null: true
        // },
        axis: {
            y: {
                label: { // ADD
                    text: 'Saturated Thickness',
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
                    format: '%Y-%m-%d'
                }
            }
        },

        legend: {
            item: {
                onmouseout: function(id) { idv.timeChartManager.resetWellChart();},
                onmouseover: function (id) { idv.timeChartManager.activateWellAsAreaChart(id);}
            }
        }
    });
};

idv.timeChartManager.generateWellData = function(well) {
    var wellData = [];
    var label = 'well' + well.id;
    debugger;
    wellData.push(label);

    for (var i=1; i< idv.timeChartManager.xAxis.length; i++) {
        wellData.push(Math.round(Math.random()*200));
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

    debugger;
    var myColumns = this.getColumns();
    idv.timeChartManager.timeChart.load({
        unload:  well.active === true ? [] : [label],
        columns: myColumns,
        colors: colors,
        types: this.chartTypes
    });
};

idv.timeChartManager.activateWellAsAreaChart = function(wellId) {
    this.chartTypes[wellId] = "area";

    idv.timeChartManager.timeChart.load({
        columns: this.getColumns(),
        types: this.chartTypes
    });
};

idv.timeChartManager.resetWellChart = function() {

    this.updateChartTypes();

    idv.timeChartManager.timeChart.load({
        columns: this.getColumns(),
        types: this.chartTypes
    });
};
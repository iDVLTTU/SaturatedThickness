var idv = idv || {};
idv.timeChartManager = idv.timeChartManager || {};
idv.timeChartManager.timeChart = null;
idv.timeChartManager.dataColumnCount = 0;
idv.timeChartManager.chartTypes = {}; // {key=>type}
idv.timeChartManager.chartColumns = [];
idv.timeChartManager.xAxis = [
    'year',
    '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005',
    '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'
];

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

    this.addColumn(idv.timeChartManager.xAxis);

    idv.timeChartManager.timeChart = c3.generate({
        bindto: '#wellTimeSeries',
        data: myData,
        axis: {
            y: {
                label: { // ADD
                    text: 'Saturated Thickness',
                    position: 'outer-middle'
                }
            },
            x: {
                label: {
                    text: 'Year',
                    position: 'outer'
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

    idv.timeChartManager.timeChart.load({
        unload:  well.active === true ? [] : [label],
        columns: this.getColumns(),
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
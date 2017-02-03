var idv = idv || {};
idv.timeChartManager = idv.timeChartManager || {};
idv.timeChartManager.timeChart = null;
idv.timeChartManager.xAxis = [
    'year',
    '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005',
    '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'
];

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

    if (well.active == true) {
        var colors = {};
        colors[label] = well.getMyColor();
        var types = {};
        types[label] = "area-spline";
        var newColumn = idv.timeChartManager.generateWellData(well);
        idv.timeChartManager.timeChart.load({
            columns: [idv.timeChartManager.xAxis, newColumn],
            colors: colors,
            types: types
        });
    }
    else {
        idv.timeChartManager.timeChart.unload(
            {
                ids: [label]
            }
        );
    }
};

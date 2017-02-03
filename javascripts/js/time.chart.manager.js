var idv = idv || {};
idv.timeChartManager = idv.timeChartManager || {};
idv.timeChartManager.timeChart = null;
idv.timeChartManager.xAxis = ['year', '1995', '1996', '1997', '1998', '1999', '2000'];

idv.timeChartManager.generateTimeChart = function() {

    var myData = {
        x: 'year',
        columns: [
            idv.timeChartManager.xAxis
        ],
        colors: {
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

idv.timeChartManager.updateTimeChartForWell = function(well){
    var label = 'well' + well.id;

    if (well.active == true) {
        var colors = {};
        colors[label] = well.color;
        var newColumn = [label, Math.round(Math.random()*30), Math.round(Math.random()*200), Math.round(Math.random()*100), Math.round(Math.random()*400), Math.round(Math.random()*150), Math.round(Math.random()*250)]
        idv.timeChartManager.timeChart.load({columns: [idv.timeChartManager.xAxis, newColumn], colors: colors});
    }
    else {
        idv.timeChartManager.timeChart.unload(
            {
                ids: [label]
            }
        );
    }
};

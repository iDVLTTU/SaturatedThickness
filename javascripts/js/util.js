var idv = idv || {};
idv.util = idv.util || {};

idv.util.getRandomColor = function() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

idv.util.getDateInYmd = function(year, month, date) {
    if (month < 10) {
        month = '0' + month;
    }

    if(date < 10) {
        date = '0' + date;
    }

    // return year + '-' + month + '-' + date;
    return year + '-' + month + '-15';
};

idv.util.getWellIdFromItsName = function(wellName) {
    return wellName.substring(4);
};

idv.util.getChartId = function(wellName) {
    return "My" + wellName + 'TimeSeries';
};

idv.util.getWellNameFromChartId = function(chartId) {
   return "well" + chartId.substring(2, chartId.length - 10);
};

idv.util.getWellIdFromChartId = function(chartId) {
    return chartId.substring(2, chartId.length - 10);
};

idv.util.removeChildren = function(containerId) {

    var chartContainer = document.getElementById(containerId);
    if (chartContainer != null) {
        while (chartContainer.firstChild) {
            chartContainer.removeChild(chartContainer.firstChild);
        }
    }
};

idv.util.getInterpolatedValue = function(waterElevation) {
  return (waterElevation-idv.INTERPOLATION_CUT)/idv.INTERPOLATION_CUT;
};

idv.util.getWaterElevationFromInterpolatedValue = function (interpolatedValue) {
  // return (interpolatedValue * idv.INTERPOLATION_CUT + idv.INTERPOLATION_CUT);
    return interpolatedValue;
};

idv.util.formatDate = function(d) {
    var format = d3.time.format("%Y-%m-%d");
    return format(d);
};

idv.util.formatSaturatedThickness = function(d) {
    var format = d3.format(",.1f");

    var a =format(d);
    debugger;
    return format(d);
};


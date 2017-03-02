var idv = idv || {};
idv.controller = idv.controller || {};

idv.controller.showContour = false;
idv.controller.showHorizon = false;

idv.controller.addWell = function(checkBox) {
    d3.select("#boardController")
        .append("svg")
            .attr("width", 200)
            .attr("height", 200)
    ;
};

idv.controller.handleAverageClick = function(averageCheckBox) {
  if(averageCheckBox.checked == true) {
      // idv.timeChartManager.showAverage();
      idv.comparisonChart.initForTest();

  }
  else {
      idv.timeChartManager.hideAverage();
  }
};

idv.controller.isAverageActivated = function() {
    var average = document.getElementById("average");
    return average.checked === true;
};

idv.controller.isContourMapEnabled = function () {
    return this.showContour === true;
};

idv.controller.showContourMap = function(contourCheckbox) {

    this.showContour = contourCheckbox.checked;

    if (this.showContour == true) {
        this.setWaitCursor();

        if (!idv.isContourMapPlotted()) {
            console.log("plotting contour");

            setTimeout(function () {
                idv.plotContourMap();

            }, 100);


        }else {

            setTimeout(function () {
                d3.select('#' + idv.CONTOUR_DIV_ID)
                    .style('visibility', 'visible');

                var startPlottingWellMarker = idv.util.getTime();
                idv.wellManager.plotWellMarkerOnContour(idv.CONTOUR_DIV_ID, idv.wellMap, false);
                var donePlottingWell = idv.util.getTime();
                console.log("Plotting well marker in: " + (donePlottingWell-startPlottingWellMarker));
            }, 100);


        }

        var updateWellColor = idv.util.getTime();
        idv.colorManager.updateContourWellColors();
        console.log("updating contour well color in: " + (idv.util.getTime() - updateWellColor));


    }
    else {


        d3.select('#' + idv.CONTOUR_DIV_ID)
            .style('visibility', 'hidden');

        this.setDefaultCursor();
        // idv.util.removeChildren(idv.CONTOUR_DIV_ID);

    }

    // contourCheckbox.style.cursor = 'default';
    // controlPanel.style.cursor = 'default';


};

idv.controller.setWaitCursor = function () {
    var controlPanel = document.getElementById("myControlPanel");
    var contourCheckbox = document.getElementById("showContourMapCheckbox");

    document.body.style.cursor = 'wait';
    contourCheckbox.style.cursor = 'wait';
    controlPanel.style.cursor = 'wait';

};

idv.controller.setDefaultCursor = function () {
    var controlPanel = document.getElementById("myControlPanel");
    var contourCheckbox = document.getElementById("showContourMapCheckbox");

    document.body.style.cursor = 'default';
    contourCheckbox.style.cursor = 'default';
    controlPanel.style.cursor = 'default';
};

idv.controller.hideTimeChart = function () {

    // var timeChart = document.getElementById("wellTimeSeries");
    // timeChart.style.visibility = "hidden";
    idv.util.removeChildren("wellTimeSeries");
};

idv.controller.showTimeChart = function () {

    // var timeChart = document.getElementById("wellTimeSeries");
    // timeChart.style.visibility = "visible";

    // debugger;
    var currentTime = idv.util.getTime();

    idv.timeChartManager.generateTimeChart("wellTimeSeries");

    var afterGenTime = idv.util.getTime();
    console.log("Generate time chart: " + (afterGenTime-currentTime));

    idv.wellManager.activateWells(idv.wellManager.getActiveWells());

    var activeWell = idv.util.getTime();
    console.log("done activate all wells: " + (activeWell-afterGenTime));


};

idv.controller.hideHorizonChart = function () {

    // var horizon = document.getElementById("horizonChart");
    // horizon.style.visibility = "hidden";

    idv.util.removeChildren("horizonChart");


};

idv.controller.showHorizonChart = function () {

    // var horizon = document.getElementById("horizonChart");
    // horizon.style.visibility = "visible";

    var activeWells = idv.wellManager.getActiveWellsAsObjects();
    drawHorizon(activeWells);

};


idv.controller.handleHorizonCheckboxClick = function (horizonCheckbox) {

    if (horizonCheckbox.checked == true) {
        this.showHorizon = true;
        this.hideTimeChart();
        this.showHorizonChart();
    }
    else {
        this.showHorizon = false;
        this.hideHorizonChart();
        this.showTimeChart();
    }
};

idv.controller.isHorizonShown = function() {
  return this.showHorizon;
};

idv.controller.testActivateWells = function(activateWellCheckbox) {
    var wells = ['702801', '235803', '235404'];
    if (activateWellCheckbox.checked === true) {
        idv.wellManager.activateWells(wells);
    }else {
        idv.wellManager.deactivateWells(wells);
    }
};

idv.controller.testBox = function(testBox) {
    var update = {
        marker: {
            size: [40, 60, 80, 100]
        }
    };


    Plotly.restyle(idv.CONTOUR_DIV_ID, update, 0);
};

idv.controller.getFlickeringOption = function() {
    var choice = select.property('value');
    if (choice=="Sudden increase") {
        return {valKey: "suddenIncrease", datePattern: "dateIncrease"};
    }

    if (choice=="Sudden decrease") {
        return  {valKey: "suddenDecrease", datePattern: "dateDecrease"};
    }

    return null;
};

idv.controller.zoomInX = function () {
    idv.comparisonChart.doZoomX();
};
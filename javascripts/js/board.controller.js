var idv = idv || {};
idv.controller = idv.controller || {};

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

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
      idv.timeChartManager.showAverage();
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


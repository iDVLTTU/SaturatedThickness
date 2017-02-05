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
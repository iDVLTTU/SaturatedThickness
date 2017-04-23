/* 2017 
 * Tommy Dang, Assistant professor, iDVL@TTU
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */


var numNeighbor = 19;  //Numeber of Neighbors to compute average

var choices = ["Number of measurements", "Average over time", "Standard deviation", "Sudden increase", "Sudden decrease"];
var averageChoices = [numNeighbor +" Neighbor", "County"];
var wellDomain = {};

var select =d3.select("#selectDiveOption")
  .append('select')
    .attr('class','select')
    .attr('id','selectRadiusStrategyOption')
    .on('change',changeSelection);

var selectAverage =d3.select("#averageDivOption")
  .append('select')
    .attr('class','select')
    .on('change',changeAverage);    

var options = select
  .selectAll('option')
    .data(choices).enter()
    .append('option')
        .text(function (d) { return d; });

var averageOptions = selectAverage
  .selectAll('option')
    .data(averageChoices).enter()
    .append('option')
        .text(function (d) { return d; });        

var minRadius = 2;
var maxRadius = 7;


function changeSelection() {    
    choice = select.property('value')

    if (idv==undefined || idv.wellMap==undefined) return;

    idv.controller.setWaitCursor();


    var handleSelection = function () {
        if (choice==choices[0]){
            var min =  99999;
            var max = -99999;
            for (var key in idv.wellMap){
                var w = idv.wellMap[key];
                min = Math.min(min,w.detail.totalMeasurementDate);
                max = Math.max(max,w.detail.totalMeasurementDate);
            }
            if (min<max){
                wellDomain.measureMin = min;
                wellDomain.measureMax = max;
                var linearScale = d3.scale.linear()
                    .domain([wellDomain.measureMin,wellDomain.measureMax])
                    .range([minRadius,maxRadius]);
                // Compute radius of wells
                for (var key in idv.wellMap){
                    var w = idv.wellMap[key];
                    w.radius = linearScale(w.detail.totalMeasurementDate);
                }
            }
        }
        else if (choice==choices[1]){
            var min =  99999;
            var max = -99999;
            for (var key in idv.wellMap){
                var w = idv.wellMap[key];
                if (w.average==undefined)
                    computeAverageForWellByInterpolate(w);
                min = Math.min(min,w.average);
                max = Math.max(max,w.average);
            }
            if (min<max){
                wellDomain.averageMin = min;
                wellDomain.averageMax = max;
                var linearScale = d3.scale.linear()
                    .domain([wellDomain.averageMin,wellDomain.averageMax])
                    .range([minRadius,maxRadius-1]);

                // Compute radius of wells
                for (var key in idv.wellMap){
                    var w = idv.wellMap[key];
                    w.radius = linearScale(w.average);
                }
            }
        }
        else if (choice=="Standard deviation"){
            if (wellDomain.sdMax==undefined){
                var min =  99999;
                var max = -99999;
                for (var key in idv.wellMap){
                    var w = idv.wellMap[key];
                    var sumDif = 0;
                    var count =0;
                    for (var key2 in w.detail){
                        if (key2.match(/[-]\d\d[-]/)){  // key2 contain a date format
                            var d1 = new Date(key2);
                            var m1 = (d1.getYear()-startYear)*12 + d1.getMonth();
                            var v1 = w.detail[key2];
                            if (w.average==undefined)  // Check if we computed the average or Not
                            //computeAverageForWell(w);
                                computeAverageForWellByInterpolate(w);
                            sumDif += (v1- w.average)*(v1- w.average);
                            count++;
                        }
                    }
                    w.sd = Math.sqrt(sumDif/count);
                    console.log(w.sd+" "+w.average);
                    min = Math.min(min,w.sd);
                    max = Math.max(max,w.sd);
                }
                if (min<max){
                    wellDomain.sdMin = min;
                    wellDomain.sdMax = max;
                }
            }

            var linearScale = d3.scale.linear()
                .domain([wellDomain.sdMin,wellDomain.sdMax])
                .range([minRadius,maxRadius]);
            // Compute radius of wells
            for (var key in idv.wellMap){
                var w = idv.wellMap[key];
                w.radius = linearScale(w.sd);
            }
        }
        else if (choice=="Sudden increase"){
            if (wellDomain.increaseMax==undefined){
                var min =  99999;
                var max = -99999;
                for (var key in idv.wellMap){
                    var w = idv.wellMap[key];
                    var previousDate =undefined;
                    var previousValue=undefined;
                    var currentDate  =undefined;
                    var currentValue =undefined;
                    var increase = -99999;
                    var inDate1 = -99999;
                    var inDate2 = -99999;
                    for (var key2 in w.detail){
                        if (key2.match(/[-]\d\d[-]/)){  // key2 contain a date format
                            previousDate = currentDate;
                            previousValue = currentValue;
                            currentDate = key2;
                            currentValue = +w.detail[key2];
                            if (previousDate!=undefined){
                                var d1 = new Date(previousDate);
                                var m1 = (d1.getYear()-startYear)*12 + d1.getMonth();
                                var d2 = new Date(currentDate);
                                var m2 = (d2.getYear()-startYear)*12 + d2.getMonth();
                                if (m2==m1+1 || m2==m1){   // Maybe in the same month
                                    if (currentValue-previousValue>increase){
                                        increase = currentValue-previousValue;
                                        inDate1 = previousDate;
                                        inDate2 = currentDate;
                                    }
                                }
                            }
                        }
                    }
                    if (increase>0){
                        w.suddenIncrease = increase;
                        w.dateIncrease1 = inDate1;
                        w.dateIncrease2 = inDate2;
                        if (wellDomain.increaseMax==undefined)
                            wellDomain.increaseMax = w.suddenIncrease;
                        else
                            wellDomain.increaseMax = Math.max(wellDomain.increaseMax,w.suddenIncrease);
                    }
                }
            }
            if (wellDomain.increaseMax>0){
                var linearScale = d3.scale.linear()
                    .domain([0,wellDomain.increaseMax])
                    .range([minRadius+1,maxRadius]);

                // Compute radius of wells
                for (var key in idv.wellMap){
                    var w = idv.wellMap[key];
                    if (w.suddenIncrease==undefined)
                        w.radius = minRadius;
                    else
                        w.radius = linearScale(w.suddenIncrease);
                }
            }
        }
        else if (choice=="Sudden decrease"){
            if (wellDomain.decreaseMax==undefined){
                var min =  99999;
                var max = -99999;
                for (var key in idv.wellMap){
                    var w = idv.wellMap[key];
                    var previousDate =undefined;
                    var previousValue=undefined;
                    var currentDate  =undefined;
                    var currentValue =undefined;
                    var decrease = -99999;
                    var deDate1 = -99999;
                    var deDate2 = -99999;
                    for (var key2 in w.detail){
                        if (key2.match(/[-]\d\d[-]/)){  // key2 contain a date format
                            previousDate = currentDate;
                            previousValue = currentValue;
                            currentDate = key2;
                            currentValue = +w.detail[key2];
                            if (previousDate!=undefined){
                                var d1 = new Date(previousDate);
                                var m1 = (d1.getYear()-startYear)*12 + d1.getMonth();
                                var d2 = new Date(currentDate);
                                var m2 = (d2.getYear()-startYear)*12 + d2.getMonth();
                                if (m2==m1+1 || m2==m1){   // Maybe in the same month
                                    //decrease = Math.max(decrease,previousValue-currentValue);
                                    if (previousValue-currentValue>decrease){
                                        decrease = previousValue-currentValue;
                                        deDate1 = previousDate;
                                        deDate2 = currentDate;
                                    }
                                }
                            }
                        }
                    }
                    if (decrease>0){
                        w.suddenDecrease = decrease;
                        w.dateDecrease1 = deDate1;
                        w.dateDecrease2 = deDate2;
                        if (wellDomain.decreaseMax==undefined)
                            wellDomain.decreaseMax = w.suddenDecrease;
                        else
                            wellDomain.decreaseMax = Math.max(wellDomain.decreaseMax,w.suddenDecrease);
                    }
                }
            }
            if (wellDomain.decreaseMax>0){
                var linearScale = d3.scale.linear()
                    .domain([0,wellDomain.decreaseMax])
                    .range([minRadius+1,maxRadius]);

                // Compute radius of wells
                for (var key in idv.wellMap){
                    var w = idv.wellMap[key];
                    if (w.suddenDecrease==undefined)
                        w.radius = minRadius;
                    else
                        w.radius = linearScale(w.suddenDecrease);
                }
            }
        }

// Horizon graph
        var topWells = getTop20Wells();
        // Long sets active wells
        idv.wellManager.activateWells(topWells);



        //drawHorizon(topWells);
        redrawAllWells();

        idv.controller.setDefaultCursor();

    };

    setTimeout(function () {
        handleSelection();
        idv.stopSpinning();
    }, 100);

};


function computeAverageForWell(w) {
  var sum=0;
  var count=0;
  for (var key2 in w.detail){
    if (key2.match(/[-]\d\d[-]/)){  // key2 contain a date format
      sum+=+w.detail[key2];
      count++;
    }  
  } 
  w.average = sum/count;
};

function computeAverageForWellByInterpolate(w) {
  var sum=0;
  var count=0;
  for (var i=0; i<w.interpolate.length;i++){
    if (w.interpolate[i]!=undefined){
      sum+=+w.interpolate[i];  
      count++;
    }  
  } 
  w.average = sum/count;
};


var averageWellsArray = {};
var averageWellsValue = {};
function computeAverage() {
  for (var key in idv.wellMap){
    var w = idv.wellMap[key];
    for (var key2 in w.detail){
      if (key2.match(/[-]\d\d[-]/)){  // key2 contain a date format
        var d1 = new Date(key2);
        var m1 = (d1.getYear()-startYear)*12 + d1.getMonth();
        if (averageWellsArray[m1]==undefined){
          averageWellsArray[m1] = [];
        }       
        averageWellsArray[m1].push(+w.detail[key2]);
      }        
    }  
  }
  for (var key in averageWellsArray){
    var sum = 0; 
    for (var i=0; i< averageWellsArray[key].length;i++){
      sum += averageWellsArray[key][i];
    }
    averageWellsValue[key] = sum/averageWellsArray[key].length;
  }  
};

function computeMaxST() {
  var maxST =0;
  for (var key in idv.wellMap){
    var w = idv.wellMap[key];
    for (var key2 in w.detail){
      if (key2.match(/[-]\d\d[-]/)){  // key2 contain a date format
        var v = +w.detail[key2];
        if (v>maxST)
          maxST = v;
      }        
    }  
  }
  
  return maxST;
};

function changeAverage() {
};



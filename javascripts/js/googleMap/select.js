/* 2017 
 * Tommy Dang, Assistant professor, iDVL@TTU
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */


var numNeighbor = 19;  //Numeber of Neighbors to compute average

var choices = ["Number of measurements", "Average over time", "Standard Deviation", "Sudden increase", "Sudden decrease"];
var averageChoices = [numNeighbor +" Neighbor", "County", "Ogallala"];
var wellDomain = {};

var select =d3.select("#selectDiv")
  .append('select')
    .attr('class','select')
    .on('change',changeSelection)

var selectAverage =d3.select("#averageDiv")
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
        if (w.average==undefined){ 
          var sum=0;
          var count=0;
          for (var key2 in w.detail){
            if (key2.match(/[-]\d\d[-]/)){  // key2 contain a date format
              sum+=+w.detail[key2];
              count++;
            }  
          } 
          w.average = sum/count;
        }  
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
  else if (choice==choices[3]){     
    if (wellDomain.inscreaseMax==undefined){ 
      var min =  99999;
      var max = -99999;  
      for (var key in idv.wellMap){
        var w = idv.wellMap[key];
        var previousDate =undefined;
        var previousValue=undefined;
        var currentDate  =undefined;
        var currentValue =undefined;
        var increase = -99999;
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
                  increase = Math.max(increase,currentValue-previousValue);
              }
            }
          }  
        }
        if (increase>0){
          w.suddenInscrease = increase;
          if (wellDomain.inscreaseMax==undefined)
            wellDomain.inscreaseMax = w.suddenInscrease;
          else
            wellDomain.inscreaseMax = Math.max(wellDomain.inscreaseMax,w.suddenInscrease);
        }
      }

      if (wellDomain.inscreaseMax>0){
        var linearScale = d3.scale.linear()
                        .domain([0,wellDomain.inscreaseMax])
                        .range([minRadius+1,maxRadius]);

        // Compute radius of wells
        for (var key in idv.wellMap){
          var w = idv.wellMap[key];
          if (w.suddenInscrease==undefined)
            w.radius = minRadius;
          else
            w.radius = linearScale(w.suddenInscrease);   
        }    
      }      
    }  
  }  

// Horizon graph 
  var topWells = getTop20Wells();
  drawHorizon(topWells); 


  // Long sets active wells
  idv.wellManager.activateWells(topWells);
  
  redrawAllWells();
   
  // Long code ***************  redraw line graphs
  idv.wellManager.plotWellMarkerOnContour(idv.CONTOUR_DIV_ID, idv.wellMap, false);
  idv.colorManager.updateContourWellColors();

};

function changeAverage() {
};



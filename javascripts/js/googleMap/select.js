/* 2017 
 * Tommy Dang, Assistant professor, iDVL@TTU
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */


var choices = ["Number of measures", "Average", "Standard Deviation", "Sudden increase", "Sudden decrease"];
var averageChoices = ["None", "9 Neighbor Average", "County Average", "Ogallala Average"];
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

var minRadius = 3;
var maxRadius = 10;


function changeSelection() {
    choice = d3.select('select').property('value')
    if (idv==undefined || idv.wellMap==undefined) return;
    if (choice==choices[0]){
      wellDomain.measureMin =  99999;
      wellDomain.measureMax = -99999;  
      for (var key in idv.wellMap){
        var w = idv.wellMap[key];
        wellDomain.measureMin = Math.min(wellDomain.measureMin,w.detail.totalMeasurementDate);
        wellDomain.measureMax = Math.max(wellDomain.measureMax,w.detail.totalMeasurementDate);     
      }
      var linearScale = d3.scale.linear()
                          .domain([wellDomain.measureMin,wellDomain.measureMax])
                          .range([minRadius,maxRadius]);
      for (var key in idv.wellMap){
        var w = idv.wellMap[key];
        w.radius = linearScale(w.detail.totalMeasurementDate);   
      }

    }
    else if (choice==choices[1]){
      wellDomain.averageMin =  99999;
      wellDomain.averageMax = -99999;  
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
          wellDomain.averageMin = Math.min(wellDomain.averageMin,w.average);
          wellDomain.averageMax = Math.max(wellDomain.averageMax,w.average);
          //console.log("numWell="+count+ " average="+w.average);         
        }
      }
      var linearScale = d3.scale.linear()
                          .domain([wellDomain.averageMin,wellDomain.averageMax])
                          .range([minRadius,maxRadius]);
      // Compute radius of wells
      for (var key in idv.wellMap){
        var w = idv.wellMap[key];
        w.radius = linearScale(w.average);   
      }
    }
    redrawMap(selectedWells);
};

function changeAverage() {
    choice = d3.select('select').property('value')
    if (idv==undefined || idv.wellMap==undefined) return;
    if (choice==choices[0]){
      wellDomain.measureMin =  99999;
      wellDomain.measureMax = -99999;  
      for (var key in idv.wellMap){
        var w = idv.wellMap[key];
        wellDomain.measureMin = Math.min(wellDomain.measureMin,w.detail.totalMeasurementDate);
        wellDomain.measureMax = Math.max(wellDomain.measureMax,w.detail.totalMeasurementDate);     
      }
      var linearScale = d3.scale.linear()
                          .domain([wellDomain.measureMin,wellDomain.measureMax])
                          .range([minRadius,maxRadius]);
      for (var key in idv.wellMap){
        var w = idv.wellMap[key];
        w.radius = linearScale(w.detail.totalMeasurementDate);   
      }
    }
    else if (choice==choices[1]){
      wellDomain.averageMin =  99999;
      wellDomain.averageMax = -99999;  
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
          wellDomain.averageMin = Math.min(wellDomain.averageMin,w.average);
          wellDomain.averageMax = Math.max(wellDomain.averageMax,w.average);
          //console.log("numWell="+count+ " average="+w.average);         
        }
      }
      var linearScale = d3.scale.linear()
                          .domain([wellDomain.averageMin,wellDomain.averageMax])
                          .range([minRadius,maxRadius]);
      // Compute radius of wells
      for (var key in idv.wellMap){
        var w = idv.wellMap[key];
        w.radius = linearScale(w.average);   
      }
    }
};



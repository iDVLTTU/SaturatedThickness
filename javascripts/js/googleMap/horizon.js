/* 2017 
 * Tommy Dang, Assistant professor, iDVL@TTU
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */


var countyAverage ={};
var startYear = 95;
var endYear = 117;
var numMonths = (endYear-startYear)*12;

function computeCountyAverage(){
  for (var k in idv.wellMap){
    var w = idv.wellMap[k];
    var county = w.detail.county;
    if (countyAverage[county]==undefined){
      countyAverage[county] = {};
    }
    for (var key in w.detail){
      if (key.match(/[-]\d\d[-]/)){  // key2 contain a date format
        var d = new Date(key);
        var m = (d.getYear()-startYear)*12 + d.getMonth();
        var v =+w.detail[key];
        if (countyAverage[county][m]==undefined)
          countyAverage[county][m] = [];
        countyAverage[county][m].push(v);
       // count++;
      }  
    }  
  }  

  // Compute county average
  for (var c in countyAverage){
    var county = countyAverage[c];
    for (var m in county){
      var monthData = county[m];
      var sum = 0;
      for (var i=0; i<monthData.length;i++){
        sum += monthData[i];
      }
      if (monthData.length>0)
        monthData["average"] = sum/monthData.length;
    }  
  }  
}

// interpolate month well data based on county average and time
function interpolate(){
  for (var k in idv.wellMap){
    var w = idv.wellMap[k].detail;
    var obj = {};
    obj.key = k;
    obj.values = [];
    var count = 0;
    for (var key in w){
      if (key.match(/[-]\d\d[-]/)){  // key2 contain a date format
        var v =+w[key];
        var d = new Date(key);
        var m = (d.getYear()-startYear)*12 + d.getMonth();
        //obj.values.push((v-3000)/3000);
        obj.values[m] = (v-3000)/3000;
        count++;
      }  
    }
    // Insert county values to array
    for (var i=0; i<numMonths; i++){
      if (obj.values[i]==undefined){
       // console.log(countyAverage[k]+" k="+k);
        var counttyName = w.county;
        if (countyAverage[counttyName][i]!=undefined && countyAverage[counttyName][i].average!=undefined){
          var v = countyAverage[counttyName][i].average;
           obj.values[i] = (v-3000)/3000;
        }    
      }
    } 
    // Extend by interpolate the middle point.
    var obj2 = {};
    obj2.key = "well "+k;
    obj2.values = [];
    for (var m=0; m<numMonths; m++){
      obj2.values[m*2] = obj.values[m]; 
    } 

    // Interpolate missing months
    interpolate(obj2.values, 2);
    interpolate(obj2.values, 3);
    interpolate(obj2.values, 4);
    interpolate(obj2.values, 5);
    interpolate(obj2.values, 6);  
    interpolate(obj2.values, 7);
    interpolate(obj2.values, 8);
    interpolate(obj2.values, 9);
    interpolate(obj2.values, 10);
    interpolate(obj2.values, 11);
    interpolate(obj2.values, 12);
  
  
    // Interpolate for step months
    function interpolate(array, step){
      for (var m=0; m<numMonths; m++){
        if (array[m*2]!=undefined && array[m*2+step*2]!=undefined){
          var missing = true;
          for (var i=1; i<step; i++){
            if (array[m*2+i*2] !=undefined)
              missing = false;
          }
          if (missing){
            for (var i=1; i<step; i++){
              array[m*2+i*2] = obj2.values[m*2]+(obj2.values[m*2+step*2]-obj2.values[m*2])*i/step; 
            }
          }
        }
      }  
    }

    // Interpolate the value beween 2 continuous months
    for (var m=0; m<numMonths; m++){
      if (obj2.values[m*2]!=undefined && obj2.values[m*2+2]!=undefined)
        obj2.values[m*2+1] = (obj2.values[m*2]+obj2.values[m*2+2])/2; 
    }  

    // Copy the real and interpolated values to wellMap 
    idv.wellMap[k].interpolate = obj2.values;
  } 
}

// Select the top 20 wells based on radius
function getTop20Wells(){
  // Clean of any previus horizons
  d3.select("#horizonChart").selectAll('.horizon').remove();
  d3.select("#horizonChart").selectAll('.horizonSVG').remove();

  var allWells = d3.entries(idv.wellMap);
  allWells.sort (function(a, b) {
      return b.value.radius- a.value.radius;
  });
  var topWells = [];
  for (var i=0;i<20;i++){
    console.log(allWells[i].value.id);
    topWells.push(allWells[i]);
  }
  return topWells;
}

// Draw Horizon graph
function drawHorizon(wellList){
  d3.select("#horizonChart").selectAll('.horizon')
    .data(wellList)
    .enter()
    .append('div')
    .attr('class', 'horizon')
    .each(function(d) {
        d3.horizonChart()
            .title("well "+d.key)
            .colors([ '#830', '#c96', '#48b', '#237'])
           // .colors([ '#4575b4', '#abd9e9', '#fee090', '#f46d43'])
           // .colors(['rgba(250,200,160,1)', 'rgba(200,150,130,255)', 'rgb(200,160,80)', 'rgb(0,120,160)', 'rgb(0,60,120)', 'rgb(0,0,60)'])
            .height(30)
            .call(this, d.value.interpolate);
    });

  // Draw x axis *********************************
  var mindate = new Date(1900+startYear,1,1),
      maxdate = new Date(1900+endYear,1,1);
          
  // define the y axis
  var xScale = d3.time.scale()
          .domain([mindate, maxdate])    // values between for month of january
          .range([0, 2*numMonths]);   // map these the the chart width = total width minus padding at both sides      

  var xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(xScale);

  var svgAxis = d3.select("#horizonChart").append("svg")
            .attr("class", "horizonSVG")
            .attr("width", 700)
            .attr("height", 20)
            .append("g")
              .attr("transform", "translate(" + 75 + "," + 20 +")");
        
  svgAxis.append("g")
      .attr("class", "xaxis")   // give it a class so it can be used to select only xaxis labels  below
      .attr("dy", -13)
      .attr("transform", "translate(" + 0 + "," + -20 +")")
      .call(xAxis);  
    
}




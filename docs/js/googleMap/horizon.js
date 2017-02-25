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
var cut = 103;


function cleanNegativeData(){
  for (var k in idv.wellMap){
    var w = idv.wellMap[k];
    for (var key in w.detail){
      if (key.match(/[-]\d\d[-]/)){  // key2 contain a date format
        var d = new Date(key);
        var m = (d.getYear()-startYear)*12 + d.getMonth();
        var v =+w.detail[key];
        if (v<=0)
          delete w.detail[key];
         
      }  
    }  
  }  
}

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
  //var maxST = computeMaxST();
  ////  for (var key in idv.wellMap){
   ///   var w = idv.wellMap[key];
   //   w.detail["2015-01-15"] = maxST;
   // }
    

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
        obj.values[m] = v;//(v-cut)/cut;
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
           obj.values[i] = v;//(v-cut)/cut;
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
    //interpolate(obj2.values, 2);
    //interpolate(obj2.values, 3);
    //interpolate(obj2.values, 4);
    //interpolate(obj2.values, 5);
    //interpolate(obj2.values, 6);  
    //interpolate(obj2.values, 7);
    //interpolate(obj2.values, 8);
    //interpolate(obj2.values, 9);
    //interpolate(obj2.values, 10);
    //interpolate(obj2.values, 11);
    //interpolate(obj2.values, 12);
  
  
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
  var allWells = d3.entries(idv.wellMap);
  allWells.sort (function(a, b) {
      return b.value.radius- a.value.radius;
  });
  var topWells = [];
  for (var i=0;i<numNeighbor+1;i++){ //numNeighbor is defined in select.js 
    topWells.push(allWells[i].value);
  }
  return topWells;
}


//[[0, 'rgba(255, 255, 255,0)'],[0.1, 'rgba(250,200,160,1)'], [0.2, 'rgba(200,150,130,255)'], [0.3, 'rgb(160,160,80)'], [0.4, 'rgb(0,120,160)'], [0.7, 'rgb(0,60,120)'] , [1, 'rgb(0,0,60)']]
//        };

var colorList = ['rgba(250,200,160,1)', 'rgba(200,150,130,255)'] 
// Draw Horizon graph
function drawHorizon(wellList){
  // Clean of any previus horizons
  d3.select("#horizonChart").selectAll('.horizon').remove();
  d3.select("#horizonChart").selectAll('.horizonSVG').remove();
  d3.select("#horizonChart").selectAll('.horizon')
    .data(wellList)
    .enter()
    .append('div')
    .attr('class', 'horizon')
    .each(function(d) {
        d3.horizonChart()
            .title("well "+d.id)
            //.colors(idv.colorManager.getAllWaterColorsAsArray())  // colorsWater is defined in color.manager.js
           // .colors([ '#4575b4', '#abd9e9', '#fee090', '#f46d43'])
           // .colors(['rgb(255,0,255)','rgb(255,0,0)','rgba(250,200,160)', 'rgba(200,150,130)', 'rgb(160,160,80)', 'rgb(0,120,160)', 'rgb(0,60,120)', 'rgb(0,0,60)'])
            .colors(['#313695', '#313695', '#4575b4', '#74add1', '#abd9e9',
                     'rgb(250,200,160)', 'rgba(200,150,130,255)','rgb(160,160,80)', 'rgb(0,120,160)', 'rgb(0,60,120)']) // can not add 'rgb(0,0,60)' because the max saturated thickness is 548.9
            .height(27)
            .call(this, d.interpolate);
    });

  //
  // d3.selectAll('.horizon')
  //     .insert('span', ':nth-child(2)')
  //     .attr('class', 'mytest')
  //     .attr('width', 10)
  //     .attr('height', 10)
  //     .style('fill', '#000')
  //     .text('1')
  // ;

  var div = d3.select("body").append("div")
      .attr("class", "tooltip horizon-tooltip")
      .style("opacity", 0);

    d3.selectAll('.horizon')
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("County: " + d.detail.county)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");

          var wellName = d.getName();
          idv.timeChartManager.activateWellAsAreaChart(wellName);
          idv.comparisonChart.generateAverageComparisonChart('average', wellName, false);

            setCenter(d.detail.position.lat, d.detail.position.lon);


        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .insert('svg', ':nth-child(2)')
          .attr('width', 14)
          .attr('height', 14)
          .attr("class", "horizon-chart-well ")

        .append('circle')
          .attr('cx', 6)
          .attr('cy', 6)
          .attr('stroke-width', 0.5)
          .attr('stroke', '#000')
          .attr('r', 5)
          .style('fill', function (d) {
              return d.getMyColor();
          })
        // .text('1')
    ;

  // d3.select("#horizonChart").selectAll('.title').on("mouseover", function(d){
  //   d3.select("#horizonChart").selectAll('.title').style("color", function(d){
  //     return d.getMyColor();
  //   });
  // });

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
              .attr("transform", "translate(" + 85 + "," + 20 +")");
        
  svgAxis.append("g")
      .attr("class", "xaxis")   // give it a class so it can be used to select only xaxis labels  below
      .attr("dy", -13)
      .attr("transform", "translate(" + 0 + "," + -20 +")")
      .call(xAxis);  
    
}




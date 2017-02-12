/* 2017 
 * Tommy Dang, Assistant professor, iDVL@TTU
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

var stocks = [];

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

// Draw Horizon graph
function drawHorizon(){
  for (var k in idv.wellMap){
    var w = idv.wellMap[k].detail;
    var obj = {};
    obj.stock = k;
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
    obj2.stock = k;
    obj2.values = [];
    for (var m=0; m<numMonths; m++){
      obj2.values[m*2] = obj.values[m]; 
    } 

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

    
    /*
    // Interpolate the middle month if missing
    for (var m=0; m<numMonths; m++){
      if (obj2.values[m*2]!=undefined && obj2.values[m*2+4]!=undefined && obj2.values[m*2+2]==undefined)
        obj2.values[m*2+2] = (obj2.values[m*2]+obj2.values[m*2+4])/2; 
    }
    // Interpolate the 2 middle month if missing
    for (var m=0; m<numMonths; m++){
      if (obj2.values[m*2]!=undefined && obj2.values[m*2+6]!=undefined && obj2.values[m*2+2]==undefined && obj2.values[m*2+4]==undefined){
         obj2.values[m*2+2] = obj2.values[m*2]+(obj2.values[m*2+6]-obj2.values[m*2])*0.33; 
         obj2.values[m*2+4] = obj2.values[m*2]+(obj2.values[m*2+6]-obj2.values[m*2])*0.66; 
      }
    }  

    // Interpolate for 4 months
    for (var m=0; m<numMonths; m++){
      if (obj2.values[m*2]!=undefined && obj2.values[m*2+8]!=undefined && obj2.values[m*2+2]==undefined && obj2.values[m*2+4]==undefined && obj2.values[m*2+6]==undefined){
         obj2.values[m*2+2] = obj2.values[m*2]+(obj2.values[m*2+8]-obj2.values[m*2])*0.25; 
         obj2.values[m*2+4] = obj2.values[m*2]+(obj2.values[m*2+8]-obj2.values[m*2])*0.50; 
         obj2.values[m*2+6] = obj2.values[m*2]+(obj2.values[m*2+8]-obj2.values[m*2])*0.75; 
      }
    }  

    // Interpolate for 5 months
    for (var m=0; m<numMonths; m++){
      if (obj2.values[m*2]!=undefined && obj2.values[m*2+10]!=undefined && obj2.values[m*2+2]==undefined && obj2.values[m*2+4]==undefined && obj2.values[m*2+6]==undefined && obj2.values[m*2+8]==undefined){
         obj2.values[m*2+2] = obj2.values[m*2]+(obj2.values[m*2+10]-obj2.values[m*2])*0.2; 
         obj2.values[m*2+4] = obj2.values[m*2]+(obj2.values[m*2+10]-obj2.values[m*2])*0.4; 
         obj2.values[m*2+6] = obj2.values[m*2]+(obj2.values[m*2+10]-obj2.values[m*2])*0.6; 
         obj2.values[m*2+8] = obj2.values[m*2]+(obj2.values[m*2+10]-obj2.values[m*2])*0.8; 
      }
    } 

    // Interpolate for 6 months
    for (var m=0; m<numMonths; m++){
      if (obj2.values[m*2]!=undefined && obj2.values[m*2+12]!=undefined && obj2.values[m*2+2]==undefined && obj2.values[m*2+4]==undefined && obj2.values[m*2+6]==undefined && obj2.values[m*2+8]==undefined && obj2.values[m*2+10]==undefined){
         obj2.values[m*2+2] = obj2.values[m*2]+(obj2.values[m*2+12]-obj2.values[m*2])*0.167; 
         obj2.values[m*2+4] = obj2.values[m*2]+(obj2.values[m*2+12]-obj2.values[m*2])*0.333; 
         obj2.values[m*2+6] = obj2.values[m*2]+(obj2.values[m*2+12]-obj2.values[m*2])*0.5; 
         obj2.values[m*2+8] = obj2.values[m*2]+(obj2.values[m*2+12]-obj2.values[m*2])*0.666; 
         obj2.values[m*2+10]= obj2.values[m*2]+(obj2.values[m*2+12]-obj2.values[m*2])*0.833; 
      }
    }  

    // Interpolate for 7 months
    for (var m=0; m<numMonths; m++){
      if (obj2.values[m*2]!=undefined && obj2.values[m*2+14]!=undefined && obj2.values[m*2+2]==undefined && obj2.values[m*2+4]==undefined && obj2.values[m*2+6]==undefined && obj2.values[m*2+8]==undefined && obj2.values[m*2+10]==undefined && obj2.values[m*2+12]==undefined){
         obj2.values[m*2+2] = obj2.values[m*2]+(obj2.values[m*2+14]-obj2.values[m*2])*1/7; 
         obj2.values[m*2+4] = obj2.values[m*2]+(obj2.values[m*2+14]-obj2.values[m*2])*2/7; 
         obj2.values[m*2+6] = obj2.values[m*2]+(obj2.values[m*2+14]-obj2.values[m*2])*3/7; 
         obj2.values[m*2+8] = obj2.values[m*2]+(obj2.values[m*2+14]-obj2.values[m*2])*4/7; 
         obj2.values[m*2+10]= obj2.values[m*2]+(obj2.values[m*2+14]-obj2.values[m*2])*5/7; 
         obj2.values[m*2+12]= obj2.values[m*2]+(obj2.values[m*2+14]-obj2.values[m*2])*6/7; 
      }
    } */

   // function interpolate(array, step){ 

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

    if (count>18)
      stocks.push(obj2);
  }
  d3.select('body').selectAll('.horizon')
    .data(stocks)
    .enter()
    .append('div')
    .attr('class', 'horizon')
    .each(function(d) {
        d3.horizonChart()
            .title(d.stock)
           // .colors(['rgba(250,200,160,1)', 'rgba(200,150,130,255)', 'rgb(200,160,80)', 'rgb(0,120,160)', 'rgb(0,60,120)', 'rgb(0,0,60)'])
            .height(30)
            .call(this, d.values);
    });
}




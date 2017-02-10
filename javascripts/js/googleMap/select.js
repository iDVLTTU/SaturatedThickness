/* 2017 
 * Tommy Dang, Assistant professor, iDVL@TTU
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

 var choices = ["Average", "Standard Deviation", "Sudden increase", "Sudden decrease"];

var select =d3.select("#selectDiv")
  .append('select')
    .attr('class','select')
    .on('change',onchange)


var options = select
  .selectAll('option')
    .data(choices).enter()
    .append('option')
        .text(function (d) { return d; });

function onchange() {
    choice = d3.select('select').property('value')
    if (idv==undefined || idv.wellMap==undefined) return;
    if (choice==choices[0]){
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
          console.log("numWell="+count+ " average="+w.average);      
        }
      }
   
    }
};



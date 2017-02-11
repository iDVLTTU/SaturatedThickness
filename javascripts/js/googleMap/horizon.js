/* 2017 
 * Tommy Dang, Assistant professor, iDVL@TTU
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

var stocks = [];
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
        obj.values.push((v-3000)/3000);
        count++;
      }  
    }  
    if (count>20)
      stocks.push(obj);
  }
  d3.select('body').selectAll('.horizon')
    .data(stocks)
    .enter()
    .append('div')
    .attr('class', 'horizon')
    .each(function(d) {
        d3.horizonChart()
            .title(d.stock)
            .colors(['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027'])
            .call(this, d.values);
    });
}

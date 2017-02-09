/* 2017 
 * Tommy Dang, Assistant professor, iDVL@TTU
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

var map; 
var mapZoom=8;

//var mapLat = 32.24;   Lubbock
// var mapLng = -101.479;
var mapLat =  35.6573;
var mapLng = -101.6125;


var mapId = google.maps.MapTypeId.TERRAIN;
var overlay;
var layer;
var bounds;
var selectedWells=[];
var numberNearestWell=9;
// Add a default well
//selectedWells.push(idv.wellMap["233701"]);
redrawMap();

// Initialize the google map
function init(){
	map = new google.maps.Map(d3.select("#map").node(),{
     zoom: mapZoom,
     draggableCursor: 'crosshair',
    center: new google.maps.LatLng(mapLat, mapLng),
    mapTypeId: mapId
  });
  bounds   = new google.maps.LatLngBounds();
	overlay  = new google.maps.OverlayView();
  overlay.onAdd = function() {
    layer = d3.select(this.getPanes().overlayMouseTarget).append("div").attr("class", "stations");
  }

  // When user clicks on the google map                  
      google.maps.event.addListener(map, 'click', function (event) {
            var coordsLabel = document.getElementById("tdCursor");
            var pnt=event.latLng;  
            var lat = pnt.lat();
            lat = lat.toFixed(4);
            var lng = pnt.lng();
            lng = lng.toFixed(4);
            console.log("Map clicked at Latitude: " + lat + "  Longitude: " + lng);
            var clickedPixel = idv.getClosestPointPixelDataForPosition(lng, lat);
            //console.log("clickedPixel: " + clickedPixel);  
            drawNearestWells(clickedPixel.x, clickedPixel.y);
      });
}



// Redraw wells on map for every click
function redrawMap(wellList) {
  	init();  // Reload a new map ***************

    var data = {};
    for (var i=0; i<wellList.length;i++){
    	well = wellList[i];
    	data[well.id+" at "+ well.detail.county] = well;
    }
	

    

   overlay.draw = function() {
      var projection = this.getProjection(), padding = 10;
      var marker = layer.selectAll("svg").data(d3.entries(data)).each(transform)
                        .enter().append("svg:svg")
                        .each(transform)
                        .attr("class", "marker");
      
    //if (selectedWells.length>0)                    
      layer.selectAll("svg").call(tip);
                   
      // Add a circle.
      marker.append("svg:circle")
                        .attr("r", function(d,i){ return i==0 ? 6 : 4;})
                        .attr("cx", padding)
                        .attr("cy", padding)
                        .attr("fill", function(d){ return d.value.getMyColor(); })
                        .on("mouseover",showTip)
                        .on("mouseout",mouseout)
                        .on("click", clickWell);

      // Add a label.
      marker.append("svg:text")
                        .attr("x", padding + 7)
                        .attr("y", padding)
                        .attr("dy", ".31em")
                        .attr("class","marker_text")
                        .text(function(d) {return d.key; });

     
 
      function displayCoordinates(pnt) {
          /*debugger;
          
          var wlist = [];
          for (var key in idv.wellMap){
            var w = idv.wellMap[key];
            // 
            w["distanceToSelectedWell"] = getPixelDistance(d.value.pointX, d.value.pointX, w)
            wlist.push(w);
          }
          wlist.sort(function(a, b) {
            return a["distanceToSelectedWell"] - b["distanceToSelectedWell"];
          });

          var wlist2 = [];
          for (var i=0; i<numberNearestWell+1;i++){
            wlist2.push(wlist[i]); 
          }  */
      } 
      function transform(d) {
        //d = new google.maps.LatLng(d.value[1], d.value[0]);
        d = new google.maps.LatLng(d.value.detail.position.lat, d.value.detail.position.lon);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this).style("left", (d.x - padding) + "px").style("top", (d.y - padding) + "px");
      }
     
      function mouseout(d){
        tip.hide(d);
        d3.select(this).transition()
            .duration(100)
            .attr("stroke-width",0.5);
      };

      function clickWell(d){
        tip.hide(d);
        console.log("Well clicked: "+d.value.id);
        drawNearestWells(d.value.pointX, d.value.pointY);
      };
    };
    overlay.setMap(map);
  }

// Get and draw the neareat well from a GPS location
// This function can be used for both Well and Map clicked
function drawNearestWells(pointX, pointY){
  var wlist = [];
  for (var key in idv.wellMap){
    var w = idv.wellMap[key];
    w["distanceToSelectedWell"] = getPixelDistance(pointX, pointY, w)
    wlist.push(w);
  }
  wlist.sort(function(a, b) {
    return a["distanceToSelectedWell"] - b["distanceToSelectedWell"];
  });

  var wlist2 = [];
  for (var i=0; i<numberNearestWell+1;i++){
    wlist2.push(wlist[i]); 
  }

  // Redraw the map ***********************
  mapZoom = map.zoom;
  mapLat = map.center.lat();
  mapLng = map.center.lng();
  mapId = map.mapTypeId;
  redrawMap(wlist2);

    idv.wellManager.activateWells(wlist2);
  //var wellGPS = {lat: +d.value.detail.position.lat, lng: +d.value.detail.position.lon};
}

// Get the distance of well d2 to the (pointX, pointY)
function getPixelDistance(pointX, pointY,d2){
  return (pointX - d2.pointX)*(pointX - d2.pointX)+
         (pointY - d2.pointY)*(pointY - d2.pointY)
};



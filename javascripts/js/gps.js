var x = document.getElementById("demo");
var idv = idv || {};

idv.handlePositionSuccess = function(position) {
   // idv.myPosition = {lon: position.coords.longitude, lat: position.coords.latitude};
    console.log("Position success");

    idv.load();
};

idv.showMyPosition = function(myPosition, plotMyPositionAtPointCallback) {
    if (myPosition == null) {
        return;
    }

    var lat = myPosition.lat;
    var lon = myPosition.lon;

    d3.csv("data/raster_to_point.csv", function(error, rasterData) {
        console.log("raster_to_point");
        var index = -1;
        var min = 1000;
        for (var i = 0; i < rasterData.length; i++) {
            var x = rasterData[i].x_center;
            var y = rasterData[i].y_center;
            var dis = (lon - x) * (lon - x) + (lat - y) * (lat - y);
            if (dis < min) {
                min = dis;
                index = i;
            }
        }

        var pointId = index + 1;
        plotMyPositionAtPointCallback(pointId);
    });

};

idv.plotMyPositionAtPoint = function(pointId) {
    if (pointId<1) {
        console.log("Could not find my position");
        return; // position not found in map
    }

    var myPoint = idv.pointMap[pointId];
    console.log("pointId:"+pointId);
    var myPositionMarker = [{
        x: [myPoint.x],
        y: [myPoint.y],
        // line: {'color': 'rgb(0, 0, 0,)',},
        // mode: 'circle',
        name: "Current Position",
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: "#a0f",
            size: 10
        }
    }];

    Plotly.addTraces(idv.CONTOUR_DIV_ID , myPositionMarker);
    alertFunc();
    function alertFunc() {
        //alert("Hello!");
        d3.selectAll(".point").style("stroke-width", function (d) {
            return d.trace != null && d.trace.x == myPoint.x && d.trace.y==myPoint.y ? 1 : false;
            // return 1;

        });

        d3.selectAll(".point").transition()
            .style("stroke", function(d) {
                return d.trace != null && d.trace.x == myPoint.x && d.trace.y==myPoint.y ? "#a0f" : false;
                // return "#a0f";
            })
            .style("stroke-width", function (d) {
                return d.trace != null && d.trace.x == myPoint.x && d.trace.y==myPoint.y ? 12 : false;
                // return 12;

            });

        setTimeout(alertFunc, 500);
    }
};

function showPosition(position) {
    //x.innerHTML = "Latitude: " + position.coords.latitude + 
    //"<br>Longitude: " + position.coords.longitude;

    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
      
    d3.csv("data/raster_to_point.csv", function(error, data2) { 
      console.log("raster_to_point2");
        
      var index =-1;
      var min = 1000;
      for (var i=0; i<data2.length;i++){
        var x = data2[i].x_center;
        var y = data2[i].y_center;
        var dis = (lon-x)*(lon-x)+(lat-y)*(lat-y);
        if (dis<min){
          min=dis;
          index=i;
        }
      }
      
      var count=0;
      var col=-1;
      var row=-1;
      for (var i=0; i<data2D.length;i++){
        for (var j=0; j<data2D[i].length;j++){
          if (data2D[i][j]>=0)
            count++;
          if (count==index){
            col=i;
            row=j;
          }
        }
      }
      console.log("min index:"+index+" col="+col+" row="+row);

      var data2 = [{
          x: [row],
          y: [col],
          // line: {'color': 'rgb(0, 0, 0,)',},
          // mode: 'circle',
          name: "Current Position",
          mode: 'markers',
          type: 'scatter',
          marker: {
              color: "#a0f",
              size: 10
          }
        }
      ];
       Plotly.addTraces('myDiv', data2);

      alertFunc();
      function alertFunc() {  
        //alert("Hello!");
        d3.selectAll(".point").style("stroke-width", function (d) {
            return d.trace != null && d.trace.x == row && d.trace.y==col ? 1 : false;

        });

        d3.selectAll(".point").transition()
            .style("stroke", function(d) {
                // console.log(d);
                return d.trace != null && d.trace.x == row && d.trace.y==col ? "#a0f" : false;
            })
            .style("stroke-width", function (d) {
                return d.trace != null && d.trace.x == row && d.trace.y==col ? 12 : false;

            });

          setTimeout(alertFunc, 500);
      }

    });      
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }

    idv.load();
}


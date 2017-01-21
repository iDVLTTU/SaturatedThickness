var x = document.getElementById("demo");

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else { 
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    //x.innerHTML = "Latitude: " + position.coords.latitude + 
    //"<br>Longitude: " + position.coords.longitude;

    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
      
    d3.csv("data/raster_to_point.csv", function(error, data2) { 
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
          line: {'color': 'rgb(0, 0, 0,)',},
          mode: 'circle'
        }
      ];
      Plotly.addTraces('myDiv', data2);

      alertFunc();
      function alertFunc() {  
        //alert("Hello!");
        d3.selectAll(".point").style("stroke-width",1);

        //d3.selectAll(".point")[0].attr("class","location");
        d3.selectAll(".point").transition()
        .style("stroke","#a0f").style("stroke-width",12);
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
}


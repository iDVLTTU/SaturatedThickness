var x = document.getElementById("demo");
var idv = idv || {};

idv.handlePositionSuccess = function(position) {
    idv.myPosition = {lon: position.coords.longitude, lat: position.coords.latitude};
    console.log("Position success");

    idv.load();
};

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(idv.handlePositionSuccess, showError, {timeout: 5000, enableHighAccuracy: false, maximumAge: 3000});

        setTimeout(function () {
            if (!!idv.myPosition) {
                return;
            }

            showError({TIMEOUT: true});
        }, 3000);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}


idv.plotMyPositionAtPoint = function(pointId) {
    if (!pointId || pointId<1 || idv.pointMap[pointId] == null || idv.pointMap[pointId] == undefined) {
        console.log("Could not find my position on map");
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
    //alertFunc();
    function alertFunc() {

        if (idv.focus == false) {
            return;
        }
        
        d3.selectAll(".point").style("stroke-width", function (d) {
            return d.trace != null && d.trace.x == myPoint.x && d.trace.y==myPoint.y ? 1 : false;
            // return 1;

        });

        d3.selectAll(".point").transition()
            .style("stroke", function(d) {
                // debugger;
                if (d.trace != null && d.trace.x == myPoint.x && d.trace.y==myPoint.y ) {
                    return "#a0f";
                }
                // return d.trace != null && d.trace.x == myPoint.x && d.trace.y==myPoint.y ? "#a0f" : false;
                return "#000";
            })
            .style("stroke-width", function (d) {
                return d.trace != null && d.trace.x == myPoint.x && d.trace.y==myPoint.y ? 12 : 0.5;
                // return 12;

            });

        // idv.colorManager.updateContourWellColors();
        // setTimeout(alertFunc, 500);
    }

    setInterval(alertFunc, 1000);
};

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

    idv.myPosition = {};
    idv.load();
}


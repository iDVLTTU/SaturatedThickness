var idv = idv || {};
idv.wellManager = idv.wellManager || {};

idv.wellManager.DEFAULT_WELL_COLOR = "#000";
idv.wellManager.activeWell = [];

idv.wellManager.selectAllWells = function() {
    return d3.selectAll(".point");
};

idv.wellManager.getActiveWells = function() {
    return this.activeWell;
};

idv.wellManager.updateWellColor = function(well) {

    if (well.active == true) {
        var unusedColorKey = idv.colorManager.getUnusedColorKey();
        if (unusedColorKey === false) {
            alert("Support only " + idv.colorManager.SUPPORTED_COLOR_COUNT + " active wells");
            return false;
        }

        well.color = unusedColorKey;
    }
    else {
        // clear used color
        idv.colorManager.resetUsedColor(well.color);
    }

    idv.wellManager.selectAllWells().style("fill",
        function(d) {
            if (d.tx == null || d.tx == undefined) {
                return;
            }

            var relatedWell = idv.wellMap[d.tx];

            return relatedWell.getMyColor();
        }
    );

    return true;
};

idv.wellManager.findWellFromCoords = function(x, y) {
    var foundWell = null, tmpWell;
    for (var key in idv.wellMap) {
        if (!idv.wellMap.hasOwnProperty(key)) {
            continue;
        }

        tmpWell = idv.wellMap[key];
        if (tmpWell.minX <= x && tmpWell.minY <= y && tmpWell.maxX >= x && tmpWell.maxY >= y) {
            foundWell = tmpWell;
            break;
        }
    }

    return foundWell;
};


// Event Click on a well in contour map
idv.wellManager.handleWellOnClick = function(well) {

    idv.wellManager.handleWellSingleClick(well);
    var wellGPS = {lat: +well.detail.position.lat, lng: +well.detail.position.lon};

    selectedWells.push(well);
    redrawMap();
    map.setCenter(wellGPS);
    // var data = [
    //     {
    //         x: ['2013-10-04', '2013-11-04', '2013-12-04'],
    //         y: [1, 3, 6],
    //         type: 'scatter'
    //     }
    // ];
    //
    // Plotly.newPlot('wellTimeSeries', data);
};


idv.wellManager.handleWellDoubleClick = function(well) {
    console.log("double click: " + well.id);
};


idv.wellManager.handleWellSingleClick = function(well) {

    debugger;
    well.active = !well.active; // active or deactive the well
    if (well.active === true) {
        this.activeWell.push(well.id);
    }else {
        var index = this.activeWell.indexOf(well.id);
        if (index > -1) {
            this.activeWell.splice(index, 1);
        }
    }

    var updated = idv.wellManager.updateWellColor(well);
    // update time chart color if the well active
    if (updated == true) {
        idv.timeChartManager.updateTimeChartForWell(well);
    }
};



idv.wellManager.enableWellClick = function() {
    var myPlot = document.getElementById(idv.CONTOUR_DIV_ID);
    myPlot.on('plotly_click', function(data){
        var x, y;
        for(var i=0; i < data.points.length; i++){
            x = Math.round(data.points[i].x);
            y = Math.round(data.points[i].y)
        }

        var well = idv.wellManager.findWellFromCoords(x, y);
        if (well == null) {
            return;
        }

        idv.wellManager.handleWellOnClick(well);
    });
};

idv.wellManager.plotWellMarkerOnContour = function(contourDivId, wellXCoordinates, wellYCoordinates, wellIds) {
    var wellMarkers = {
        x: wellXCoordinates,
        y: wellYCoordinates,
        mode: 'markers',
        type: 'scatter',
        name: "Well",
        text: wellIds,
        marker: {
            size: 7,
            color: "rgba(0, 0, 0, 0.75)"
        }
    };


    Plotly.addTraces(contourDivId, wellMarkers);


    // var myData = [];
    // for(var i = 0; i <wellXCoordinates.length; i++) {
    //     myData.push([wellXCoordinates[i], wellYCoordinates[i]]);
    // }
    //
    // var color = d3.scale.category10();
    //
    // d3.select("svg")
    //     .selectAll("circle")
    //         .data(myData)
    //     .enter().append("circle")
    //         .attr("transform", function(d) { return "translate(" + d + ")"; })
    //         .attr("r", 10)
    //         .style("fill", function(d, i) { return color(i); })
    //         .on("click", function (d, i) {
    //             alert(d);
    //         })
    // ;
};

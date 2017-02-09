var idv = idv || {};
idv.wellManager = idv.wellManager || {};

idv.wellManager.DEFAULT_WELL_COLOR = "#000";
idv.wellManager.activeWells = [];

idv.wellManager.selectAllWells = function() {
    return d3.selectAll(".point");
};

idv.wellManager.getActiveWells = function() {
    return this.activeWells;
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
    redrawMap(selectedWells);
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

    well.active = !well.active; // active or deactive the well

    if (well.active === true) {
        this.activateWell(well, true);
    }
    else {
        this.deactivateWell(well, true);
    }
};

idv.wellManager.activateWell = function(well, force) {
    if (!well.hasOwnProperty("id")) {
        throw new Error("Invalid well");
    }

    if (!!force) {
        this.deactivateWells(this.getActiveWells());
    }

    well = idv.wellMap[well.id];
    well.active = true;
    var index = this.activeWells.indexOf(well.id);
    if (index < 0) {
        this.activeWells.push(well.id);
    }

    this.updateWellTimeChart(well, force);
};

/**
 * Activate wells and plot them onto a chart
 * @param wells with format [{id: 1122}, {id: 123}], or [id1, id2, id3]
 */
idv.wellManager.activateWells = function(wells) {
    if (!Array.isArray(wells)) {
        throw new Error('Expect array of wells');
    }

    debugger;
    // console.log(this.getActiveWells());
    //
    // wells.forEach(function (w) {
    //    return w.hasOwnProperty('id') ? w : idv.wellMap[w];
    // });
    //
    // var deactivateWells = [];
    // var currentActiveWells = this.getActiveWells();
    // var inTobeActivatedList;
    // for(var j =0; j< currentActiveWells.length; j++) {
    //     inTobeActivatedList = false;
    //     for(var k=0; k < wells.length; k++) {
    //          if (currentActiveWells[j] == wells[k].id) {
    //              inTobeActivatedList = true;
    //              break;
    //          }
    //     }
    //
    //     if (inTobeActivatedList == false) {
    //         deactivateWells.push(currentActiveWells[j]);
    //     }
    // }
    //
    // debugger;

    this.deactivateWells(deactivateWells);

    var tmpWell;
    for(var i=0; i< wells.length; i++) {
        tmpWell = wells[i];
        if (tmpWell != null && !tmpWell.hasOwnProperty('id')) {
            tmpWell = {id: tmpWell};
        }

        if (tmpWell.active === false) {
            this.activateWell(tmpWell, false);
        }
    }

    idv.timeChartManager.resetWellChart();
};

/**
 * Deactivate wells and remove them from a chart
 * @param wells with format [{id: 1122}, {id: 123}], or [id1, id2, id3]
 */
idv.wellManager.deactivateWells = function(wells) {
    if (!Array.isArray(wells)) {
        throw new Error('Expect array of wells');
    }
    debugger;
    var tmpWell;
    var labels = [];
    for(var i=0; i< wells.length; i++) {
        tmpWell = wells[i];
        if (tmpWell != null && !tmpWell.hasOwnProperty('id')) {
            tmpWell = {id: tmpWell};
        }

        tmpWell = this.deactivateWell(tmpWell, false);

        labels.push(tmpWell.getName());
    }

    idv.timeChartManager.refreshTimeChart(null, null, null, labels);
};

idv.wellManager.deactivateWell = function(well, force) {
    if (!well.hasOwnProperty("id")) {
        throw new Error("Invalid well");
    }

    well = idv.wellMap[well.id];
    well.active = false;
    var index = this.activeWells.indexOf(well.id);
    if (index > -1) {
        this.activeWells.splice(index, 1);
    }

    this.updateWellTimeChart(well, force);

    return well;
};

idv.wellManager.updateWellTimeChart = function(well, refreshChart) {
    var updated = idv.wellManager.updateWellColor(well);
    // update time chart color if the well active
    if (updated == true) {
        idv.timeChartManager.updateTimeChartForWell(well, refreshChart);
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

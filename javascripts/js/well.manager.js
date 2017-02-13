var idv = idv || {};
idv.wellManager = idv.wellManager || {};

idv.wellManager.DEFAULT_WELL_COLOR = "#000";
idv.wellManager.activeWells = [];

idv.wellManager.selectAllWells = function() {
    return d3.selectAll(".point");
};

idv.wellManager.getActiveWells = function() {
    return this.activeWells == null ? [] : this.activeWells;
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

    var activeWells = this.getActiveWells();
    var mySelectedWell = [];
    activeWells.forEach(function (d) {
        var tmpWell = idv.wellMap[d];
        mySelectedWell.push(tmpWell);
    });

    // Tommy ******************************************
    redrawMap(mySelectedWell);
    map.setCenter(wellGPS);
    // Plotly.newPlot('wellTimeSeries', data);
};


idv.wellManager.handleWellDoubleClick = function(well) {
    console.log("double click: " + well.id);
};


idv.wellManager.handleWellSingleClick = function(well) {
    if (well.active == true) {
        return;
    }
    // well.active = !well.active; // active or deactive the well
    well.active = true; // active or deactive the well
    console.log(well.getName());
    if (well.active === true) {
        this.activateWell(well, true);
    }
    else {
        //this.deactivateWell(well, true);
    }

    idv.colorManager.updateContourWellColors();

};


/**
 * Activate wells and plot them onto a chart
 * @param wells with format [{id: 1122}, {id: 123}], or [id1, id2, id3]
 */
idv.wellManager.activateWells = function(wells) {
    if (!Array.isArray(wells)) {
        throw new Error('Expect array of wells');
    }

    var removedWells;
    if (wells.length > 20) {
        removedWells = wells.splice(20);
    }

    wells = wells.map(function (w) {
        return w.hasOwnProperty('id') ? idv.wellMap[w['id']]: idv.wellMap[w];
    });

    var deactivateWells = this.updateWellSelection(wells);

    var tmpWell;
    for(var i=0; i< wells.length; i++) {
        tmpWell = wells[i];
        this.activateWell(tmpWell, false);
    }

    idv.timeChartManager.resetWellChart(deactivateWells);

    this.plotWellMarkerOnContour(idv.CONTOUR_DIV_ID, idv.wellMap, false);

    idv.colorManager.updateContourWellColors();

    if (!!removedWells) {
        removedWells = removedWells.map(function (w) {
            return w.hasOwnProperty('id') ? idv.wellMap[w['id']]: idv.wellMap[w];
        });

        wells = wells.concat(removedWells);
        idv.timeChartManager.updateAverageData(wells);

    }
    else {
        idv.timeChartManager.updateAverageData();
    }

    // draw comparison chart
    if (wells.length > 0) {
        idv.comparisonChart.generateAverageComparisonChart('average', wells[0].getName());
    }

};

/**
 * Active well
 * @param well
 * @param force true if we want to recalculate average value and affect to the output
 */
idv.wellManager.activateWell = function(well, force) {
    if (!well.hasOwnProperty("id")) {
        throw new Error("Invalid well");
    }

    var deactivateList;

    if (!!force) {
        deactivateList = this.updateWellSelection([well]);
    }

    idv.timeChartManager.updateTimeChartForWell(well, force, deactivateList);
};

idv.wellManager.resetActiveWells = function() {
    this.activeWells = [];
    idv.colorManager.resetUsedColors();
};

idv.wellManager.removeActiveWell = function(well) {
    if (well.active == false) {
        return;
    }

    well = idv.wellMap[well.id];
    well.setActive(false);
    var index = this.activeWells.indexOf(well.id);
    if (index > -1) {
        this.activeWells.splice(index, 1);
    }
};
/**
 * this will update active list and return deactivate list
 * @param selectedWells
 */
idv.wellManager.updateWellSelection = function(selectedWells) {

    var deactivateWells = [];
    var currentActiveWells = this.getActiveWells();
    var inTobeActivatedList;

    this.resetActiveWells();

    for(var j =0; j< currentActiveWells.length; j++) {
        inTobeActivatedList = false;
        for(var k=0; k < selectedWells.length; k++) {
            if (currentActiveWells[j] == selectedWells[k].id) {
                inTobeActivatedList = true;
                break;
            }
        }
        if (inTobeActivatedList == false) {
            deactivateWells.push(currentActiveWells[j]);
            this.deactivateWell(idv.wellMap[currentActiveWells[j]], false);
        }
    }

    // update color for each well
    selectedWells.forEach(function (well) {
        well.setActive(true);
        well.color = idv.colorManager.getUnusedColorKey();
        idv.wellManager.activeWells.push(well.id);
    });

    return deactivateWells;
};


/**
 * Deactivate wells and remove them from a chart
 * @param wells with format [{id: 1122}, {id: 123}], or [id1, id2, id3]
 */
idv.wellManager.deactivateWells = function(wells) {
    if (!Array.isArray(wells)) {
        throw new Error('Expect array of wells');
    }
    var tmpWell;
    var labels = [];
    for(var i=0; i< wells.length; i++) {
        tmpWell = wells[i];
        if (tmpWell != null && !tmpWell.hasOwnProperty('id')) {
            tmpWell = {id: tmpWell};
        }

        this.deactivateWell(tmpWell, false);

        labels.push(tmpWell.id);
    }

    idv.timeChartManager.refreshTimeChart(null, labels);
};

idv.wellManager.deactivateWell = function(well, force) {
    if (!well.hasOwnProperty("id")) {
        throw new Error("Invalid well");
    }

    this.removeActiveWell(well);

    this.updateWellTimeChart(well, force);

    return well;
};

idv.wellManager.updateWellTimeChart = function(well, refreshChart) {
    idv.timeChartManager.updateTimeChartForWell(well, refreshChart);
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
            console.log("not found any wall on that click");
            return;
        }

        idv.wellManager.handleWellOnClick(well);
    });
};

idv.wellManager.plotWellMarkerOnContour = function(contourDivId, allWells, newGraph) {
    var tmpWell;
    var xCoords = [];
    var yCoords = [];
    var sizes = [];
    var ids = [];

    for(var wellId in allWells) {
        if (!allWells.hasOwnProperty(wellId)) {
            continue;
        }
        tmpWell = allWells[wellId];
        xCoords.push(tmpWell.pointX);
        yCoords.push(tmpWell.pointY);
        ids.push(tmpWell.id);
        sizes.push(tmpWell.hasOwnProperty('radius')? tmpWell.radius*2 : 10);
        // sizes.push(10);
    }

    var wellMarkers = {
        x: xCoords,
        y: yCoords,
        mode: 'markers',
        type: 'scatter',
        name: "Well",
        text: ids,
        marker: {
            size: sizes,
            color: "rgba(0, 0, 0, 0.5)",
            line: {
                width: 0.5,
                color: '#000'
            }
        }
    };

    if (!!newGraph) {
        Plotly.addTraces(contourDivId, wellMarkers);
    }
    else {

        var update = {
            marker: {
                size : sizes,
                line: {
                    width: 0.5,
                    color: '#000'
                }
            }
        };
        Plotly.restyle(contourDivId, update, 1);
    }

};

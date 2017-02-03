var idv = idv || {};
idv.wellManager = idv.wellManager || {};

idv.wellManager.DEFAULT_WELL_COLOR = "#000";

idv.wellManager.selectAllWells = function() {
    return d3.selectAll(".point");
};

idv.wellManager.updateWellColor = function(well, color) {
    idv.wellManager.selectAllWells().style("fill",
        function(d) {
            if (d.tx == null || d.tx == undefined) {
                return;
            }

            var relatedWell = idv.wellMap[d.tx];

            return relatedWell.getMyColor();
        }
    );
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

idv.wellManager.handleWellOnClick = function(well) {

    idv.wellManager.handleWellSingleClick(well);

    // var data = [
    //     {
    //         x: ['2013-10-04', '2013-11-04', '2013-12-04'],
    //         y: [1, 3, 6],
    //         type: 'scatter'
    //     }
    // ];
    //
    // Plotly.newPlot('wellTimeSeries', data);

    // console.log(well);
};


idv.wellManager.handleWellDoubleClick = function(well) {
    console.log("double click: " + well.id);
};


idv.wellManager.handleWellSingleClick = function(well) {
    idv.clicked = false;
    var label = 'well' + well.id;
    var myData = {
        x: 'year',
        columns: [
            ['year', '1995', '1996', '1997', '1998', '1999', '2000'],
            [label, Math.round(Math.random()*30), Math.round(Math.random()*200), Math.round(Math.random()*100), Math.round(Math.random()*400), Math.round(Math.random()*150), Math.round(Math.random()*250)],
        ],
        colors: {
        }
    };
    myData.colors[label] = well.color;

    var chart = c3.generate({
        bindto: '#wellTimeSeries',
        data: myData,
        axis: {
            y: {
                label: { // ADD
                    text: 'Saturated Thickness',
                    position: 'outer-middle'
                }
            },
            x: {
                label: {
                    text: 'Year',
                    position: 'outer'
                }
            }
        }
    });

    well.active = !well.active; // active or deactive the well

    idv.wellManager.updateWellColor(well, '0xf00');

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
            size: 10,
            color: idv.wellManager.DEFAULT_WELL_COLOR
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

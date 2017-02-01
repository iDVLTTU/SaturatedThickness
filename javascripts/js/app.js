var idv = idv || {};
var data2D = [];
idv.pointMap = {}; //
idv.CONTOUR_DIV_ID = "myDiv";
idv.TOTAL_WELLS = 10;
idv.TOTAL_COLS = 588;
var wellMap = {};
var wellXs = [];
var wellYs = [];

idv.load = function() {
    d3.csv('data/well_data.csv', function(error, allWellData) {

        var getWellDataForPoint = function(pointId) {
            var wellData = null;
            var foundWell = null;

            for (var i=0;i<allWellData.length;i++) { // rows loop
                wellData = allWellData[i];
                if (wellData.Point_ID == pointId) {
                    foundWell = wellData;
                    break;
                }
            }

            return foundWell;
        };

        var getCoordinateFromPointId = function(pointId) {
            var myPoint = idv.pointMap[pointId];

            return {x: myPoint.index % idv.TOTAL_COLS, y: Math.floor(myPoint.index/idv.TOTAL_COLS) + 1};
        };

        var plotContourMap = function (divId, data2D) {
            var contourMap = {
                z: data2D,
                type: 'contour',
                showscale: true,
                autocontour: false,
                contours: {
                    start: 20,
                    end: 700,
                    size: 60
                },
                colorscale: [[0, 'rgba(255, 255, 255,0)'],[0.1, 'rgba(250,200,160,1)'], [0.2, 'rgba(200,150,130,255)'], [0.3, 'rgb(160,160,80)'], [0.4, 'rgb(0,120,160)'], [0.7, 'rgb(0,60,120)'] , [1, 'rgb(0,0,60)']]
            };


            var data = [
                contourMap
            ];

            var layout = {
                title: 'Saturated Thickness of Ogallala Aquifier in 2013',
                width: 850,
                height: 1000,

                xaxis: {
                    side: 'top'
                },

                yaxis: {
                    autorange: 'reversed'
                },
                legend: {
                    font: {
                        size: 10
                    },
                    yanchor: 'bottom',
                    xanchor: 600
                }
            };

            Plotly.newPlot(divId, data, layout);

        };

        var plotWellMarkerOnContour = function(contourDivId, wellXCoordinates, wellYCoordinates) {
            var wellMarkers = {
                x: wellXCoordinates,
                y: wellYCoordinates,
                mode: 'markers',
                type: 'scatter',
                name: "Well",
                marker: {
                    size: 10,
                    color: "#f00"
                }
            };

            Plotly.addTraces(contourDivId, wellMarkers);
        };

        d3.tsv("data/ascii_2013.csv", function (error, pixelData) {
            var pointId = 0;
            var wellData;
            var coord = {};
            var wellCount = 0;
            var col = 0;
            var index = 0;
            for (var i=0;i<pixelData.length-19;i++){ // rows loop
                var currentRow=[];
                col = 0; // reset for column value
                for (var key in pixelData[i]){ // columns loop
                    var cellValue = pixelData[i][key];
                    currentRow.push(cellValue);
                    col ++;
                    index ++;
                    if (cellValue > -9999) {
                        pointId ++; // current point id
                        wellData = wellCount < idv.TOTAL_WELLS ? getWellDataForPoint(pointId) : null;
                        idv.pointMap[pointId] = {
                            "id": pointId,
                            "water": cellValue,
                            "well": wellData,
                            "x": col,
                            "y": i+1,
                            "index": index
                        };

                        if (wellData != null && wellMap != undefined) {
                            wellMap[wellData.Well_ID] = wellData;
                            coord = getCoordinateFromPointId(pointId);
                            wellXs.push(coord.x);
                            wellYs.push(coord.y);
                            wellCount ++;
                        }
                    }
                }

                data2D.push(currentRow);
            }

            // plot contour map
            plotContourMap(idv.CONTOUR_DIV_ID, data2D);

            // plot well on top of contour
            plotWellMarkerOnContour(idv.CONTOUR_DIV_ID, wellXs, wellYs);

            // plot my position
            idv.showMyPosition(idv.myPosition, idv.plotMyPositionAtPoint);

            idv.enableWellClick();
        });
    });
};

idv.enableWellClick = function() {
    // var myPlot = document.getElementById(idv.CONTOUR_DIV_ID);
    // myPlot.on('plotly_click', function(data){
    //     var pts = '';
    //     for(var i=0; i < data.points.length; i++){
    //         pts = 'x = '+data.points[i].x +'\ny = '+
    //             data.points[i].y.toPrecision(4) + '\n\n';
    //     }
    //     alert('Closest point clicked:\n\n'+pts);
    // });

    var svg = d3.select("svg");

    var elements = svg.selectAll(".point");
    console.log(elements);

    elements.on("click", function(d,i) {
        alert(i);
    });

    // d3.selectAll(".point").on('click', function(d) {
    //    console.log("item click");
    // });

};


getLocation();



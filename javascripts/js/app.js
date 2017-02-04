var idv = idv || {};
var data2D = [];
idv.pointMap = {}; //
idv.CONTOUR_DIV_ID = "myDiv";
idv.TOTAL_WELLS = 10;
idv.TOTAL_COLS = 588;
idv.wellMap = {};
idv.timeChart = null;

var wellXs = [];
var wellYs = [];
var wellIds = [];

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

                        if (wellData != null && wellData != undefined) {
                            idv.wellMap[wellData.Well_ID] = {
                                "id": wellData.Well_ID,
                                "pointId": index,
                                "pointX": col,
                                "pointY": i+1,
                                "minX": col - 10,
                                "minY": i+1-5,
                                "maxX": col + 10,
                                "maxY": i+1 + 5,
                                "active": false,
                                "color": false, // current color
                                "detail": wellData,
                                "getMyColor": function() {
                                    if (this.active == false) {
                                        return idv.wellManager.DEFAULT_WELL_COLOR;
                                    }

                                    if (this.color == null || this.color == undefined) {
                                        alert('Invalid color setting');
                                        return idv.wellManager.DEFAULT_WELL_COLOR;
                                    }
                                    return idv.colorManager.getColorObject(this.color).code;
                                }
                            };
                            //coord = getCoordinateFromPointId(pointId);
                            wellXs.push(col);
                            wellYs.push(i+1);
                            wellIds.push(wellData.Well_ID);
                            wellCount ++;
                        }
                    }
                }

                data2D.push(currentRow);
            }

            // plot contour map
            plotContourMap(idv.CONTOUR_DIV_ID, data2D);

            // plot well on top of contour
            idv.wellManager.plotWellMarkerOnContour(idv.CONTOUR_DIV_ID, wellXs, wellYs, wellIds);

            // plot my position
            idv.showMyPosition(idv.myPosition, idv.plotMyPositionAtPoint);
            //
            idv.wellManager.enableWellClick();

            // plot time chart
            idv.timeChartManager.generateTimeChart();
            // console.log(idv.timeChart);
        });
    });
};


getLocation();

// var data = [
//     {
//         x: ['2013-10-04 22:23:00', '2013-11-04 22:23:00', '2013-12-04 22:23:00'],
//         y: [1, 3, 6],
//         type: 'scatter'
//     }
// ];
//
// Plotly.newPlot('wellTimeSeries', data);
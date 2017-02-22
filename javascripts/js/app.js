/* 2017 
 * Tommy Dang, Assistant professor, iDVL@TTU
 * Long Nguyen, PhD student, iDVL@TTU
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

 var idv = idv || {};

idv.CONTOUR_DIV_ID = "myDiv";
idv.TOTAL_WELLS = 10;
idv.TOTAL_COLS = 588;
idv.INTERPOLATION_CUT = 3000;

idv.data2D = [];
idv.pointMap = {}; //
idv.wellMap = {};

idv.wellXs = [];
idv.wellYs = [];
idv.wellIds = [];


idv.handlePixelDataLoadComplete = function(pixelData) {
    var pointId = 0;
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
                idv.pointMap[pointId] = {
                    "id": pointId,
                    "water": cellValue,
                    "well": null,
                    "x": col,
                    "y": i+1,
                    "position": null,
                    "index": index
                };
            }
        }

        idv.data2D.push(currentRow);
    }
};

idv.updateRasterPointPositionData = function(rasterPoint) {
    var pointData;
    for(var i=0; i< rasterPoint.length; i++) {
        pointData = rasterPoint[i];

        if (!idv.pointMap.hasOwnProperty(pointData.POINTID)) {
            continue;
        }

        idv.pointMap[pointData.POINTID]["position"] = {lon: pointData.x_center, lat: pointData.y_center};
    }
};

idv.getClosestPointPixelDataForPosition = function(longtitude, latitude) {
    var tmpPoint;
    var min = null;
    var currentDistance;
    var closestPoint;

    var distance = function(lon, lat, position) {
        var dis = (lon - position.lon) * (lon - position.lon) + (lat - position.lat) * (lat - position.lat);

        return dis;
    };

    for(var pointId in idv.pointMap) {
        if (!idv.pointMap.hasOwnProperty(pointId)) {
            continue;
        }
        tmpPoint = idv.pointMap[pointId];

        if (min === null) {
            min = distance(longtitude, latitude, tmpPoint["position"]);
            closestPoint = tmpPoint;
        }
        else {
            currentDistance = distance(longtitude, latitude, tmpPoint["position"]);
            if (currentDistance < min) {
                min = currentDistance;
                closestPoint = tmpPoint;
            }
        }
    }

    return closestPoint;
};

idv.handleWellDataLoadComplete = function(allWellData) {
    var myWells = {};
    var tmpWell;
    var measuredDate;
    var tmpPoint;

    var wellCount = 0;

    // idv.wellMap[wellData.Well_ID] = {
    for(var idx=0; idx < allWellData.length; idx++) {
        tmpWell = allWellData[idx];
        if (!idv.pointMap.hasOwnProperty(tmpWell.Point_ID)) {
            continue; // ignore well with no point coordinate
        }
        
        if (!myWells.hasOwnProperty(tmpWell.Well_ID)) {
            myWells[tmpWell.Well_ID] = {"totalMeasurementDate": 0};
            myWells[tmpWell.Well_ID]["county"] = tmpWell.County;
            myWells[tmpWell.Well_ID]["position"] = {"lon" : tmpWell.x_long, "lat": tmpWell.y_lat};
        }

        measuredDate = idv.util.getDateInYmd(tmpWell.MeasurementYear, tmpWell.MeasurementMonth, tmpWell.MeasurementDay);
        // ignore negative data or data with zero NS base
        if (+tmpWell.SaturatedThickness <=0 || (tmpWell.SaturatedThickness == tmpWell.WaterElevation)) {
            continue;
        }

        if(!myWells[tmpWell.Well_ID].hasOwnProperty(measuredDate)) {
            myWells[tmpWell.Well_ID]["totalMeasurementDate"] ++;
            myWells[tmpWell.Well_ID][measuredDate] = +tmpWell.SaturatedThickness;
            idv.timeChartManager.addMeasurementDate(measuredDate);
        }

        if (!idv.wellMap.hasOwnProperty(tmpWell.Well_ID)) {
            // tmpPoint = this.getClosestPointPixelDataForPosition(myWells[tmpWell.Well_ID]["position"]["lon"], myWells[tmpWell.Well_ID]["position"]["lat"]);
            tmpPoint = idv.pointMap[tmpWell.Point_ID];
            idv.wellMap[tmpWell.Well_ID] = {
                "id": +tmpWell.Well_ID,
                "pointId": tmpPoint.id,
                "pointX": tmpPoint.x,
                "pointY": tmpPoint.y,
                "getName": function () {
                    return "well" + this.id;
                },
                "minX": (tmpPoint.x - 10),
                "minY": (tmpPoint.y-5),
                "maxX": (tmpPoint.x + 10),
                "maxY": (tmpPoint.y + 5),
                "active": false,
                "setActive": function(active) {
                    this.active = active;
                    if (active == false) {
                        this.color = null;
                    }
                },
                "color": false, // current color
                "detail": myWells[tmpWell.Well_ID],
                "getMyColor": function() {
                    if (this.active == false) {
                        return idv.wellManager.DEFAULT_WELL_COLOR;
                    }

                    if (this.color == null || this.color == undefined) {
                        this.color = idv.colorManager.getUnusedColorKey();
                    }
                    return idv.colorManager.getColorObject(this.color).code;
                }
            };

            this.wellXs.push(tmpPoint.x);
            this.wellYs.push(tmpPoint.y);
            this.wellIds.push(tmpWell.Well_ID);
            wellCount ++;
        }

        idv.wellMap[tmpWell.Well_ID]["detail"] = myWells[tmpWell.Well_ID];
        // if(wellCount > 10) {
        //     break;
        // }
    }

    idv.timeChartManager.setupTimeAxis();

};

idv.plotContourMap = function () {
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
            // width: 800,
            // height: 900,
            width: 700,
            height: 450,

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

        idv.handleContourZoom();

    };

    // plot contour map
    plotContourMap(idv.CONTOUR_DIV_ID, idv.data2D);

    idv.wellManager.enableWellClick();
    // plot time chart
    idv.timeChartManager.generateTimeChart("wellTimeSeries");

     // idv.timeChartManager.generateTimeChart("wellTimeSeries1");
    // console.log(idv.timeChart);

    // plot my position
    //idv.showMyPosition(idv.myPosition, idv.plotMyPositionAtPoint);
    //

    // plot well on top of contour
    // idv.wellManager.plotWellMarkerOnContour(idv.CONTOUR_DIV_ID, this.wellXs, this.wellYs, this.wellIds);
    // plot well markers on contour
    idv.wellManager.plotWellMarkerOnContour(idv.CONTOUR_DIV_ID, idv.wellMap, true);

    idv.colorManager.updateContourWellColors();

};

idv.handleContourZoom = function () {
    var myContour = document.getElementById('myDiv');
    myContour.on('plotly_relayout',
        function(eventdata){
            idv.colorManager.updateContourWellColors();
        });


};


idv.load = function() {

    d3.tsv("data/ascii_2013.csv", function(error, pixelData) {
    // d3.tsv("data/ascii_2013all.csv", function(error, pixelData) {
        idv.handlePixelDataLoadComplete(pixelData);

        d3.csv("data/raster_to_point.csv", function(error, rasterPoint) {
            idv.updateRasterPointPositionData(rasterPoint);

            d3.csv('data/well_data_full.csv', function(error, allWellData) {
                idv.handleWellDataLoadComplete(allWellData);
                // In horizon.js
                // cleanNegativeData();
                computeCountyAverage();
                interpolate();
                
                idv.plotContourMap();

                // In select.js
                changeSelection();

                // plot well markers on contour
                // idv.wellManager.plotWellMarkerOnContour(idv.CONTOUR_DIV_ID, idv.wellMap, false);
                idv.colorManager.updateContourWellColors();

                // print out the max Saturated Thickness
                console.log("Max Saturated Thickness: " +computeMaxST());

                //var topWells = getTop20Wells();
                //drawHorizon(topWells);  

                // In map.js
                //redrawAllWells();

            });    
        });    
    });
};


getLocation();






var fs = require('fs');
var parse = require('csv-parse');
var csvWriter = require('csv-write-stream')
var writer = csvWriter();
writer.pipe(fs.createWriteStream('out.csv'))

var pointData = [];

var findClosestPoint = function (longtitude, latitude) {
    var distance = function(lon, lat, point) {
        var dis = (lon - point.lon) * (lon - point.lon) + (lat - point.lat) * (lat - point.lat);

        return dis;
    };

    var min = null;
    var tmpPoint;
    var closestPoint;
    var currentDistance;

    for(var i=0; i< pointData.length; i++) {
        tmpPoint = pointData[i];
        if (min === null) {
            min = distance(longtitude, latitude, pointData[i]);
            closestPoint = tmpPoint;
        }
        else {
            currentDistance = distance(longtitude, latitude, pointData[i]);
            if (currentDistance < min) {
                min = currentDistance;
                closestPoint = tmpPoint;
            }
        }
    }

    return closestPoint;
};
var wellToPoint = {};
var readAndProcessWellData = function() {
    var skipHeader = true;
    fs.createReadStream('Dr.Dang_data.csv')
        .pipe(parse({delimiter: ','}))
        .on('data', function(csvrow) {
            if (!skipHeader) {
                // find closest point to this well
                var myPoint;
                if (!wellToPoint.hasOwnProperty(csvrow[0])) {
                    myPoint = findClosestPoint(csvrow[1], csvrow[2]);
                    wellToPoint[csvrow[0]] = myPoint;
                }
                else {
                    myPoint = wellToPoint[csvrow[0]];
                }

                debugger;

                var line = {
                    Well_ID: csvrow[0],
                    Point_ID: myPoint.id,
                    x_long: csvrow[1],
                    y_lat: csvrow[2],
                    County: csvrow[3],
                    MeasurementMonth: csvrow[4],
                    MeasurementDay: csvrow[5],
                    MeasurementYear: csvrow[6],
                    WaterElevation: +csvrow[8],
                    SaturatedThickness: (+csvrow[8] - (+csvrow[9]))
                };

                writer.write(line);
            }

            skipHeader = false; // pass header
        })
        .on('end',function() {
            //do something wiht csvData
            // console.log(csvData);
            writer.end();
        });

};

var readAndProcessRasterPoint = function() {
    var skipHeader = true;
    fs.createReadStream('raster_to_point.csv')
        .pipe(parse({delimiter: ','}))
        .on('data', function(csvrow) {
            if (!skipHeader) {
                pointData.push({
                    id: csvrow[0],
                    GRID_CODE: csvrow[1],
                    lon: csvrow[2],
                    lat: csvrow[3]
                });
            }

            skipHeader = false;
        })
        .on('end',function() {
            readAndProcessWellData();
        });
};

readAndProcessRasterPoint();

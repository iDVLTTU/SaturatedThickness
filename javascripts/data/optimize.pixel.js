var fs = require('fs');
var parse = require('csv-parse');
var csvWriter = require('csv-write-stream');

var removedPoints = {};

var optimizeRasterToPoint = function () {

    var skipHeader = true;
    var rowHeader = {};

    var writer = csvWriter();

    var headerIndexMapping = {};
    var ignorePointDataRow = false;
    var currentPointIndex;


    writer.pipe(fs.createWriteStream('raster_to_point.optimize.csv'));

    var removeOddRowOrColumn = function (pointIndex) {

        return !!removedPoints[pointIndex];
    };

    fs.createReadStream('raster_to_point.csv')
        .pipe(parse({delimiter: ','}))
        .on('data', function(csvrow) {

            if (!skipHeader) {

                var myRow = {};
                for(var k in rowHeader) {
                    myRow[k] = null;
                }

                for(var col=0; col < csvrow.length; col++) {
                    if (col == 0) {
                        currentPointIndex = +csvrow[col];

                        if (removeOddRowOrColumn(currentPointIndex) == true) {
                            ignorePointDataRow = true;
                            break;
                        }
                    }

                    myRow[headerIndexMapping[col] ] = +csvrow[col];
                }

                if (!ignorePointDataRow) {
                    writer.write(myRow);
                }

                ignorePointDataRow = false; // reset
            }
            else {
                for(var i = 0; i < csvrow.length; i++) {
                    headerIndexMapping[i] = csvrow[i].trim();
                    rowHeader[headerIndexMapping[i]] = null;
                }

                skipHeader = false;
            }
        })
        .on('end',function() {
            writer.end();
        });

};



// remove rows and cols in odd index, starting from 0
var optimizePixeldata = function () {

    var writer = csvWriter();
    var skipHeader = true;
    var skipRow = false;
    var rowHeader = {};

    var pointIndex = -1;
    var cellVal;

    writer.pipe(fs.createWriteStream('ascii_2013all.optimize.csv'));

    fs.createReadStream('ascii_2013all.csv')
        .pipe(parse({delimiter: '\t'}))
        .on('data', function(csvrow) {
            if (!skipHeader) {

                if (skipRow == true) {
                    skipRow = false;

                    for(var i=0; i< csvrow.length; i++) {
                        cellVal = +csvrow[i];
                        if (cellVal > 0) {
                            pointIndex ++; // increase index
                            removedPoints[pointIndex] = true;
                        }
                    }
                } else {
                    //
                    for(var col=0; col < csvrow.length; col=col+1) {
                        cellVal = parseFloat(csvrow[col]);
                        if (cellVal > 0) {
                            pointIndex ++; // increase index
                        }

                        if (col % 2 == 0) {
                            rowHeader['Var ' +  (col + 1)] = cellVal;
                        }
                        else if (cellVal > 0) {
                            removedPoints[pointIndex] = true;
                        }
                    }

                    writer.write(rowHeader);

                    skipRow = true;
                }

            }
            else {

                for(var i = 0; i < csvrow.length; i=i+2) {
                    rowHeader[csvrow[i].trim()] = null;
                }

                skipHeader = false;
            }
        })
        .on('end',function() {
            writer.end();

            optimizeRasterToPoint();
        });
};

optimizePixeldata();

// optimizeRasterToPoint();

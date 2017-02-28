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

    var totalPointFound = 0;
    var totalPointIgnored = 0;

    writer.pipe(fs.createWriteStream('raster_to_point.optimized.csv'));

    var removeOddRowOrColumn = function (pointIndex) {

        return !!removedPoints[pointIndex];
    };

    fs.createReadStream('raster_to_point.csv')
        .pipe(parse({delimiter: ','}))
        .on('data', function(csvrow) {

            if (!skipHeader) {

                totalPointFound ++;

                var myRow = {};
                for(var k in rowHeader) {
                    myRow[k] = null;
                }

                for(var col=0; col < csvrow.length; col++) {
                    if (col == 0) {
                        currentPointIndex = +csvrow[col];

                        if (removeOddRowOrColumn(currentPointIndex) == true) {
                            ignorePointDataRow = true;
                            totalPointIgnored++;
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

            console.log("Total point found: " + totalPointFound);
            console.log("Total point ignored: " + totalPointIgnored);
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

    var rowToSkip = 0;
    var REDUCE_ROW_FACTOR = 2;
    var REDUCE_COL_FACTOR = 2;

    writer.pipe(fs.createWriteStream('ascii_2013all.optimized.csv'));

    var totalRowsIgnored = 0;
    var totalPoint = 0;
    var totalPointIgnored = 0;


    fs.createReadStream('ascii_2013all.csv')
        .pipe(parse({delimiter: '\t'}))
        .on('data', function(csvrow) {
            if (!skipHeader) {
                rowToSkip ++;

                skipRow = (REDUCE_ROW_FACTOR != 0 && rowToSkip % REDUCE_ROW_FACTOR) == 0 ? true : false;

                if (skipRow == true) {
                    for(var j=0; j< csvrow.length; j++) {
                        cellVal = +csvrow[j];
                        if (cellVal > 0) {
                            totalPoint ++;
                            pointIndex ++; // increase index
                            removedPoints[pointIndex] = true;
                            totalPointIgnored ++;
                        }
                    }

                    totalRowsIgnored ++;

                } else {
                    //
                    for(var col=0; col < csvrow.length; col=col+1) {
                        cellVal = parseFloat(csvrow[col]);
                        if (cellVal > 0) {
                            pointIndex ++; // increase index
                            totalPoint++;
                        }

                        if ((REDUCE_COL_FACTOR ==0 || col % REDUCE_COL_FACTOR) != 0) {
                            rowHeader['Var ' +  (col + 1)] = cellVal;
                        }
                        else if (cellVal > 0) {
                            removedPoints[pointIndex] = true;
                            totalPointIgnored++;

                        }
                    }

                    writer.write(rowHeader);
                }

            }
            else {

                for(var i = 0; i < csvrow.length; i++) {
                   if ((REDUCE_COL_FACTOR == 0 || i % REDUCE_COL_FACTOR) != 0) {
                        rowHeader[csvrow[i].trim()] = null;
                    }
                }

                skipHeader = false;
            }

        })
        .on('end',function() {
            writer.end();

            console.log("Total point found: " + totalPoint);
            console.log("Total rows ignored: " + totalRowsIgnored);
            console.log("Total pixels ignored: " + totalPointIgnored);
            console.log("Start remove pixels get ignore from 'raster_to_point.csv'");

            optimizeRasterToPoint();
        });
};

optimizePixeldata();

// optimizeRasterToPoint();

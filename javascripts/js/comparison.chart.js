var idv = idv || {};
idv.comparisonChart = idv.comparisonChart || {};
var setupSvg = function () {
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("body").select("#charts").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    return svg;
};

idv.comparisonChart.svg = setupSvg();

idv.comparisonChart.initForTest = function () {
    // idv.wellManager.activateWells(
    //     [{id: 450802}, {id: 450502}, {id: 458201}, {id: 450401}],
    //     true);
    //
    // idv.timeChartManager.updateAverageData();
    //
    // this.generateAverageComparisonChart('average', "well450802");
};


idv.comparisonChart.generateAverageComparisonChart = function(averageKey, columnKey) {

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var line = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return x(d.year); })
        .y(function(d) {
            // debugger;
            return y(d[columnKey]); }
            );

    var area = d3.svg.area()
        .interpolate("basis")
        .x(function(d) {
            return x(d.year);
        })
        .y1(function(d) { return y(d[averageKey]); });

    var svg = this.svg;
    svg.selectAll("*").remove();

    var data = this.getData(averageKey, columnKey);
    x.domain(d3.extent(data, function(d) {
        return d.year;
    }));

    y.domain([
        d3.min(data, function(d) { return Math.min(d[averageKey], d[columnKey]); }),
        d3.max(data, function(d) { return Math.max(d[averageKey], d[columnKey]); })
    ]);


    var wellId = columnKey.substring(4);
    var myWell = idv.wellMap[wellId];
    // clipping ----------------------------
    svg.datum(data);

    // creating clip path items ---------------------
    svg.append("clipPath")
        .attr("id", "clip-below")
        .append("path")
        .attr("d", area.y0(height));

    svg.append("clipPath")
        .attr("id", "clip-above")
        .append("path")
        .attr("d", area.y0(0));

    //----------- Creating lines with clip path items created-------
    svg.append("path")
        .attr("class", "area above")
        // .style("fill", myWell.getMyColor())     // set the fill colour
        .attr("clip-path", "url(#clip-above)")
        .attr("d", area.y0(function(d) { return y(d[columnKey]); }))
    ;

    svg.append("path")
        .attr("class", "area below")
        // .style("fill", 'grey')     // set the fill colour
        .attr("clip-path", "url(#clip-below)")
        .attr("d", area)
    ;

    svg.append("path")
        .attr("class", "line")
        .style("stroke", myWell.getMyColor())
        .attr("d", line)
    ;

    // coordinate
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        // .ticks(21)
        .tickFormat(d3.time.format("%b '%y"))
    ;

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        // .ticks(5)
    ;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Water Elevation");
};

idv.comparisonChart.getData = function(averageKey, columnKey) {

    var parseDate = d3.time.format("%Y-%m-%d").parse;
    var totalDataItem = idv.timeChartManager.xAxis.length - 1;
    var data = [];
    var tmp = {};
    var myTmpCol1;
    var myTmpCol2;
    for(var i = 0; i< totalDataItem; i++) {
        myTmpCol1 = idv.timeChartManager.getColumnDataByKey(averageKey);
        myTmpCol2 = idv.timeChartManager.getColumnDataByKey(columnKey);
        tmp = {
            'year': parseDate(idv.timeChartManager.xAxis[i+1])
        };

        tmp[averageKey] = +myTmpCol1[i+1];
        tmp[columnKey] = +myTmpCol2[i+1];

        data.push(tmp);
    }

    data.sort(function(a,b) {
        return new Date(a.year).getTime() - new Date(b.year).getTime();
    });

    return data;
};
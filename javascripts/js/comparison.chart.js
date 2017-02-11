var idv = idv || {};
idv.comparisonChart = idv.comparisonChart || {};

idv.comparisonChart.generateAverageComparisonChart = function(averageKey, columnKey) {
    var margin = {top: 25, right: 20, bottom: 30, left: 80};
    var width = 1002; // - margin.left - margin.right,
    var height = 256; // - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var line = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d[averageKey]); });

    var area = d3.svg.area()
        .interpolate("basis")
        .x(function(d) {
            return x(d.year);
        })
        .y1(function(d) { return y(d[averageKey]); });


    // var svg = d3.select("body").select("#wellTimeSeries").append("svg")
    var svg = d3.select("body").select("#charts").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = this.getData(averageKey, columnKey);
    x.domain(d3.extent(data, function(d) {
        return d.year;
    }));

    // x.domain([
    //     new Date(1995, 1, 15),
    //     new Date(2017, 1, 15)
    // ]);

    var minMax = [
        500,
        4100
    ];
    console.log(minMax);

    y.domain(minMax);

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
        .attr("clip-path", "url(#clip-above)")
        .attr("d", area.y0(function(d) { return y(d[columnKey]); }))
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    ;

    svg.append("path")
        .attr("class", "area below")
        .attr("clip-path", "url(#clip-below)")
        .attr("d", area)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    ;

    svg.append("path")
        .attr("class", "line")
        .attr("d", line)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    ;
};

idv.comparisonChart.getData = function(averageKey, columnKey) {

    var parseDate = d3.time.format("%Y-%m-%d").parse;
    var totalDataItem = idv.timeChartManager.xAxis.length - 1;
    var data = [];
    var tmp = {};
    var myTmpCol1;
    var myTmpCol2;
    for(var i = 0; i< totalDataItem; i++) {
        debugger;
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
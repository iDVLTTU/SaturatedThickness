var idv = idv || {};
idv.comparisonChart = idv.comparisonChart || {};
var setupSvg = function () {
    var margin = {top: 20, right: 30, bottom: 30, left: 70},
        width = 960 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var svg = d3.select("body").select("#charts").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    return svg;
};

idv.comparisonChart.yDomainMax = 0;
idv.comparisonChart.yDomainMin = 0;

idv.comparisonChart.setYDomainMax = function(max) {
    this.yDomainMax = Math.ceil(max);
};

idv.comparisonChart.setYDomainMin = function(min) {
    this.yDomainMin = Math.floor(min);
};

idv.comparisonChart.getYDomain = function() {
    return [this.yDomainMin, this.yDomainMax];
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

    var margin = {top: 20, right: 30, bottom: 30, left: 60},
        width = 960 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var line = d3.svg.area()
        .interpolate("basis")
        .defined(function(d) { return !!d[columnKey]; }) // Omit empty values.
        .x(function(d) { return x(d.year); })
        .y(function(d) {
            // debugger;

            var a= y(d[columnKey]);

            return y(d[columnKey]); }
            );

    var area = d3.svg.area()
        .interpolate("basis")
        .defined(function(d) { return !!d[columnKey]; }) // Omit empty values.
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

    debugger;

    var mmin = d3.min(data, function(d) { return Math.min(d[averageKey], d[columnKey]); });
    // this.setYDomainMin(d3.min(data, function(d) { return Math.min(d[averageKey], d[columnKey]); }));
    this.setYDomainMin(mmin);
    y.domain(this.getYDomain());

    var wellId = idv.util.getWellIdFromItsName(columnKey);
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
        // .attr("class", "area above")
        .style("fill", idv.colorManager.getWaterColor('lightBlue'))     // set the fill colour
        .attr("clip-path", "url(#clip-above)")
        .attr("d", area.y0(function(d) { return y(d[columnKey]); }))
    ;

    svg.append("path")
        // .attr("class", "area below")
        .style("fill", idv.colorManager.getWaterColor('lightBrown'))     // set the fill colour
        .attr("clip-path", "url(#clip-below)")
        .attr("d", area)
    ;

    svg.append("path")
        .attr("class", "line")
        .style("stroke", '#000')
        .attr("d", line)
    ;

    // dot over existed data
    debugger;
    svg.selectAll("dot")
        .data(data.filter(function (d) {
            return d['populated'] === false;
        }))
        .enter().append("circle")
            .attr("r", 3.5)
            .attr("cx", function(d) {
                return x(d.year); })
            .attr("cy", function(d) {
                return y(d[columnKey]);
            })
            .style("stroke-width", 1)
            .style("stroke", '#000')
            .style("fill", myWell.getMyColor())
    ;

    // coordinate
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        // .ticks(21)
        .tickFormat(d3.time.format("%Y"))
        // .tickFormat(d3.time.format("%b '%y"))
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
        .attr("y", 0- margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", ".51em")
        .style("text-anchor", "middle")
        // .attr("y", 6)
        // .attr("dy", ".71em")
        // .style("text-anchor", "end")
        .text("Water Elevation");
};

idv.comparisonChart.getData = function(averageKey, columnKey) {

    var parseDate = d3.time.format("%Y-%m-%d").parse;
    var totalDataItem = idv.timeChartManager.xAxis.length - 1;
    var data = [];
    var tmp = {};
    var myTmpCol1;
    var myTmpCol2;
    var currentWell;
    for(var i = 0; i< totalDataItem; i++) {
        myTmpCol1 = idv.timeChartManager.getColumnDataByKey(averageKey);
        myTmpCol2 = idv.timeChartManager.getColumnDataByKey(columnKey);
        currentWell = idv.wellMap[idv.util.getWellIdFromItsName(columnKey)];

        tmp = {
            'year': parseDate(idv.timeChartManager.xAxis[i+1]),
            'populated': !currentWell.detail[idv.timeChartManager.xAxis[i+1]]
        };

        tmp[averageKey] = +myTmpCol1[i+1];
        tmp[columnKey] = myTmpCol2[i+1];

        data.push(tmp);
    }

    data.sort(function(a,b) {
        return new Date(a.year).getTime() - new Date(b.year).getTime();
    });

    return data;
};
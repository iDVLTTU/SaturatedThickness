var idv = idv || {};
idv.comparisonChart = idv.comparisonChart || {};

idv.timeChartManager.setting = {
    margin: {top: 20, right: 30, bottom: 30, left: 70},
    svgWidth: 960,
    svgHeight: 300
};

idv.timeChartManager.setting["width"] = this.setting.svgWidth - this.setting.margin.left - this.setting.margin.right;
idv.timeChartManager.setting["height"] = this.setting.svgHeight - this.setting.margin.top - this.setting.margin.bottom;

idv.timeChartManager.setting["xScale"] = d3.time.scale().range([0, this.setting.width]);
idv.timeChartManager.setting["yScale"] = d3.scale().linear().range([this.setting.height, 0]);


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
        .defined(function(d) { return !!d[columnKey]; }) // Omit empty values.
        .x(function(d) { return x(d.year); })
        .y(function(d) {
            return y(d[columnKey]); }
            );

    var lineBase = d3.svg.area()
        .defined(function(d) { return !!d[columnKey]; }) // Omit empty values.
        .x(function(d) { return x(d.year); })
        .y(function(d) {
            return height + y(d[columnKey]); }
        );

    var area = d3.svg.area()
        // .interpolate("basis")
        .defined(function(d) { return !!d[columnKey]; }) // Omit empty values.
        .x(function(d) {
            return x(d.year);
        })
        .y1(function(d) { return y(d[averageKey]); });

    var areaBase = d3.svg.area()
    // .interpolate("basis")
        .defined(function(d) { return !!d[columnKey]; }) // Omit empty values.
        .x(function(d) {
            return x(d.year);
        })
        .y1(function(d) { return height + y(d[averageKey]); });

    var svg = this.svg;
    svg.selectAll("*:not(.line)").remove();
    // svg.selectAll("*").remove();

    var parseDate = d3.time.format("%Y-%m-%d").parse;
    var data = this.getData(averageKey, columnKey);

    var timeDomain = d3.extent(idv.timeChartManager.xAxis.slice(1), function(d) {
        return parseDate(d);
    });

    x.domain(timeDomain);
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
        .attr("class", "areaAbove")
        .style("fill", idv.colorManager.getWaterColor('lightBlue'))     // set the fill colour
        .attr("clip-path", "url(#clip-above)")
        .attr('opacity', 0)
        .attr("d", areaBase.y0(function(d) { return y(d[columnKey]); }))
    ;

    svg.append("path")
        .attr("class", "areaBelow")
        .style("fill", idv.colorManager.getWaterColor('lightBrown'))     // set the fill colour
        .attr("clip-path", "url(#clip-below)")
        .attr('opacity', 0)
        .attr("d", areaBase)
    ;

    svg.selectAll('.areaAbove')
        .transition()
        .duration(2000)
        .attr('opacity', 1)
        .style("fill", idv.colorManager.getWaterColor('lightBlue'))     // set the fill colour
        .attr("clip-path", "url(#clip-above)")
        .attr("d", area.y0(function(d) { return y(d[columnKey]); }))
    ;
    svg.selectAll('.areaBelow')
        .transition()
        .duration(2000)
        .attr('opacity', 1)
        .style("fill", idv.colorManager.getWaterColor('lightBrown'))     // set the fill colour
        .attr("clip-path", "url(#clip-below)")
        .attr("d", area)
    ;
    // update
    // svg.append('path').

    // svg.selectAll('.wline').remove();
    svg.append('path')
        .attr("class", "wline")
        .style("stroke", '#000')
        .attr('opacity', 0)
        .attr("d", lineBase);

    svg.selectAll('.wline')
        .transition()
        .duration(2000)
        .attr("d", line)
        .attr('opacity', 1)

    // .style("stroke", "#f00")
    ;

    // dot over existed data
    svg.selectAll("dot")
        .data(data.filter(function (d) {
            return d['populated'] === false;
        }))
        .enter().append("circle")
            .attr("cx", function(d) {
                return x(d.year); })
            .attr("cy", function(d) {
                return y(d[columnKey]);
            })
            .attr('opacity', 0)
            .attr("r", 0)
            .transition()
            .duration(2500)
            .attr('opacity', 1)
            .style("stroke-width", 1)
            .style("stroke", '#000')
            .style("fill", myWell.getMyColor())
            .attr("r", 3.5)
            .each(flickering)
    ;

    // svg.selectAll("circle")
    //     .each(flickering);

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


    function flickering(d, i) {
        if (d["flickering"] == false) {
            return;
        }

        var circle = d3.select(this);
        (function repeat() {
            circle = circle.transition()
                .duration(500)
                .attr('opacity', 1)
                .transition()
                .duration(500)
                .attr('opacity', 0.1)
                .each("end", repeat);
        })();
    }
};

idv.comparisonChart.getData = function(averageKey, columnKey) {

    var parseDate = d3.time.format("%Y-%m-%d").parse;
    var totalDataItem = idv.timeChartManager.xAxis.length - 1;
    var data = [];
    var tmp = {};
    var myTmpCol1;
    var myTmpCol2;
    var currentWell;
    var myTime;

    var flickeringOption = idv.controller.getFlickeringOption();
    var dateOfWellThatHasSuddenProperty = function(well, property, suddenDate) {
        var myProperty;
        for(var i=1; i<=20; i++) {
            myProperty = (property + "" + i);
            if (well.hasOwnProperty(myProperty)) {
                if (well[myProperty] == suddenDate) {
                    return true;
                }
            }
        }

        return false;
    };

    for(var i = 0; i< totalDataItem; i++) {
        myTmpCol1 = idv.timeChartManager.getColumnDataByKey(averageKey);
        myTmpCol2 = idv.timeChartManager.getColumnDataByKey(columnKey);
        currentWell = idv.wellMap[idv.util.getWellIdFromItsName(columnKey)];
        myTime = idv.timeChartManager.xAxis[i+1];
        tmp = {
            'year': parseDate(myTime),
            'populated': !currentWell.detail[myTime],
            'flickering': !!flickeringOption && currentWell.hasOwnProperty(flickeringOption.valKey) && dateOfWellThatHasSuddenProperty(currentWell, flickeringOption.datePattern, myTime)
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
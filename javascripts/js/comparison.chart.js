var idv = idv || {};
idv.comparisonChart = idv.comparisonChart || {};

idv.comparisonChart.setting = {
    margin: {top: 20, right: 0, bottom: 30, left: 70},
    svgWidth: 960,
    svgHeight: 300
};

idv.comparisonChart.setting["width"] = idv.comparisonChart.setting.svgWidth - idv.comparisonChart.setting.margin.left - idv.comparisonChart.setting.margin.right;
idv.comparisonChart.setting["height"] = idv.comparisonChart.setting.svgHeight - idv.comparisonChart.setting.margin.top - idv.comparisonChart.setting.margin.bottom;

idv.comparisonChart.setting["xScale"] = d3.time.scale().range([0, idv.comparisonChart.setting.width]);
idv.comparisonChart.setting["yScale"] = d3.scale.linear().range([idv.comparisonChart.setting.height, 0]);

idv.comparisonChart.setting["xAxis"] = d3.svg.axis().scale(idv.comparisonChart.setting["xScale"]).orient("bottom").tickFormat(d3.time.format("%Y"));
idv.comparisonChart.setting["yAxis"] = d3.svg.axis().scale(idv.comparisonChart.setting["yScale"]).orient("left");

idv.comparisonChart.zoomX = null;
idv.comparisonChart.zoomXScale = 1;

var setupSvg = function () {
    var margin = idv.comparisonChart.setting.margin;
    var svgWidth = idv.comparisonChart.setting.svgWidth;
    var svgHeight = idv.comparisonChart.setting.svgHeight;


    // zoom
    // define the zoom behavior
    var zm = d3.behavior.zoom()
        .x(idv.comparisonChart.setting["xScale"])
        .scaleExtent([1, 10])
        // .on('zoom', idv.comparisonChart.handleZoomXEvent);
        .on('zoom', function(d, index) {
            debugger;
            idv.comparisonChart.handleZoomXEvent();
        });

    idv.comparisonChart.zoomX = zm;

    var svg = d3.select("body").select("#charts").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", "translate(" + (margin.left-10) + "," + margin.top + ")")
        .call(zm)
        ;

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

idv.comparisonChart.doZoomX = function () {
    this.zoomXScale ++;
    this.zoomX.scale(this.zoomXScale);

    var scale =  this.zoomX.scale();
    console.log(scale);

    this.svg.select(".x.axis").call(this.setting.xAxis);

};

idv.comparisonChart.handleZoomXEvent = function () {
    console.log("received zoom event");
    var scale =  this.zoomX.scale();
    console.log(scale);
    this.svg.select(".x.axis").call(this.setting.xAxis);
    // this.svg.select(".y.axis").call(yAxis);

};

idv.comparisonChart.generateAverageComparisonChart = function(averageKey, columnKey) {
    var x = this.setting.xScale;
    var y = this.setting.yScale;
    var width = this.setting.width;
    var height = this.setting.height;
    var margin = this.setting.margin;

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
        .style("fill", idv.colorManager.getAboveAverageColor())     // set the fill colour
        .attr("clip-path", "url(#clip-above)")
        .attr('opacity', 0)
        .attr("d", areaBase.y0(function(d) { return y(d[columnKey]); }))
    ;

    svg.append("path")
        .attr("class", "areaBelow")
        .style("fill", idv.colorManager.getBelowAverageColor())     // set the fill colour
        .attr("clip-path", "url(#clip-below)")
        .attr('opacity', 0)
        .attr("d", areaBase)
    ;

    svg.selectAll('.areaAbove')
        .transition()
        .duration(2000)
        .attr('opacity', 1)
        .style("fill", idv.colorManager.getAboveAverageColor())     // set the fill colour
        .attr("clip-path", "url(#clip-above)")
        .attr("d", area.y0(function(d) { return y(d[columnKey]); }))
    ;
    svg.selectAll('.areaBelow')
        .transition()
        .duration(2000)
        .attr('opacity', 1)
        .style("fill", idv.colorManager.getBelowAverageColor())     // set the fill colour
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

    // preparing tooltip for each dot
    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

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
            .on("mouseover", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div	.html("Date: " + idv.util.formatDate(d.year) + "<br/>S. Thickness: " + idv.util.formatSaturatedThickness(d[columnKey]))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
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
    var xAxis = this.setting.xAxis;
    var yAxis = this.setting.yAxis;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("y", 30)
        .attr("x", width + 3)
        .style("text-anchor", "end")
        .text("Year")

    ;

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 25 - idv.comparisonChart.setting.margin.left)
        .attr("x", 0 - (height / 2) - 10)
        .attr("dy", ".51em")
        .style("text-anchor", "middle")
        // .style("text-anchor", "end")
        .text("Saturated Thickness (ft)");


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
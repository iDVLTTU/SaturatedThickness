var idv = idv || {};
idv.controller = idv.controller || {};

idv.controller.addWell = function(well) {
    d3.select("#boardController")
        .append("svg")
            .attr("width", 200)
            .attr("height", 200)
    ;
};

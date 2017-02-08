var idv = idv || {};
idv.colorManager = idv.colorManager || {};
idv.colorManager.colors = d3.scale.category10();

idv.colorManager.SUPPORTED_COLOR_COUNT = 10;
idv.colorManager.supportedColors = {};
for (var i=0; i< idv.colorManager.SUPPORTED_COLOR_COUNT; i++) {
    idv.colorManager.supportedColors["color" + (i + 1)] = {
        used: false,
        code: idv.colorManager.colors(i)
    }
}

idv.colorManager.getUnusedColorKey = function() {
    var tmpColor;
    for(var myColor in idv.colorManager.supportedColors) {
        if (!idv.colorManager.supportedColors.hasOwnProperty(myColor) || idv.colorManager.supportedColors[myColor] == null) {
            continue;
        }

        tmpColor = idv.colorManager.supportedColors[myColor];
        if (tmpColor.used === false) {
            tmpColor.used = true;

            return myColor;
        }
    }

    return false;
};

idv.colorManager.resetUsedColor = function(colorKey) {
    if (!idv.colorManager.supportedColors.hasOwnProperty(colorKey) || idv.colorManager.supportedColors[colorKey] == null) {
        return;
    }

    idv.colorManager.supportedColors[colorKey].used = false;
};

idv.colorManager.getColorObject = function(colorKey) {
    if (!idv.colorManager.supportedColors.hasOwnProperty(colorKey) || idv.colorManager.supportedColors[colorKey] == null) {
        return false;
    }

    return idv.colorManager.supportedColors[colorKey];
};

var idv = idv || {};
idv.colorManager = idv.colorManager || {};
idv.colorManager.colors = d3.scale.category10();

idv.colorManager.SUPPORTED_COLOR_COUNT = 10;
idv.colorManager.supportedColors = {
    "color1": {
        used: false,
        code: idv.colorManager.colors(0)
    },
    "color2": {
        used: false,
        code: idv.colorManager.colors(1)
    },
    "color3": {
        used: false,
        code: idv.colorManager.colors(2)
    },
    "color4": {
        used: false,
        code: idv.colorManager.colors(3)
    },
    "color5": {
        used: false,
        code: idv.colorManager.colors(4)
    },
    "color6": {
        used: false,
        code: idv.colorManager.colors(5)
    },
    "color7": {
        used: false,
        code: idv.colorManager.colors(6)
    },
    "color8": {
        used: false,
        code: idv.colorManager.colors(7)
    },
    "color9": {
        used: false,
        code: idv.colorManager.colors(8)
    },
    "color10": {
        used: false,
        code: idv.colorManager.colors(9)
    }
};

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

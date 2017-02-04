var idv = idv || {};
idv.colorManager = idv.colorManager || {};

idv.colorManager.SUPPORTED_COLOR_COUNT = 10;
idv.colorManager.supportedColors = {
    "color1": {
        used: false,
        code: '#FF0000'
    },
    "color2": {
        used: false,
        code: '#00FF00'
    },
    "color3": {
        used: false,
        code: '#0000FF'
    },
    "color4": {
        used: false,
        code: '#FFFF00'
    },
    "color5": {
        used: false,
        code: '#00FFFF'
    },
    "color6": {
        used: false,
        code: '#FF00FF'
    },
    "color7": {
        used: false,
        code: '#C0C0C0'
    },
    "color8": {
        used: false,
        code: '#800000'
    },
    "color9": {
        used: false,
        code: '#808000'
    },
    "color10": {
        used: false,
        code: '#008000'
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

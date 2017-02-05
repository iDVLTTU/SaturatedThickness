var idv = idv || {};
idv.util = idv.util || {};

idv.util.getRandomColor = function() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

idv.util.getDateInYmd = function(year, month, date) {
    if (month < 10) {
        month = '0' + month;
    }

    if(date < 10) {
        date = '0' + date;
    }

    // return year + '-' + month + '-' + date;
    return year + '-' + month + '-15';
};

margin_ = {l: 50, r: 50, b: 100, t: 100, pad: 0};
var eventData_;
var data2D = [];
d3.tsv("data/ascii_2013.csv", function(error, data_) { 
  for (var i=0;i<data_.length-19;i++){
    var a=[];
    for (var key in data_[i]){
      var v = +data_[i][key];
    // if (v<0)
     //   v=null;
     //   v=-10;
      a.push(v);
    }
    data2D.push(a);
  }
  //console.log(data_.length);
  var data = [ {
      z: data2D,  
      type: 'contour',
      showscale: true,
      autocontour: false,
      contours: {
        start: 20,
        end: 700,
        size: 60
      },
      colorscale: [[0, 'rgba(255, 255, 255,0)'],[0.1, 'rgba(250,200,160,1)'], [0.2, 'rgba(200,150,130,255)'], [0.3, 'rgb(160,160,80)'], [0.4, 'rgb(0,120,160)'], [0.7, 'rgb(0,60,120)'] , [1, 'rgb(0,0,60)']]
     }
   ];

  var layout = {
    title: 'Saturated Thickness of Ogallala Aquifier in 2013',
    width: 850,
    height: 1000,

    xaxis: {
      side: 'top' 
    },

    yaxis: {
      autorange: 'reversed'
    },
  };

  Plotly.newPlot('myDiv', data, layout);  
  console.log("DONE Plotly contours")

  // Get current GPS location
  getLocation();

});


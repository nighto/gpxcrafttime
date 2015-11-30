var pointsArray = [];

var emptyGPXStart = '<?xml version="1.0" standalone="yes"?><gpx xmlns="http://www.topografix.com/GPX/1/1" creator="http://nighto.github.io/gpxcrafttime/" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"><trk><trkseg>';
var emptyGPXEnd = '</trkseg></trk></gpx>';

function calculateDistance(x1, y1, x2, y2){
  return Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) );
}

function calculateDeltas(_pointsArray){
  var _deltaArray = [];

  if(_pointsArray.length < 2)
    return _deltaArray;

  // starting on the second item
  for(var i=1; i<_pointsArray.length; i++){
    var x1, x2, y1, y2;
    x2 = _pointsArray[i][0];
    y2 = _pointsArray[i][1];
    x1 = _pointsArray[i-1][0];
    y1 = _pointsArray[i-1][1];

    _deltaArray.push( calculateDistance(x1, y1, x2, y2) );
  }

  return _deltaArray;
}

function calculateTotalDistance(_deltaArray){
  var _total = _deltaArray.reduce(function(prev, curr, idx, arr){
    return prev + curr;
  }, 0);
  return _total;
}

function calculateInterpolation(startCoord, endCoord, intervalsCount){

  // calculate the coordinates difference
  var thisDelta = [
    ( endCoord[0] - startCoord[0] ),
    ( endCoord[1] - startCoord[1] )
  ];

  // how big are those intervals?
  var thisInterval = [
    ( thisDelta[0] / intervalsCount ),
    ( thisDelta[1] / intervalsCount )
  ];

  // now we create the intermediate points
  var intermediatePointsArray = [];
  for(var i=0; i<intervalsCount+1; i++){
    intermediatePointsArray.push([
      parseFloat( ( startCoord[0] + (thisInterval[0] * i) ).toFixed(6) ),
      parseFloat( ( startCoord[1] + (thisInterval[1] * i) ).toFixed(6) )
    ]);
  }
  return intermediatePointsArray;
}

function calculateInterval(_date, timeStart, timeEnd){

  if(!pointsArray.length){
    alert('Invalid GPX file');
    return null;
  }

  if(!date || !timeStart || !timeEnd){
    alert('Invalid date or times.');
    return null;
  }

  var
    dateStart = new Date(_date + 'T' + timeStart + 'Z'),
    dateEnd   = new Date(_date + 'T' + timeEnd   + 'Z')
  ;

  var intervalsInSeconds = ( (dateEnd - dateStart) / 1000 - 1 );

  var deltas = calculateDeltas(pointsArray);

  var totalDistance = calculateTotalDistance(deltas);

  var intervalByDistanceArray = deltas.map(function(num){
    return Math.round( (num / totalDistance) * intervalsInSeconds );
  });

  var intervalsArray = [];
  for(var i=0, l=intervalByDistanceArray.length; i<l; i++){
    var thisIntervalArray = calculateInterpolation(pointsArray[i], pointsArray[i+1], intervalByDistanceArray[i]);
    console.log(thisIntervalArray.length, thisIntervalArray);
    // if this is not the last interval
    if(i<(l-1)){
      // discard this interval last element (because it's the same of next interval's first element)
      thisIntervalArray.pop();
    }
    intervalsArray = intervalsArray.concat(thisIntervalArray);
  }

  writeGPX(intervalsArray, dateStart);  
}

function writeGPX(intervalsArray, dateStart){
  var gpx = emptyGPXStart.slice(0);

  for(var i=0, l=intervalsArray.length; i<l; i++){
    var thisDate = new Date( dateStart.getTime() + (i * 1000) );
    gpx += '<trkpt lat="' + intervalsArray[i][0].toFixed(6) + '" lon="' + intervalsArray[i][1].toFixed(6) + '"><time>' + thisDate.toISOString() + '</time></trkpt>';
  }

  gpx += emptyGPXEnd;

  exportGPX(gpx);
}

function exportGPX(gpx){
  var element = document.createElement('a');
  element.setAttribute('href', 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(gpx));
  element.setAttribute('download', 'file.gpx');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function handleTrkpts(trkpts){
  for (t in trkpts){
    if(trkpts[t].attributes){
      var
        lat = parseFloat( trkpts[t].attributes[0].nodeValue ),
        lon = parseFloat( trkpts[t].attributes[1].nodeValue )
      ;

      pointsArray.push( [ lat, lon ] );
    }
  }
  console.log(pointsArray);
}

function handleGpxString(strGpx){
  var parser = new window.DOMParser();
  var xml = parser.parseFromString(strGpx, 'text/xml');
  var trkpts = xml.getElementsByTagName('trkpt');
  pointsArray = [];
  handleTrkpts(trkpts);
}

function handleFileSelect(evt){
  var
    input = evt.target
    reader = new FileReader();
  ;
  reader.onload = function(){
    handleGpxString(reader.result);
  };
  reader.readAsText(input.files[0]);
}

function initHtmlListeners(){

  document.getElementById('gpx').addEventListener('change', handleFileSelect, false);

  document.getElementById('calculate').addEventListener('click', function(){
    calculateInterval(
      document.getElementById('date').value,
      document.getElementById('timestart').value,
      document.getElementById('timeend').value
    );
  });
}

function init(){
  initHtmlListeners();
}
init();
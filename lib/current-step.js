var point = require('turf-point');
var pointOnLine = require('turf-point-on-line');

module.exports = currentStep;
function currentStep(user, route) {
  var location = point(user.geometry.coordinates);
  var distances = [];
  var steps = route.routes[0].legs[0].steps;
  for (var i = 0; i < steps.length; i++) {
    var feature = '{"type":"Feature","properties":{},"geometry":' + JSON.stringify(steps[i].geometry) + '}';
    var distance = pointOnLine(JSON.parse(feature),location).properties.dist;
    distances.push(distance);
  }
  return indexOfMin(distances);

  function indexOfMin(array) {
    if (array.length === 0) { return -1; }
    var min = array[0];
    var minIndex = 0;
    for (var i = 1; i < array.length; i++) {
      if (array[i] < min) {
        minIndex = i;
        min = array[i];
      }
    }
    return minIndex;
  }
}
var along = require('turf-along');
var distance = require('turf-line-distance');
var lineslice = require('turf-line-slice');
var point = require('turf-point');
var test = require('tape');

var currentStep = require('../').currentStep;
var route = require('./fixtures/route');

test('Tests step', function(t) {
  var lineString = JSON.parse('{"type":"Feature","properties":{},"geometry":' + JSON.stringify(route.routes[0].geometry) + '}');
  var length = distance(lineString, 'miles');
  var segment = length / 50;

  var dist1 = distance(lineslice(point([-75.123274, 39.944218]), point([-75.121567, 39.944115]), lineString, 'miles'), 'miles');
  var dist2 = distance(lineslice(point([-75.123274, 39.944218]), point([-75.121877, 39.942624]), lineString, 'miles'), 'miles');
  var dist3 = distance(lineslice(point([-75.123274, 39.944218]), point([-75.121897, 39.942455]), lineString, 'miles'), 'miles');
  var dist4 = distance(lineslice(point([-75.123274, 39.944218]), point([-75.119258, 39.942419]), lineString, 'miles'), 'miles');
  var dist5 = distance(lineslice(point([-75.123274, 39.944218]), point([-75.119273, 39.941566]), lineString, 'miles'), 'miles');
  var dist6 = distance(lineslice(point([-75.123274, 39.944218]), point([-75.118674, 39.94156]), lineString, 'miles'), 'miles');

  for (var i = 0; i <= length; i += segment) {
    var location = along(lineString, i, 'miles');
    var step = currentStep(location, route);
    if (i < dist1) {
      t.equal(step, 0);
    } else if (dist1 < i && i < dist2) {
      t.equal(step, 1);
    } else if (dist2 < i && i < dist3) {
      t.equal(step, 2);
    } else if (dist3 < i && i < dist4) {
      t.equal(step, 3);
    } else if (dist4 < i && i < dist5) {
      t.equal(step, 4);
    } else if (dist5 < i && i <= dist6) {
      t.equal(step, 5);
    };
  };
  t.end();
});
var test = require('tape');
var route = require('./fixtures/route');
var navigation = require('../');

var user = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'Point',
        coordinates: [-122.40658342838287, 37.79485564380556]
    }
};

test('userToRoute should reRoute', function(t) {
    var reRoute = navigation.shouldReRoute(user, route);
    t.equal('boolean', typeof reRoute, 'is boolean');
    t.equal(reRoute, true, 'Should reRoute');
    t.end();
});

test('userToRoute should not reRoute', function(t) {
    var closeUser = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'Point',
            coordinates: [-75.17943572998047, 39.92940139770508]
        }
    };
    var reRoute = navigation.shouldReRoute(closeUser, route);
    t.equal('boolean', typeof reRoute, 'is boolean');
    t.equal(reRoute, false, 'Should not reRoute');
    t.end();
});

test('findClosestStep', function(t) {
    var step = navigation.findClosestStepToUser(user, route);
    t.equal(step, 1, 'first step');
    t.end();
});

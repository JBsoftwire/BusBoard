const log4js = require('log4js');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/BusBoard2.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});
const logger = log4js.getLogger('BusBoard2.log');

const request = require('request');
const appURL = require('./config').appURL;

class Stop {
    constructor(stopID, distance, name) {
        this.stopID = stopID;
        this.distance = distance;
        this.name = name;
    }
}

function locationToURL(location) { // constructs a URL to call the TFL nearby bus stops API given coordinates
    let [latitude, longitude] = location;
    let stopTypes = ['NaptanBusCoachStation',
        'NaptanBusWayPoint',
        'NaptanOnstreetBusCoachStopCluster',
        'NaptanOnstreetBusCoachStopPair',
        'NaptanPrivateBusCoachTram',
        'NaptanPublicBusCoachTram'];
    let stopTypesURL = stopTypes.join('%2C');
    return 'https://api.tfl.gov.uk/StopPoint?stopTypes=' + stopTypesURL + '&radius=500&lat=' + latitude + '&lon=' + longitude + appURL;
}

// sorting function for bus stop distances
function nearStop(stopA, stopB) {
    return stopA[0].distance - stopB[0].distance;
}

// removes empty stops
function pruneStops(stops) {

    return stops
}

// given appropriate parsed JSON from the TFL API can create an array of Stop objects
function makeStopList(data) {
    let nearStops = [];
    data.forEach((stop) => {
        // each 'stop' has multiple 'children' representing stops on opposite sides of the road, etc.
        // these are considered part of the same stop for the purposes of this program
        let nearStoplets = [];
        stop['children'].forEach((stoplet) => {
            nearStoplets.push(new Stop(stoplet['naptanId'], stop['distance'], stoplet['commonName']))
        });
        nearStops.push(nearStoplets);
    });
    return nearStops
}

function requestStops(location, stopCount) {
    logger.debug('Entered requestStops');
    let locationURL = locationToURL(location, appURL);
    return new Promise((resolve, reject) => {
        request(locationURL, (error, response, body) => {
            let stopData = JSON.parse(body)['stopPoints'];
            let nearStops = makeStopList(stopData);
            nearStops = nearStops.filter(stop => stop.length > 0);
            nearStops = nearStops.sort(nearStop).slice(0, stopCount);
            if (nearStops) {resolve(nearStops)} else {reject('Nearby stop list retrieval failed.')}
        })
    })
}

module.exports = {Stop, locationToURL, nearStop, makeStopList, requestStops};
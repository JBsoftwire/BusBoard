const log4js = require('log4js');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/BusBoardPromise.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});
const logger = log4js.getLogger('BusBoardPromise.log');
logger.trace('initiating program');

const request = require('request-promise');
const readline = require('readline-sync');

const url = require('./URLconstructors');
const list = require('./listMakers');
const sorter = require('./sorters');


const appID = '10d7f3ed';
const appKey = '298858f961a22f8766e39ac81f627ab4';
let appURL = '&app_id=' + appID + '&app_key=' + appKey;

function getPostcode() {
    console.log('Enter postcode:');
    return readline.prompt();
}

function postcodeDataToLocation (data) {
    return [data['latitude'], data['longitude']];
}

function prepareBusLists(stops, count) { // given
    let busList = [];
    stops.forEach((stop) => {
        let buses = [];
        stop.forEach((stoplet) => {
            buses = buses.concat(stoplet);
        });
        buses = buses.sort(sorter.earlyBus).slice(0, count);
        busList.push(buses)
    });
    return busList
}

function printBuses(buses, count) {
    // 'buses' is an array. each entry is a subarray, containing 1 or more subsubarrays.
    // each subsubarray is a list of buses arriving next
    buses.forEach((stop) => {
        console.log('The next', stop.length, 'buses arriving at', stop[0].stop, 'will be:');
        stop.forEach(function(bus) {
            let minutes = parseInt(bus.ETA/60);
            let minuteString;
            let secondString;
            if (minutes === 1) {
                minuteString = minutes + ' minute';
            } else {
                minuteString = minutes + ' minutes';
            }
            let seconds = parseInt(bus.ETA%60);
            if (seconds === 1) {
                secondString = seconds + ' second.';
            } else {
                secondString = seconds + ' seconds.';
            }
            console.log('A route', bus.line, 'bus heading toward', bus.destination, 'will arrive at', bus.stop, 'in', minuteString, 'and', secondString)
        })
    })
}

let busCount = 5;
let stopCount = 2;
let postcode = getPostcode();
let urlPostcode = url.postcodeToURL(postcode);

function requestLocation(urlPostcode) { // gets the latitude and longitude of a given postcode
    return new Promise((resolve, reject) => {
        request(urlPostcode, (error, response, body) => {
            logger.warn('error:', error);
            let postcodeData = JSON.parse(body)['result'];
            if (postcodeData === undefined) {
                logger.fatal('Failed to recover location data from server. Invalid postcode?');
                console.log('Error: unable to recover location data from server. Did you enter a valid postcode?');
            }
            let [latitude, longitude] = postcodeDataToLocation(postcodeData);
            let urlLocation = url.locationToURL(latitude, longitude, appURL);
            if (urlLocation) {resolve(urlLocation)} else {reject('Postcode location retrieval failed.')}
        });
    })
}

function requestNearbyStops(urlLocation) {
    // gets the nearest stops to the postcode requested
    // each 'stop' has 'children' representing stops on opposite sides of the road, etc.
    // these are considered part of the same stop for the purposes of this program
    return new Promise((resolve, reject) => {
        request(urlLocation, (error, response, body) => {
            logger.warn('error:', error);
            let stopData = JSON.parse(body)['stopPoints'];
            let nearStops = list.makeStopList(stopData).sort(sorter.nearStop).slice(0, stopCount);
            if (nearStops) {resolve(nearStops)} else {reject('Nearby stop list retrieval failed.')}
        })
    })
}

function requestArrivals(nearStops) { // function to get arrivals at all stops requested and combine them into a single mass promise
    let arrivalsList = [];
    nearStops.forEach((stop) => {
        arrivalsList.push(requestArrivalsSingle(stop))
    })
    return Promise.all(arrivalsList)
}

function requestArrivalsSingle(nearStops) {
    // requests the bus arrivals from all children of a single bus stop (including all 'child' stops together)
    // see 'makeStopList' function in 'listMakers.js' for details of child stop handling
    let arrivalsList = [];
    nearStops.forEach((stop) => {
        let arrivals = new Promise((resolve, reject) => {
            let urlBusStop = url.stopToURL(stop, appURL);
            request(urlBusStop, (error, response, body) => {
                logger.warn('error:', error);
                let busdata = JSON.parse(body);
                let buses = list.makeBusList(busdata);
                if (buses) {resolve(buses)} else {reject('Bus arrival list retrieval failed.')}
            });
        });
        arrivalsList = arrivalsList.concat(arrivals)
    });
    return Promise.all(arrivalsList)
}

requestLocation(urlPostcode).then((urlLocation) => requestNearbyStops(urlLocation))
                            .then((nearStops) => requestArrivals(nearStops))
                            .then((nextBuses) => {nextBuses = prepareBusLists(nextBuses, busCount); printBuses(nextBuses, busCount);});
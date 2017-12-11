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
const requests = require('./request');

const appID = '10d7f3ed';
const appKey = '298858f961a22f8766e39ac81f627ab4';
let appURL = '&app_id=' + appID + '&app_key=' + appKey;

function getPostcode() {
    console.log('Enter postcode:');
    return readline.prompt();
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

requests.requestLocation(urlPostcode, appURL).then((urlLocation) => requests.requestNearbyStops(urlLocation, stopCount))
                            .then((nearStops) => requests.requestArrivals(nearStops, appURL))
                            .then((nextBuses) => {nextBuses = prepareBusLists(nextBuses, busCount); printBuses(nextBuses, busCount);});
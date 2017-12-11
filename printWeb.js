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

const express = require('express');
const app = express();

// sorting function for bus arrival times
function earlyBus(busA, busB) {
    if (busA.ETA < busB.ETA) {return -1;}
    if (busB.ETA < busA.ETA) {return 1;}
    return 0;
}

// given a list of buses arriving at stops, sorts out the next (up to) [busCount] to arrive at each
function prepareBusLists(stops, busCount) {
    logger.debug('Entered prepareBusLists.');
    let busList = [];
    stops.forEach((stop) => {
        let buses = [];
        stop.forEach((stoplet) => {
            buses = buses.concat(stoplet);
        });
        buses = buses.sort(earlyBus).slice(0, busCount);
        busList.push(buses)
    });
    busList = busList.filter(stop => stop.length > 0);
    return busList
}

function printBuses(buses) {
    // 'buses' is an array. each entry is a subarray, containing 1 or more subsubarrays.
    // each subsubarray is a list of buses arriving next
    logger.debug('Entered printBuses.');
    if (buses.length > 0) {
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
                console.log('A route', bus.line, 'bus heading toward', bus.destination, 'will arrive in', minuteString, 'and', secondString)
            })
        })
    } else {console.log('No buses arriving near that postcode.')}

}

module.exports = {earlyBus, prepareBusLists, printBuses};
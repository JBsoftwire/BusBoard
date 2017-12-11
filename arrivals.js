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

class Bus {
    constructor(line, stop, destination, ETA) {
        this.line = line;
        this.stop = stop;
        this.destination = destination;
        this.ETA = ETA;
    }
}

// given appropriate parsed JSON from the TFL API can create an array of Bus objects
function makeBusList(data) {
    let nextBuses = [];
    data.forEach((bus) => {
        nextBuses.push(new Bus(bus['lineName'], bus['stationName'], bus['destinationName'], bus['timeToStation']));
    });
    return nextBuses
}

// constructs a URL to call the TFL next arrivals API given a bus stop code
function stopToURL(data) {
    return 'https://api.tfl.gov.uk/StopPoint/' + data.stopID + '/Arrivals?' + appURL;
}

// function to get arrivals at all stops requested and combine them into a single mass promise
function requestArrivals(nearStops) {
    logger.debug('Entered requestArrivals.');
    let arrivalsList = [];
    if(nearStops) {
        nearStops.forEach((stop) => {
            arrivalsList.push(requestArrivalsSingle(stop, appURL))
        })
    } else {return new Promise((resolve, reject) => {reject('Cannot form arrivals list.')})}
    return Promise.all(arrivalsList)
}

// requests the bus arrivals from all children of a single bus stop (including all 'child' stops together)
// see 'makeStopList' function in 'listMakers.js' for details of child stop handling
function requestArrivalsSingle(nearStops, appURL) {
    logger.debug('Entered requestArrivalsSingle.');
    let arrivalsList = [];
    nearStops.forEach((stop) => {
        let arrivals = new Promise((resolve, reject) => {
            let urlBusStop = stopToURL(stop, appURL);
            request(urlBusStop, (error, response, body) => {
                let busdata = JSON.parse(body);
                let buses = makeBusList(busdata);
                if (buses) {resolve(buses)} else {reject('Bus arrival list retrieval failed.')}
            });
        });
        arrivalsList = arrivalsList.concat(arrivals)
    });
    return Promise.all(arrivalsList)
}

module.exports = {makeBusList, stopToURL, requestArrivals, requestArrivalsSingle}
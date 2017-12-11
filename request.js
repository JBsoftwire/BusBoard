const request = require('request-promise');
const url = require('./URLconstructors');
const list = require('./listMakers');
const sorter = require('./sorters');

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

function postcodeDataToLocation (data) {
    return [data['latitude'], data['longitude']];
}

function requestLocation(urlPostcode, appURL) { // gets the latitude and longitude of a given postcode
    logger.debug('Entered requestLocation.');
    return new Promise((resolve, reject) => {
        request(urlPostcode, (error, response, body) => {
            logger.warn('error:', error);
            let postcodeData = JSON.parse(body)['result'];
            if (postcodeData === undefined) {
                logger.fatal('Failed to recover location data from server. Invalid postcode?');
                console.log('Error: unable to recover location data from server. Did you enter a valid postcode?');
            }
            let urlLocation;
            if (postcodeData) {
                logger.debug('successfully retrieved location data');
                let [latitude, longitude] = postcodeDataToLocation(postcodeData);
                urlLocation = url.locationToURL(latitude, longitude, appURL);
            }
            if (urlLocation) {resolve(urlLocation)} else {reject('Postcode location retrieval failed.')}
        });
    })
}

function requestNearbyStops(urlLocation, stopCount) {
    logger.debug('Entered requestNearbyStops.');
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

function requestArrivals(nearStops, appURL) { // function to get arrivals at all stops requested and combine them into a single mass promise
    logger.debug('Entered requestArrivals.');
    let arrivalsList = [];
    if(nearStops) {
        nearStops.forEach((stop) => {
            arrivalsList.push(requestArrivalsSingle(stop, appURL))
        })
    } else {return new Promise((resolve, reject) => {reject('Cannot form arrivals list.')})}
    return Promise.all(arrivalsList)
}

function requestArrivalsSingle(nearStops, appURL) {
    logger.debug('Entered requestArrivalsSingle.');
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

module.exports = {requestLocation, requestNearbyStops, requestArrivals, requestArrivalsSingle, postcodeDataToLocation}
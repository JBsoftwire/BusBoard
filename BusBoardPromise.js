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

// program structure:
// // Promise to get postcode location
// // Promise to get list of bus stops
// // Promise.All for the buses from each stop
// // print out results

class Bus {
    constructor(line, stop, destination, ETA) {
        this.line = line;
        this.stop = stop;
        this.destination = destination;
        this.ETA = ETA;
    }
}

class Stop {
    constructor(stopID, distance, name) {
        this.stopID = stopID;
        this.distance = distance;
        this.name = name;
    }
}

function getPostcode() {
    console.log('Enter postcode:');
    return readline.prompt();
}

function postcodeDataToLocation (data) {
    return [data['latitude'], data['longitude']];
}

function printBuses(buses, count) {
    console.log('The next', count, 'buses:');
    buses.forEach(function(bus) {
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
        console.log('A route', bus['lineName'], 'bus heading toward', bus['destinationName'], 'will arrive at', bus['stationName'], 'in', minuteString, 'and', secondString)
    })
}

let busCount = 5;
let stopCount = 2;
// let postcode = 'N80AH';
console.log('Enter postcode:');
let postcode = getPostcode();
let urlPostcode = url.postcodeToURL(postcode);

let postcodeLocation = new Promise((resolve, reject) => {
    request(urlPostcode, (error, response, body) => {
        let postcodeData = JSON.parse(body)['result'];
        let [latitude, longitude] = postcodeDataToLocation(postcodeData);
        let urlLocation = url.locationToURL(latitude, longitude);
        if (urlLocation) {resolve(urlLocation)} else {reject('Postcode location retrieval failed.')}
    });
});

postcodeLocation.then((urlLocation) => {
    let busStops = new Promise((resolve, reject) => {
        request(urlLocation, (error, response, body) => {
            let stopData = JSON.parse(body)['stopPoints'];
            let nearStops = makeStopList(stopData);
            if (nearStops) {resolve(nearStops)} else {reject('Nearby stop list retrieval failed.')}
        });
    });
});

busStops.then((nearStops) => {
    nearStops = nearStops.sort(nearStop).slice(0, stopCount);
    //find nearest stops HERE
    // let nearStopsRaw = stopData.sort(nearStop).slice(0, stopCount); // get [stopCount] nearest stops
    let arrivalsList = [];
    nearStops.forEach((stop) => {
        let arrivals = new Promise((resolve, reject) => {
            let urlBusStop = stopToURL(stop);
            request(urlBusStop, (error, response, body) => {
                let busdata = JSON.parse(body);
                let buses = makeBusList(busdata)
                if (buses) {resolve(buses)} else {reject('Bus arrival list retrieval failed.')}
            });
        });
        arrivalsList = arrivalsList.concat(arrivals)
    });
});

Promise.all(arrivalsList).then((nextBuses) => {
    nextBuses = nextBuses.sort(earlyBus).slice(0, busCount); // finds the next [busCount] buses to arrive
    printBuses(nextBuses, busCount); // display the selected buses
});



request(urlBusStop, function (error, response, bodyBusStop) {
    let stopData = JSON.parse(bodyBusStop)['stopPoints'];
    let nearStops = stopData.sort(nearStop).slice(0, stopCount); // get [stopCount] nearest stops
    let nextBuses = [];
    let stopsChecked = 0;
    nearStops.forEach(function(nearStop) {
        nearStop['children'].forEach(function(stop) { // looks at the substops (e.g. both directions) of a stop
            let url = stopToURL(stop);
            request(url, function (error, response, bodyNextBus) {
                let busdata = JSON.parse(bodyNextBus);
                nextBuses = nextBuses.concat(busdata); // adds the approaching buses for that stop to the array
                stopsChecked++; // increases # of stops checked by 1
                if (stopsChecked === nearStops.length) { // if all stops have been checked, finds five nearest and prints
                    nextBuses = nextBuses.sort(earlyBus).slice(0, busCount);
                    printBuses(nextBuses, busCount);
                }
            });
        });
    });
});

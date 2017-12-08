const log4js = require('log4js');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/BusBoard.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});
const logger = log4js.getLogger('BusBoard.log');

logger.trace('initiating program');

const request = require('request-promise');
const readline = require('readline-sync');

const appID = '10d7f3ed';
const appKey = '298858f961a22f8766e39ac81f627ab4';
let appURL = '&app_id=' + appID + '&app_key=' + appKey;

let busCount = 5;
let stopCount = 2;

function earlyBus(busA, busB) { //sorting function for bus arrival times
    if (busA['timeToStation'] < busB['timeToStation']) {return -1;}
    if (busB['timeToStation'] < busA['timeToStation']) {return 1;}
    return 0;
}

function nearStop(stopA, stopB) {
    if (stopA['distance'] < stopB['distance']) {return -1;}
    if (stopB['distance'] < stopA['distance']) {return 1;}
    return 0;
}

function printBuses(buses, count) {
    console.log('The next', count, 'buses:');
    buses.forEach(function(bus) {
        let minutes = parseInt(bus['timeToStation']/60);
        let minuteString;
        let secondString;
        if (minutes === 1) {
            minuteString = minutes + ' minute';
        } else {
            minuteString = minutes + ' minutes';
        }
        let seconds = parseInt(bus['timeToStation']%60);
        if (seconds === 1) {
            secondString = seconds + ' second.';
        } else {
            secondString = seconds + ' seconds.';
        }
        console.log('A route', bus['lineName'], 'bus heading toward', bus['destinationName'], 'will arrive at', bus['stationName'], 'in', minuteString, 'and', secondString)
    })
}

function locationToURL(data) {
    let [longitude, latitude] = [data['longitude'], data['latitude']];
    let stopTypes = ['NaptanBusCoachStation',
        'NaptanBusWayPoint',
        'NaptanOnstreetBusCoachStopCluster',
        'NaptanOnstreetBusCoachStopPair',
        'NaptanPrivateBusCoachTram',
        'NaptanPublicBusCoachTram'];
    let stopTypesURL = stopTypes.join('%2C');
    return 'https://api.tfl.gov.uk/StopPoint?stopTypes='+stopTypesURL+'&radius=500&lat='+latitude+'&lon='+longitude+appURL;
}

console.log('Enter postcode:');
// let postcode = readline.prompt();
let postcode = 'N80AH';
let urlPC = 'https://api.postcodes.io/postcodes/' + postcode;

request(urlPC, function (error, response, bodyPostCode) {
    // console.log('error:', error); // Print the error if one occurred
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    let postcodeData = JSON.parse(bodyPostCode)['result'];
    // grab latitude and longitude
    let urlBS = locationToURL(postcodeData);
    // call up stop from TFL
    request(urlBS, function (error, response, bodyBusStop) {
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
});
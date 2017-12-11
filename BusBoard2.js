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
logger.debug('initiating program');

const request = require('request');
const readline = require('readline-sync');

const location = require('./location');
const stops = require('./stops');
const arrivals = require('./arrivals');
const print = require('./print');

const appID = '10d7f3ed';
const appKey = '298858f961a22f8766e39ac81f627ab4';
let appURL = '&app_id=' + appID + '&app_key=' + appKey;

function getPostcode() {
    console.log('Enter postcode:');
    return readline.prompt();
}

let counts = new Object();
counts.busCount = 5;
counts.stopCount = 2;
let postcode = getPostcode();
// let postcode= 'SW193JR';
// let postcode= 'N80AH';

location.requestLocation(postcode)
    .then((data) => stops.requestStops(data, counts.stopCount))
    .then(arrivals.requestArrivals)
    .then((buses) => {buses = print.prepareBusLists(buses, counts.busCount); print.printBuses(buses)})
    .catch((err) => {logger.error(err); console.log('Something went wrong. Please try again, check your inputs, or contact tech support.')});
const log4js = require('log4js');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/BusBoardApp.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});
const logger = log4js.getLogger('BusBoardApp.log');
logger.debug('initiating program');

const request = require('request');
const readline = require('readline-sync');
const express = require('express');
const app = express();

const location = require('./location');
const stops = require('./stops');
const arrivals = require('./arrivals');
const print = require('./print');
const printWeb = require('./printWeb')

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
// let postcode = getPostcode();
// let postcode= 'SW193JR';
// let postcode= 'N80AH';

app.get('/departureBoards/:postcode', (req, res) => {
    // res.send(req.params.postcode);
    location.requestLocation(req.params.postcode)
        .then((data) => stops.requestStops(data, counts.stopCount), (err) => {res.status(400).send(err)})
        .then(arrivals.requestArrivals)
        .then((buses) => {buses = print.prepareBusLists(buses, counts.busCount); if (buses.length > 0) {
            res.json(buses)
        } else {res.send('No buses arriving near that postcode.')}})
        .catch((err) => {logger.error(err); logger.warn('Something went wrong.'); res.send('Something went wrong. Did you enter a valid postcode?')});
});

app.listen(3000, () => console.log('Departure board app listening on port 3000.'));

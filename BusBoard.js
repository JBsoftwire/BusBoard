const request = require('request');
const fs = require('fs');
const readline = require('readline-sync');
//const moment = require('moment-msdate')

const appID = '10d7f3ed';
const appKey = '298858f961a22f8766e39ac81f627ab4';

console.log('Enter bus stop code:');
//let busStop = readline.prompt();
let busStop = '490008660N';

let url = 'https://api.tfl.gov.uk/StopPoint/' + busStop + '/Arrivals?app_id=' + appID + '&app_key=' + appKey;
// https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals?app_id=10d7f3ed&app_key=298858f961a22f8766e39ac81f627ab4

request(url, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('JSON:', body);
});
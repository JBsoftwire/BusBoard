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

class Bus {
    constructor(ID = undefined, route = undefined, ETA = Infinity) {
        this.ID = ID;
        this.route = route;
        this.ETA = ETA;
    }
}

request(url, function (error, response, body) {
    // console.log('error:', error); // Print the error if one occurred
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    // console.log('JSON:', body);
    let data = JSON.parse(body);
    // grab (up to) 5 with lowest timeToStation
    // // scan through, grab tTS, compare with current set, push into middle and move others out
    // print out their lineID and destinationName: 'No. ### to XYZ'
    // is timeToStation in seconds?
    let nextBuses = new Array(5).fill(new Bus,0) // initialises an array for the five next buses
    data.forEach(function(arrival) {
        for (let i = 0; i < 5; i++) {
            if (arrival['timeToStation'] < nextBuses[i].ETA) {
                nextBuses.splice(i, 0, new Bus(arrival['id'],arrival['lineId'],arrival['timeToStation']));
                nextBuses.pop();
                break;
            }
        }
    })
    console.log('The next five buses:');
    nextBuses.forEach(function(bus) {
        let minutes = parseInt(bus.ETA/60);
        let minuteString
        let secondString
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
        console.log('A route', bus.route, 'bus will arrive in', minuteString, 'and', secondString)
    })
});

// code to insert [item] in [array] at [index]: array.splice(index, 0, item)



// let entries = JSON.parse(data);

// let transaction = new Transaction(dateParse(entry['Date']), entry['FromAccount'], entry['ToAccount'], entry['Narrative'], entry['Amount']);

// {
//     "$type": "Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities",
//     "id": "1603978838",
//     "operationType": 1,
//     "vehicleId": "LK11CWU",
//     "naptanId": "490008660N",
//     "stationName": "Lady Somerset Road",
//     "lineId": "214",
//     "lineName": "214",
//     "platformName": "GY",
//     "direction": "inbound",
//     "bearing": "316",
//     "destinationNaptanId": "",
//     "destinationName": "Highgate Village",
//     "timestamp": "2017-12-07T12:52:31Z",
//     "timeToStation": 1086,
//     "currentLocation": "",
//     "towards": "Highgate Village or Parliament Hill Fields",
//     "expectedArrival": "2017-12-07T13:10:37Z",
//     "timeToLive": "2017-12-07T13:11:07Z",
//     "modeName": "bus",
//     "timing": {
//     "$type": "Tfl.Api.Presentation.Entities.PredictionTiming, Tfl.Api.Presentation.Entities",
//         "countdownServerAdjustment": "00:00:00.6853268",
//         "source": "2017-12-06T10:48:14.302Z",
//         "insert": "2017-12-07T12:51:29.958Z",
//         "read": "2017-12-07T12:51:29.958Z",
//         "sent": "2017-12-07T12:52:31Z",
//         "received": "0001-01-01T00:00:00Z"
// }
// }
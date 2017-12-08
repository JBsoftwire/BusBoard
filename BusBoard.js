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

class Stop {
    constructor(ID = undefined, name = undefined, distance = Infinity) {
        this.ID = ID;
        this.name = name;
        this.distance = distance;
    }
}

let busCount = 5;
let stopCount = 2;

// function listSmallest(list, number, property) {
//     //variables: a 'list' of objects, a 'number' of the smallest to return, a 'property' to order by
//     //this could be replaced with a sorting of the array and truncation, but that would be O(n ln n) while this is O(nm)
//     let smallList = new Array(number).fill(new Map([property, Infinity]));
//     let j = 0;
//     list.forEach(function(entry) {
//         for (let i = 0; i < number; i++) {
//             if (entry[property] < smallList[i][property]) {
//                 smallList.splice(i,0,entry);
//                 smallList.pop();
//                 j++;
//                 break;
//             }
//         }
//     });
//     smallList = smallList.slice(0,j);
//     return smallList
// }

function printBuses(buses, count) {
    console.log('The next', count, 'buses:');
    uses.forEach(function(bus) {
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
        console.log('A route', bus['lineName'], 'bus will arrive in', minuteString, 'and', secondString)
    })
}

request(url, function (error, response, body) {
    // console.log('error:', error); // Print the error if one occurred
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    // console.log('JSON:', body);
    let data = JSON.parse(body);
    //relevant properties: 'timeToStation', 'lineName', can grab more later if needed, it's all retained
    //let nextBuses = listSmallest(data, busCount, 'timeToStation');
    let nextBuses = data.sort().slice(0, busCount)
    printBuses(nextBuses, busCount);
});

console.log('Enter postcode:');
//let busStop = readline.prompt();
let postcode = 'N80AH';
let urlPC = 'https://api.postcodes.io/postcodes/' + postcode

request(urlPC, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('JSON:', body);
    let postcodeData = JSON.parse(body)['result'];
    // grab latitude and longitude
    let [longitude, latitude] = [postcodeData['longitude'],postcodeData['latitude']];
    let stopTypes = 'NaptanBusCoachStation%2CNaptanBusWayPoint%2CNaptanOnstreetBusCoachStopCluster%2CNaptanOnstreetBusCoachStopPair%2CNaptanPrivateBusCoachTram%2CNaptanPublicBusCoachTram';
    let appUrl = '&app_id=' + appID + '&app_key=' + appKey;
    let urlBS = 'https://api.tfl.gov.uk/StopPoint?stopTypes='+stopTypes+'&radius=500&lat='+latitude+'&lon='+longitude+appUrl;
    //call up stop from TFL
    request(urlBS, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('JSON:', body);
        let stopData = JSON.parse(body)['stopPoints'];
        let nextBuses = new Array(stopCount).fill(new Stop,0) // initialises an array for the five next buses
        stopData.forEach(function(stop) { //this should find the two nearest bus stops
            for (let i = 0; i < stopCount; i++) {
                if (stop['distance'] < nextBuses[i].distance) {
                    nextBuses.splice(i, 0, new Bus(arrival['id'],arrival['lineName'],arrival['timeToStation']));
                    nextBuses.pop();
                    break;
                }
            }
        })
        console.log(Stop[0])
        //NEXT: pull next bus data for them and turn into a bus list
    })
});

// https://api.tfl.gov.uk/StopPoint?
// stopTypes=NaptanBusCoachStation%2CNaptanBusWayPoint%2CNaptanOnstreetBusCoachStopCluster%2CNaptanOnstreetBusCoachStopPair%2CNaptanPrivateBusCoachTram%2CNaptanPublicBusCoachTram
// &radius=200
// &lat=51.5839674169706
// &lon=-0.10187318628895
// &modes=bus



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

// {
//     "status": 200,
//     "result": {
//     "postcode": "N9 0AB",
//         "quality": 1,
//         "eastings": 535496,
//         "northings": 193835,
//         "country": "England",
//         "nhs_ha": "London",
//         "longitude": -0.0438874430749641,
//         "latitude": 51.6270243729818,
//         "european_electoral_region": "London",
//         "primary_care_trust": "Enfield",
//         "region": "London",
//         "lsoa": "Enfield 025G",
//         "msoa": "Enfield 025",
//         "incode": "0AB",
//         "outcode": "N9",
//         "parliamentary_constituency": "Edmonton",
//         "admin_district": "Enfield",
//         "parish": "Enfield, unparished area",
//         "admin_county": null,
//         "admin_ward": "Lower Edmonton",
//         "ccg": "NHS Enfield",
//         "nuts": "Enfield",
//         "codes": {
//         "admin_district": "E09000010",
//             "admin_county": "E99999999",
//             "admin_ward": "E05000204",
//             "parish": "E43000200",
//             "parliamentary_constituency": "E14000687",
//             "ccg": "E38000057",
//             "nuts": "UKI54"
//     }
// }
// }

// [
//     "CarPickupSetDownArea",
//     "NaptanAirAccessArea",
//     "NaptanAirEntrance",
//     "NaptanAirportBuilding",
//     "NaptanBusCoachStation",
//     "NaptanBusWayPoint",
//     "NaptanCoachAccessArea",
//     "NaptanCoachBay",
//     "NaptanCoachEntrance",
//     "NaptanCoachServiceCoverage",
//     "NaptanCoachVariableBay",
//     "NaptanFerryAccessArea",
//     "NaptanFerryBerth",
//     "NaptanFerryEntrance",
//     "NaptanFerryPort",
//     "NaptanFlexibleZone",
//     "NaptanHailAndRideSection",
//     "NaptanLiftCableCarAccessArea",
//     "NaptanLiftCableCarEntrance",
//     "NaptanLiftCableCarStop",
//     "NaptanLiftCableCarStopArea",
//     "NaptanMarkedPoint",
//     "NaptanMetroAccessArea",
//     "NaptanMetroEntrance",
//     "NaptanMetroPlatform",
//     "NaptanMetroStation",
//     "NaptanOnstreetBusCoachStopCluster",
//     "NaptanOnstreetBusCoachStopPair",
//     "NaptanPrivateBusCoachTram",
//     "NaptanPublicBusCoachTram",
//     "NaptanRailAccessArea",
//     "NaptanRailEntrance",
//     "NaptanRailPlatform",
//     "NaptanRailStation",
//     "NaptanSharedTaxi",
//     "NaptanTaxiRank",
//     "NaptanUnmarkedPoint",
//     "TransportInterchange"
// ]

// [
//     "NaptanBusCoachStation",
//     "NaptanBusWayPoint",
//     "NaptanOnstreetBusCoachStopCluster",
//     "NaptanOnstreetBusCoachStopPair",
//     "NaptanPrivateBusCoachTram",
//     "NaptanPublicBusCoachTram",
// ]


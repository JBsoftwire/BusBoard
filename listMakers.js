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

function makeStopList(data) { // given appropriate parsed JSON from the TFL API can create an array of Stop objects
    let nearStops = [];
    data.forEach((stop) => {
        // each 'stop' has multiple 'children' representing stops on opposite sides of the road, etc.
        // these are considered part of the same stop for the purposes of this program
        let nearStoplets = []
        stop['children'].forEach((stoplet) => {
            nearStoplets.push(new Stop(stoplet['naptanId'], stop['distance'], stoplet['commonName']))
        })
        nearStops.push(nearStoplets);
    });
    return nearStops
}

function makeBusList(data) { // given appropriate parsed JSON from the TFL API can create an array of Bus objects
    let nextBuses = [];
    data.forEach((bus) => {
        nextBuses.push(new Bus(bus['lineName'], bus['stationName'], bus['destinationName'], bus['timeToStation']));
    });
    return nextBuses
}

module.exports = {makeStopList, makeBusList}
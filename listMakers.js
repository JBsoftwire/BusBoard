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

function makeStopList(data) {
    let nearStops = [];
    // data.forEach((stop) => {
    //     nearStops = nearStops.concat([stop['Children'], stop['Distance']]);
    // });
    // nearStops.forEach((stop) => {
    //     stop = new Stop(stop[0]['naptanID'], stop[0]['commonName'], stop[1]);
    // });
    data.forEach((stop) => {
        let nearStoplets = []
        stop['children'].forEach((stoplet) => {
            nearStoplets.push(new Stop(stoplet['naptanId'], stop['distance'], stoplet['commonName']))
        })
        nearStops.push(nearStoplets);
    });
    return nearStops
}

function makeBusList(data) {
    // line, stop, destination, ETA
    let nextBuses = [];
    data.forEach((bus) => {
        nextBuses.push(new Bus(bus['lineName'], bus['stationName'], bus['destinationName'], bus['timeToStation']));
    });
    return nextBuses
}

module.exports = {makeStopList, makeBusList}
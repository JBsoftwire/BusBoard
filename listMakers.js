function makeStopList(data) {
    let nearStops = [];
    // data.forEach((stop) => {
    //     nearStops = nearStops.concat([stop['Children'], stop['Distance']]);
    // });
    // nearStops.forEach((stop) => {
    //     stop = new Stop(stop[0]['naptanID'], stop[0]['commonName'], stop[1]);
    // });
    data.forEach((stop) => {
        stop['Children'].forEach((stoplet) => {
            nearStops.push(new Stop(stoplet['naptanID'], stoplet['commonName'], stop['Distance']))
        })
    });
    return nearStops
}

function makeBusList(data) {
    // line, stop, destination, ETA
    let nextBuses = [];
    data.forEach((bus) => {
        nextBuses.push(new Bus(bus['lineName'], bus['stationName'], bus['destinationName'], bus['time']));
    });
    return nextBuses
}

module.exports = {makeStopList, makeBusList}
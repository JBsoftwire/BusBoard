function earlyBus(busA, busB) { //sorting function for bus arrival times
    if (busA.ETA < busB.ETA) {return -1;}
    if (busB.ETA < busA.ETA]) {return 1;}
    return 0;
}

function nearStop(stopA, stopB) {
    if (stopA.distance < stopB.distance) {return -1;}
    if (stopB.distance < stopA.distance) {return 1;}
    return 0;
}

module.exports = {nearStop, earlyBus}
function postcodeToURL(postcode) { // constructs a URL to call the postcodes.io API given a postcode
    return 'https://api.postcodes.io/postcodes/' + postcode;
}

function locationToURL(latitude, longitude, appURL) { // constructs a URL to call the TFL nearby bus stops API given coordinates
    let stopTypes = ['NaptanBusCoachStation',
        'NaptanBusWayPoint',
        'NaptanOnstreetBusCoachStopCluster',
        'NaptanOnstreetBusCoachStopPair',
        'NaptanPrivateBusCoachTram',
        'NaptanPublicBusCoachTram'];
    let stopTypesURL = stopTypes.join('%2C');
    return 'https://api.tfl.gov.uk/StopPoint?stopTypes=' + stopTypesURL + '&radius=500&lat=' + latitude + '&lon=' + longitude + appURL;
}

function stopToURL(data, appURL) { // constructs a URL to call the TFL next arrivals API given a bus stop code
    return 'https://api.tfl.gov.uk/StopPoint/' + data.stopID + '/Arrivals?' + appURL;
}

module.exports = {postcodeToURL, locationToURL, stopToURL}
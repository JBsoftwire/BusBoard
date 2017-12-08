function postcodeToURL(postcode) {
    return 'https://api.postcodes.io/postcodes/' + postcode;
}

function locationToURL(latitude, longitude, appURL) {
    let stopTypes = ['NaptanBusCoachStation',
        'NaptanBusWayPoint',
        'NaptanOnstreetBusCoachStopCluster',
        'NaptanOnstreetBusCoachStopPair',
        'NaptanPrivateBusCoachTram',
        'NaptanPublicBusCoachTram'];
    let stopTypesURL = stopTypes.join('%2C');
    return 'https://api.tfl.gov.uk/StopPoint?stopTypes=' + stopTypesURL + '&radius=500&lat=' + latitude + '&lon=' + longitude + appURL;
}

function stopToURL(data, appURL) {
    return 'https://api.tfl.gov.uk/StopPoint/' + data.stopID + '/Arrivals?' + appURL;
}

module.exports = {postcodeToURL, locationToURL, stopToURL}
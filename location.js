const log4js = require('log4js');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/BusBoard2.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});
const logger = log4js.getLogger('BusBoard2.log');

const request = require('request');

function postcodeDataToLocation (data) {
    return [data['latitude'], data['longitude']];
}

function postcodeToURL(postcode) { // constructs a URL to call the postcodes.io API given a postcode
    return 'https://api.postcodes.io/postcodes/' + postcode;
}

function requestLocation(postcode) {
    logger.debug('Entered requestLocation');
    return new Promise((resolve, reject) => {
        let urlPostcode = postcodeToURL(postcode);
        request(urlPostcode, (error, response, body) => {
            let postcodeData = JSON.parse(body)['result'];
            if (postcodeData === undefined) {
                logger.fatal('Failed to recover location data from server. Invalid postcode?');
                console.log('Error: unable to recover location data from server. Did you enter a valid postcode?');
            }
            if (postcodeData) {
                logger.debug('successfully retrieved location data');
                resolve(postcodeDataToLocation(postcodeData))
            } else {reject('Invalid postcode')}
        });
    })
}

module.exports = {postcodeDataToLocation, postcodeToURL, requestLocation};
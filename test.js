var request = require('request');
// request('http://www.google.com', function (error, response, body) {
//     console.log('error:', error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     console.log('body:', body); // Print the HTML for the Google homepage.
// });

function insert(array, item, index) { //inserts [item] at [index] in [array] by bumping array entries from [index] and higher up 1 step
    let obj = array
    let tail = obj.splice(index);
    obj.push(item);
    return obj.concat(tail)
}

let list = ['one', 'two', 'three', 'four'];

let nextBuses = new Array(5).fill(['none', 'infinity'],0)

console.log(nextBuses)
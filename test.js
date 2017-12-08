// var q = new Promise(function(resolve, reject) {
//     if (/* condition */) {
//         resolve(/* value */);  // fulfilled successfully
//     }
//     else {
//         reject(/* reason */);  // error, rejected
//     }
// });

var p = new Promise((resolve, reject) => resolve(5));

var q = new Promise(function(resolve, reject) {
    if (true) {
        resolve(6);
    } else {
        reject('No');
    }
})

p.then((val) => {console.log(val); console.log(val+10)});

p.then(function(val) {
    console.log(val + 100)
});

// q.then((val) => console.log(val + 100));
const readline = require('readline-sync');
readline.prompt()
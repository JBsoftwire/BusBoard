const request = require('request')
const fs = require('fs');
const readline = require('readline-sync');
const moment = require('moment-msdate')

console.log('Enter bus stop code:');
let busStop = readline.prompt();
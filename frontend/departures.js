class Bus {
    constructor(line, stop, destination, ETA) {
        this.line = line;
        this.stop = stop;
        this.destination = destination;
        this.ETA = ETA;
    }
}

function getPostcode() {
    var postcode = document.getElementById("postcode").value;
    console.log('postcode:',postcode)
    var url = 'http://localhost:3000/departureBoards?postcode=' + encodeURIComponent(postcode);
    var xhttp = new XMLHttpRequest();
    // xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.open('GET', url, true);
    xhttp.onload = function() {
        console.log(xhttp.response)
        try {
            var buses = JSON.parse(xhttp.response);
            var newHTML = '';
            for (var i = 0; i < buses.length; i++) {
                console.log(buses[i]);
                newHTML = newHTML + '<h3>' + buses[i][0]['stop'] + '</h3>\n<ul>\n';
                for (var j = 0; j < buses[i].length; j++) {
                    var bus = buses[i][j];
                    var minuteString = parseInt(bus['ETA']/60) + ' minutes';
                    var secondString = parseInt(bus['ETA']%60) + ' seconds';
                    newHTML = newHTML+'<li>'+ minuteString +' and '+ secondString +': number '+ bus['line'] +' to '+ bus['destination'] + '</li>\n';
                }
                newHTML = newHTML + '</ul>\n'
            }
            document.getElementById("results").innerHTML = newHTML
        } catch (error) {
            document.getElementById("results").innerHTML = '<h3>' + xhttp.response + '</h3>'
        }
    };
    xhttp.send();
}

// <h3>Example stop 1</h3>
// <ul>
// <li>2 minutes: 123 to Example Street</li>
// <li>3 minutes: 456 to Fantasy Land</li>
// </ul>
// <h3>Example stop 2</h3>
// <ul>
// <li>1 minute: 123 to Example Street</li>
// <li>4 minutes: 456 to Fantasy Land</li>
// </ul>
//
// [
//     [
//         {"line":"141","stop":"St Ann's Road","destination":"Palmers Green, North Circular Road","ETA":30},
//         {"line":"141","stop":"St Ann's Road","destination":"London Bridge","ETA":52},
//         {"line":"141","stop":"St Ann's Road","destination":"London Bridge","ETA":127},
//         {"line":"29","stop":"St Ann's Road","destination":"Wood Green","ETA":127},
//         {"line":"29","stop":"St Ann's Road","destination":"Wood Green","ETA":202}],
//     [{"line":"341","stop":"Harringay Road","destination":"Angel Road, Superstores","ETA":268},
//         {"line":"341","stop":"Harringay Road","destination":"Angel Road, Superstores","ETA":931},
//         {"line":"341","stop":"Harringay Road","destination":"Angel Road, Superstores","ETA":1701}]]
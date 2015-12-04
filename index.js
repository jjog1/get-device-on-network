var arp = require('arp-table')()
var ping = require('ping');
var fs = require('fs');

var wstream = fs.createWriteStream('fileToWrite.txt');

var baseRange = '192.168.0', startingRange = 30, maxRange = 40;
for( i = startingRange; i < maxRange; i ++)
{
	host = baseRange + '.' + i;
	// Ping the network, we don't care what the response is 
	// but it will help populate/refresh the arp table
	ping.sys.probe(host, function(){});
}

// Writes the arps table to a file.
arp.stdout.pipe(wstream);

// The regex for both mac address and ip addresses
var ipRe = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/, macRe = /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/

var tableObject = {};

// xx-xx-xx-xx-xx-xx
var deviceMac = '';

function func(data) {
  var mac = data.match(macRe);
  if(mac != null){
  	mac = mac[0];
  }
  var ip = data.match(ipRe)
  if(ip != null){
  		ip = ip[0];
  	}
  tableObject[mac] = ip
}

function populateObject(input, cb) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
      cb()
  });
}

function checker(){
	console.log('checker');
	console.log(tableObject[deviceMac]);
}

setTimeout(function(){
	var input = fs.createReadStream('fileToWrite.txt');
	populateObject(input, checker);}
, 5000);
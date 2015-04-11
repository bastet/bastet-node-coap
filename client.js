const coap = require('coap');
var host = 'localhost';

var names = ["Dan", "Martin","slug/snail/worm", "hostname", "ip", "cpu", "memory", "type", "platform", "arch", "release", "uptime", "load", "network"];
names.forEach(function(entry) {
	var request = coap.request('coap://'+host+'/'+entry);
	request.on('response', function(res) {
        console.log('');
        console.log('Request: '+entry);
		res.pipe(process.stdout);
	})
	request.end()
});

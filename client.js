const coap = require('coap');
var host = 'localhost';

var names = ["Dan", "Martin","slug/snail/worm", "hostname", "ip"];
names.forEach(function(entry) {
	var request = coap.request('coap://'+host+'/'+entry);
	request.on('response', function(res) {
		res.pipe(process.stdout)
	})
	request.end()
});

const coap  = require('coap');

var names = ["Dan", "Dave", "Luke"];
names.forEach(function(entry) {
	var request = coap.request('coap://localhost/'+entry);
	request.on('response', function(res) {
		res.pipe(process.stdout)
	})
	request.end()
});

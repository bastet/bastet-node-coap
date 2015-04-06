const coap    = require('coap');
var server  = coap.createServer();

server.on('request', function(req, res) {
  console.log('Request recieved: '+req.url);
  res.end('Hello ' + req.url.split('/')[1] + '\n')
})

server.listen(function() {
  console.log('server started')
})

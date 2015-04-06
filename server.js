const coap = require('coap');
var server = coap.createServer();
var application = {};

var os = require('os');
var ifaces = os.networkInterfaces();

var router = {
    'routes': [{'url': 'example', 'function': 'exampleFunction'}],
    'getRoutes': function() { return this.routes; },
    'addRoute': function(routeString, routeFunction) {
        this.routes.push({'url': routeString, 'function': routeFunction});
    },
    // Custom basic router
    'parseRoute': function(routeString) {
        var result = "null";
        var initialComponents = routeString.split('/');
        var urlComponents = [];
        initialComponents.forEach(function(item) {
            if(item.length > 0) { urlComponents.push(item); }
        });
        // check each registered route again the first part of the url
        this.routes.forEach(function(route) {
            // if a match is found then try and run the assigned function
            if(route.url === urlComponents[0]) {
                console.log('Valid requested route: '+route.url);
                if(route.function in application && typeof application[route.function] === 'function') {
                    result = application[route.function](urlComponents);
                }
            }
        });
        return result;
    }
};

// Define new routes
router.addRoute('slug', 'printSlug');
router.addRoute('hostname', 'getHostname');
router.addRoute('ip', 'getIP');

// Define custom functions
application.exampleFunction = function exampleFunction() { retun('This is an example function.'); };

application.getHostname = function getHostname() {
    return(os.hostname());
};

application.getIP = function getIP() {
    var IP = "no ip";
    Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;
    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        IP = (ifname + ':' + alias, iface.address);
      } else {
        // this interface has only one ipv4 adress
        IP = iface.address;
      }
    });
  });
  return IP;
};

application.printSlug = function printSlug(urlComponents) {
    return(urlComponents);
};

// event on recieving a request
server.on('request', function(req, res) {
  var result = router.parseRoute(req.url);
  if(result === 'null' || typeof result === 'undefined') {
    res.end(JSON.stringify('Hello ' + req.url.split('/')[1]) + '\n');
  } else {
    res.end(JSON.stringify(result)+'\n');
  }
})

// start the server listening
server.listen(function() {
  console.log('server started')
})

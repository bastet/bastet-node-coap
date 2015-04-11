const coap = require('coap');
var server = coap.createServer();
var application = {};

var os = require('os');
var ifaces = os.networkInterfaces();

var router = {
    'routes': [{'url': '.well-known', 'function': 'discovery'}],
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

// Define new routes in the format (slug string, function name)
router.addRoute('slug', 'getSlug');
router.addRoute('hostname', 'getHostname');
router.addRoute('ip', 'getIP');
router.addRoute('cpu', 'getCPUs');

// Define custom functions
application.discovery = function exampleFunction() { return(router.routes); };

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

application.getSlug = function getSlug(urlComponents) {
    return(urlComponents);
};

application.getCPUs = function getCPUs(urlComponents) {
    return(os.cpus());
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

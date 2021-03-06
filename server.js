const coap = require('coap');
const linkFormat = require('h5.linkformat');
var toString = require('h5.linkformat/lib/toString');

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
router.addRoute('cpu-percentage', 'getCPUPercentage');
router.addRoute('memory', 'getRAM');
router.addRoute('type', 'getType');
router.addRoute('platform', 'getPlatform');
router.addRoute('arch', 'getArch');
router.addRoute('release', 'getRelease');
router.addRoute('uptime', 'getUptime');
router.addRoute('load', 'getLoad');
router.addRoute('network', 'getNetwork');

// Define custom functions
application.discovery = function discovery() {
    var links = [];
    router.routes.forEach(function(route, index){
        links.push({'href': '/'+route.url, 'rt': index+''});
    });
    return(toString(links));
};

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

application.getCPUPercentage = function getCPUPercentage(urlComponents) {
    var cpus = os.cpus();
    var output = {};
    for(var i = 0, len = cpus.length; i < len; i++) {
        var cpu = cpus[i], total = 0;
        for(type in cpu.times)
            total += cpu.times[type];
        var types = {};
        for(type in cpu.times) {
            types[type] = Math.round(100 * cpu.times[type] / total);
        }
        output[i] = types;
    }
    return(output);
};

application.getRAM = function getRAM(urlComponents) {
    if(typeof(urlComponents[1]) === 'undefined') {
       urlComponents[1] = 'byte';
    }
    console.log(urlComponents);
    var RAM, total = os.totalmem(), free = os.freemem();
    switch (urlComponents[1]) {
        case 'mb':
            var divisible = 1024;
            RAM = {'total': total / divisible, 'free': free / divisible, 'used': (total - free) / divisible};
            break;
        case 'percent':
        case 'percentage':
            RAM = {'total': ((100 / total) * total), 'free': ((100 / total) * free), 'used': ((100 / total) * (total - free))};
            break;
        case 'byte':
        case 'b':
        default:
            RAM = {'total': total, 'free': free, 'used': (total - free)};
            break;
    }
    return(RAM);
};

application.getType = function getType(urlComponents) {
    return(os.type());
};

application.getPlatform = function getPlatform(urlComponents) {
    return(os.platform());
};

application.getArch = function getArch(urlComponents) {
    return(os.arch());
};

application.getRelease = function getRelease(urlComponents) {
    return(os.release());
};

application.getUptime = function getUptime(urlComponents) {
    return({'unit': 'seconds', 'value': os.uptime()});
};

application.getLoad = function getLoad(urlComponents) {
    return(os.loadavg());
};

application.getNetwork = function getNetwork(urlComponents) {
    return(os.networkInterfaces());
};

// event on recieving a request
server.on('request', function(req, res) {
  var result = router.parseRoute(req.url);
  if(result === 'null' || typeof result === 'undefined') {
    res.end(JSON.stringify('Hello ' + req.url.split('/')[1]) + '\n');
  } else if(req.url.indexOf("well-known") > -1){
    res.setOption('Content-Format', 'application/link-format');
    res.end(result);
    } else {
    res.end(JSON.stringify(result)+'\n');
  }
})

// start the server listening
server.listen(function() {
  console.log('server started')
})

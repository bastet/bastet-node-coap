const coap = require('coap');
var server = coap.createServer();
var application = {};

var router = {
    'routes': [{'url': 'example', 'function': 'exampleFunction'}],
    'getRoutes': function() { return this.routes; },
    'addRoute': function(routeString, routeFunction) {
        this.routes.push({'url': routeString, 'function': routeFunction});
    },
    // Custom basic router
    'parseRoute': function(routeString) {
        var initialComponents = routeString.split('/');
        var urlComponents = [];
        initialComponents.forEach(function(item) {
            if(item.length > 0) { urlComponents.push(item); }
        });
        // check each registered route again the first part of the url
        this.routes.forEach(function(route) {
            // if a match is found then try and run the assigned function
            if(route.url === urlComponents[0]) {
                if(route.function in application && typeof application[route.function] === 'function') {
                    application[route.function](urlComponents);
                }
            }
        });
    }
};

// Define new routes
router.addRoute('slug', 'printSlug');

// Define custom functions
application.exampleFunction = function exampleFunction() { console.log('This is an example function.'); };

application.printSlug = function printSlug(urlComponents) {
    console.log('printSlugs');
    console.log(urlComponents);
};

// event on recieving a request
server.on('request', function(req, res) {
  router.parseRoute(req.url);
  res.end('Hello ' + req.url.split('/')[1] + '\n')
})

// start the server listening
server.listen(function() {
  console.log('server started')
})

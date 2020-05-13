
var express = require('express');
var path = require('path');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var bodyParser = require('body-parser');
var expressLess = require('express-less');
var cfenv = require('cfenv');
var WebSocket = require('ws');
var http = require('http');
var url = require('url');
var config = require('config');
var fs = require('fs');
var path = require('path');

// create a new express server
var app = express();
var server = http.createServer(app);

app.use(bodyParser.json());

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname,'specs/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);
// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // static - all our js, css, images, etc go into the assets path
  // static - all our js, css, images, etc go into the assets path
  app.use('/tripcontract/app', express.static(path.join(__dirname, './client', 'app')));
  app.use('/tripcontract/bower_components', express.static(path.join(__dirname, './client', 'bower_components')));
  app.use('/tripcontract/assets', express.static(path.join(__dirname, './client', 'assets')));
  app.use('/tripcontract/data', express.static(path.join(__dirname, './client', 'data')));

  app.use('/tripcontract/less/stylesheets/*', function (req, res, next) {
      var url = req.originalUrl;
      var relativePath = url.replace("/tripcontract/less/stylesheets/", "");
      var lessCSSFile = path.join('./client', relativePath);
      req.url = lessCSSFile;
      var expressLessObj = expressLess(__dirname, {
          compress: true,
          debug: true
      });
      expressLessObj(req, res, next);
  });

  var restServerConfig = Object.assign({}, config.get('restServer'));
  if (process.env.REST_SERVER_CONFIG ) {
    try {
      var restServerEnv = JSON.parse(process.env.REST_SERVER_CONFIG);
      restServerConfig = Object.assign(restServerConfig, restServerEnv); // allow for them to only specify some fields
      restServerConfig = restServerEnv;
    } catch (err) {
      console.error('Error getting rest config from env vars, using default');
    }
  }
  app.set('config', {
    restServer: restServerConfig
  })

  var wss = new WebSocket.Server({ server: server });
  wss.on('connection', function (ws, req) {
    var location = url.parse(req.url, true);
    console.log('client connected', location.pathname);
    var remoteURL = restServerConfig.webSocketURL + location.pathname;
    console.log('creating remote connection', remoteURL);
    var remote = new WebSocket(remoteURL);
    ws.on('close', function (code, reason) {
      console.log('client closed', location.pathname, code, reason);
      remote.close();
    });
    ws.on('message', function (data) {
      console.log('message from client', data);
      remote.send(data);
    });
    remote.on('open', function () {
      console.log('remote open', location.pathname);
    })
    remote.on('close', function (code, reason) {
      console.log('remote closed', location.pathname, code, reason);
      ws.close();
    });
    remote.on('message', function (data) {
      console.log('message from remote', data);
      ws.send(data);
    });

    remote.on('error', function (data) {
      console.log('AN ERROR OCCURED: ', data);
      ws.close();
    });
  });

  // This route deals enables HTML5Mode by forwarding missing files to the index.html
  app.use('/*', function (req, res) {
    res.sendFile(path.join(__dirname, './client', 'index.html'));
  });

  // get the app environment from Cloud Foundry
  var appEnv = cfenv.getAppEnv();

  // start server on the specified port
  server.listen(appEnv.port, function () {
    'use strict';
    // print a message when the server starts listening
    console.log('server starting on ' + appEnv.url);
  });

});

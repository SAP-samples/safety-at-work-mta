/*eslint no-console: 0*/
"use strict";

const https = require("https"),
	port = process.env.PORT || 3100,
	server = require("http").createServer(),
    bodyParser = require('body-parser'),
	express = require("express");

//Initialize Express App for XSA UAA and HDBEXT Middleware
const xsenv = require("@sap/xsenv"),
	passport = require("passport"),
	xssec = require("@sap/xssec");
	
xsenv.loadEnv();

https.globalAgent.options.ca = xsenv.loadCertificates();
global.__base = __dirname + "/";
global.__uaa = process.env.UAA_SERVICE_NAME;

//logging
const logging = require("@sap/logging"),
 appContext = logging.createAppContext();

//Initialize Express App for XS UAA 
var app = express();

// Body parse for POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

//Build a JWT Strategy from the bound UAA resource
passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
	uaa: {
		tag: "xsuaa"
	}
}).uaa));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

//Add XS Logging to Express
app.use(logging.middleware({
	appContext: appContext,
	logNetwork: true
}));

//Add Passport JWT processing
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

//Setup Additional Node.js Routes
require("./router")(app);

//Start the Server
server.on("request", app);
server.listen(port, function () {
	console.info(`HTTP Server: ${server.address().port}`);
});

module.exports = app;
'use strict';
/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
const express = require("express"),
    controller = require("../../controller"),
    cfenv = require("cfenv");

module.exports = function() {
	var app = express.Router();

	app.get(
		"/userInfo", 
		controller.testEcho
	);
	
	return app;
};
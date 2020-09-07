/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-define: 0, no-redeclare: 0*/
"use strict";

$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";
$.import("common.libs", "checkInfection");
$.import("common.libs", "insertInfected");
var http = $.require("https");

//Implementation of GET call
async function fnHandlePost() {
	var bodyStr = $.request.body ? $.request.body.asString() : undefined;
	if (bodyStr === undefined) {
		var e = new Error()
		e.message = "Missing BODY";
		throw e;
	}
	// Extract body insert data to DB and return results in JSON/other format
	var oBody = JSON.parse(bodyStr),
		sQuery = oBody.query,
		sSQL = '',
		sMode = oBody.mode,
		oResult = {};

	/*
		expected body structure
		{
			function: "fnName",
			payload: {
				param1: ...,
				param2: ...
			}
		}
	*/

	try {
		var oResult = {
			"function": "",
			value: {}
		}
		let http_promise = getPromise();
		let response_body = await http_promise;
	
		oResult.value = JSON.stringify(response_body);
		return oResult;
	} catch (e) {
		throw e;
	}

}

function getPromise() {
	return new Promise((resolve, reject) => {
		http.get('https://next.json-generator.com/api/json/get/VyreP7csd', (response) => {
			let chunks_of_data = [];

			response.on('data', (fragments) => {
				chunks_of_data.push(fragments);
			});

			response.on('end', () => {
				let response_body = chunks_of_data;
				resolve(response_body.toString());
			});

			response.on('error', (error) => {
				reject(error);
			});
		});
	});
}

try {
	switch ($.request.method) {
		//Handle your GET calls here
	case $.net.http.POST:
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(fnHandlePost()));
		break;
	default:
		break;
	}
} catch (e) {
	$.response.status = 500;
	$.response.contentType = "application/json";
	$.response.setBody(JSON.stringify({
		error: {
			code: "500",
			fileName: e.fileName,
			lineNumber: e.lineNumber,
			message: e.message ? e.message : e,
			stack: e.stack
		}
	}));
}
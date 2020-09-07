/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-define: 0, no-redeclare: 0*/
"use strict";

$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";
$.import("common.libs", "checkInfection");
$.import("common.libs", "insertInfected");
$.import("common.libs", "importEvents");
$.import("common.libs", "insertEIDs");

//Implementation of GET call
function fnHandlePost() {
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

	if (!oBody.function || oBody.function === null || oBody.function.trim() === "") {
		var e = new Error()
		e.message = "please provide a function name";
		throw e;
	}

	var oResult = {
		"function": "",
		value: {}
	}
	try {
		if (oBody.function === "checkInfection") {
			if (!oBody.payload || oBody.payload === null) {
				var e = new Error()
				e.message = "please provide a payload for the function";
				throw e;
			}
			
			var bResult = $.common.libs.checkInfection.execute(oBody.payload);
			oResult.function = oBody.function;
			oResult.value["meetInfected"] = bResult;
		} else if (oBody.function === "insertInfected") {
			
			if (!oBody.payload || oBody.payload === null) {
				var e = new Error()
				e.message = "please provide a payload for the function";
				throw e;
			} 

			var iResult = $.common.libs.insertInfected.execute(oBody.payload);
			oResult.function = oBody.function;
			oResult.value["countPotentialInfectedUsers"] = iResult;
		} else if (oBody.function === "importEvents") {
			
			if (!oBody.payload || oBody.payload === null) {
				var e = new Error()
				e.message = "please provide a payload for the function";
				throw e;
			} 

			var iResult = $.common.libs.importEvents.execute(oBody.payload);
			oResult.function = oBody.function;
			oResult.value = iResult;
		} else if (oBody.function === "insertEIDs") {
			
			if (!oBody.payload || oBody.payload === null) {
				var e = new Error()
				e.message = "please provide a payload for the function";
				throw e;
			} 

			var iResult = $.common.libs.insertEIDs.execute(oBody.payload);
			oResult.function = oBody.function;
			oResult.value = iResult;
		}

		return oResult;
	} catch (e) {
		throw e;
	}

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
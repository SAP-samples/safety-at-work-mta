/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-define: 0, no-redeclare: 0*/
"use strict";

/**
@function checks whether the provided deviceId has met any device belonging to a covid infected user
@param {string} deviceId - deviceId to use for the check
@returns {boolean} true, user met one or more infected, false no infected users met
*/

function execute(obj){
	var connection = $.hdb.getConnection(),
		deviceId = obj.deviceId,
		iRes = 0;
	
	if (!obj.deviceId || obj.deviceId == null) {
		var e = new Error()
		e.message = "Missing device ID parameter";
		throw e;
	}
	
	//check if any EID assigned to the provided DeviceID are parte of the EIDMatched column of table ProximityDetected
	var sSQL = 'select count("EID") as "countMatched" from "demo.sap.presales.covid19.model::covid19.ProximityDetected" P join ';
		sSQL += ' "demo.sap.presales.covid19.model::covid19.EphemeralID" E';
		sSQL += ' ON P."EIDMatched" = E."EID"';
		sSQL += ' where E."DeviceID" = ?';

	var oResult = connection.executeQuery(sSQL, deviceId);
	
	iRes = oResult[0]["countMatched"];
	return iRes>0?true:false;
}
/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-define: 0, no-redeclare: 0*/
"use strict";

/**
 * @function this function inserts the reported infected device id (user ID) and checks if any event is referring the the EIDs used by this device
 *
 * @param {Object} object representing the infected record to insert
 *
 * @return: {Object} - [possibleInfected] number of potential EID infected
 *
 */

function execute(obj) {
	var connection = $.hdb.getConnection(),
		deviceId = obj.deviceId,
		attrib1 = obj.attrib1,
		attrib2 = obj.attrib2,
		attrib3 = obj.attrib3,
		notes = obj.notes,
		distance = 0,
		sId = $.util.createUuid(),
		oNow = new Date();

	if (!obj.deviceId || obj.deviceId == null) {
		var e = new Error()
		e.message = "Missing device ID parameter";
		throw e;
	}

	//check whether distance parameter is not a number. If yes, raise exception, if not transform it to float
	if (obj.distance && obj.distance != null && Number.isNaN(obj.distance)) {
		var e = new Error()
		e.message = "Provided distance value is not a number. Please send a number";
		throw e;
	} else {
		distance = parseFloat(obj.distance)
	}

	//if no istance value is provided set it to the default 2, means at least two devices met multiple times in
	//2 time windows of 5 minutes
	if (!obj.distance || obj.distance == null) {
		distance = 2;
	}
	
	if (!obj.attrib1) {
		attrib1 = null;
	}
	
	if (!obj.attrib2) {
		attrib2 = null;
	}
	
	if (!obj.attrib3) {
		attrib3 = null;
	}
	
	if (!obj.notes) {
		notes = null;
	}

	try {
		//insert the reported infected
		connection.executeUpdate('INSERT INTO "demo.sap.presales.covid19.model::covid19.Infected" VALUES (?,?,?,?,?,?,?)', sId, deviceId, oNow, attrib1,attrib2,attrib3,notes);

		//search for the EID used by the provided DevideID
		//move the EIDs found and the infected ID in the table EphemeralIDInfected
		var sSQL1 =
			"insert into \"demo.sap.presales.covid19.model::covid19.EphemeralIDInfected\" ";
		sSQL1 +=
			"select \"EID\", ? from \"demo.sap.presales.covid19.model::covid19.EphemeralID\" "
		sSQL1 += "where \"DeviceID\" = ?";

		connection.executeUpdate(sSQL1, sId, deviceId);

		/*check in the events table the source EIDs that met the found EIDs. Copy these matched in ProximityDetected table
		exclude by the list all the source EIDs that realted to same deviceID, for example, exclude matches between EID assigned
		to multiple devices owned by same user
		ProximityDetected table:
			• CreatedAt --> date time of record creation
			• EIDInfected --> Target EIDs coming from Events table. Corresponding to all EID used by the provided user
			• EIDMatched --> Source EID coming from Events table
			• EventTS --> date time of the event when 2 EID met
		*/
		var sSQL2 = 'insert into "demo.sap.presales.covid19.model::covid19.ProximityDetected" ';
		sSQL2 += 'SELECT ?, "TargetIED", "SourceEID", "CreatedAt"';
		sSQL2 += ' FROM "demo.sap.presales.covid19.model::covid19.Event"';
		sSQL2 += ' WHERE "TargetIED" IN (';
		sSQL2 += 'SELECT "EID" FROM "demo.sap.presales.covid19.model::covid19.EphemeralID" "E"';
		sSQL2 += ' JOIN "demo.sap.presales.covid19.model::covid19.Device" "D" ON "E"."DeviceID" = "D"."DeviceID"';
		sSQL2 += ' WHERE E."DeviceID" = ? and UPPER("D"."Type") = ?)	AND "Distance" > ? AND "SourceEID" NOT IN (';
		sSQL2 += ' SELECT "EID" FROM "demo.sap.presales.covid19.model::covid19.EphemeralID"'
		sSQL2 += ' WHERE "DeviceID" = ?)';

		connection.executeUpdate(sSQL2, oNow, deviceId, "USER", distance, deviceId);

		var sSQL3 = 'select distinct count("DeviceID") as "countUsersMatched"';
			sSQL3 += ' from "demo.sap.presales.covid19.model::covid19.EphemeralID" E join (';
			sSQL3 += ' select distinct "EIDMatched" from "demo.sap.presales.covid19.model::covid19.ProximityDetected"';
			sSQL3 += ' ) P on E.EID = P."EIDMatched"';
		
		var oResult = connection.executeQuery(sSQL3);
		connection.commit()
		return oResult[0]["countUsersMatched"];
	} catch (e) {
		connection.rollback();
		throw e;
	}
}
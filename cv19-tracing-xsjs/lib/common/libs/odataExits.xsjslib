$.import("common.libs", "insertInfected");

function device_create(param) {

	try {

		var after = param.afterTableName;

		//Get Input New Record Values
		var pStmt = param.connection.prepareStatement(`select * from "${after}"`);
		var rs = null;
		rs = pStmt.executeQuery();
		var oNow = new Date(),
			sUserId = $.session.getUsername() ? $.session.getUsername() : "anonymous",
			sID = "",
			sType = "",
			sDescription = "",
			iCapacity = 0,
			sMajor = "",
			sMinor = "";

		while (rs.next()) {
			sID = rs.getString(1).trim();
			sType = rs.getString(2).toUpperCase();
			sDescription = rs.getString(3);
			iCapacity = rs.getInteger(9);
			sMajor = rs.getString(10);
			sMinor = rs.getString(11);
		}
		pStmt.close();

		pStmt = param.connection.prepareStatement(
			'INSERT INTO "demo.sap.presales.covid19.model::covid19.Device" VALUES (?,?,?,?,?,?,?,?,?,?,?)'
		);
		
		sDescription = (!sDescription || sDescription==null) ? sID : sDescription;
		
		//check if major and minor are numbers between 0 and 65535
		if(sType.toLowerCase() == "beacon" && sMajor && sMajor!=null){
			if(isNaN(sMajor)){
				return {
					HTTP_STATUS_CODE: 500, // e.g. 400, 500, etc. 
					ERROR_MESSAGE: 'Major has to be a number'
				};
			}else{
				var iMajor = parseInt(sMajor);
				if(iMajor<0 || iMajor>65535){
					return {
						HTTP_STATUS_CODE: 500, // e.g. 400, 500, etc. 
						ERROR_MESSAGE: 'Major has to be a number between 0 and 65535'
					};
				}
			}
		}
		
		if(sType.toLowerCase() == "beacon" && sMinor && sMinor!=null){
			if(isNaN(sMinor)){
				return {
					HTTP_STATUS_CODE: 500, // e.g. 400, 500, etc. 
					ERROR_MESSAGE: 'Minor has to be a number'
				};
			}else{
				var iMinor = parseInt(sMinor);
				if(iMinor<0 || iMinor>65535){
					return {
						HTTP_STATUS_CODE: 500, // e.g. 400, 500, etc. 
						ERROR_MESSAGE: 'Minor has to be a number between 0 and 65535'
					};
				}
			}
		}
		
		sMajor = (!sMajor || sMajor==null) ? "0" : sMajor;
		sMinor = (!sMinor || sMinor==null) ? "0" : sMinor;
		
		if (sType.toLowerCase() == "beacon") {
			pStmt.setString(1, sID+"|"+sMajor+"|"+sMinor);
		}else{
			pStmt.setString(1, sID);
		}
		pStmt.setString(2, sType);
		pStmt.setString(3, !sDescription ? "" : sDescription);
		pStmt.setString(4, undefined);
		pStmt.setTimestamp(5, oNow);
		pStmt.setString(6, sUserId);
		pStmt.setTimestamp(7, oNow);
		pStmt.setString(8, sUserId);
		pStmt.setInteger(9, !iCapacity ? 0 : iCapacity);
		pStmt.setString(10, sMajor);
		pStmt.setString(11, sMinor);

		pStmt.executeUpdate();
		pStmt.close();

		if (sType.toLowerCase() == "beacon") {
			//insert a corresponding record in EphemeralID table in case the device is of type beacon
			pStmt = param.connection.prepareStatement(
				'INSERT INTO "demo.sap.presales.covid19.model::covid19.EphemeralID" VALUES (?,?,?)'
			);

			pStmt.setString(1, sID+"|"+sMajor+"|"+sMinor);
			pStmt.setString(2, sID+"|"+sMajor+"|"+sMinor);
			pStmt.setTimestamp(3, oNow);

			pStmt.executeUpdate();
			pStmt.close();
		}

	} catch (e) {
		$.trace.error(e.toString());
		if (e.hasOwnProperty("message") && e.message.indexOf("unique constraint violated") >= 0) {
			return {
				HTTP_STATUS_CODE: 500, // e.g. 400, 500, etc. 
				ERROR_MESSAGE: 'device already onboarded. If the device is a Beacon, set up different values for major and minor',
				DETAILS: 'device already onboarded. If the device is a Beacon, set up different values for major and minor'
			};
		} else {
			throw e;
		}
	}
}

function device_delete(param) {

	try {
		var after = param.afterTableName;

		//Get Input New Record Values
		var pStmt = param.connection.prepareStatement(`select * from "${after}"`);
		var rs = null;
		rs = pStmt.executeQuery();
		var oNow = new Date(),
			sUserId = $.session.getUsername() ? $.session.getUsername() : "anonymous",
			sID = "";

		while (rs.next()) {
			sID = rs.getString(1);
		}
		pStmt.close();

		pStmt = param.connection.prepareStatement(
			'DELETE from "demo.sap.presales.covid19.model::covid19.Device" where "DeviceID" = ?'
		);

		pStmt.setString(1, sID);

		pStmt.executeUpdate();
		pStmt.close();

	} catch (e) {
		$.trace.error(e.toString());
		throw e;
	}
}

function device_update(param) {

	try {
		
		//ATTENTION: major and minor are not managed since cannot be changes once defined 
		//during the device creation. The reason is, in case of change, I should change
		//device's key
		
		var after = param.afterTableName;

		//Get Input New Record Values
		var pStmt = param.connection.prepareStatement(`select * from "${after}"`);
		var rs = null;
		rs = pStmt.executeQuery();
		var oNow = new Date(),
			sUserId = $.session.getUsername() ? $.session.getUsername() : "anonymous",
			sID = "",
			sType = "",
			sDescription = "",
			iCapacity = 0;

		while (rs.next()) {
			sID = rs.getString(1);
			sType = rs.getString(2);
			sDescription = rs.getString(3);
			iCapacity = rs.getInteger(9);
		}
		pStmt.close();

		pStmt = param.connection.prepareStatement(
			'UPDATE "demo.sap.presales.covid19.model::covid19.Device" set "Type"=?, "Description" = ?, "UpdatedAt" = ?, "UpdatedBy" = ?, "Capacity" = ?  where "DeviceID" = ?'
		);

		pStmt.setString(1, sType);
		pStmt.setString(2, sDescription);
		pStmt.setTimestamp(3, oNow);
		pStmt.setString(4, sUserId);
		pStmt.setString(6, sID);
		pStmt.setInteger(5, iCapacity);

		pStmt.executeUpdate();
		pStmt.close();

	} catch (e) {
		$.trace.error(e.toString());
		throw e;
	}
}

function infected_create(param) {
	try {

		var after = param.afterTableName;

		//Get Input New Record Values
		var pStmt = param.connection.prepareStatement(`select * from "${after}"`);
		var rs = null;
		rs = pStmt.executeQuery();
		var oItem = {
			deviceId: null,
			attrib1: null,
			attrib2: null,
			attrib3: null,
			notes: null
		};

		while (rs.next()) {
			oItem.deviceId = rs.getString(2);
			oItem.attrib1 = rs.getString(4);
			oItem.attrib2 = rs.getString(5);
			oItem.attrib3 = rs.getString(6);
			oItem.notes = rs.getString(7);
		}
		pStmt.close();

		$.common.libs.insertInfected.execute(oItem);

	} catch (e) {
		$.trace.error(e.toString());
		throw e;
	}
}
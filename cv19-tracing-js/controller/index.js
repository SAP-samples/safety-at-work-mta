const axios = require("axios"),
	cfenv = require("cfenv"),
	oCFVariables = cfenv.getAppEnv();


axios.interceptors.request.use(request => {
	console.log('Starting Request', request)
	return request
});

module.exports = {
	
	testEcho: (req, res) => {
    	try {
    		var oCFVariables = cfenv.getAppEnv(),
    			oUser = req.user,
    			oUserAttr = req.authInfo.userAttributes;
    		
    		//look for approver attribute, it contains either approver user id or group id of approvers
    		if(oUserAttr.hasOwnProperty("Approver") && oUserAttr.Approver.length>0){
    			oUser["approver"] = oUserAttr.Approver[0];
    		}else{
    			oUser["approver"] = oUser.id;
    		}
 
			res.status(200).send(oUser);
	    } catch (err) {
	        console.log(err);
	        res.status(500).send(err);
	    }
    }
};
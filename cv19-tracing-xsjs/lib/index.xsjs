var body = "";
body = JSON.stringify({
	"session": [{
		"UserInfo": $.session.securityContext
	}]
});

$.response.contentType = "application/json";
$.response.setBody(JSON.parse(body));
$.response.status = $.net.http.OK;
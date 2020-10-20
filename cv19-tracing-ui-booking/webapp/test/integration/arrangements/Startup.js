sap.ui.define([
  "sap/ui/test/Opa5"
], function(Opa5) {
  "use strict";

  return Opa5.extend("covid19.ui.booking.cv19-tracing-ui-booking.test.integration.arrangements.Startup", {

    iStartMyApp: function () {
      this.iStartMyUIComponent({
        componentConfig: {
          name: "covid19.ui.booking.cv19-tracing-ui-booking",
          async: true,
          manifest: true
        }
      });
    }

  });
});

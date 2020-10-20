sap.ui.define([
  "sap/ui/test/Opa5"
], function(Opa5) {
  "use strict";

  return Opa5.extend("cv19.tracing.area.booking.cv19-tracing-area-booking.test.integration.arrangements.Startup", {

    iStartMyApp: function () {
      this.iStartMyUIComponent({
        componentConfig: {
          name: "cv19.tracing.area.booking.cv19-tracing-area-booking",
          async: true,
          manifest: true
        }
      });
    }

  });
});

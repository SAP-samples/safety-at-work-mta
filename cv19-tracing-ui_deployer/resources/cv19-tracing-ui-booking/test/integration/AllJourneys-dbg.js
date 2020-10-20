sap.ui.define([
  "sap/ui/test/Opa5",
  "covid19/ui/booking/cv19-tracing-ui-booking/test/integration/arrangements/Startup",
  "covid19/ui/booking/cv19-tracing-ui-booking/test/integration/BasicJourney"
], function(Opa5, Startup) {
  "use strict";

  Opa5.extendConfig({
    arrangements: new Startup(),
    pollingInterval: 1
  });

});

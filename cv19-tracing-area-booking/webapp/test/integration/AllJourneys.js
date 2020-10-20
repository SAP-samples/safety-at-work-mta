sap.ui.define([
  "sap/ui/test/Opa5",
  "cv19/tracing/area/booking/cv19-tracing-area-booking/test/integration/arrangements/Startup",
  "cv19/tracing/area/booking/cv19-tracing-area-booking/test/integration/BasicJourney"
], function(Opa5, Startup) {
  "use strict";

  Opa5.extendConfig({
    arrangements: new Startup(),
    pollingInterval: 1
  });

});

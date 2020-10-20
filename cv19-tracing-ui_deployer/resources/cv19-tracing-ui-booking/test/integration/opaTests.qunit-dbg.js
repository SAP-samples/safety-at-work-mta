/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
  "use strict";

  sap.ui.require([
    "covid19/ui/booking/cv19-tracing-ui-booking/test/integration/AllJourneys"
  ], function() {
    QUnit.start();
  });
});

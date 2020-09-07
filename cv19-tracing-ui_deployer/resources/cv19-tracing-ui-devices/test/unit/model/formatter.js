sap.ui.define(["sap/m/Text","covid19/ui/devicesmanagement/cv19-tracing-ui-devices/model/formatter"],function(t,n){"use strict";QUnit.module("formatter - Currency value");function i(t,i,e){var u=n.currencyValue(i);t.strictEqual(u,e,"The rounding was correct")}QUnit.test("Should round down a 3 digit number",function(t){i.call(this,t,"3.123","3.12")});QUnit.test("Should round up a 3 digit number",function(t){i.call(this,t,"3.128","3.13")});QUnit.test("Should round a negative number",function(t){i.call(this,t,"-3","-3.00")});QUnit.test("Should round an empty string",function(t){i.call(this,t,"","")});QUnit.test("Should round a zero",function(t){i.call(this,t,"0","0.00")})});
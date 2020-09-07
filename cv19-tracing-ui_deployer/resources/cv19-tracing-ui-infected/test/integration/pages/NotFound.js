sap.ui.define(["sap/ui/test/Opa5"],function(e){"use strict";var t="page",o="NotFound",n="DetailObjectNotFound";e.createPageObjects({onTheNotFoundPage:{actions:{},assertions:{iShouldSeeTheNotFoundGeneralPage:function(t,o){return this.waitFor({controlType:"sap.m.MessagePage",viewName:o,success:function(){e.assert.ok(true,"Shows the message page")},errorMessage:"Did not reach the empty page"})},iShouldSeeTheNotFoundPage:function(){return this.iShouldSeeTheNotFoundGeneralPage(t,o)},iShouldSeeTheObjectNotFoundPage:function(){return this.iShouldSeeTheNotFoundGeneralPage(t,n)},theNotFoundPageShouldSayResourceNotFound:function(){return this.waitFor({id:t,viewName:o,success:function(t){e.assert.strictEqual(t.getTitle(),t.getModel("i18n").getProperty("notFoundTitle"),"The not found text is shown as title");e.assert.strictEqual(t.getText(),t.getModel("i18n").getProperty("notFoundText"),"The resource not found text is shown")},errorMessage:"Did not display the resource not found text"})},theNotFoundPageShouldSayObjectNotFound:function(){return this.waitFor({id:t,viewName:n,success:function(t){e.assert.strictEqual(t.getTitle(),t.getModel("i18n").getProperty("detailTitle"),"The object text is shown as title");e.assert.strictEqual(t.getText(),t.getModel("i18n").getProperty("noObjectFoundText"),"The object not found text is shown")},errorMessage:"Did not display the object not found text"})}}}})});
/*jshint expr: true */
"use strict";

import App from "../lib/App";

describe("App", function () {
    describe("Static API", () => {
        it("should provide static helpers", () => {
            App.should.itself.respondTo("instance");
            App.should.itself.respondTo("run");
            App.should.itself.respondTo("user");
            App.should.itself.respondTo("session");
            App.should.itself.respondTo("dispatchAction");
            App.should.itself.respondTo("logger");
            App.should.itself.respondTo("localize");
            App.should.itself.ownProperty("events");
        });

        it("should provide inner classes", () => {
            App.should.itself.respondTo("Components");
            App.should.itself.respondTo("Delegate");
        });
    });

    describe("when attempting to retrieve an instance before running", () => {
        it("should throw", () => {
            (() => App.instance()).should.throw(Error);
        });
    });

    describe("when running the application", () => {
        beforeEach(() => {
            App.run(new App.Components(), new App.Delegate());
        });

        afterEach(() => App.terminate());

        it("should return the app when asked for the instance.", () => {
            App.instance().should.be.an.instanceOf(App);
        });

        describe("when attempting to run the application again", () => {
            it("should throw", () => {
                (() => App.run(new App.Components(), new App.Delegate())).should.throw(Error);
            });
        });
    });
});

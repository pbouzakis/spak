/*jshint expr: true */
"use strict";

import App from "../lib/App";
import componentsStub from "./support/componentsStub";

describe("App", function () {
    describe("Static API", () => {
        it("should provide static helpers", () => {
            App.should.itself.respondTo("instance");
            App.should.itself.respondTo("run");
            App.should.itself.respondTo("terminate");
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
            this.componentList = componentsStub();
            this.user = { email: "good@email.com", id: "ABC" };
            this.session = { isSession: true, user: this.user };
            this.delegateHandlers = {
                provideSession: sinon.stub().returns(this.session),
                onBeforeBootstrapped: sinon.stub(),
                onBootstrapped: sinon.stub(),
                onReady: sinon.stub()
            };
            return App.run(new App.Components(...this.componentList), new App.Delegate(this.delegateHandlers));
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

        it("should message the app delegate that app is going to be bootstrapped", () => {
            this.delegateHandlers.onBeforeBootstrapped.should.have.been.called;
        });

        it("should bootstrap the components", () => {
            this.componentList.every((component) => component.bootstrap.calledWithMatch(
                (specs) => typeof specs.wire === "function" // Checking for a spec like object.
            )).should.be.true;
        });

        it("should message the app delegate that app has been bootstrapped", () => {
            this.delegateHandlers.provideSession.should.have.been.called;
        });

        it("should expose the correct session", () => {
            App.session().should.equal(this.session);
        });

        it("should expose the user", () => {
            App.user().should.equal(this.session.user);
        });

        it("should message the app delegate that app has been bootstrapped", () => {
            this.delegateHandlers.onBootstrapped.should.have.been.called;
        });

        it("should message the app delegate that app is ready for action!", () => {
            this.delegateHandlers.onReady.should.have.been.called;
        });
    });
});

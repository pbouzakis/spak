/*jshint expr: true */
import { App } from "..";
import defaultArgs from "../lib/defaultAppArgs";
import AppHooks from "../lib/AppHooks";

class SampleHooks extends AppHooks {
    constructor() {
        super();
        sinon.spy(this, "onAuthFoo");
        sinon.spy(this, "onLockerBar");
        sinon.spy(this, "onAppReady");
        sinon.spy(this, "onDispose");
    }
    onAuthFoo() {
    }
    onLockerBar() {
    }
    onAppReady() {
    }
    onDispose() {
    }
}
AppHooks.events("auth.foo", "locker.bar")(SampleHooks); // Mimic decorator usage.

describe("AppHooks", function () {
    beforeEach(() => {
        this.hooks = new SampleHooks();
        return App.runAsync(...defaultArgs).then(() => {
            sinon.spy(App.events, "on");
            sinon.spy(App.events, "once");
            sinon.spy(App.events, "off");
        });
    });

    describe("interface", () => {
        it("should implement AppHooks", () => {
            this.hooks.should.respondTo("subscribe");
            this.hooks.should.respondTo("subscribeTo");
            this.hooks.should.respondTo("dispose");
        });
    });

    describe("when asked to subscribe", () => {
        beforeEach(() => {
            this.hooks.subscribe();
        });

        it("should subscribe to two `App.events`", () => {
            App.events.on.should.have.been.calledTwice;
        });

        it("should listen to `App.events` for `auth.foo", () => {
            App.events.on.should.have.been.calledWith("auth.foo", sinon.match.func);
        });

        it("should listen to `App.events` for `locker.bar`", () => {
            App.events.on.should.have.been.calledWith("locker.bar", sinon.match.func);
        });

        it("should have called the `onAppReady` template method", () => {
            this.hooks.onAppReady.should.have.been.called;
        });

        describe("when events are published", () => {
            beforeEach(() => {
                App.events.publish("auth.foo", 1);
                App.events.publish("locker.bar", 2);
            });

            it("should have invoked `onAuthFoo`", () => {
                this.hooks.onAuthFoo.should.have.been.calledWith(1);
            });

            it("should have invoked `onLockerBar`", () => {
                this.hooks.onLockerBar.should.have.been.calledWith(2);
            });
        });

        describe("when asked to dispose and events are published", () => {
            beforeEach(() => {
                this.hooks.dispose();
                App.events.publish("auth.foo", 1);
                App.events.publish("locker.bar", 2);
            });

            it("should not have invoked `onAuthFoo`", () => {
                this.hooks.onAuthFoo.should.not.have.been.calledWith(1);
            });

            it("should have invoked `onLockerBar`", () => {
                this.hooks.onLockerBar.should.not.have.been.calledWith(2);
            });

            it("should have called the `onDispose` template method", () => {
                this.hooks.onDispose.should.have.been.calledWith(this.hooks.events);
            });
        });

        describe("when asked to dispose of just `foo`", () => {
            beforeEach(() => {
                this.hooks.dispose("auth.foo");
                App.events.publish("auth.foo", 1);
                App.events.publish("locker.bar", 2);
            });

            it("should not have invoked `onAuthFoo`", () => {
                this.hooks.onAuthFoo.should.not.have.been.calledWith(1);
            });

            it("should have invoked `onLockerBar`", () => {
                this.hooks.onLockerBar.should.have.been.calledWith(2);
            });

            it("should have called the `onDispose` template method", () => {
                this.hooks.onDispose.should.have.been.calledWith(sinon.match((events) => {
                    return events.should.eql(["auth.foo"]);
                }));
            });
        });
    });

    describe("when asked to subscribe when an app event is published", () => {
        beforeEach(() => {
            sinon.spy(this.hooks, "subscribe");
            this.hooks.subscribeTo("hooksReady");
        });

        it("should listen to `App.events` for `hooksReady`", () => {
            App.events.once.should.have.been.calledWith("hooksReady", sinon.match.func);
        });

        it("should NOT have called `subscribe`", () => {
            this.hooks.subscribe.should.not.have.been.called;
        });

        describe("when `hooksReady` is published", () => {
            beforeEach(() => {
                App.events.publish("hooksReady");
            });

            it("should have called `subscribe`", () => {
                this.hooks.subscribe.should.have.been.called;
            });
        });
    });

    afterEach(() => {
        App.events.on.restore();
        App.events.once.restore();
        App.events.off.restore();
        App.terminate();
    });
});

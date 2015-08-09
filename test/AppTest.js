/*jshint expr: true */
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
            this.didSomethingFromAction = sinon.stub();
            this.componentList = componentsStub(this.didSomethingFromAction);
            this.user = { email: "good@email.com", id: "ABC" };
            this.session = { isSession: true, user: this.user };
            this.logger = { log: () => {} };
            this.uncaughtErrors = { listen: sinon.stub() };
            this.localizedPath = "localizedPath";
            this.delegateHandlers = {
                startup: sinon.stub(),
                provideSession: sinon.stub().returns(this.session),
                provideLogger: sinon.stub().returns({ container: () => this.logger }),
                provideLocalize: sinon.stub().returns({ localize: () => this.localizedPath }),
                provideUncaughtErrors: sinon.stub().returns(this.uncaughtErrors),
                onBeforeBootstrapped: sinon.stub(),
                onBootstrapped: sinon.stub()
            };
        });

        afterEach(() => App.terminate());

        describe("and an error is thrown:", () => {
            ["startup", "onBootstrapped"].forEach((hook) => {
                describe(`${hook}`, () => {
                    beforeEach((done) => {
                        this.delegateHandlers.onReady = sinon.spy(done);
                        this.delegateHandlers.handleRunError = sinon.spy(() => done());
                        this.error = new Error("Oops");
                        this.delegateHandlers[hook] = () => { throw this.error; };
                        App.run(new App.Components(...this.componentList), new App.Delegate(this.delegateHandlers));
                    });

                    it("should call the onRunError handler", () => {
                        this.delegateHandlers.handleRunError.should.have.been.calledWith(this.error);
                    });
                });
            });
        });

        describe("successfully", () => {
            beforeEach((done) => {
                this.delegateHandlers.onReady = sinon.spy(done);
                this.delegateHandlers.handleRunError = sinon.spy(done);
                App.run(new App.Components(...this.componentList), new App.Delegate(this.delegateHandlers));
            });

            it("should return the app when asked for the instance.", () => {
                App.instance().should.be.an.instanceOf(App);
            });

            describe("when attempting to run the application again", () => {
                beforeEach((done) => {
                    this.delegateHandlers = { handleRunError: sinon.spy(() => done()), onReady: done };
                    App.run(new App.Components(), new App.Delegate(this.delegateHandlers));
                });
                it("should call `onRunError`", () => {
                    this.delegateHandlers.handleRunError.should.have.been.called;
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

            it("should message the app delegate to provide session", () => {
                this.delegateHandlers.provideSession.should.have.been.called;
            });

            it("should message the app delegate to provide logging", () => {
                this.delegateHandlers.provideLogger.should.have.been.called;
            });

            it("should message the app delegate to provide localization", () => {
                this.delegateHandlers.provideLocalize.should.have.been.called;
            });

            it("should message the app delegate to provide uncaught errors", () => {
                this.delegateHandlers.provideUncaughtErrors.should.have.been.called;
            });

            it("should expose the correct session", () => {
                App.session().should.equal(this.session);
            });

            it("should support logging", () => {
                App.logger("ns").should.equal(this.logger);
            });

            it("should support localization", () => {
                App.localize("some/path").should.equal(this.localizedPath);
            });

            it("should expose the user", () => {
                App.user().should.equal(this.session.user);
            });

            it("should ask uncaught errors to listen", () => {
                this.uncaughtErrors.listen.should.have.been.calledWith(sinon.match.func);
            });

            it("should message the app delegate that app has been bootstrapped", () => {
                this.delegateHandlers.onBootstrapped.should.have.been.called;
            });

            it("should message the app delegate that app is ready for action!", () => {
                this.delegateHandlers.onReady.should.have.been.called;
            });

            it("should expose a pubsub api on events", () => {
                App.events.should.respondTo("on");
                App.events.should.respondTo("off");
                App.events.should.respondTo("once");
                App.events.should.respondTo("publish");
            });

            // Use instance method rather than  static to get promise returned.
            describe("when an action is triggered that was registered", () => {
                describe("using it's name", () => {
                    beforeEach(() => {
                        this.opts = { size: 100 };
                        // Same as App.dispatchAction(...args)
                        return App.instance().dispatchAction("doSomething", this.opts);
                    });

                    it("should exec the action", () => {
                        this.didSomethingFromAction.should.have.been.calledWith(this.opts);
                    });
                });

                describe("using the name provided in the spec.action call", () => {
                    beforeEach(() => {
                        this.opts = { size: 200 };
                        return App.instance().dispatchAction("doOtherThing", this.opts);
                    });

                    it("should exec the action", () => {
                        this.didSomethingFromAction.should.have.been.calledWith(this.opts);
                    });
                });

                describe("and dispatched with multiple arguments", () => {
                    beforeEach(() => {
                        this.opts = { size: 100 };
                        this.color = "blue";
                        return App.instance().dispatchAction("doSomething", this.opts, this.color);
                    });

                    it("should exec the action", () => {
                        this.didSomethingFromAction.should.have.been.calledWith(this.opts, this.color);
                    });
                });
            });
        });
    });
});

import AppSpecfications from "../lib/AppSpecifications";

var dummyAction = {
    componentName: "dummyAction",
    exec() {}
};
var dummyAction2 = {
    componentName: "dummyAction2",
    exec() {}
};
var dummyHook = {
    subscribeTo() {}
};
var dummyHook2 = {
    subscribeTo() {}
};
var dummyActionFn = () => {};
var factory1 = () => ({ bar: "yes please" });

describe("AppSpecfications", function () {
    beforeEach(() => {
        this.specs = new AppSpecfications();
    });

    it("implements Specifications", () => {
        this.specs.should.have.property("register");
        this.specs.should.respondTo("build");
        this.specs.should.respondTo("clear");
    });

    it("implements LookupableRegistry", () => {
        this.specs.should.respondTo("lookup");
        this.specs.should.respondTo("lookupWhere");
        this.specs.should.respondTo("has");
        this.specs.should.respondTo("all");
    });

    describe("registering", () => {
        beforeEach(() => {
            // Component A's registration
            this.regForCompA = {
                name: "@app/component-a",
                registration: {
                    $actions: [dummyAction, ["dummyAction3", dummyActionFn]],
                    $hooks: [dummyHook, dummyHook2],
                    fooService: factory1()
                }
            };
            this.regForCompB = {
                name: "@app/component-b",
                registration: {
                    $actions: [dummyAction2],
                    barService: factory1()
                }
            };

            this.specs.register(this.regForCompA);
            this.specs.register(this.regForCompB);
        });

        it("should contain 2 registrations", () => {
            this.specs.all().length.should.equal(2);
        });

        it("can lookup a registration", () => {
            this.specs.lookup("@app/component-a").should.equal(this.regForCompA);
        });

        it("can check if barServices has been registered", () => {
            this.specs.hasRegistered("barService").should.be.true;
        });

        it("should contain the right amount of actions", () => {
            this.specs.actions.length.should.equal(3);
        });

        it("should contain actual actions", () => {
            this.specs.actions.indexOf(dummyAction2).should.be.greaterThan(-1);
        });

        it("should contain the right amount of hooks", () => {
            this.specs.hooks.length.should.equal(2);
        });

        it("should contain actual hooks", () => {
            this.specs.hooks.indexOf(dummyHook).should.be.greaterThan(-1);
        });

        describe("when built using the default builder", () => {
            beforeEach(() => {
                this.container = this.specs.build();
            });

            it("should contain the right amount of actions", () => {
                Object.keys(this.container.$actions).length.should.equal(3);
            });

            it("should contain actual actions", () => {
                this.container.$actions.dummyAction2.should.equal(dummyAction2);
            });

            it("should contain the right amount of hooks", () => {
                this.container.$hooks.length.should.equal(2);
            });

            it("should contain actual hooks", () => {
                this.container.$hooks.indexOf(dummyHook).should.be.greaterThan(-1);
            });

            it("should have the fooService", () => {
                this.container.fooService.should.equal(this.regForCompA.registration.fooService);
            });

            it("should have the barService", () => {
                this.container.barService.should.equal(this.regForCompB.registration.barService);
            });
        });
    });
});

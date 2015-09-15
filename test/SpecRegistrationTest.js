/*jshint expr: true */
import _ from "underscore";
import { SpecRegistration, SpecRef, CondSpecs,
         SpecFromClass, SpecFromFn, SpecFromValue,
         ConfigMod, SpecWithConfigMod,
         ActionSpec, HooksSpec } from "../lib/di";

// Begin sample modules
class Foo {
    static get inject() {
        return ["bar", "colors"];
    }
}
class FooNoArgs {
    static get inject() {
        return [];
    }
}
class FooNoInject {
}
function createBar(colors) {
    return { colors };
}
createBar.inject = ["colors"];
var colors = ["red", "green", "blue"];
class AddOrder {
    static get inject() {
        return ["theRepo"];
    }
    get componentName() {
        return "addOrder";
    }
}
class RemoveOrder {
    static get inject() {
        return [];
    }
    get componentName() {
        return "RemoveOrder";
    }
}
class MyHooks {
    static get inject() {
        return ["theRepo"];
    }
}
class MyOtherHooks {
    static get inject() {
        return ["AddOrder", "theRepo"];
    }
}
// End sample modules

describe("SpecRegistration", function () {
    describe("when created", () => {
        beforeEach(() => {
            this.specs = new SpecRegistration();
        });

        it("should implement SpecRegistration", () => {
            this.specs.should.respondTo("writeTo");
        });
    });

    describe("Creating a registration", () => {
        describe("with the 3 base spec types", () => {
            beforeEach(() => {
                this.specs = new SpecRegistration(
                    new SpecFromClass("foo", Foo),
                    new SpecFromFn("bar", createBar),
                    new SpecFromValue("colors", colors),
                    new ConfigMod((cfg) => cfg.custom = true),
                    new SpecWithConfigMod(
                        new SpecFromClass("foo2", Foo),
                        (cfg) => cfg.hasChanged = true
                    )
                );
                this.config = {};
                this.specs.writeTo(this.config);
            });

            it("should create a config with `foo` spec'd from class Foo", () => {
                this.config.should.have.property("foo");
                this.config.foo.should.eql({
                    create: {
                        module: Foo,
                        args: [{ $ref: "bar" }, { $ref: "colors" }],
                        isConstructor: true
                    }
                });
            });

            it("should create a config with `bar` spec'd from fn createBar", () => {
                this.config.should.have.property("bar");
                this.config.bar.should.eql({
                    create: {
                        module: createBar,
                        args: [{ $ref: "colors" }],
                        isConstructor: false
                    }
                });
            });

            it("should create a config with `colors` spec'd from colors array", () => {
                this.config.should.have.property("colors");
                this.config.colors.should.eql({
                    literal: colors
                });
            });

            it("should create a config with `custom` property from `ConfigMod`", () => {
                this.config.should.have.property("custom");
                this.config.custom.should.be.true;
            });

            it("should create a config with `foo2` spec'd from class Foo by `SpecWithConfig`", () => {
                this.config.should.have.property("foo2");
                this.config.foo2.should.eql({
                    create: {
                        module: Foo,
                        args: [{ $ref: "bar" }, { $ref: "colors" }],
                        isConstructor: true
                    },
                    hasChanged: true
                });
            });
        });

        describe("with specs that override the `args`", () => {
            beforeEach(() => {
                this.colors = ["red"];
                this.specs = new SpecRegistration(
                    new SpecFromValue("newColors", ["orange", "black"]),

                    new SpecFromClass("foo", Foo)
                        .setArg(1, new SpecRef("newColors")),

                    new SpecFromClass("baz", Foo)
                        .setFirstArg("one")
                        .setSecondArg("two")
                        .setThirdArg("three")
                        .setFourthArg("four"),

                    new SpecFromFn("bar", createBar)
                        .setAllArgs(new SpecRef("foo"), new SpecRef("baz"), true)
                );
                this.config = {};
                this.specs.writeTo(this.config);
            });

            it("should create a config with `foo` spec'd from class Foo", () => {
                this.config.should.have.property("foo");
                this.config.foo.should.eql({
                    create: {
                        module: Foo,
                        args: [{ $ref: "bar" }, { $ref: "newColors" }],
                        isConstructor: true
                    }
                });
            });

            it("should create a config with `baz` spec'd from class Foo", () => {
                this.config.should.have.property("baz");
                this.config.baz.should.eql({
                    create: {
                        module: Foo,
                        args: ["one", "two", "three", "four"],
                        isConstructor: true
                    }
                });
            });

            it("should create a config with `bar` spec'd from fn createBar", () => {
                this.config.should.have.property("bar");
                this.config.bar.should.eql({
                    create: {
                        module: createBar,
                        args: [{ $ref: "foo" }, { $ref: "baz" }, true],
                        isConstructor: false
                    }
                });
            });
        });

        describe("with the classes with no args", () => {
            beforeEach(() => {
                this.specs = new SpecRegistration(
                    new SpecFromClass("foo", FooNoArgs),
                    new SpecFromClass("bar", FooNoInject)
                );
                this.config = {};
                this.specs.writeTo(this.config);
            });

            it("should create a config with `foo` spec'd from class FooNoArgs", () => {
                this.config.should.have.property("foo");
                this.config.foo.should.eql({
                    create: {
                        module: FooNoArgs,
                        args: [],
                        isConstructor: true
                    }
                });
            });

            it("should create a config with `bar` spec'd from class FooNoInject", () => {
                this.config.should.have.property("bar");
                this.config.bar.should.eql({
                    create: {
                        module: FooNoInject,
                        args: [],
                        isConstructor: true
                    }
                });
            });
        });

        describe("with conditional specs", () => {
            var createOtherBar = () => { return {}; };
            var otherColors = ["orange", "black"];

            [true, false, () => true].forEach((flag) => {
                var isCondIsTrue = Boolean(typeof flag === "function" ? flag() : flag);
                describe("are set to " + isCondIsTrue, () => {
                    beforeEach(() => {
                        this.specs = new SpecRegistration(
                            new SpecFromClass("foo", Foo),
                            new CondSpecs(flag)
                                .whenTrue(
                                    new SpecFromFn("bar", createBar),
                                    new SpecFromValue("colors", colors)
                                )
                                .whenFalse(
                                    new SpecFromFn("bar", createOtherBar),
                                    new SpecFromValue("colors", otherColors),
                                    new SpecFromValue("size", 100)
                                )
                        );
                        this.config = {};
                        this.specs.writeTo(this.config);
                    });

                    it("should create a config with `foo` spec'd from class Foo", () => {
                        this.config.should.have.property("foo");
                        this.config.foo.should.eql({
                            create: {
                                module: Foo,
                                args: [{ $ref: "bar" }, { $ref: "colors" }],
                                isConstructor: true
                            }
                        });
                    });

                    if (isCondIsTrue) {
                        it("should create a config with `bar` spec'd from fn createBar", () => {
                            this.config.should.have.property("bar");
                            this.config.bar.should.eql({
                                create: {
                                    module: createBar,
                                    args: [{ $ref: "colors" }],
                                    isConstructor: false
                                }
                            });
                        });

                        it("should create a config with `colors` spec'd from colors array", () => {
                            this.config.should.have.property("colors");
                            this.config.colors.should.eql({
                                literal: colors
                            });
                        });

                    } else {
                        it("should create a config with `bar` spec'd from fn createOtherBar", () => {
                            this.config.should.have.property("bar");
                            this.config.bar.should.eql({
                                create: {
                                    module: createOtherBar,
                                    args: [],
                                    isConstructor: false
                                }
                            });
                        });

                        it("should create a config with `colors` spec'd from otherColors array", () => {
                            this.config.should.have.property("colors");
                            this.config.colors.should.eql({
                                literal: otherColors
                            });
                        });

                        it("should create a config with `size` spec'd from literal 5 number", () => {
                            this.config.should.have.property("size");
                            this.config.size.should.eql({
                                literal: 100
                            });
                        });
                    }
                });
            });
        });

        describe("with an action spec", () => {
            beforeEach(() => {
                this.specs = new SpecRegistration(
                    new ActionSpec("PlaceOrder", AddOrder),
                    new ActionSpec(RemoveOrder)
                );
                this.config = {};
                this.specs.writeTo(this.config);
            });

            it("should create a config with `placeOrder` spec'd from the class AddOrder", () => {
                this.config.should.have.property("placeOrder");
                this.config.placeOrder.should.eql({
                    create: {
                        module: AddOrder,
                        args: [{ $ref: "theRepo" }],
                        isConstructor: true
                    },
                    action: ["placeOrder"]
                });
            });

            it("should create a config with `removeOrder` spec'd from the class RemoveOrder", () => {
                this.config.should.have.property("removeOrder");
                this.config.removeOrder.should.eql({
                    create: {
                        module: RemoveOrder,
                        args: [],
                        isConstructor: true
                    },
                    action: ["removeOrder"]
                });
            });
        });

        describe("with a hooks spec", () => {
            beforeEach(() => {
                this.specs = new SpecRegistration(
                    new HooksSpec(MyHooks),
                    new HooksSpec(MyOtherHooks)
                );
                this.config = {};
                this.specs.writeTo(this.config);
            });

            it("should create a config with hooks spec'd from the class MyHooks", () => {
                var specKey = this.specs._specs[0].specKey;
                this.config.should.have.property(specKey);
                this.config[specKey].should.eql({
                    create: {
                        module: MyHooks,
                        args: [{ $ref: "theRepo" }],
                        isConstructor: true
                    },
                    init: { subscribeTo: "app.ready" }
                });
            });

            it("should create a config with hooks spec'd from the class MyOtherHooks", () => {
                var specKey = this.specs._specs[1].specKey;
                this.config.should.have.property(specKey);
                this.config[specKey].should.eql({
                    create: {
                        module: MyOtherHooks,
                        args: [{ $ref: "AddOrder" }, { $ref: "theRepo" }],
                        isConstructor: true
                    },
                    init: { subscribeTo: "app.ready" }
                });
            });
        });

        describe("when specs have multiple roles", () => {
            beforeEach(() => {
                this.specs = new SpecRegistration(
                    new SpecFromClass(["Foo", "OrderService"], Foo),
                    new SpecFromValue(["Colors", "PickerOptions"], colors),
                    new ActionSpec(["PlaceOrder", "AddOrder"], AddOrder)
                );
                this.config = {};
                this.specs.writeTo(this.config);
            });

            it("should create a config with `foo` spec'd from the class Foo", () => {
                this.config.should.have.property("foo");
                this.config.foo.should.eql({
                    create: {
                        module: Foo,
                        args: [{ $ref: "bar" }, { $ref: "colors" }],
                        isConstructor: true
                    }
                });
            });

            it("should create a config with `orderService` aliased from `foo`", () => {
                this.config.should.have.property("orderService");
                this.config.orderService.should.eql({
                    create: {
                        module: _.identity,
                        args: [{ $ref: "foo" }],
                        isConstructor: false
                    }
                });
            });

            it("should create a config with `colors` spec'd from colors array", () => {
                this.config.should.have.property("colors");
                this.config.colors.should.eql({
                    literal: colors
                });
            });

            it("should create a config with `pickerOptions` aliased from `colors`", () => {
                this.config.should.have.property("pickerOptions");
                this.config.pickerOptions.should.eql({
                    create: {
                        module: _.identity,
                        args: [{ $ref: "colors" }],
                        isConstructor: false
                    }
                });
            });

            it("should create a config with `placeOrder` spec'd from the class PlaceOrder", () => {
                this.config.should.have.property("placeOrder");
                this.config.placeOrder.should.eql({
                    create: {
                        module: AddOrder,
                        args: [{ $ref: "theRepo" }],
                        isConstructor: true
                    },
                    action: ["placeOrder", "addOrder"]
                });
            });

            it("should create a config with `addOrder` aliased from `placeOrder`", () => {
                this.config.should.have.property("addOrder");
                this.config.addOrder.should.eql({
                    create: {
                        module: _.identity,
                        args: [{ $ref: "placeOrder" }],
                        isConstructor: false
                    }
                });
            });
        });
    });
});

/*jshint expr: true */
import Registry from "../lib/Registry";

describe("Registry", function () {
    beforeEach(() => {
        this.registry = new Registry("mappers");
    });

    it("implements LookupRegistry", () => {
        this.registry.should.have.property("name");
        this.registry.should.respondTo("lookup");
        this.registry.should.respondTo("lookupWhere");
        this.registry.should.respondTo("has");
        this.registry.should.respondTo("all");
        this.registry.should.respondTo("clear");
    });

    it("should have the correct name", () => {
        this.registry.name.should.equal("mappers");
    });

    describe("when objects are registered", () => {
        beforeEach(() => {
            var createItem = (name, value) => {
                return {
                    name,
                    value,
                    isMatchFor: (criteria) => criteria.value === value,
                    onRegistryRemoval: sinon.stub()
                };
            };
            this.items = {
                foo: createItem("foo", 1),
                bar: createItem("bar", 2),
                baz: createItem("baz", 3),
            };
            Object.keys(this.items).forEach((key) => {
                this.registry.register(this.items[key]);
            });
        });

        it("should 3 items in the registry", () => {
            this.registry.all().length.should.equal(3);
        });

        it("should be able to lookup by name", () => {
            Object.keys(this.items).every((key) => {
                var item = this.items[key];
                return this.registry.lookup(key).should.equal(item);
            }).should.be.true;
        });

        it("should be able to lookup by matching", () => {
            Object.keys(this.items).every((key) => {
                var item = this.items[key];
                return this.registry.lookupWhere({ value: item.value }).should.equal(item);
            }).should.be.true;
        });

        it("should be able to lookup with custom lookup", () => {
            Object.keys(this.items).every((key) => {
                var item = this.items[key];
                return this.registry.lookupWhere((candidate) => candidate.name === item.name).should.equal(item);
            }).should.be.true;
        });

        describe("when cleared", () => {
            beforeEach(() => {
                this.registry.clear();
            });

            it("should remove all items from registry", () => {
                this.registry.all().length.should.equal(0);
            });

            it("should call the `onRegistryRemoval` hook", () => {
                Object.keys(this.items).every((key) => {
                    var item = this.items[key];
                    return item.onRegistryRemoval.should.have.been.called;
                }).should.be.true;
            });
        });
    });

    describe("when prepopulated with registered items", () => {
        beforeEach(() => {
            this.registry = new Registry("mappers",
                { name: "foo" },
                { name : "baz" }
            );
        });

        it("should contain 2 items", () => {
            this.registry.all().length.should.equal(2);
        });

        it("should be able to lookup them up", () => {
            this.registry.lookup("foo").should.eql({ name: "foo" });
            this.registry.lookup("baz").should.eql({ name: "baz" });
        });
    });
});

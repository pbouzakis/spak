/*jshint expr: true */
import AppConfig from "../lib/AppConfig";

function hasAllValues(config, values) {
    return Object.keys(values).every((key) => {
        return config[key].should.equal(values[key]);
    });
}

describe("AppConfig", function () {
    beforeEach(() => {
        this.values1 = {
            foo: "foo",
            isEnabled: true,
            size: 100
        };
    });

    describe("When creating a simple config", () => {
        beforeEach(() => {
            this.config = new AppConfig(this.values1);
        });

        it("should expose all values in config", () => {
            hasAllValues(this.config, this.values1).should.equal.true;
        });

        describe("when merging new values", () => {
            beforeEach(() => {
                this.expectedValues = {
                    foo: "foo",
                    size: 300,
                    isEnabled: false,
                    message: "Hello"
                };
                this.config.merge({
                    size: 300,
                    isEnabled: false,
                    message: "Hello"
                });
            });

            it("should merge the new values", () => {
                it("should expose all values in config", () => {
                    hasAllValues(this.config, this.expectedValues).should.equal.true;
                });
            });
        });

        describe("when providing defaults", () => {
            beforeEach(() => {
                this.expectedValues = {
                    foo: "foo",
                    size: 100,
                    isEnabled: true,
                    message: "Hello"
                };
                this.config.defaults({
                    size: 200,
                    isEnabled: false,
                    message: "Hello"
                });
            });

            it("should merge the new values", () => {
                it("should expose all values in config", () => {
                    hasAllValues(this.config, this.expectedValues).should.equal.true;
                });
            });
        });
    });

    describe("When creating a config from multiple value objects", () => {
        beforeEach(() => {
            this.values2 = {
                foo: "baz",
                size: 200,
                title: "Very cool title"
            };
            this.expectedValues = {
                foo: "baz",
                isEnabled: true,
                size: 200,
                title: "Very cool title"
            };
            this.config = new AppConfig(this.values1, this.values2);
        });

        it("should expose all values in config", () => {
            hasAllValues(this.config, this.expectedValues).should.equal.true;
        });
    });
});

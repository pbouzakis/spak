/*jshint expr: true */
"use strict";

import ComponentNameSetter from "../../../lib/plugins/browserify-transforms/ComponentNameSetter";

describe("ComponentNameSetter:", function () {
    beforeEach(() => {
        this.writer = {
            filename: "xxxx.js",
            appendToDefaultExport: sinon.stub()
        };
        this.annotator = new ComponentNameSetter(this.writer);
    });

    it("implements transformer", () => {
        this.annotator.should.respondTo("write");
    });

    describe("when the filename matches a standard UIComponent filename", () => {
        beforeEach(() => {
            this.writer.file = "node_modules/@app/foo/lib/ui/VeryAwesomeUI.js";
            this.writer.filename = "VeryAwesomeUI.js";
        });

        describe("and when the file contains an es default export", () => {
            beforeEach(() => {
                this.writer.body = "\nexport default class Foo {\n\n}\n";
                this.annotator.write();
            });

            it("should add a component name property to the module's prototype", () => {
                this.writer.appendToDefaultExport.should.have.been.calledWithMatch(
                    "prototype.componentName = \"veryAwesome\""
                );
            });
        });

        describe("and when the file contains an node default export", () => {
            beforeEach(() => {
                this.writer.body = "\nmodule.exports = function Foo (){\n\n}\n";
                this.annotator.write();
            });

            it("should add a component name property to the module's prototype", () => {
                this.writer.appendToDefaultExport.should.have.been.calledWithMatch(
                    "prototype.componentName = \"veryAwesome\""
                );
            });
        });

        describe("and when the file DOES NOT contain a default export", () => {
            beforeEach(() => {
                this.writer.body = "\nexport class Foo {\n\n}\nexport class Foo {\n\n}\n";
                this.annotator.write();
            });

            it("should add a component name property to the module's prototype", () => {
                this.writer.appendToDefaultExport.should.not.have.been.calledWithMatch(
                    "prototype.componentName = \"veryAwesome\""
                );
            });
        });
    });

    describe("when the file is located inside an actions folder", () => {
        beforeEach(() => {
            this.writer.file = "node_modules/@app/foo/lib/actions/AddItem.js";
            this.writer.filename = "AddItem.js";
            this.writer.body = "\nexport default class AddItem {\n\n}\n";
            this.annotator.write();
        });

        it("should add a component name property to the module's prototype", () => {
            this.writer.appendToDefaultExport.should.have.been.calledWithMatch(
                "prototype.componentName = \"addItem\""
            );
        });
    });

    describe("when the filename does not find a standard component", () => {
        it("should not add any prototype property", () => {
            this.annotator.write();
            this.writer.appendToDefaultExport.should.not.have.been.called;
        });
    });
});

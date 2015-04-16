/*jshint expr: true */
"use strict";

import ViewUINameSetter from "../../../lib/plugins/browserify-transforms/UIComponentNameSetter";

describe("UIComponentNameSetter:", () => {
    beforeEach(() => {
        this.writer = {
            filename: "xxxx.js",
            appendToDefaultExport: sinon.stub()
        };
        this.annotator = new ViewUINameSetter(this.writer);
    });

    it("implements transformer", () => {
        this.annotator.should.respondTo("write");
    });

    describe("when the filename matches a standard ViewUI filename", () => {
        beforeEach(() => {
            this.writer.filename = "VeryAwesomeUI.js";
            this.annotator.write();
        });

        it ("should add a component name property to the module's prototype", () => {
            this.writer.appendToDefaultExport.should.have.been.calledWithMatch("prototype.componentName = \"veryAwesome\"");
        });
    });

    describe("when the filename does not match a standard ViewUI filename", () => {
        it ("should not add any prototype property", () => {
            this.annotator.write();
            this.writer.appendToDefaultExport.should.not.have.been.called;
        });
    });
});

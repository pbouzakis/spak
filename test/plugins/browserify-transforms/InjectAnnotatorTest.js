"use strict";

import fs from "fs";
import Injector from "../../../lib/plugins/browserify-transforms/InjectAnnotator";

var getModuleBody = (nameOfFile) => fs.readFileSync(`${__dirname}/samples/${nameOfFile}.js`, "utf8");
var validModules = ["node-module-export", "es-module-export", 
                    "node-module-export-w-opts", "es-module-export-w-opts", "es-module-export-deconstruction-w-opts",
                    "node-multiple-export", "es-multiple-export"];

var noDepsModules = ["node-no-default-export", "es-no-default-export"];

describe("InjectAnnotator:", () => {
    beforeEach(() => {
        this.writer = {
            addAnnotation: sinon.stub(),
            appendToDefaultExport: sinon.stub(),
            appendToBody: sinon.stub()
        };
        this.injector = new Injector(this.writer);
    });

    it("implements annotable", () => {
        this.injector.should.respondTo("annotate");
    });

    // Test injector w/ valid sample modules.
    validModules.forEach((moduleName) => {
        describe(`with ${moduleName}:`, () => {
            beforeEach(() => {
                var body = getModuleBody(moduleName);
                this.injector.annotate(body);
                this.expectedDeps = ["foo", "bar", "baz"];

                if (moduleName.match(/w-opts$/)) {
                    this.expectedDeps.push("beepOpt", "boopOpt");
                }
            });

            it("should add an annotation", () => {
                this.writer.addAnnotation.should.have.been.calledWith("inject", this.expectedDeps);
            });

            it("should auto import a runtime inject annotator", () => {
                this.writer.appendToBody.should.have.been.calledWithMatch("import { inject }");
            });

            it("should add an inject static property", () => {
                var deps = JSON.stringify(this.expectedDeps);
                this.writer.appendToDefaultExport.should.have.been.calledWith(`inject = ${deps}`);
            });
        });
    });

    noDepsModules.forEach((moduleName) => {
        describe(`with ${moduleName}:`, () => {
            beforeEach(() => {
                var body = getModuleBody(moduleName);
                this.injector.annotate(body);
            });

            it("should add an annotation", () => {
                this.writer.addAnnotation.should.not.have.been.calledWith("inject", this.expectedDeps);
            });

            it("should auto import a runtime inject annotator", () => {
                this.writer.appendToBody.should.not.have.been.calledWithMatch("import { inject }");
            });

            it("should add an inject static property", () => {
                var deps = JSON.stringify(this.expectedDeps);
                this.writer.appendToDefaultExport.should.not.have.been.calledWith(`inject = ${deps}`);
            });
        });
    });
});

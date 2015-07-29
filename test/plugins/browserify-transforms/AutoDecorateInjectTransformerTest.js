/*jshint expr: true */
"use strict";

import fs from "fs";
import InjectTransformer from "../../../lib/plugins/browserify-transforms/AutoDecorateInjectTransformer";

var getModuleBody = (nameOfFile) => fs.readFileSync(`${__dirname}/samples/${nameOfFile}.js`, "utf8");
var validModules = ["node-module-export", "es-module-export", "es-class-export",
                    "node-module-export-w-opts", "es-module-export-w-opts", "es-class-export-w-opts",
                    "es-module-export-deconstruction-w-opts", "es-class-export-deconstruction-w-opts",
                    "node-multiple-export", "es-multiple-export"];

var noDepsModules = ["node-no-default-export", "es-no-default-export"];

describe("AutoDecorateInject:", function () {
    beforeEach(() => {
        this.writer = {
            decorateExport: sinon.stub(),
            appendToDefaultExport: sinon.stub(),
            appendToBody: sinon.stub()
        };
        this.transformer = new InjectTransformer(this.writer);
    });

    it("implements transformer", () => {
        this.transformer.should.respondTo("write");
    });

    // Test injector w/ valid sample modules.
    validModules.forEach((moduleName) => {
        describe(`with ${moduleName}:`, () => {
            beforeEach(() => {
                var body = getModuleBody(moduleName);
                this.transformer.write(body);
                this.expectedDeps = ["\"foo\"", "\"bar\"", "\"baz\""];

                if (moduleName.match(/w-opts$/)) {
                    this.expectedDeps.push("\"beepOpt\"", "\"boopOpt\"");
                }
            });

            it("should add a decorator", () => {
                this.writer.decorateExport.should.have.been.calledWith("inject", this.expectedDeps);
            });

            it("should auto import the inject decorator", () => {
                this.writer.appendToBody.should.have.been.calledWithMatch("import { inject }");
            });
        });
    });

    noDepsModules.forEach((moduleName) => {
        describe(`with ${moduleName}:`, () => {
            beforeEach(() => {
                var body = getModuleBody(moduleName);
                this.transformer.write(body);
            });

            it("should add a decorator", () => {
                this.writer.decorateExport.should.not.have.been.calledWith("inject", this.expectedDeps);
            });

            it("should auto import the inject decorator", () => {
                this.writer.appendToBody.should.not.have.been.calledWithMatch("import { inject }");
            });
        });
    });
});

/*jshint expr: true */
"use strict";

import fs from "fs";
import TransformWriter from "../../../lib/plugins/browserify-transforms/TransformWriter";
var DEFAULT_EXPORT_EXPR = TransformWriter.DEFAULT_EXPORT_EXPR;

var getModuleBody = (nameOfFile) => fs.readFileSync(`${__dirname}/samples/${nameOfFile}.js`, "utf8");

describe("TransformWriter:", () => {
    beforeEach(() => {
        var body = getModuleBody("es-module-export");
        this.writer = new TransformWriter("/path/to/my/module/fooBaz.js", body);
    });

    it("implements Writable", () => {
        this.writer.should.respondTo("decorateExport");
        this.writer.should.respondTo("appendToDefaultExport");
        this.writer.should.respondTo("appendToBody");
        this.writer.should.have.property("filename");
        this.writer.should.have.property("body");
    });

    it ("should have the write filename", () => {
        this.writer.filename.should.equal("fooBaz.js");
    });

    describe("when adding a decorator", () => {
        beforeEach(() => {
            this.writer.decorateExport("foo", ["awesome", true]);
            this.firstExpectedAnnotation = ` = (foo("awesome", true)(module.exports)) || ${DEFAULT_EXPORT_EXPR};`;
        });

        it ("should appear in the body", () => {
            this.writer.body.should.have.string(DEFAULT_EXPORT_EXPR + this.firstExpectedAnnotation);
        });

        describe("and when adding a second decorator", () => {
            beforeEach(() => {
                this.writer.decorateExport("baz", []);
                this.secondExpectedAnnotation = ` = (baz()(module.exports)) || ${DEFAULT_EXPORT_EXPR};`;
            });

            it ("should have the new content in the body", () => {
                this.writer.body.should.have.string(DEFAULT_EXPORT_EXPR + this.secondExpectedAnnotation);
            });

            it ("should still have the first content appended in the body", () => {
                this.writer.body.should.have.string(DEFAULT_EXPORT_EXPR + this.firstExpectedAnnotation);
            });
        });
    });

    describe("when appending a property on the default export of the file", () => {
        beforeEach(() => {
            this.writer.appendToDefaultExport("isEnabled = true");
            this.firstExpectedPropSet = ".isEnabled = true;";
        });

        it ("should appear in the body", () => {
            this.writer.body.should.have.string(DEFAULT_EXPORT_EXPR + this.firstExpectedPropSet);
        });

        describe("and when adding a second property on the export", () => {
            beforeEach(() => {
                this.writer.appendToDefaultExport("prototype.anotherValue = { size: \"large\" }");
                this.secondExpectedPropSet = ".prototype.anotherValue = { size: \"large\" };";
            });

            it ("should have the new content in the body", () => {
                this.writer.body.should.have.string(DEFAULT_EXPORT_EXPR + this.secondExpectedPropSet);
            });

            it ("should still have the first content appended in the body", () => {
                this.writer.body.should.have.string(DEFAULT_EXPORT_EXPR + this.firstExpectedPropSet);
            });
        });
    });

    describe("when appending content to the body", () => {
        beforeEach(() => {
            this.firstContentToAppend = "import helper from \"./helper\";";
            this.writer.appendToBody(this.firstContentToAppend);
        });

        it ("should have the content in the body", () => {
            this.writer.body.should.have.string(this.firstContentToAppend);
        });

        describe("and when appending again", () => {
            beforeEach(() => {
                this.secondContentToAppend = "import util from \"./import\";";
                this.writer.appendToBody(this.secondContentToAppend);
            });

            it ("should have the new content in the body", () => {
                this.writer.body.should.have.string(this.secondContentToAppend);
            });

            it ("should still have the first content appended in the body", () => {
                this.writer.body.should.have.string(this.firstContentToAppend);
            });
        });
    });
});

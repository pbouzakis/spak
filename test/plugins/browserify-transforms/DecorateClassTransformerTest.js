/*jshint expr: true */
"use strict";

import fs from "fs";
import DecorateClassTransformer from "../../../lib/plugins/browserify-transforms/DecorateClassTransformer";
var { register, clear } = DecorateClassTransformer;

var getModuleBody = (nameOfFile) => fs.readFileSync(`${__dirname}/samples/${nameOfFile}.js`, "utf8");

describe("DecorateClass:", () => {
    beforeEach(() => {
        this.writer = {
            decorateExport: sinon.stub(),
            appendToDefaultExport: sinon.stub(),
            appendToBody: sinon.stub()
        };
        this.transformer = new DecorateClassTransformer(this.writer);
    });

    it("implements transformer", () => {
        this.transformer.should.respondTo("write");
    });

    describe("when decorated with a single decorator w/ no args", () => {
        beforeEach(() => {
            var body = getModuleBody("es-no-args-annotated");
            this.transformer.write(body);
        });

        it ("should add a decorator", () => {
            this.writer.decorateExport.should.have.been.calledWith("beep", []);
        });
    });

    describe("when decorated with a single decorator w/ args", () => {
        beforeEach(() => {
            var body = getModuleBody("es-args-annotated");
            this.transformer.write(body);
        });

        it ("should add an annotation", () => {
            this.writer.decorateExport.should.have.been.calledWith("boop", ["blue", true]);
        });
    });

    describe("when decorated with a multiple decorators", () => {
        beforeEach(() => {
            var body = getModuleBody("es-multiple-annotated");
            this.transformer.write(body);
        });

        it ("should added 3 decorators", () => {
            this.writer.decorateExport.should.have.been.calledThrice;
        });

        it ("should add the first decorator w/ the correct args", () => {
            this.writer.decorateExport.getCall(0).should.have.been.calledWith("beep", []);
        });

        it ("should add the second decorator w/ the correct args", () => {
            this.writer.decorateExport.getCall(1).should.have.been.calledWith("boop", [true, 100, "yes"]);
        });

        it ("should add the thrid decorator w/ the correct args", () => {
            this.writer.decorateExport.getCall(2).should.have.been.calledWith("baz", ["very", "cool"]);
        });
    });

    describe("when exports are not decorated", () => {
        beforeEach(() => {
            var body = getModuleBody("es-module-export");
            this.transformer.write(body);
        });

        it ("should not add a decorator", () => {
            this.writer.decorateExport.should.not.have.been.called;
        });
    });

    describe("when registered decorator transformer exists", () => {
        beforeEach(() => {
            this.uiTransformer = { decorator: "ui", transform: sinon.stub() };
            this.customTransformer = { decorator: "custom", transform: sinon.stub() };

            register([this.uiTransformer, this.customTransformer]);

            var body = getModuleBody("es-registered-handlers");
            this.transformer.write(body);
        });

        afterEach(clear);

        it ("should create 2 decorators", () => {
            this.writer.decorateExport.should.have.been.calledTwice;
        });

        it ("should add one decorator", () => {
            this.writer.decorateExport.getCall(0).should.have.been.calledWith("ui", []);
        });

        it ("should call back the first transformer", () => {
            this.uiTransformer.transform.should.have.been.calledWithMatch({ writer: this.writer });
        });

        it ("should add a second decorator", () => {
            this.writer.decorateExport.getCall(1).should.have.been.calledWith("custom", ["one", 2]);
        });

        it ("should call back the second transformer", () => {
            this.customTransformer.transform.should.have.been.calledWithMatch({ writer: this.writer });
        });
    });
});

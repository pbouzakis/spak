import EventBus from "../lib/EventBus";

describe("EventBus", function () {
    beforeEach(() => {
        this.events = new EventBus();
    });

    it("should be observable", () => {
        this.events.should.respondTo("on");
        this.events.should.respondTo("off");
        this.events.should.respondTo("once");
    });

    it("should be a publisher", () => {
        this.events.should.respondTo("publish");
    });

    describe("when creating a dual emitter", () => {
        beforeEach(() => {
            this.emitter = {};
            this.emitter.publish = this.events.makeDualEmitter(
                this.emitter, { events: ["added", "changed", "deleted"], prefix: "local.item" }
            );
        });

        it("should make the object observable", () => {
            this.emitter.should.respondTo("on");
            this.emitter.should.respondTo("off");
            this.emitter.should.respondTo("once");
        });

        describe("when publishing on the emitter", () => {
            beforeEach(() => {
                this.localAddedListener = sinon.stub();
                this.appAddedListener = sinon.stub();
                this.emitter.on("added", this.localAddedListener);
                this.events.on("local.itemAdded", this.appAddedListener);
                this.emitter.publish("added", 10, true, "something");
            });

            it("should call the listener from the emitter", () => {
                this.localAddedListener.should.have.been.calledWith(10, true, "something");
            });

            it("should call the listener from the emitter", () => {
                this.appAddedListener.should.have.been.calledWith(this.emitter, 10, true, "something");
            });
        });

        describe("when publishing async on the emitter", () => {
            beforeEach(() => {
                this.localAddedListener = sinon.stub();
                this.appAddedListener = sinon.stub();
                this.emitter.on("added", this.localAddedListener);
                this.events.on("local.itemAdded", this.appAddedListener);
                return this.emitter.publish.when("added", 10, true, "something");
            });

            it("should call the listener from the emitter", () => {
                this.localAddedListener.should.have.been.calledWith(10, true, "something");
            });

            it("should call the listener from the emitter", () => {
                this.appAddedListener.should.have.been.calledWith(this.emitter, 10, true, "something");
            });
        });
    });

    describe("when creating a dual emitter with a prefix w/ no dot", () => {
        beforeEach(() => {
            this.emitter = {};
            this.emitter.publish = this.events.makeDualEmitter(
                this.emitter, { events: ["added", "changed", "deleted"], prefix: "items" }
            );
        });

        describe("when publishing on the emitter", () => {
            beforeEach(() => {
                this.localAddedListener = sinon.stub();
                this.appAddedListener = sinon.stub();
                this.emitter.on("added", this.localAddedListener);
                this.events.on("items.added", this.appAddedListener);
                this.emitter.publish("added", 10, true, "something");
            });

            it("should call the listener from the emitter", () => {
                this.localAddedListener.should.have.been.calledWith(10, true, "something");
            });

            it("should call the listener from the emitter", () => {
                this.appAddedListener.should.have.been.calledWith(this.emitter, 10, true, "something");
            });
        });
    });
});


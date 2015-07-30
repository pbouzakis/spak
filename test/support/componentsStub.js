export default function componentsStub(cb) {
    class DoSomethingAction {
        get name() { return "doSomething"; }
        exec(...args) {
            cb(...args);
        }
    }

    return [
        {
            metadata: { name: "component-1" },
            bootstrap: sinon.stub()
        },
        {
            metadata: { name: "component-2" },
            bootstrap: sinon.spy((spec) => spec.action(DoSomethingAction))
        },
        {
            metadata: { name: "component-2" },
            bootstrap: sinon.spy((spec) => spec.action("doOtherThing", DoSomethingAction))
        }
    ];
}

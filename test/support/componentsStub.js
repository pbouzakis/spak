export default function componentsStub(cb) {
    class DoSomethingAction {
        get componentName() { return "doSomething"; }
        exec(...args) {
            cb(...args);
        }
    }

    return [
        {
            metadata: { name: "component-1" },
            register: sinon.stub()
        },
        {
            metadata: { name: "component-2" },
            register: sinon.spy((spec) => spec.action(DoSomethingAction))
        },
        {
            metadata: { name: "component-2" },
            register: sinon.spy((spec) => spec.action("doOtherThing", DoSomethingAction))
        }
    ];
}

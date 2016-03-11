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
            register: sinon.stub(),
            onAppConfig: sinon.stub(),
            onAppBootstrapped: sinon.stub(),
            onBeforeAppBootstrapped: sinon.stub()
        },
        {
            metadata: { name: "component-2" },
            register: sinon.spy(() => ({ $actions: [new DoSomethingAction()] })),
            onAppConfig: sinon.stub(),
            onAppBootstrapped: sinon.stub(),
            onAppComponentsRegistered: sinon.stub()
        },
        {
            metadata: { name: "component-2" },
            register: sinon.spy(() => ({ $actions: [["doOtherThing", new DoSomethingAction()]] })),
            onAppConfig: sinon.stub(),
            onAppComponentsRegistered: sinon.stub(),
            onBeforeAppBootstrapped: sinon.stub()
        }
    ];
}

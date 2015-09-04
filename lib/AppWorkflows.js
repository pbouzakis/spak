export default class AppWorkflows {
    add(workflow) {
        Object.defineProperty(this, workflow.name, {
            value: workflow,
            enumerable: true
        });
    }
}

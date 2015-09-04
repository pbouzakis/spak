# App Workflows

A workflow is a sequence of steps that each execute a given task.
Each step can be async and therefore return a promise.
A workflow is complete, when it has run through all it's steps

Constrast this to Q.all(), which runs all promises in parallel.

## Creating a workflow

```javascript
App.workflows.add(new App.Workflow(
    "preload",
    new App.WorkflowStep("db", loadDb),
    new App.WorkflowStep("sync", initSync),
    new App.WorkflowStep("ui", renderUI)
));

// This creates a workflow object, that can now be access on `App.workflows`.
App.workflows.preload.run().done(); // `run` returns a promise, so good idea to also done.
```

You can also add steps after construction.

```javascript
App.workflows.add(new App.Workflow("preload"));

// Later...
App.workflows.preload
    .addStep(new App.WorkflowStep("db", loadDb))
    .addStep(new App.WorkflowStep("sync", initSync))
    .addStep(new App.WorkflowStep("ui", renderUI));
```

Internally, `yep-app` uses the npm package `workflowit`.
For more details please see docs for [workflowit package](https://github.com/YuzuJS/workflowit)

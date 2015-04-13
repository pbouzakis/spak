"use strict";

export function inject(...args) {
    console.log("ARGS", ...args);
}

export function ui(tagname, modules) {
    var annotation = { type: "ui", tagname, behaviors: {} };

    Object.keys(modules).forEach((key) => {
        var mod = modules[key];

        if (key.match(/(Behavior|Control)$/)) {
            key = key.replace("Behavior", "");
            key = key.replace("Control", "");
            annotation.behaviors[key] = mod;

        } else if (key === tagname) {
            annotation.view = mod;
        }
    });
    console.log("UI annotator for " + tagname, annotation);

    annotation.mixinUI = (ui, instance) => {
        ui.component(instance, annotation.view);

        if (annotation.behaviors) {
            instance.behavior(annotation.behaviors);
        }

        instance.loaded = () => {};
        instance.ready = () => {};
        instance.option("viewModel", instance);
    };

    return annotation;
}

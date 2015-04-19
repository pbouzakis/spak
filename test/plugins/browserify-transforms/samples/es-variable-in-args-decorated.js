"use strict";

var obj = { size: 20 };

// @boop(obj, "blue", true)
export default function CustomStuff() {
    this.showSomethign = () => {
        console.log("show something!");
    };
}

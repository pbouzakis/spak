"use strict";

// @beep
// @boop(true, 100, "yes")
// @baz("very", "cool")
export default function Multiple(foo) {
    this.showSomethign = () => {
        console.log(foo);
    };
}

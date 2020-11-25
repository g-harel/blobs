// If debug is initially set to false it will not be toggleable.
export let debug = true;
export const debugColor = "green";

const debugListeners: ((debug: boolean) => void)[] = [];
export const onDebugStateChange = (fn: (debug: boolean) => void) => {
    debugListeners.push(fn);
    fn(debug);
};

if (debug && document.body) {
    const toggleButton = document.createElement("button");
    toggleButton.innerHTML = "debug";
    toggleButton.onclick = () => {
        debug = !debug;
        for (const listener of debugListeners) {
            listener(debug);
        }
    };
    document.body.prepend(toggleButton);
}

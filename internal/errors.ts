export const error = (message: string) => {
    throw `(blobs2) ${message}`;
};

export const typeCheck = (name: string, val: any, expected: string[]) => {
    let actual: string = typeof val;
    if (actual === "number" && isNaN(val)) actual = "NaN";
    if (!expected.includes(actual)) {
        error(`"${name}" should have type "${expected.join("|")}" but was "${actual}".`);
    }
};

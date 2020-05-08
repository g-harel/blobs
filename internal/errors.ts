export const error = (message: string) => {
    throw `(blobs2) ${message}`;
};

export const typeCheck = (name: string, val: any, expected: string[]) => {
    const actual = typeof val;
    if (!expected.includes(actual)) {
        error(`"${name}" should have type "${expected.join("|")}" but was "${actual}".`);
    }
};

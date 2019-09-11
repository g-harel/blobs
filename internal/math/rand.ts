// Seeded random number generator.
// https://stackoverflow.com/a/47593316/3053361
export const rand = (seed: string) => {
    const xfnv1a = (str: string) => {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 16777619);
        }
        return () => {
            h += h << 13;
            h ^= h >>> 7;
            h += h << 3;
            h ^= h >>> 17;
            return (h += h << 5) >>> 0;
        };
    };

    const sfc32 = (a: number, b: number, c: number, d: number) => () => {
        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;
        var t = (a + b) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };

    const seedGenerator = xfnv1a(seed);
    return sfc32(seedGenerator(), seedGenerator(), seedGenerator(), seedGenerator());
};

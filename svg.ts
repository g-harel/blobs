const size = 600;
const count = 8;
const color = "grey";

const angle = 2 * Math.PI / count;
const distance = size / 3;

const points: {x: number, y: number}[] = [];
for (let i = 0; i < count; i += 1) {
    points.push({
        x: Math.sin(i * angle) * distance,
        y: Math.cos(i * angle) * distance,
    });
}

const paths = points.map<string>((point, i) => {
    if (i === 0) {
        return `M${point.x},${point.y}`;
    }
    return `L${point.x},${point.y}`;
});
paths.push("Z");

console.log(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(${size / 2}, ${size / 2})">
            <path
                stroke="none"
                stroke-width="0"
                fill="${color}"
                d="${paths.join("\n")}"
            />
        </g>
    </svg>
`);

// const r = (a, b) => Math.min(a, b) + (Math.abs(a - b) * Math.random());

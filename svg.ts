const rand = (a, b) => Math.min(a, b) + (Math.abs(a - b) * Math.random());

const size = 600;
const count = 8;
const color = "grey";

const angle = 2 * Math.PI/count;
const distance = size/3;
const ctrlDistance = distance * 4/3 * Math.tan(angle/4);

const points: {x: number, y: number}[] = [];
for (let i = 0; i < count; i++) {
    points.push({
        x: Math.sin(i*angle) * distance,
        y: Math.cos(i*angle) * distance,
    });
}

const controls: {x1: number, y1: number, x2: number, y2: number}[] = [];
for (let i = 0; i < count; i++) {
    const j = (i+count-1)%count;
    controls.push({
        x1: points[i].x - Math.cos(i*angle) * ctrlDistance,
        y1: points[i].y + Math.sin(i*angle) * ctrlDistance,
        x2: points[j].x + Math.cos(j*angle) * ctrlDistance,
        y2: points[j].y - Math.sin(j*angle) * ctrlDistance,
    });
}

const paths: string[] = [];
for (let i = 0; i <= count; i++) {
    const point = points[i%count];
    const control = controls[i%count];

    // Start at the first point's coordinates.
    if (i === 0) {
        paths.push(`M${point.x},${point.y}`);
        continue;
    }

    //
    paths.push(`C${control.x2},${control.y2},${control.x1},${control.y1},${point.x},${point.y}`);

}
// Close the path.
paths.push("Z");

console.log(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <g transform="
            translate(${size / 2}, ${size / 2})
            rotate(${rand(0, 360 / count)})
        ">
            ${points.map(({x, y}, i) => {
                return `<line x1="${x}" y1="${y}" x2="${controls[i].x1}" y2="${controls[i].y1}" stroke-width="1" stroke="green" />`;
            }).join("")}
            ${points.map(({x, y}) => {
                return `<circle cx="${x}" cy="${y}" r="4" fill="red" />`;
            }).join("")}
            ${controls.map(({x1: x, y1: y}, i) => {
                return `<circle cx="${x}" cy="${y}" r="2" fill="${i === 0 ? "black" : "blue"}" />`;
            }).join("")}
            ${controls.map(({x2: x, y2: y}, i) => {
                return `<circle cx="${x}" cy="${y}" r="2" fill="${i === 0 ? "black" : "blue"}" />`;
            }).join("")}
            <path
                stroke="none"
                stroke-width="0"
                fill="${color}"
                d="${paths.join("")}"
            />
        </g>
    </svg>
`);

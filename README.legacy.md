## Install

```ts
// $ npm install blobs
const blobs = require("blobs");
```

```html
<script src="https://unpkg.com/blobs"></script>
```

## Usage

```typescript
const svg = blobs(options);
```

![](https://svgsaur.us?t=&w=5&h=32&b=fdcc56)![](https://svgsaur.us/?t=WARNING&w=103&h=32&s=16&y=21&x=12&b=feefcd&f=arial&o=b) ![](https://svgsaur.us?t=&w=1&h=48&)

_Options are **not** [sanitized](https://en.wikipedia.org/wiki/HTML_sanitization). Never trust raw user-submitted values in the options._

## Options

#### Required

| Name         | Type     | Description                                  |
| ------------ | -------- | -------------------------------------------- |
| `size`       | `number` | Bounding box dimensions (in pixels)          |
| `complexity` | `number` | Blob complexity (number of points)           |
| `contrast`   | `number` | Blob contrast (randomness of point position) |

#### Optional

| Name           | Type       | Default    | Description                           |
| -------------- | ---------- | ---------- | ------------------------------------- |
| `color`        | `string?`  | `"none"`   | Fill color                            |
| `stroke`       | `object?`  | `...`      | Stroke options                        |
| `stroke.color` | `string`   | `"none"`   | Stroke color                          |
| `stroke.width` | `number`   | `0`        | Stroke width (in pixels)              |
| `seed`         | `string?`  | _`random`_ | Value to seed random number generator |
| `guides`       | `boolean?` | `false`    | Render points, handles and stroke     |

_Either `stroke` or `color` must be defined._

_Guides will use stroke color and width if defined. Otherwise, they default to `black` stroke with width of `1`._

##### Example Options Object

```typescript
const options = {
    size: 600,
    complexity: 0.2,
    contrast: 0.4,
    color: "#ec576b",
    stroke: {
        width: 0,
        color: "black",
    },
    guides: false,
    seed: "1234",
};
```

## Advanced

If you need to edit the output svg for your use case, blobs also allows for _editable_ output.

```typescript
const editableSvg = blobs.editable(options);
```

The output of this function is a data structure that represents a nested svg document. This structure can be changed and rendered to a string using its `render` function.

```typescript
editableSvg.attributes.width = 1000;
const svg = editableSvg.render();
```

Utilities to create nodes in the editable output can be imported from `blobs/editable`.

```typescript
const xmlChild = blobs.xml("path");
xmlChild.attributes.stroke = "red";
// ...
editableSvg.children.push(xmlChild);
```

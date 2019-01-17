# [blobs](https://g-harel.github.io/blobs)

[![](https://img.shields.io/npm/v/blobs.svg)](https://www.npmjs.com/package/blobs)
[![](https://img.shields.io/bundlephobia/minzip/blobs.svg)](https://bundlephobia.com/result?p=blobs)

[![](https://user-images.githubusercontent.com/9319710/51342364-b4dc5800-1a61-11e9-9452-3db013605a80.png)](https://g-harel.github.io/blobs)

## Install

```shell
$ npm install blobs
```

```html
<script src="https://unpkg.com/blobs"></script>
```

## Usage

```typescript
const svg = blobs(options);
```

## Options

#### Required

Name           | Type       | Description
-------------- | ---------- | ---------------------------------------------
`size`         | `number`   | Bounding box dimensions (in pixels)
`complexity`   | `number`   | Shape complexity (number of points)
`contrast`     | `number`   | Shape contrast (randomness of point position)


#### Optional

Name           | Type       | Default    | Description
-------------- | ---------- | ---------- | -------------------------------------
`color`        | `string?`  | `"none"`   | Fill color
`stroke`       | `object?`  | `...`      | Stroke options
`stroke.color` | `string`   | `"none"`   | Stroke color
`stroke.width` | `number`   | `0`        | Stroke width (in pixels)
`seed`         | `string?`  | _`random`_ | Value to seed random number generator
`guides`       | `boolean?` | `false`    | Render points, handles and stroke

_Either `stroke` or `color` must be defined._

_Guides will use stroke color and width if defined. Otherwise, they default to `black` stroke with width of `1`._

## License

[MIT](./LICENSE)

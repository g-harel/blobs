// Generic XML element. None of the implementations' output is sanitized.
export interface IElement {
    render(): string;
}

// Unstructured element that will render as the provided string.
export class RawElement implements IElement {
    public text: string;

    public constructor(text: string) {
        this.text = text;
    }

    public render(): string {
        return this.text;
    }
}

// Structured element with tag, attributes and children.
export class Element implements IElement {
    public tag: string;
    public attributes: Record<string, string | number>;
    public children: IElement[];

    public constructor(tag: string, attributes?: Element["attributes"]) {
        this.tag = tag;
        this.attributes = attributes || {};
        this.children = [];
    }

    public add(child: IElement): Element {
        this.children.push(child);
        return this;
    }

    public render(): string {
        const attributes = this.renderAttributes();
        const content = this.renderChildren();
        return `<${this.tag}${attributes}>${content}</${this.tag}>`;
    }

    private renderAttributes(): string {
        const attributes = Object.keys(this.attributes);
        if (attributes.length === 0) return "";
        let out = "";
        for (const attribute of attributes) {
            out += ` ${attribute}="${this.attributes[attribute]}"`;
        }
        return out;
    }

    private renderChildren(): string {
        let out = "";
        for (const child of this.children) {
            out += child.render();
        }
        return out;
    }
}

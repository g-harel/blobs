// TODO move to legacy.

// Generic XML element.
export interface IXml {
    render(): string;
}

// Shortcut to create an XmlElement without "new";
export const xml = (tag: string) => new XmlElement(tag);

// Structured element with tag, attributes and children.
export class XmlElement implements IXml {
    public attributes: Record<string, string | number> = {};
    public children: IXml[] = [];

    public constructor(public tag: string) {}

    public render(): string {
        const attributes = this.renderAttributes();
        const content = this.renderChildren();
        if (content === "") {
            return `<${this.tag}${attributes}/>`;
        }
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

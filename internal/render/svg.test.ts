import {XmlElement} from "./svg";

describe("internal/render/svg", () => {
    describe("XmlElement", () => {
        it("should render element tags", () => {
            const elem = new XmlElement("test");
            expect(elem.render()).toBe("<test/>");
        });

        it("should render element attributes", () => {
            const elem = new XmlElement("test");
            elem.attributes.a = 1;
            elem.attributes["b-c"] = "d";
            expect(elem.render()).toBe('<test a="1" b-c="d"/>');
        });

        it("should render nested elements", () => {
            const a = new XmlElement("a");
            const aa = new XmlElement("aa");
            const ab = new XmlElement("ab");
            const aba = {render: () => "aba"};
            a.children.push(aa);
            a.children.push(ab);
            ab.children.push(aba);
            expect(a.render()).toBe("<a><aa/><ab>aba</ab></a>");
        });
    });
});

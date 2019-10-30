import {Element, RawElement} from ".";

describe("internal/xml/xml", () => {
    describe("render", () => {
        it("should render raw elements", () => {
            const elem = new RawElement("test");
            expect(elem.render()).toBe("test");
        });

        it("should render element tags", () => {
            const elem = new Element("test");
            expect(elem.render()).toBe("<test></test>");
        });

        it("should render element attributes", () => {
            const elem = new Element("test", {a: 1, "b-c": "d"});
            expect(elem.render()).toBe('<test a="1" b-c="d"></test>');
        });

        it("should render element children", () => {
            const a = new Element("a");
            const aa = new Element("aa");
            const ab = new Element("ab");
            const aba = new RawElement("aba");
            a.add(aa).add(ab);
            ab.add(aba);
            expect(a.render()).toBe('<a><aa></aa><ab>aba</ab></a>');
        });
    });
});

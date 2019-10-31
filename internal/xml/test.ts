import {Xml} from ".";

describe("internal/xml/xml", () => {
    describe("render", () => {
        it("should render element tags", () => {
            const elem = new Xml("test");
            expect(elem.render()).toBe("<test/>");
        });

        it("should render element attributes", () => {
            const elem = new Xml("test", {a: 1, "b-c": "d"});
            expect(elem.render()).toBe('<test a="1" b-c="d"/>');
        });

        it("should render nested elements", () => {
            const a = new Xml("a");
            const aa = new Xml("aa");
            const ab = new Xml("ab");
            const aba = {render: () => "aba"};
            a.children.push(aa);
            a.children.push(ab);
            ab.children.push(aba);
            expect(a.render()).toBe("<a><aa/><ab>aba</ab></a>");
        });
    });
});

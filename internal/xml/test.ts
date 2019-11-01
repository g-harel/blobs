import {xml} from ".";

describe("internal/xml/xml", () => {
    describe("render", () => {
        it("should render element tags", () => {
            const elem = xml("test");
            expect(elem.render()).toBe("<test/>");
        });

        it("should render element attributes", () => {
            const elem = xml("test");
            elem.attributes.a = 1;
            elem.attributes["b-c"] = "d";
            expect(elem.render()).toBe('<test a="1" b-c="d"/>');
        });

        it("should render nested elements", () => {
            const a = xml("a");
            const aa = xml("aa");
            const ab = xml("ab");
            const aba = {render: () => "aba"};
            a.children.push(aa);
            a.children.push(ab);
            ab.children.push(aba);
            expect(a.render()).toBe("<a><aa/><ab>aba</ab></a>");
        });
    });
});

import JSZip from "jszip";

let extractPptxText: (buf: Buffer) => Promise<string>;
let extractPdfText: (buf: Buffer) => Promise<string>;

beforeAll(async () => {
  const mod = await import("@/app/lib/extractors");
  extractPptxText = mod.extractPptxText;
  extractPdfText = mod.extractPdfText;
});

async function makePptx(slides: string[]): Promise<Buffer> {
  const zip = new JSZip();
  slides.forEach((text, i) => {
    zip.file(
      `ppt/slides/slide${i + 1}.xml`,
      `<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`
    );
  });
  return zip.generateAsync({ type: "nodebuffer" });
}

describe("extractPptxText", () => {
  it("extracts text from a single slide", async () => {
    const buf = await makePptx(["Hello World"]);
    const result = await extractPptxText(buf);
    expect(result).toContain("Hello World");
  });

  it("extracts and joins text from multiple slides", async () => {
    const buf = await makePptx(["Slide One", "Slide Two"]);
    const result = await extractPptxText(buf);
    expect(result).toContain("Slide One");
    expect(result).toContain("Slide Two");
  });

  it("returns empty string when no slides exist", async () => {
    const zip = new JSZip();
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    const result = await extractPptxText(buf);
    expect(result).toBe("");
  });

  it("handles a:t tags with attributes", async () => {
    const zip = new JSZip();
    zip.file(
      "ppt/slides/slide1.xml",
      `<p:sld><a:t xml:space="preserve">Attributed Text</a:t></p:sld>`
    );
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    const result = await extractPptxText(buf);
    expect(result).toContain("Attributed Text");
  });
});

describe("extractPdfText", () => {
  it("calls pdf-parse and returns text", async () => {
    const fakeBuffer = Buffer.from("fake");
    const result = await extractPdfText(fakeBuffer);
    expect(typeof result).toBe("string");
  });
});

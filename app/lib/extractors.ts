import JSZip from "jszip";
import { PDFParse } from "pdf-parse";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
}

export async function extractPptxText(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const slideKeys = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort();

  const texts: string[] = [];
  for (const key of slideKeys) {
    const xml = await zip.files[key].async("string");
    const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) ?? [];
    const slideText = matches
      .map(m => m.replace(/<[^>]+>/g, ""))
      .join(" ")
      .trim();
    if (slideText) texts.push(slideText);
  }
  return texts.join("\n");
}

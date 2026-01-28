// Polyfill browser APIs that pdfjs-dist expects but don't exist in Node.js/serverless.
// Only text extraction is needed, so minimal stubs are sufficient.
if (typeof globalThis.DOMMatrix === 'undefined') {
  // @ts-expect-error Minimal DOMMatrix stub for text extraction only
  globalThis.DOMMatrix = class DOMMatrix {
    m11 = 1; m12 = 0; m13 = 0; m14 = 0
    m21 = 0; m22 = 1; m23 = 0; m24 = 0
    m31 = 0; m32 = 0; m33 = 1; m34 = 0
    m41 = 0; m42 = 0; m43 = 0; m44 = 1
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0
    is2D = true
    isIdentity = true
    inverse() { return new DOMMatrix() }
    multiply() { return new DOMMatrix() }
    translate() { return new DOMMatrix() }
    scale() { return new DOMMatrix() }
    rotate() { return new DOMMatrix() }
    transformPoint() { return { x: 0, y: 0, z: 0, w: 1 } }
  }
}
if (typeof globalThis.Path2D === 'undefined') {
  // @ts-expect-error Stub for pdfjs-dist canvas operations
  globalThis.Path2D = class Path2D {}
}

import { PDFParse } from 'pdf-parse'

export interface ParsedPage {
  pageNumber: number
  text: string
}

export interface ParsedPdf {
  pages: ParsedPage[]
  totalPages: number
  fullText: string
}

export async function parsePdf(buffer: Buffer): Promise<ParsedPdf> {
  const parser = new PDFParse({ data: new Uint8Array(buffer), verbosity: 0 })
  const result = await parser.getText()

  const pages: ParsedPage[] = result.pages
    .map((page: { num: number; text: string }) => ({
      pageNumber: page.num,
      text: page.text.trim(),
    }))
    .filter((p: ParsedPage) => p.text.length > 0)

  const fullText = pages.map((p) => p.text).join('\n\n')

  await parser.destroy()

  return {
    pages,
    totalPages: result.total,
    fullText,
  }
}

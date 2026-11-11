import { emptyDocument, type DiagramDocument, type DiagramNode, type DiagramEdge } from "./model";

/**
 * Best-effort import of diagrams.net / draw.io mxfile XML into Vigodesk diagram JSON.
 * Supports common mxCell vertex/edge shapes; advanced stencils become rectangles.
 */
export function fromDrawioXml(xml: string): DiagramDocument {
  const doc = emptyDocument();
  const page = doc.pages[0]!;
  page.nodes = [];
  page.edges = [];

  if (typeof DOMParser === "undefined") {
    throw new Error("Draw.io import requires a browser DOMParser");
  }

  const parsed = new DOMParser().parseFromString(xml, "application/xml");
  if (parsed.querySelector("parsererror")) {
    throw new Error("Invalid draw.io / mxfile XML");
  }

  const cells = Array.from(parsed.querySelectorAll("mxCell"));
  const idMap = new Map<string, string>();
  let n = 0;

  for (const cell of cells) {
    const id = cell.getAttribute("id") || "";
    if (!id || id === "0" || id === "1") continue;
    const isVertex = cell.getAttribute("vertex") === "1";
    if (!isVertex) continue;

    const ourId = `dio-${++n}`;
    idMap.set(id, ourId);

    const geo = cell.querySelector("mxGeometry");
    const x = Number(geo?.getAttribute("x") || 40);
    const y = Number(geo?.getAttribute("y") || 40);
    const w = Number(geo?.getAttribute("width") || 120);
    const h = Number(geo?.getAttribute("height") || 60);
    const style = cell.getAttribute("style") || "";
    const shape = mapDrawioShape(style);
    const label = decodeDrawioLabel(cell.getAttribute("value") || "");
    const node: DiagramNode = {
      id: ourId,
      label,
      shape,
      x,
      y,
      w,
      h,
      kind: "shape",
    };
    page.nodes.push(node);
  }

  for (const cell of cells) {
    if (cell.getAttribute("edge") !== "1") continue;
    const id = cell.getAttribute("id") || "";
    const ourId = idMap.get(id) || `dio-e-${++n}`;
    if (!idMap.has(id)) idMap.set(id, ourId);
    const source = idMap.get(cell.getAttribute("source") || "");
    const target = idMap.get(cell.getAttribute("target") || "");
    if (!source || !target) continue;
    const edge: DiagramEdge = {
      id: ourId,
      source,
      target,
      label: decodeDrawioLabel(cell.getAttribute("value") || ""),
    };
    page.edges.push(edge);
  }

  if (!page.nodes.length) {
    throw new Error("No shapes found in this draw.io file");
  }

  page.name = "Imported";
  return doc;
}

function mapDrawioShape(style: string): string {
  const s = style.toLowerCase();
  if (s.includes("ellipse") || s.includes("shape=ellipse")) return "ellipse";
  if (s.includes("rhombus") || s.includes("diamond")) return "diamond";
  if (s.includes("cylinder")) return "cylinder";
  if (s.includes("cloud")) return "cloud";
  if (s.includes("actor")) return "actor";
  if (s.includes("swimlane")) return "swimlane";
  if (s.includes("parallelogram")) return "parallelogram";
  if (s.includes("hexagon")) return "hexagon";
  return "rectangle";
}

function decodeDrawioLabel(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

export function isDrawioFile(name: string, text: string): boolean {
  const lower = name.toLowerCase();
  if (lower.endsWith(".drawio") || lower.endsWith(".dio") || lower.endsWith(".xml")) return true;
  return /<mxfile[\s>]|<mxGraphModel[\s>]/.test(text);
}

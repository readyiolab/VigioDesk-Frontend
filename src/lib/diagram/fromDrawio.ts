import {
  emptyDocument,
  emptyPage,
  type DiagramDocument,
  type DiagramEdge,
  type DiagramNode,
  type DiagramPage,
  type EdgeStyle,
} from "./model";

/**
 * Best-effort import of diagrams.net / draw.io mxfile XML into Vigodesk diagram JSON.
 * Supports multi-page mxfile diagrams; advanced stencils map to closest custom shapes.
 */
export function fromDrawioXml(xml: string): DiagramDocument {
  if (typeof DOMParser === "undefined") {
    throw new Error("Draw.io import requires a browser DOMParser");
  }

  const parsed = new DOMParser().parseFromString(xml, "application/xml");
  if (parsed.querySelector("parsererror")) {
    throw new Error("Invalid draw.io / mxfile XML");
  }

  const diagramEls = Array.from(parsed.querySelectorAll("diagram"));
  const pages: DiagramPage[] = [];

  if (diagramEls.length) {
    diagramEls.forEach((el, i) => {
      const name = el.getAttribute("name") || `Page-${i + 1}`;
      const page = parseCellsIntoPage(el, name);
      if (page.nodes.length || page.edges.length) pages.push(page);
    });
  }

  if (!pages.length) {
    const page = parseCellsIntoPage(parsed.documentElement, "Imported");
    if (page.nodes.length || page.edges.length) pages.push(page);
  }

  if (!pages.length) {
    throw new Error("No shapes found in this draw.io file");
  }

  const doc = emptyDocument();
  doc.pages = pages;
  return doc;
}

function parseStyleMap(style: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of style.split(";")) {
    if (!part.trim()) continue;
    const eq = part.indexOf("=");
    if (eq < 0) {
      out[part.trim().toLowerCase()] = "1";
      continue;
    }
    out[part.slice(0, eq).trim().toLowerCase()] = part.slice(eq + 1).trim();
  }
  return out;
}

function parseCellsIntoPage(root: Element, name: string): DiagramPage {
  const page = emptyPage(name);
  page.nodes = [];
  page.edges = [];

  const cells = Array.from(root.querySelectorAll("mxCell"));
  const idMap = new Map<string, string>();
  let n = 0;

  for (const cell of cells) {
    const id = cell.getAttribute("id") || "";
    if (!id || id === "0" || id === "1") continue;
    if (cell.getAttribute("vertex") !== "1") continue;

    const ourId = `dio-${++n}`;
    idMap.set(id, ourId);

    const geo = cell.querySelector("mxGeometry");
    const x = Number(geo?.getAttribute("x") || 40);
    const y = Number(geo?.getAttribute("y") || 40);
    const w = Number(geo?.getAttribute("width") || 120);
    const h = Number(geo?.getAttribute("height") || 60);
    const styleAttr = cell.getAttribute("style") || "";
    const styleMap = parseStyleMap(styleAttr);
    const shape = mapDrawioShape(styleAttr, styleMap);
    const label = decodeDrawioLabel(cell.getAttribute("value") || "");
    const node: DiagramNode = {
      id: ourId,
      label,
      shape,
      x,
      y,
      w,
      h,
      kind: shape === "text" ? "text" : "shape",
      style: {
        fill: styleMap.fillcolor,
        stroke: styleMap.strokecolor,
        strokeWidth: styleMap.strokewidth ? Number(styleMap.strokewidth) : undefined,
        dashed: styleMap.dashed === "1",
        fontSize: styleMap.fontsize ? Number(styleMap.fontsize) : undefined,
        fontColor: styleMap.fontcolor,
        rounded: styleMap.rounded === "1",
      },
      layerId: page.layers?.[0]?.id,
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
    const styleMap = parseStyleMap(cell.getAttribute("style") || "");
    const geo = cell.querySelector("mxGeometry");
    const pointEls = geo ? Array.from(geo.querySelectorAll("mxPoint")) : [];
    const points = pointEls
      .map((p) => [Number(p.getAttribute("x") || 0), Number(p.getAttribute("y") || 0)] as [number, number])
      .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));

    let edgeStyle: EdgeStyle["edgeStyle"] = "orthogonal";
    const es = (styleMap.edgestyle || "").toLowerCase();
    if (es.includes("none") || es === "") {
      if (styleMap.curved === "1") edgeStyle = "orthogonal";
      else if (!styleMap.edgestyle) edgeStyle = "orthogonal";
      else edgeStyle = "straight";
    }
    if (es.includes("elbow")) edgeStyle = "elbow";
    if (es.includes("entityrelation")) edgeStyle = "entityRelation";
    if (es === "none") edgeStyle = "straight";

    const edge: DiagramEdge = {
      id: ourId,
      source,
      target,
      label: decodeDrawioLabel(cell.getAttribute("value") || ""),
      style: {
        stroke: styleMap.strokecolor,
        strokeWidth: styleMap.strokewidth ? Number(styleMap.strokewidth) : undefined,
        dashed: styleMap.dashed === "1",
        arrow: (styleMap.endarrow as EdgeStyle["arrow"]) || "classic",
        startArrow: (styleMap.startarrow as EdgeStyle["startArrow"]) || "none",
        edgeStyle,
        curved: styleMap.curved === "1",
        exitX: styleMap.exitx ? Number(styleMap.exitx) : undefined,
        exitY: styleMap.exity ? Number(styleMap.exity) : undefined,
        entryX: styleMap.entryx ? Number(styleMap.entryx) : undefined,
        entryY: styleMap.entryy ? Number(styleMap.entryy) : undefined,
        floating: !(styleMap.exitx || styleMap.entryx),
        points: points.length ? points : undefined,
      },
    };
    page.edges.push(edge);
  }

  return page;
}

function mapDrawioShape(style: string, map: Record<string, string>): string {
  const s = style.toLowerCase();
  const shape = (map.shape || "").toLowerCase();
  if (map.text === "1" || shape === "text") return "text";
  if (shape.includes("umlactor") || s.includes("actor")) return "actor";
  if (shape.includes("offpage")) return "offPageConnector";
  if (shape.includes("manualinput")) return "manualInput";
  if (shape.includes("datastore") || shape.includes("datastorage")) return "dataStorage";
  if (shape.includes("internalstorage")) return "internalStorage";
  if (shape.includes("document")) return "document";
  if (shape.includes("note")) return "note";
  if (shape.includes("step")) return "step";
  if (shape.includes("tape")) return "tape";
  if (shape.includes("card")) return "card";
  if (shape.includes("callout")) return "callout";
  if (shape.includes("cube")) return "cube";
  if (shape.includes("component") || shape.includes("module")) return "component";
  if (shape.includes("display")) return "display";
  if (shape.includes("delay")) return "delay";
  if (shape.includes("parallelogram") || s.includes("parallelogram")) return "parallelogram";
  if (shape.includes("hexagon") || s.includes("hexagon")) return "hexagon";
  if (shape.includes("cylinder") || s.includes("cylinder")) return "cylinder";
  if (shape.includes("cloud") || s.includes("cloud")) return "cloud";
  if (shape.includes("doubleellipse") || s.includes("doubleellipse")) return "doubleEllipse";
  if (shape.includes("triangle") || s.includes("triangle")) return "triangle";
  if (s.includes("rhombus") || s.includes("diamond") || shape.includes("rhombus")) return "diamond";
  if (s.includes("ellipse") || shape.includes("ellipse")) return "ellipse";
  if (s.includes("swimlane") || shape.includes("swimlane")) return "swimlane";
  if (map.rounded === "1") return "rounded";
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

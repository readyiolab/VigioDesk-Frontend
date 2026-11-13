import type { DiagramDocument, DiagramEdge, DiagramNode, DiagramPage } from "./model";

/**
 * Export Vigodesk diagram JSON → diagrams.net mxfile XML (round-trip friendly for basic shapes).
 */
export function toDrawioXml(doc: DiagramDocument, title = "Untitled Diagram"): string {
  const diagrams = doc.pages.map((page, i) => pageToDiagramXml(page, i)).join("\n");
  const safeTitle = escapeXml(title || "Untitled Diagram");
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Vigodesk" modified="${new Date().toISOString()}" agent="Vigodesk" version="22.0.0" type="device" title="${safeTitle}">
${diagrams}
</mxfile>`;
}

function pageToDiagramXml(page: DiagramPage, index: number): string {
  const cells: string[] = [`<mxCell id="0"/>`, `<mxCell id="1" parent="0"/>`];

  for (const node of page.nodes) {
    cells.push(nodeToMxCell(node));
  }
  for (const edge of page.edges) {
    cells.push(edgeToMxCell(edge));
  }

  const name = escapeXml(page.name || `Page-${index + 1}`);
  const id = escapeXml(page.id || `page-${index}`);
  return `  <diagram id="${id}" name="${name}">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        ${cells.join("\n        ")}
      </root>
    </mxGraphModel>
  </diagram>`;
}

function nodeToMxCell(node: DiagramNode): string {
  const style = shapeToDrawioStyle(node);
  const value = escapeXml(node.label || "");
  const parent = node.groupId ? escapeXml(node.groupId) : "1";
  return `<mxCell id="${escapeXml(node.id)}" value="${value}" style="${escapeXml(style)}" vertex="1" parent="${parent}">
          <mxGeometry x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}" as="geometry"/>
        </mxCell>`;
}

function edgeToMxCell(edge: DiagramEdge): string {
  const s = edge.style ?? {};
  const parts = [
    "edgeStyle=orthogonalEdgeStyle",
    "rounded=1",
    `strokeColor=${s.stroke ?? "#64748b"}`,
    `strokeWidth=${s.strokeWidth ?? 1.5}`,
    `endArrow=${s.arrow ?? "classic"}`,
    `startArrow=${s.startArrow && s.startArrow !== "none" ? s.startArrow : "none"}`,
  ];
  if (s.curved) parts.push("curved=1");
  if (s.dashed) parts.push("dashed=1");
  if (typeof s.exitX === "number") parts.push(`exitX=${s.exitX}`);
  if (typeof s.exitY === "number") parts.push(`exitY=${s.exitY}`);
  if (typeof s.entryX === "number") parts.push(`entryX=${s.entryX}`);
  if (typeof s.entryY === "number") parts.push(`entryY=${s.entryY}`);
  if (s.edgeStyle === "straight") parts[0] = "edgeStyle=none";
  else if (s.edgeStyle === "elbow") parts[0] = "edgeStyle=elbowEdgeStyle";
  else if (s.edgeStyle === "entityRelation") parts[0] = "edgeStyle=entityRelationEdgeStyle";
  const value = escapeXml(edge.label || "");
  const points = s.points?.length
    ? `<Array as="points">${s.points
        .map(([x, y]) => `<mxPoint x="${x}" y="${y}"/>`)
        .join("")}</Array>`
    : "";
  return `<mxCell id="${escapeXml(edge.id)}" value="${value}" style="${escapeXml(parts.join(";"))};" edge="1" parent="1" source="${escapeXml(edge.source)}" target="${escapeXml(edge.target)}">
          <mxGeometry relative="1" as="geometry">${points}</mxGeometry>
        </mxCell>`;
}

function shapeToDrawioStyle(node: DiagramNode): string {
  const s = node.style ?? {};
  const shapeMap: Record<string, string> = {
    rectangle: "rounded=0",
    rounded: "rounded=1;arcSize=20",
    ellipse: "ellipse;shape=ellipse",
    circle: "ellipse;shape=ellipse",
    diamond: "rhombus",
    rhombus: "rhombus",
    parallelogram: "shape=parallelogram;perimeter=parallelogramPerimeter",
    hexagon: "shape=hexagon;perimeter=hexagonPerimeter",
    cylinder: "shape=cylinder3;boundedLbl=1",
    cloud: "ellipse;shape=cloud",
    actor: "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top",
    triangle: "triangle",
    doubleEllipse: "ellipse;shape=doubleEllipse",
    document: "shape=document",
    note: "shape=note;size=14",
    process: "rounded=1;arcSize=20",
    decision: "rhombus",
    terminator: "ellipse;shape=ellipse",
    swimlane: "swimlane",
    arrow: "shape=arrow",
    text: "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle",
    step: "shape=step;perimeter=stepPerimeter",
    tape: "shape=tape",
    card: "shape=card",
    callout: "shape=callout",
    internalStorage: "shape=internalStorage",
    dataStorage: "shape=dataStorage",
    offPageConnector: "shape=offPageConnector",
    preparation: "hexagon",
    manualInput: "shape=manualInput",
    display: "shape=display",
    delay: "shape=delay",
  };
  const shapePart = shapeMap[node.shape] ?? "rounded=0";
  const parts = [
    shapePart,
    "whiteSpace=wrap",
    "html=1",
    `fillColor=${s.fill ?? "#dae8fc"}`,
    `strokeColor=${s.stroke ?? "#6c8ebf"}`,
    `fontColor=${s.fontColor ?? "#333333"}`,
    `fontSize=${s.fontSize ?? 12}`,
  ];
  if (s.dashed) parts.push("dashed=1");
  if (typeof s.strokeWidth === "number") parts.push(`strokeWidth=${s.strokeWidth}`);
  return parts.filter(Boolean).join(";") + ";";
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadDrawio(doc: DiagramDocument, filename: string) {
  const xml = toDrawioXml(doc, filename.replace(/\.drawio$/i, ""));
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".drawio") ? filename : `${filename}.drawio`;
  a.click();
  URL.revokeObjectURL(url);
}

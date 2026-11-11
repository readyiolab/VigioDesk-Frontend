import { emptyDocument, type DiagramDocument } from "./model";

export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  build: () => DiagramDocument;
}

function flowchartTemplate(): DiagramDocument {
  const doc = emptyDocument();
  const page = doc.pages[0]!;
  page.name = "Flowchart";
  page.nodes = [
    { id: "n1", label: "Start", shape: "ellipse", x: 200, y: 40, w: 120, h: 60, kind: "shape" },
    { id: "n2", label: "Process", shape: "rectangle", x: 200, y: 140, w: 120, h: 60, kind: "shape" },
    { id: "n3", label: "Decision?", shape: "diamond", x: 200, y: 240, w: 140, h: 80, kind: "shape" },
    { id: "n4", label: "Yes path", shape: "rectangle", x: 60, y: 360, w: 120, h: 60, kind: "shape" },
    { id: "n5", label: "No path", shape: "rectangle", x: 340, y: 360, w: 120, h: 60, kind: "shape" },
    { id: "n6", label: "End", shape: "ellipse", x: 200, y: 480, w: 120, h: 60, kind: "shape" },
  ];
  page.edges = [
    { id: "e1", source: "n1", target: "n2", label: "" },
    { id: "e2", source: "n2", target: "n3", label: "" },
    { id: "e3", source: "n3", target: "n4", label: "Yes" },
    { id: "e4", source: "n3", target: "n5", label: "No" },
    { id: "e5", source: "n4", target: "n6", label: "" },
    { id: "e6", source: "n5", target: "n6", label: "" },
  ];
  return doc;
}

function orgChartTemplate(): DiagramDocument {
  const doc = emptyDocument();
  const page = doc.pages[0]!;
  page.name = "Org chart";
  page.nodes = [
    { id: "ceo", label: "CEO", shape: "rectangle", x: 220, y: 40, w: 140, h: 50, kind: "shape" },
    { id: "eng", label: "Engineering", shape: "rectangle", x: 60, y: 160, w: 140, h: 50, kind: "shape" },
    { id: "prod", label: "Product", shape: "rectangle", x: 220, y: 160, w: 140, h: 50, kind: "shape" },
    { id: "ops", label: "Operations", shape: "rectangle", x: 380, y: 160, w: 140, h: 50, kind: "shape" },
  ];
  page.edges = [
    { id: "e1", source: "ceo", target: "eng", label: "" },
    { id: "e2", source: "ceo", target: "prod", label: "" },
    { id: "e3", source: "ceo", target: "ops", label: "" },
  ];
  return doc;
}

function architectureTemplate(): DiagramDocument {
  const doc = emptyDocument();
  const page = doc.pages[0]!;
  page.name = "Architecture";
  page.nodes = [
    { id: "users", label: "Users", shape: "actor", x: 40, y: 120, w: 80, h: 100, kind: "shape" },
    { id: "web", label: "Web App", shape: "rectangle", x: 180, y: 140, w: 120, h: 60, kind: "shape" },
    { id: "api", label: "API", shape: "rectangle", x: 360, y: 140, w: 120, h: 60, kind: "shape" },
    { id: "db", label: "Database", shape: "cylinder", x: 540, y: 130, w: 100, h: 80, kind: "shape" },
    { id: "queue", label: "Queue", shape: "rectangle", x: 360, y: 260, w: 120, h: 50, kind: "shape" },
    { id: "worker", label: "Workers", shape: "rectangle", x: 540, y: 260, w: 100, h: 50, kind: "shape" },
  ];
  page.edges = [
    { id: "e1", source: "users", target: "web", label: "HTTPS" },
    { id: "e2", source: "web", target: "api", label: "" },
    { id: "e3", source: "api", target: "db", label: "" },
    { id: "e4", source: "api", target: "queue", label: "enqueue" },
    { id: "e5", source: "queue", target: "worker", label: "" },
  ];
  return doc;
}

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  {
    id: "flowchart",
    name: "Basic flowchart",
    description: "Start → process → decision → end",
    build: flowchartTemplate,
  },
  {
    id: "org-chart",
    name: "Org chart",
    description: "Simple leadership hierarchy",
    build: orgChartTemplate,
  },
  {
    id: "architecture",
    name: "Web architecture",
    description: "Users, app, API, DB, queue, workers",
    build: architectureTemplate,
  },
];

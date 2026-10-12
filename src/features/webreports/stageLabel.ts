export function stageLabel(status: string, stage: string): string {
  if (status === "failed") return "The scan did not complete";
  if (status === "completed") return "Scan complete";
  return `Scanning · ${stage.replaceAll("_", " ")}`;
}

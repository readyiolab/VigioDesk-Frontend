import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DiagramPage, DiagramSettings } from "@/lib/diagram/model";
import type { SelectionInfo } from "./DiagramCanvas";
import { LayersPanel } from "./LayersPanel";
import { cn } from "@/lib/utils";
import type { CellStyle } from "@maxgraph/core";

type FormatTab = "diagram" | "style" | "arrange" | "elements";

type Props = {
  settings: DiagramSettings;
  onSettingsChange: (patch: Partial<DiagramSettings>) => void;
  selection: SelectionInfo | null;
  onApplyStyle: (patch: Partial<CellStyle>) => void;
  onOpenPageSetup?: () => void;
  onThemeChange?: (themeId: string) => void;
  elementsPage?: DiagramPage;
  onSelectElement?: (nodeId: string) => void;
  onToggleElementLock?: (nodeId: string) => void;
  onToggleElementHidden?: (nodeId: string) => void;
  onAlign?: (dir: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  onDistribute?: (axis: "h" | "v") => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onAutoRoute?: () => void;
  onClearWaypoints?: () => void;
  onSetEdgeFloating?: (floating: boolean) => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onAddLayer?: () => void;
  onRemoveLayer?: (layerId: string) => void;
  onRenameLayer?: (layerId: string, name: string) => void;
  onToggleLayerVisible?: (layerId: string) => void;
  onToggleLayerLocked?: (layerId: string) => void;
  onSelectLayer?: (layerId: string) => void;
  tab?: FormatTab;
  onTabChange?: (tab: FormatTab) => void;
  className?: string;
};

type ConnectorRouting = "orthogonal" | "straight" | "elbow" | "curved" | "entityRelation";

/**
 * An edge with no edgeStyle inherits the orthogonal stylesheet default, so it
 * must not read as straight (and never as an empty Select value).
 */
function connectorRouting(style: Partial<CellStyle>): ConnectorRouting {
  if (style.curved) return "curved";
  const kind = String(style.edgeStyle ?? "");
  if (kind === "none") return "straight";
  if (kind.includes("elbow")) return "elbow";
  if (kind.includes("entityRelation")) return "entityRelation";
  return "orthogonal";
}

export function FormatPanel({
  settings,
  onSettingsChange,
  selection,
  onApplyStyle,
  onOpenPageSetup,
  onThemeChange,
  elementsPage,
  onSelectElement,
  onToggleElementLock,
  onToggleElementHidden,
  onAlign,
  onDistribute,
  onBringToFront,
  onSendToBack,
  onAutoRoute,
  onClearWaypoints,
  onSetEdgeFloating,
  onGroup,
  onUngroup,
  onAddLayer,
  onRemoveLayer,
  onRenameLayer,
  onToggleLayerVisible,
  onToggleLayerLocked,
  onSelectLayer,
  tab,
  onTabChange,
  className,
}: Props) {
  const style = selection?.style ?? {};
  const styleRec = style as Record<string, unknown>;
  const selectedIds = (selection?.cells ?? [])
    .map((c) => c.getId())
    .filter(Boolean) as string[];
  const isFloating = styleRec.diagramFloating !== "0";

  return (
    <aside className={cn("flex h-full w-[280px] shrink-0 flex-col border-l border-[#cfd8e3] bg-[#f5f7fa]", className)}>
      <Tabs
        {...(tab != null
          ? {
              value: tab === "elements" ? "elements" : tab,
              onValueChange: (v: string) => onTabChange?.(v as FormatTab),
            }
          : { defaultValue: "diagram" as const })}
        className="flex h-full flex-col"
      >
        <TabsList className="mx-2 mt-2 grid h-8 grid-cols-4 rounded-md bg-[#e2e8f0]">
          <TabsTrigger value="diagram" className="px-1 text-[10px]">
            Diagram
          </TabsTrigger>
          <TabsTrigger value="style" className="px-1 text-[10px]">
            Style
          </TabsTrigger>
          <TabsTrigger value="arrange" className="px-1 text-[10px]">
            Arrange
          </TabsTrigger>
          <TabsTrigger value="elements" className="px-1 text-[10px]">
            Layers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagram" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
          <section className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">View</h3>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">Grid</Label>
              <Switch
                checked={settings.grid !== false}
                onCheckedChange={(v) => onSettingsChange({ grid: v })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={5}
                max={50}
                value={settings.gridSize ?? 10}
                onChange={(e) => onSettingsChange({ gridSize: Number(e.target.value) || 10 })}
                className="h-8 w-20 rounded-md text-xs"
              />
              <span className="text-xs text-muted-foreground">pt</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">Page View</Label>
              <Switch
                checked={settings.pageView !== false}
                onCheckedChange={(v) => onSettingsChange({ pageView: v })}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">Background</Label>
              <Input
                type="color"
                value={settings.background ?? "#ffffff"}
                onChange={(e) => onSettingsChange({ background: e.target.value })}
                className="h-8 w-12 rounded-md p-1"
              />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Options</h3>
            {(
              [
                ["connectionArrows", "Connection Arrows"],
                ["connectionPoints", "Connection Points"],
                ["guides", "Guides"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <Label className="text-xs">{label}</Label>
                <Switch
                  checked={settings[key] !== false}
                  onCheckedChange={(v) => onSettingsChange({ [key]: v })}
                />
              </div>
            ))}
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">Snap to Point</Label>
              <Switch
                checked={settings.snapToPoint === true}
                onCheckedChange={(v) => onSettingsChange({ snapToPoint: v })}
              />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Theme</h3>
            <Select
              value={settings.theme ?? "automatic"}
              onValueChange={(v) => {
                if (onThemeChange) onThemeChange(v);
                else onSettingsChange({ theme: v as DiagramSettings["theme"] });
              }}
            >
              <SelectTrigger className="h-8 rounded-md text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["automatic", "classic", "simple", "minimal", "sketch", "atlas"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Paper Size</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full rounded-md text-xs"
              onClick={() => onOpenPageSetup?.()}
            >
              Page Setup…
            </Button>
            <Select
              value={settings.paper ?? "a4-portrait"}
              onValueChange={(v) => onSettingsChange({ paper: v as DiagramSettings["paper"] })}
            >
              <SelectTrigger className="h-8 rounded-md text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4-portrait">A4 Portrait</SelectItem>
                <SelectItem value="a4-landscape">A4 Landscape</SelectItem>
                <SelectItem value="letter">US-Letter</SelectItem>
                <SelectItem value="legal">US-Legal</SelectItem>
                <SelectItem value="widescreen-16-9">16:9</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-md text-xs"
              onClick={() =>
                onSettingsChange({
                  grid: true,
                  gridSize: 10,
                  pageView: true,
                  background: "#ffffff",
                  connectionArrows: true,
                  connectionPoints: true,
                  guides: true,
                  paper: "a4-portrait",
                })
              }
            >
              Clear Default Style
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="style" className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          {!selection ? (
            <p className="text-xs text-muted-foreground">Select a shape or connector to edit its style.</p>
          ) : (
            <>
              {selection.isVertex && (
                <>
                  <Field label="Fill">
                    <Input
                      type="color"
                      value={(style.fillColor as string) || "#dae8fc"}
                      onChange={(e) => onApplyStyle({ fillColor: e.target.value })}
                      className="h-8 w-full rounded-md p-1"
                    />
                  </Field>
                  <Field label="Line">
                    <Input
                      type="color"
                      value={(style.strokeColor as string) || "#6c8ebf"}
                      onChange={(e) => onApplyStyle({ strokeColor: e.target.value })}
                      className="h-8 w-full rounded-md p-1"
                    />
                  </Field>
                </>
              )}
              {selection.isEdge && (
                <Field label="Line">
                  <Input
                    type="color"
                    value={(style.strokeColor as string) || "#64748b"}
                    onChange={(e) => onApplyStyle({ strokeColor: e.target.value })}
                    className="h-8 w-full rounded-md p-1"
                  />
                </Field>
              )}
              <Field label="Stroke width">
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={(style.strokeWidth as number) || 1.5}
                  onChange={(e) => onApplyStyle({ strokeWidth: Number(e.target.value) || 1 })}
                  className="h-8 rounded-md text-xs"
                />
              </Field>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Dashed</Label>
                <Switch
                  checked={Boolean(style.dashed)}
                  onCheckedChange={(v) => onApplyStyle({ dashed: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Shadow</Label>
                <Switch
                  checked={Boolean(style.shadow)}
                  onCheckedChange={(v) => onApplyStyle({ shadow: v })}
                />
              </div>
              <Field label="Opacity">
                <Input
                  type="number"
                  min={10}
                  max={100}
                  value={(style.opacity as number) ?? 100}
                  onChange={(e) => onApplyStyle({ opacity: Number(e.target.value) || 100 })}
                  className="h-8 rounded-md text-xs"
                />
              </Field>
              <Field label="Font size">
                <Input
                  type="number"
                  min={8}
                  max={48}
                  value={(style.fontSize as number) || 12}
                  onChange={(e) => onApplyStyle({ fontSize: Number(e.target.value) || 12 })}
                  className="h-8 rounded-md text-xs"
                />
              </Field>
              <Field label="Font color">
                <Input
                  type="color"
                  value={(style.fontColor as string) || "#333333"}
                  onChange={(e) => onApplyStyle({ fontColor: e.target.value })}
                  className="h-8 w-full rounded-md p-1"
                />
              </Field>
              {selection.isEdge && (
                <>
                  <Field label="Start arrow">
                    <Select
                      value={(style.startArrow as string) || "none"}
                      onValueChange={(v) =>
                        onApplyStyle({ startArrow: v === "none" ? undefined : v })
                      }
                    >
                      <SelectTrigger className="h-8 rounded-md text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["none", "classic", "block", "open", "oval", "diamond"].map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="End arrow">
                    <Select
                      value={(style.endArrow as string) || "classic"}
                      onValueChange={(v) => onApplyStyle({ endArrow: v === "none" ? undefined : v })}
                    >
                      <SelectTrigger className="h-8 rounded-md text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["classic", "block", "open", "oval", "diamond", "none"].map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Bidirectional</Label>
                    <Switch
                      checked={Boolean(style.startArrow) && Boolean(style.endArrow)}
                      onCheckedChange={(v) =>
                        onApplyStyle(
                          v
                            ? {
                                startArrow: (style.endArrow as string) || "classic",
                                endArrow: (style.endArrow as string) || "classic",
                              }
                            : { startArrow: undefined }
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Curved</Label>
                    <Switch
                      checked={Boolean(style.curved)}
                      onCheckedChange={(v) => onApplyStyle({ curved: v })}
                    />
                  </div>
                  <Field label="Connector">
                    <Select
                      value={connectorRouting(style)}
                      onValueChange={(v) =>
                        onApplyStyle({
                          edgeStyle:
                            v === "orthogonal"
                              ? "orthogonalEdgeStyle"
                              : v === "elbow"
                                ? "elbowEdgeStyle"
                                : v === "entityRelation"
                                  ? "entityRelationEdgeStyle"
                                  : "none",
                          curved: v === "curved",
                        })
                      }
                    >
                      <SelectTrigger className="h-8 rounded-md text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orthogonal">Orthogonal</SelectItem>
                        <SelectItem value="straight">Straight</SelectItem>
                        <SelectItem value="elbow">Elbow</SelectItem>
                        <SelectItem value="curved">Curved</SelectItem>
                        <SelectItem value="entityRelation">Entity Relation</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Floating</Label>
                    <Switch
                      checked={isFloating}
                      onCheckedChange={(v) => onSetEdgeFloating?.(v)}
                    />
                  </div>
                  <Field label="Line jump">
                    <Select
                      value={String(styleRec.jumpStyle ?? "none")}
                      onValueChange={(v) =>
                        onApplyStyle({
                          jumpStyle: v === "none" ? undefined : v,
                          jumpSize: v === "none" ? undefined : 6,
                        } as Partial<CellStyle>)
                      }
                    >
                      <SelectTrigger className="h-8 rounded-md text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="arc">Arc</SelectItem>
                        <SelectItem value="gap">Gap</SelectItem>
                        <SelectItem value="sharp">Sharp</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-md text-xs"
                      onClick={() => onAutoRoute?.()}
                    >
                      Auto-route
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-md text-xs"
                      onClick={() => onClearWaypoints?.()}
                    >
                      Clear waypoints
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="arrange" className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          <section className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
              Align
            </h3>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  ["left", "Left"],
                  ["center", "Center"],
                  ["right", "Right"],
                  ["top", "Top"],
                  ["middle", "Middle"],
                  ["bottom", "Bottom"],
                ] as const
              ).map(([dir, label]) => (
                <Button
                  key={dir}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-md text-[10px]"
                  onClick={() => onAlign?.(dir)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </section>
          <section className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
              Distribute
            </h3>
            <div className="grid grid-cols-2 gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-md text-xs"
                onClick={() => onDistribute?.("h")}
              >
                Horizontal
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-md text-xs"
                onClick={() => onDistribute?.("v")}
              >
                Vertical
              </Button>
            </div>
          </section>
          <section className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
              Order
            </h3>
            <div className="grid grid-cols-2 gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-md text-xs"
                onClick={() => onBringToFront?.()}
              >
                To front
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-md text-xs"
                onClick={() => onSendToBack?.()}
              >
                To back
              </Button>
            </div>
          </section>
          <section className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
              Group
            </h3>
            <div className="grid grid-cols-2 gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-md text-xs"
                onClick={() => onGroup?.()}
              >
                Group
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-md text-xs"
                onClick={() => onUngroup?.()}
              >
                Ungroup
              </Button>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="elements" className="min-h-0 flex-1 overflow-hidden p-1">
          {elementsPage ? (
            <LayersPanel
              page={elementsPage}
              selectedIds={selectedIds}
              onSelect={(id) => onSelectElement?.(id)}
              onToggleLock={(id) => onToggleElementLock?.(id)}
              onToggleHidden={(id) => onToggleElementHidden?.(id)}
              onAddLayer={onAddLayer}
              onRemoveLayer={onRemoveLayer}
              onRenameLayer={onRenameLayer}
              onToggleLayerVisible={onToggleLayerVisible}
              onToggleLayerLocked={onToggleLayerLocked}
              onSelectLayer={onSelectLayer}
            />
          ) : (
            <p className="px-3 py-4 text-xs text-muted-foreground">No page loaded.</p>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

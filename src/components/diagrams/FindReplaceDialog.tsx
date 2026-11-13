import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onClose: () => void;
  onFind: (query: string) => string[];
  onReplace: (find: string, replace: string, all: boolean) => number;
  onSelectIds: (ids: string[]) => void;
};

export function FindReplaceDialog({ open, onClose, onFind, onReplace, onSelectIds }: Props) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [status, setStatus] = useState("");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Find and Replace</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Find</Label>
            <Input
              value={find}
              onChange={(e) => setFind(e.target.value)}
              className="h-8 rounded-md text-sm"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Replace with</Label>
            <Input
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              className="h-8 rounded-md text-sm"
            />
          </div>
          {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
        </div>
        <DialogFooter className="flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const ids = onFind(find);
              onSelectIds(ids);
              setStatus(ids.length ? `Found ${ids.length}` : "No matches");
            }}
          >
            Find
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const n = onReplace(find, replace, false);
              setStatus(n ? "Replaced 1" : "No matches");
            }}
          >
            Replace
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const n = onReplace(find, replace, true);
              setStatus(n ? `Replaced ${n}` : "No matches");
            }}
          >
            Replace all
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

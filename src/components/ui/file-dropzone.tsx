import React, { useCallback, useState, useRef } from "react";
import { UploadCloud, FileText, Image as ImageIcon, HardDrive, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CloudFilePickerModal } from "./CloudFilePickerModal";

interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  toolName?: string;
  className?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  multiple = false,
  maxSizeMB,
  onFiles,
  disabled = false,
  toolName = "PDF",
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCloudPickerOpen, setIsCloudPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFiles(multiple ? files : [files[0]]);
    }
  }, [disabled, multiple, onFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFiles(multiple ? files : [files[0]]);
      e.target.value = "";
    }
  }, [multiple, onFiles]);

  const isImageTool = accept.includes("image");
  const Icon = isImageTool ? ImageIcon : FileText;

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer group bg-card/40 backdrop-blur-xs",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border/80 hover:border-primary/50 hover:bg-muted/40 shadow-xs",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${toolName} files`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />

        <div className="relative flex flex-col items-center gap-4 py-12 px-6 text-center max-w-lg">
          {/* Animated icon */}
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 shadow-xs",
              isDragOver
                ? "bg-primary/10 scale-110 ring-2 ring-primary/30"
                : "bg-muted group-hover:bg-primary/10 group-hover:scale-105"
            )}
          >
            {isDragOver ? (
              <UploadCloud className="h-8 w-8 text-primary animate-pulse" />
            ) : (
              <Icon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>

          {/* Main CTA */}
          <div className="space-y-1.5">
            <p className="text-base font-bold text-foreground">
              {isDragOver ? (
                "Drop files here"
              ) : (
                <>
                  <span className="text-primary hover:underline">Choose file</span>
                  {" "}or drag & drop here
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {isImageTool ? "JPG, PNG, or WebP" : accept === ".pdf" ? "PDF files only" : accept.replace(/\./g, "").toUpperCase() + " files"}
              {multiple && " • Multiple files supported"}
              {maxSizeMB && ` • Max ${maxSizeMB}MB per file`}
            </p>
          </div>

          {/* Action buttons: Device + Cloud Storage */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
            {/* Primary button: Device */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              Select {toolName} {multiple ? "Files" : "File"}
            </button>

            {/* Cloud Storage Picker Trigger */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCloudPickerOpen(true);
              }}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-4 py-2.5 text-xs font-semibold text-foreground shadow-xs hover:bg-muted hover:border-primary/40 transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              <HardDrive className="h-3.5 w-3.5 text-primary" />
              <span>From Storage</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">(Drive, Dropbox, OneDrive, SharePoint)</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
          aria-hidden="true"
        />
      </div>

      {/* Cloud Storage Selection Modal */}
      <CloudFilePickerModal
        isOpen={isCloudPickerOpen}
        onClose={() => setIsCloudPickerOpen(false)}
        onFilesSelected={onFiles}
        accept={accept}
        multiple={multiple}
        toolName={toolName}
        onOpenDeviceFilePicker={() => inputRef.current?.click()}
      />
    </>
  );
};

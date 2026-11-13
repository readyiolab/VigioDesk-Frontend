import { cn } from "@/lib/utils";

export type CloudBrandId = "gdrive" | "dropbox" | "onedrive" | "sharepoint" | "box";

const LOGO_SRC: Record<CloudBrandId, string> = {
  gdrive: "/brands/google-drive.svg",
  dropbox: "/brands/dropbox.svg",
  onedrive: "/brands/onedrive.svg",
  sharepoint: "/brands/sharepoint.svg",
  box: "/brands/box.svg",
};

const LOGO_ALT: Record<CloudBrandId, string> = {
  gdrive: "Google Drive",
  dropbox: "Dropbox",
  onedrive: "Microsoft OneDrive",
  sharepoint: "Microsoft SharePoint",
  box: "Box",
};

interface CloudProviderLogoProps {
  id: CloudBrandId;
  className?: string;
  size?: number;
}

/** Official brand mark from /public/brands (Simple Icons, brand-colored). */
export function CloudProviderLogo({ id, className, size = 20 }: CloudProviderLogoProps) {
  return (
    <img
      src={LOGO_SRC[id]}
      alt={LOGO_ALT[id]}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      loading="lazy"
      decoding="async"
    />
  );
}

export const CLOUD_BRAND_ORDER: CloudBrandId[] = [
  "gdrive",
  "dropbox",
  "onedrive",
  "sharepoint",
  "box",
];

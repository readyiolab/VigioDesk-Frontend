import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lettersApi } from "@/services/lettersApi";
import { ensureOrg, setOrgId, useOrgStore } from "@/features/org";
import { letterKeys } from "./keys";

async function resolveOrgId(userId?: string | null): Promise<string> {
  return ensureOrg(userId);
}

export function useBrands(userId?: string | null, enabled = true) {
  const orgId = useOrgStore((s) => s.getOrgIdForUser(userId));
  const qc = useQueryClient();

  return useQuery({
    queryKey: letterKeys.brands(orgId ?? "pending"),
    enabled,
    queryFn: async () => {
      const oid = await resolveOrgId(userId);
      const { brands } = await lettersApi.listBrands(oid);
      const data = { orgId: oid, brands };
      if (oid !== orgId) {
        setOrgId(oid, { userId });
        qc.setQueryData(letterKeys.brands(oid), data);
      }
      return data;
    },
  });
}

export function useTemplates(userId?: string | null, enabled = true) {
  const orgId = useOrgStore((s) => s.getOrgIdForUser(userId));
  const qc = useQueryClient();

  return useQuery({
    queryKey: letterKeys.templates(orgId ?? "pending"),
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const oid = await resolveOrgId(userId);
      let { templates } = await lettersApi.listTemplates(oid);
      // Seed at most once per org per browser session — avoid write storms on every visit.
      const seedKey = `letters:seeded:${oid}`;
      if (!templates.length && typeof sessionStorage !== "undefined" && !sessionStorage.getItem(seedKey)) {
        sessionStorage.setItem(seedKey, "1");
        const seeded = await lettersApi.seedTemplates(oid);
        templates = seeded.templates;
      }
      const data = { orgId: oid, templates };
      if (oid !== orgId) {
        setOrgId(oid, { userId });
        qc.setQueryData(letterKeys.templates(oid), data);
      }
      return data;
    },
  });
}

export function useLetterStudioHome(userId?: string | null) {
  const existingOrgId = useOrgStore((s) => s.getOrgIdForUser(userId));
  const existingOrgName = useOrgStore((s) => s.orgName ?? "");

  return useQuery({
    queryKey: [...letterKeys.all, "studio-home", userId ?? "anon"],
    staleTime: 30_000,
    queryFn: async () => {
      let id = existingOrgId;
      let orgName = existingOrgName || "";
      let warning: string | undefined;
      if (!id) {
        const boot = await lettersApi.bootstrap();
        id = boot.org.organization.id as string;
        orgName = boot.org.organization.name as string;
        warning = boot.warning;
        setOrgId(id, {
          userId,
          role: boot.org.role,
          orgName,
        });
      }
      const [batchRes, brandRes, templateRes] = await Promise.all([
        lettersApi.listBatches(id),
        lettersApi.listBrands(id).catch(() => ({ brands: [] as unknown[] })),
        lettersApi.listTemplates(id).catch(() => ({ templates: [] as unknown[] })),
      ]);
      return {
        orgId: id,
        orgName,
        warning,
        batches: batchRes.batches,
        brandCount: brandRes.brands?.length || 0,
        templateCount: templateRes.templates?.length || 0,
      };
    },
  });
}

export function useCreateBrand(userId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const oid = await resolveOrgId(userId);
      const { brand } = await lettersApi.createBrand(oid, body);
      return { orgId: oid, brand };
    },
    onSuccess: ({ orgId }) => {
      void qc.invalidateQueries({ queryKey: letterKeys.brands(orgId) });
    },
  });
}

export function useBatches(userId?: string | null, enabled = true) {
  const orgId = useOrgStore((s) => s.getOrgIdForUser(userId));
  const qc = useQueryClient();

  return useQuery({
    queryKey: letterKeys.batches(orgId ?? "pending"),
    enabled,
    queryFn: async () => {
      const oid = await resolveOrgId(userId);
      const { batches } = await lettersApi.listBatches(oid);
      const data = { orgId: oid, batches };
      if (oid !== orgId) {
        setOrgId(oid, { userId });
        qc.setQueryData(letterKeys.batches(oid), data);
      }
      return data;
    },
  });
}

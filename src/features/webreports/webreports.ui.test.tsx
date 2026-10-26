import type { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { shouldPollReport } from "@/features/webreports/keys"
import type { DevicePerformance, WebReport } from "@/features/webreports/types"
import WebReportPage from "@/pages/webreports/WebReportPage"
import WebReportsHome from "@/pages/webreports/WebReportsHome"
import WebReportsLanding from "@/pages/webreports/WebReportsLanding"
import SharedWebReportPage from "@/pages/webreports/SharedWebReportPage"
import { useAuth } from "@/contexts/AuthContext"
import { ApiError } from "@/services/api"
import { webreportsApi } from "@/services/webreportsApi"

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}))

vi.mock("@/services/webreportsApi", () => ({
  webreportsApi: {
    list: vi.fn(),
    create: vi.fn(),
    get: vi.fn(),
    rescan: vi.fn(),
    share: vi.fn(),
    revoke: vi.fn(),
    remove: vi.fn(),
    getPublic: vi.fn(),
  },
}))

const api = vi.mocked(webreportsApi)

function device(overrides: Partial<DevicePerformance> = {}): DevicePerformance {
  return {
    score: 80,
    lcp: 2100,
    inp: null,
    tbt: 120,
    cls: 0.04,
    fcp: 900,
    ttfb: 180,
    bytes: 400000,
    ratings: { lcp: "good", inp: "unavailable", cls: "good" },
    field: {},
    issues: [],
    unavailableReason: null,
    pageUrl: "https://example.com/",
    ...overrides,
  }
}

function report(overrides: Partial<WebReport> = {}): WebReport {
  return {
    contractVersion: 1,
    id: "rep-1",
    url: "https://example.com/",
    status: "completed",
    stage: "completed",
    progress: 100,
    scannedAt: "2026-10-12T12:00:00.000Z",
    pagesCrawled: 3,
    completeness: { complete: true, unavailableSections: [] },
    scores: { overall: 82, mobile: 80, desktop: 90, seo: 78, aiSearch: 84 },
    scoringVersion: "webreports-scoring-v1",
    summary: { headline: "Mostly ready", text: "Fix the title length." },
    performance: { mobile: device(), desktop: device({ score: 90 }) },
    seo: {
      checks: [
        {
          id: "title-length",
          category: "seo",
          status: "present",
          severity: "warning",
          title: "Title length",
          description: "One title is short.",
          affectedCount: 1,
          affectedUrls: ["https://example.com/"],
          fix: "Rewrite the title.",
          impact: "medium",
          effort: "easy",
        },
      ],
    },
    aiSearch: {
      botAccess: { GPTBot: "allowed" },
      llmsTxt: { present: true, status: "present" },
      jsDependency: { rawVsRenderedRatio: 0.8, status: "absent" },
      checks: [],
    },
    topFixes: [
      {
        rank: 1,
        title: "Rewrite short titles",
        impact: "medium",
        effort: "easy",
        why: "One title is short.",
        scope: "1 page",
        instructions: "Use a descriptive title.",
        checkIds: ["title-length"],
      },
    ],
    shareToken: null,
    error: null,
    ...overrides,
  }
}

function renderRoutes(path: string, extra?: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/webreports" element={<WebReportsHome />} />
          <Route path="/webreports/:id" element={<WebReportPage />} />
          <Route path="/webreports/shared/:token" element={<SharedWebReportPage />} />
          {extra}
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const writeText = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAuth).mockReturnValue({ user: null, token: null, loading: false } as ReturnType<typeof useAuth>)
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
  )
  writeText.mockReset()
  writeText.mockResolvedValue(undefined)
  api.list.mockResolvedValue({ reports: [], pagination: { limit: 20, offset: 0, total: 0 } })
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  })
})

afterEach(() => {
  cleanup()
})

describe("scan polling", () => {
  it("polls only while a visible scan is unfinished", () => {
    expect(shouldPollReport("running", false)).toBe(2000)
    expect(shouldPollReport("queued", false)).toBe(2000)
    expect(shouldPollReport("running", true)).toBe(false)
    expect(shouldPollReport("completed", false)).toBe(false)
    expect(shouldPollReport("failed", false)).toBe(false)
  })
})

describe("website audit home", () => {
  it("shows an empty history", async () => {
    renderRoutes("/webreports")
    expect(await screen.findByText("No scans yet. Submit a URL to start.")).toBeTruthy()
  })

  it("validates the URL before submitting", async () => {
    const user = userEvent.setup()
    renderRoutes("/webreports")
    await screen.findByText("No scans yet. Submit a URL to start.")
    await user.click(screen.getByRole("button", { name: "Start scan" }))
    expect(screen.getByRole("alert").textContent).toContain("Enter a website URL.")
    await user.type(screen.getByLabelText("Website URL"), "ftp://example.com")
    await user.click(screen.getByRole("button", { name: "Start scan" }))
    expect(screen.getByRole("alert").textContent).toContain("Use an http or https URL.")
    expect(api.create).not.toHaveBeenCalled()
  })

  it("starts a scan and opens the report", async () => {
    const user = userEvent.setup()
    api.create.mockResolvedValue({ cached: false, report: report({ status: "queued", stage: "validating", progress: 5 }) })
    api.get.mockResolvedValue({ report: report({ status: "queued", stage: "validating", progress: 5, summary: { headline: null, text: null } }) })
    renderRoutes("/webreports")
    await screen.findByText("No scans yet. Submit a URL to start.")
    await user.type(screen.getByLabelText("Website URL"), "https://example.com/")
    await user.click(screen.getByRole("button", { name: "Start scan" }))
    expect(await screen.findByRole("heading", { name: "Checking the address" })).toBeTruthy()
    expect(api.create.mock.calls[0][0]).toEqual({ url: "https://example.com/", maxPages: undefined, force: false })
  })

  it("shows a failed submit", async () => {
    const user = userEvent.setup()
    api.create.mockRejectedValue(new ApiError("Daily website audit limit reached.", 403))
    renderRoutes("/webreports")
    await screen.findByText("No scans yet. Submit a URL to start.")
    await user.type(screen.getByLabelText("Website URL"), "https://example.com/")
    await user.click(screen.getByRole("button", { name: "Start scan" }))
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Daily website audit limit reached.")
  })
})

describe("report progress and results", () => {
  it("shows queued and running progress", async () => {
    api.get.mockResolvedValue({
      report: report({ status: "running", stage: "crawling", progress: 20, summary: { headline: null, text: null } }),
    })
    renderRoutes("/webreports/rep-1")
    expect(await screen.findByRole("heading", { name: "Reading public pages" })).toBeTruthy()
    expect(screen.getByRole("progressbar", { name: "Scan progress" })).toBeTruthy()
    expect(screen.getByText("20%")).toBeTruthy()
    expect(screen.getByText("Measuring mobile performance")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Back to scans" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Share" })).toBeNull()
    expect(screen.queryByText("Unavailable")).toBeNull()
  })

  it("shows a completed report", async () => {
    api.get.mockResolvedValue({ report: report() })
    renderRoutes("/webreports/rep-1")
    expect(await screen.findByRole("heading", { name: "Mostly ready" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Key problems" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Back to scans" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Share" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeTruthy()
    expect(screen.getByText(/Rewrite short titles/)).toBeTruthy()
    expect(screen.getAllByText("82").length).toBeGreaterThan(0)
  })

  it("shows a partial report without treating missing scores as zero", async () => {
    api.get.mockResolvedValue({
      report: report({
        scores: { overall: 70, mobile: null, desktop: 90, seo: 78, aiSearch: 84 },
        completeness: { complete: false, unavailableSections: ["mobile", "field-data"] },
        performance: { mobile: device({ score: null, unavailableReason: "Lighthouse did not return a result." }), desktop: device() },
      }),
    })
    renderRoutes("/webreports/rep-1")
    expect((await screen.findAllByText(/Incomplete measurement: mobile, field-data/)).length).toBeGreaterThan(0)
    expect(screen.getAllByText("Lighthouse did not return a result.").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Not measured").length).toBeGreaterThan(0)
    expect(screen.queryByText("0")).toBeNull()
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0)
  })

  it("shows a failed scan", async () => {
    api.get.mockResolvedValue({
      report: report({
        status: "failed",
        stage: "validating",
        progress: 5,
        summary: { headline: null, text: null },
        error: { message: "That address cannot be scanned." },
      }),
    })
    renderRoutes("/webreports/rep-1")
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "That address cannot be scanned.")
  })

  it("copies a share link, revokes it, and starts a rescan", async () => {
    const user = userEvent.setup()
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)
    api.get.mockResolvedValue({ report: report({ shareToken: "a".repeat(64) }) })
    api.share.mockResolvedValue({ shareToken: "b".repeat(64), sharePath: "/webreports/shared/" + "b".repeat(64) })
    api.revoke.mockResolvedValue({ ok: true })
    api.rescan.mockResolvedValue({ report: report({ status: "queued", stage: "validating", progress: 0 }) })
    renderRoutes("/webreports/rep-1")
    await screen.findByRole("button", { name: "Share" })
    await user.click(screen.getByRole("button", { name: "Share" }))
    await waitFor(() => expect(write).toHaveBeenCalled())
    await user.click(screen.getByRole("button", { name: "Revoke share" }))
    await waitFor(() => expect(api.revoke).toHaveBeenCalled())
    await user.click(screen.getByRole("button", { name: "Rescan" }))
    await waitFor(() => expect(api.rescan).toHaveBeenCalled())
  })
})

describe("public share", () => {
  it("renders a read-only report", async () => {
    api.getPublic.mockResolvedValue({ report: report({ id: undefined, shareToken: undefined }) })
    renderRoutes("/webreports/shared/abc")
    expect(await screen.findByRole("heading", { name: "Mostly ready" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Share" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Rescan" })).toBeNull()
    expect(screen.getByText("Bot access does not guarantee inclusion in AI answers.")).toBeTruthy()
  })

  it("explains a revoked link", async () => {
    api.getPublic.mockRejectedValue(new ApiError("Not found", 404))
    renderRoutes("/webreports/shared/revoked")
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "This share link is invalid or has been revoked."
    )
  })
})

describe("product page", () => {
  function renderLanding() {
    return render(
      <MemoryRouter initialEntries={["/webreports"]}>
        <Routes>
          <Route path="/webreports" element={<WebReportsLanding />} />
          <Route path="/webreports/scan" element={<p>Scan form</p>} />
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </MemoryRouter>
    )
  }

  it("shows the audit headline and sends signed-out visitors to login", async () => {
    const user = userEvent.setup()
    renderLanding()
    expect(
      screen.getByRole("heading", { name: /Turn Any Public URL into an Executive Audit Report/i })
    ).toBeTruthy()
    await user.click(screen.getAllByRole("button", { name: /Start free/ })[0])
    expect(await screen.findByText("Login page")).toBeTruthy()
  })

  it("sends a signed-in visitor to the scan form", async () => {
    const user = userEvent.setup()
    vi.mocked(useAuth).mockReturnValue({
      user: { plan: "PRO" },
      token: "session",
      loading: false,
    } as ReturnType<typeof useAuth>)
    renderLanding()
    await user.click(screen.getAllByRole("button", { name: /Start scan/ })[0])
    expect(await screen.findByText("Scan form")).toBeTruthy()
  })
})

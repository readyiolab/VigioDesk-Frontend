import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import {
  Menu,
  LogOut,
  CreditCard,
  Settings,
  Zap,
  Search,
  ChevronDown,
  X,
  FileText,
  ShieldCheck,
  ArrowRight,
  PenTool,
  History,
  Cloud,
  User as UserIcon,
  Monitor,
  GitBranch,
  ScanSearch,
  Command,
  Layers,
  Bot,
  ExternalLink,
  Lock,
  Scissors,
  GitMerge,
  Minimize,
  FileSignature,
  Lightbulb,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../theme-provider";
import { TOOLS, TOOL_CATEGORIES, getToolRoute } from "@/lib/design-tokens";
import { AuthModal } from "../auth/AuthModal";
import { cn } from "@/lib/utils";
import { prefetchHandlers, prefetchRoute } from "@/lib/routePrefetch";

const TOOL_GROUPS = TOOL_CATEGORIES.filter((cat) => cat !== "All")
  .map((cat) => ({
    category: cat,
    tools: TOOLS.filter((tool) => tool.categories[1] === cat),
  }))
  .filter((group) => group.tools.length > 0);

function isAiTool(id: string) {
  return id === "summarize" || id === "chatpdf" || id === "explain" || id === "ocr";
}

function navActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

type DropdownType = "tools" | "products" | "ai" | "more" | null;

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isHome = location.pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Command palette / Search modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  // Mega-menu search within tools dropdown
  const [toolsSearch, setToolsSearch] = useState("");

  // Mobile menu states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");

  // Auth modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  // Profile menu dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    setIsSearchModalOpen(false);
    setIsProfileOpen(false);
    setToolsSearch("");
    setCommandQuery("");
  }, [location.pathname]);

  // Global ⌘K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
        setCommandQuery("");
      } else if (e.key === "Escape") {
        setIsSearchModalOpen(false);
        setActiveDropdown(null);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dropdown hover timing to prevent accidental closure
  const handleDropdownEnter = (type: DropdownType) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(type);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const solidNav = !isHome || scrolled;

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate("/");
  };

  // Filter tools for the tools mega-menu search
  const filteredMegaTools = useMemo(() => {
    if (!toolsSearch.trim()) return [];
    const q = toolsSearch.toLowerCase();
    return TOOLS.filter(
      (t) => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
    );
  }, [toolsSearch]);

  // Command palette search results
  const commandResults = useMemo(() => {
    if (!commandQuery.trim()) {
      // Return popular / recommended tools
      const popularIds = ["merge", "compress", "split", "esign", "summarize", "chatpdf", "protect", "jpgToPdf"];
      return TOOLS.filter((t) => popularIds.includes(t.id));
    }
    const q = commandQuery.toLowerCase();
    return TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.categories.some((c) => c.toLowerCase().includes(q))
    );
  }, [commandQuery]);

  // Reset selected result on query change
  useEffect(() => {
    setSelectedResultIndex(0);
  }, [commandQuery]);

  // Handle keyboard navigation in command modal
  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (commandResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev + 1) % commandResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev - 1 + commandResults.length) % commandResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetTool = commandResults[selectedResultIndex];
      if (targetTool) {
        navigate(getToolRoute(targetTool));
        setIsSearchModalOpen(false);
      }
    }
  };

  // Mobile tools search
  const mobileFiltered = useMemo(() => {
    if (!mobileSearch.trim()) return null;
    const q = mobileSearch.toLowerCase();
    return TOOLS.filter(
      (t) => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
    );
  }, [mobileSearch]);

  const navButtonClass = (isActive: boolean) =>
    cn(
      "group inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs lg:text-[13px] font-semibold transition-all duration-200 select-none cursor-pointer",
      isActive
        ? "bg-primary/10 text-primary shadow-xs ring-1 ring-primary/25 dark:bg-primary/15"
        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
    );

  return (
    <>
      {/* ─── DESKTOP & MOBILE HEADER BAR ─── */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 print:hidden",
          isHome
            ? scrolled
              ? "border-b border-[#d8e4f2]/80 bg-[#EEF4FB]/95 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-border/50 dark:bg-background/85 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]"
              : "border-b border-transparent bg-[#EEF4FB] backdrop-blur-md dark:bg-background/40"
            : solidNav
              ? "border-b border-border/70 bg-[#EEF4FB]/90 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-border/50 dark:bg-background/80 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]"
              : "border-b border-border/20 bg-[#EEF4FB]/60 backdrop-blur-md dark:bg-background/40"
        )}
      >
        <div className="mx-auto flex h-16 sm:h-20 max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">

          {/* LEFT: Mobile toggle & Brand */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="-ml-1 inline-flex cursor-pointer rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              to="/"
              className="group flex items-center gap-2 transition-transform duration-200"
              {...prefetchHandlers("/")}
            >
              <img
                src="/logo.png"
                alt="vigodesk.com"
                className="h-11 sm:h-14 lg:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* CENTER: Desktop Organized Navigation */}
          <nav className="relative hidden items-center gap-1 lg:flex xl:gap-1.5">

            {/* 1. TOOLS MEGA-MENU */}
            <div
              className="relative"
              onMouseEnter={() => {
                handleDropdownEnter("tools");
                prefetchRoute("/workspace");
              }}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown((prev) => (prev === "tools" ? null : "tools"))}
                className={navButtonClass(activeDropdown === "tools" || location.pathname === "/workspace")}
              >
                <span>Tools</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground group-hover:text-foreground",
                    activeDropdown === "tools" && "rotate-180 text-primary"
                  )}
                />
              </button>

              {/* Tools Mega-Menu Dropdown Panel */}
              {activeDropdown === "tools" && (
                <div
                  className="absolute left-1/2 top-full z-50 mt-1.5 w-[min(94vw,760px)] -translate-x-1/2 animate-in fade-in-0 zoom-in-95 duration-150"
                  onMouseEnter={() => handleDropdownEnter("tools")}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-5 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.25)] backdrop-blur-2xl dark:border-border/60 dark:shadow-[0_24px_70px_-20px_rgba(0,0,0,0.65)]">

                    {/* Search inside Tools */}
                    <div className="relative mb-4">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search all 30+ PDF tools (merge, compress, OCR, esign)..."
                        value={toolsSearch}
                        onChange={(e) => setToolsSearch(e.target.value)}
                        className="h-10 w-full rounded-xl border border-border/80 bg-muted/40 pl-10 pr-9 text-xs font-medium outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                      {toolsSearch && (
                        <button
                          type="button"
                          onClick={() => setToolsSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {toolsSearch.trim() ? (
                      /* Filtered Results */
                      <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
                        {filteredMegaTools.length === 0 ? (
                          <div className="py-10 text-center">
                            <p className="text-xs font-medium text-muted-foreground">No matching tools found for "{toolsSearch}"</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setToolsSearch("")}
                              className="mt-3 text-xs"
                            >
                              Clear search
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {filteredMegaTools.map((tool) => {
                              const Icon = tool.icon;
                              return (
                                <Link
                                  key={tool.id}
                                  to={getToolRoute(tool)}
                                  onClick={() => setActiveDropdown(null)}
                                  onMouseEnter={() => prefetchRoute(getToolRoute(tool))}
                                  className="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-border/80 hover:bg-muted/70"
                                >
                                  <span
                                    className={cn(
                                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                                      tool.accent
                                    )}
                                  >
                                    <Icon className={cn("h-4 w-4", tool.accentText)} />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary">
                                        {tool.name}
                                      </p>
                                      {isAiTool(tool.id) && (
                                        <span className="rounded bg-fuchsia-500/10 px-1 py-0.2 text-[8px] font-bold text-fuchsia-600 dark:text-fuchsia-400">
                                          AI
                                        </span>
                                      )}
                                    </div>
                                    <p className="truncate text-[10px] text-muted-foreground">
                                      {tool.desc}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Categorized Columns */
                      <div className="grid grid-cols-3 gap-6 max-h-[420px] overflow-y-auto pr-1">
                        {TOOL_GROUPS.slice(0, 3).map((group) => (
                          <div key={group.category} className="space-y-1.5">
                            <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {group.category}
                              </span>
                            </div>
                            <ul className="space-y-0.5">
                              {group.tools.slice(0, 6).map((tool) => {
                                const Icon = tool.icon;
                                return (
                                  <li key={tool.id}>
                                    <Link
                                      to={getToolRoute(tool)}
                                      onClick={() => setActiveDropdown(null)}
                                      onMouseEnter={() => prefetchRoute(getToolRoute(tool))}
                                      className="group flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted"
                                    >
                                      <span
                                        className={cn(
                                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                                          tool.accent
                                        )}
                                      >
                                        <Icon className={cn("h-3 w-3", tool.accentText)} />
                                      </span>
                                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground group-hover:text-primary">
                                        {tool.name}
                                      </span>
                                      {isAiTool(tool.id) && (
                                        <span className="shrink-0 rounded bg-fuchsia-500/10 px-1 py-0.5 text-[8px] font-bold text-fuchsia-600 dark:text-fuchsia-400">
                                          AI
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}



                  </div>
                </div>
              )}
            </div>

            {/* 2. PRODUCTS / STUDIOS DROPDOWN */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter("products")}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown((prev) => (prev === "products" ? null : "products"))}
                className={navButtonClass(
                  activeDropdown === "products" ||
                  navActive(location.pathname, "/esign") ||
                  navActive(location.pathname, "/letters") ||
                  navActive(location.pathname, "/diagrams") ||
                  navActive(location.pathname, "/webreports")
                )}
              >
                <span>Products</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground group-hover:text-foreground",
                    activeDropdown === "products" && "rotate-180 text-primary"
                  )}
                />
              </button>

              {/* Products Dropdown Panel */}
              {activeDropdown === "products" && (
                <div
                  className="absolute left-0 top-full z-50 mt-1.5 w-[560px] animate-in fade-in-0 zoom-in-95 duration-150"
                  onMouseEnter={() => handleDropdownEnter("products")}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-4 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.25)] backdrop-blur-2xl dark:border-border/60 dark:shadow-[0_24px_70px_-20px_rgba(0,0,0,0.65)]">
                    <div className="mb-2.5 px-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Document Creation & Signing Studios
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* eSign Studio */}
                      <Link
                        to="/esign"
                        onClick={() => setActiveDropdown(null)}
                        {...prefetchHandlers("/esign")}
                        className="group flex flex-col justify-between rounded-xl border border-border/50 bg-background/50 p-3 transition-all hover:border-blue-500/40 hover:bg-blue-500/5 hover:shadow-xs"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            <PenTool className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                eSign Studio
                              </span>
                              <span className="rounded bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                                Popular
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                              Legally-binding contracts, audit trails & multi-signer flows.
                            </p>
                          </div>
                        </div>
                      </Link>

                      {/* Letter Studio */}
                      <Link
                        to="/letters"
                        onClick={() => setActiveDropdown(null)}
                        {...prefetchHandlers("/letters")}
                        className="group flex flex-col justify-between rounded-xl border border-border/50 bg-background/50 p-3 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:shadow-xs"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                            <FileText className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                Letter Studio
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                              Corporate stationery, letterhead generator & typography engine.
                            </p>
                          </div>
                        </div>
                      </Link>

                      {/* Diagram Studio */}
                      <Link
                        to="/diagrams"
                        onClick={() => setActiveDropdown(null)}
                        {...prefetchHandlers("/diagrams")}
                        className="group flex flex-col justify-between rounded-xl border border-border/50 bg-background/50 p-3 transition-all hover:border-orange-500/40 hover:bg-orange-500/5 hover:shadow-xs"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-600/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                            <GitBranch className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400">
                                Diagram Studio
                              </span>
                              <span className="rounded bg-orange-500/10 px-1.5 py-0.2 text-[9px] font-bold text-orange-600 dark:text-orange-400">
                                New
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                              Flowcharts, technical architecture & vector PDF graph export.
                            </p>
                          </div>
                        </div>
                      </Link>

                      {/* WebReports */}
                      <Link
                        to="/webreports"
                        onClick={() => setActiveDropdown(null)}
                        {...prefetchHandlers("/webreports")}
                        className="group flex flex-col justify-between rounded-xl border border-border/50 bg-background/50 p-3 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:shadow-xs"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <ScanSearch className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                WebReports
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                              Convert live URLs into executive audit and performance reports.
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>


                  </div>
                </div>
              )}
            </div>

            {/* 3. AI SUITE DROPDOWN (Glowing Highlight) */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter("ai")}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown((prev) => (prev === "ai" ? null : "ai"))}
                className={navButtonClass(
                  activeDropdown === "ai" || navActive(location.pathname, "/ai")
                )}
              >
                <span>AI Suite</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground group-hover:text-foreground",
                    activeDropdown === "ai" && "rotate-180 text-primary"
                  )}
                />
              </button>

              {/* AI Suite Dropdown Panel */}
              {activeDropdown === "ai" && (
                <div
                  className="absolute left-0 top-full z-50 mt-1.5 w-[480px] animate-in fade-in-0 zoom-in-95 duration-150"
                  onMouseEnter={() => handleDropdownEnter("ai")}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div className="overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-card/95 p-4 shadow-[0_24px_70px_-20px_rgba(217,70,239,0.25)] backdrop-blur-2xl dark:border-fuchsia-500/20 dark:shadow-[0_24px_70px_-20px_rgba(0,0,0,0.7)]">
                    <div className="mb-2 flex items-center justify-between px-2">

                    </div>

                    <div className="space-y-1.5">
                      {/* Summarize */}
                      <Link
                        to="/ai/summarize"
                        onClick={() => setActiveDropdown(null)}
                        {...prefetchHandlers("/ai/summarize")}
                        className="group flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-fuchsia-500/10"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300">
                          <FileText className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400">
                              Summarize PDF
                            </span>
                            <span className="rounded bg-fuchsia-500/10 px-1 py-0.2 text-[8px] font-bold text-fuchsia-600">
                              Instant
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Synthesize 100+ page documents into key executive takeaways.
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-fuchsia-500" />
                      </Link>

                      {/* ChatPDF */}
                      <Link
                        to="/ai/chat"
                        onClick={() => setActiveDropdown(null)}
                        {...prefetchHandlers("/ai/chat")}
                        className="group flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-emerald-500/10"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                          <MessageSquare className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              Chat with PDF
                            </span>
                            <span className="rounded bg-emerald-500/10 px-1 py-0.2 text-[8px] font-bold text-emerald-600">
                              Q&A
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Ask questions, compare clauses, and cite precise page sources.
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500" />
                      </Link>

                      {/* Explain PDF */}
                      <Link
                        to="/ai/explain"
                        onClick={() => setActiveDropdown(null)}
                        {...prefetchHandlers("/ai/explain")}
                        className="group flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-sky-500/10"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
                          <Lightbulb className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400">
                              Explain & Translate
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Decode complex legal, medical & financial jargon into clear terms.
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-sky-500" />
                      </Link>

                      {/* Smart OCR */}
                      <Link
                        to="/workspace/ocr"
                        onClick={() => setActiveDropdown(null)}
                        {...prefetchHandlers("/workspace/ocr")}
                        className="group flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-amber-500/10"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
                          <Bot className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">
                              Smart OCR
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Extract machine-readable text and tables from scans and photos.
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-amber-500" />
                      </Link>
                    </div>


                  </div>
                </div>
              )}
            </div>

            {/* 4. WORKSPACE DIRECT LINK */}
            <Link
              to="/workspace"
              className={navButtonClass(navActive(location.pathname, "/workspace"))}
              {...prefetchHandlers("/workspace")}
            >
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Workspace</span>
            </Link>

            {/* 5. PRICING DIRECT LINK */}
            <Link
              to="/billing"
              className={navButtonClass(navActive(location.pathname, "/billing"))}
              {...prefetchHandlers("/billing")}
            >
              <span>Pricing</span>
            </Link>

            {/* 6. MORE (Cloud & Desktop App) */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter("more")}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown((prev) => (prev === "more" ? null : "more"))}
                className={navButtonClass(
                  activeDropdown === "more" ||
                  navActive(location.pathname, "/enterprise") ||
                  navActive(location.pathname, "/desktop")
                )}
              >
                <span>More</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground group-hover:text-foreground",
                    activeDropdown === "more" && "rotate-180 text-primary"
                  )}
                />
              </button>

              {/* More Dropdown Panel */}
              {activeDropdown === "more" && (
                <div
                  className="absolute right-0 top-full z-50 mt-1.5 w-[320px] animate-in fade-in-0 zoom-in-95 duration-150"
                  onMouseEnter={() => handleDropdownEnter("more")}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.25)] backdrop-blur-2xl dark:border-border/60">
                    <Link
                      to="/enterprise"
                      onClick={() => setActiveDropdown(null)}
                      {...prefetchHandlers("/enterprise")}
                      className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                        <Cloud className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground group-hover:text-primary">
                          Cloud Storage & BYOK
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Connect S3, Cloudflare R2 & team cloud storage.
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/desktop"
                      onClick={() => setActiveDropdown(null)}
                      {...prefetchHandlers("/desktop")}
                      className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                        <Monitor className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-foreground group-hover:text-primary">
                            Desktop App
                          </p>
                          <span className="rounded bg-blue-500/10 px-1 py-0.2 text-[8px] font-bold text-blue-600">
                            Offline
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Native performance for macOS & Windows.
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </nav>

          {/* RIGHT: Search, Theme Toggle & User Auth */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">



            {/* USER LOGGED IN vs GUEST */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/70 bg-background/60 p-1 pr-2.5 transition-all hover:border-primary/40 hover:bg-muted/60"
                  aria-label="User account menu"
                >
                  <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <div className="hidden text-left xl:block">
                    <p className="max-w-[100px] truncate text-xs font-semibold leading-tight text-foreground">
                      {user.name}
                    </p>
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 leading-none mt-0.5">
                      {user.plan || "PRO"}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>

                {/* Profile Popover */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="mb-1 border-b border-border/60 px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-xs font-bold text-foreground">{user.name}</p>
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-extrabold text-blue-600 dark:text-blue-400">
                          {user.plan || "PRO"}
                        </span>
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground mt-0.5">{user.email}</p>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                        {...prefetchHandlers("/profile")}
                      >
                        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                        Account Settings
                      </Link>

                      <Link
                        to="/history"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                        {...prefetchHandlers("/history")}
                      >
                        <History className="h-3.5 w-3.5 text-muted-foreground" />
                        Conversion History
                      </Link>

                      <Link
                        to={user.plan === "ENTERPRISE" ? "/settings/cloud" : "/enterprise"}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                        {...prefetchHandlers(user.plan === "ENTERPRISE" ? "/settings/cloud" : "/enterprise")}
                      >
                        <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
                        Your Cloud (BYOK)
                      </Link>

                      <Link
                        to="/billing"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                        {...prefetchHandlers("/billing")}
                      >
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                        Manage Subscription
                      </Link>
                    </div>

                    <div className="my-1 h-px bg-border/60" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuthModal("login")}
                  className="h-9 cursor-pointer rounded-xl px-3 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Log In
                </Button>

                <Button
                  size="sm"
                  onClick={() => openAuthModal("register")}
                  className="group relative h-9 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span>Start free trial</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Button>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* ─── SPOTLIGHT COMMAND / SEARCH PALETTE (⌘K) ─── */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in-0 duration-150">
          <div
            className="fixed inset-0 bg-background/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsSearchModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] backdrop-blur-2xl animate-in zoom-in-95 duration-150">
            {/* Search Input Bar */}
            <div className="flex items-center border-b border-border/60 px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search tools, products, actions... (e.g. merge, compress, esign, summarize)"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                onKeyDown={handleCommandKeyDown}
                className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              {commandQuery && (
                <button
                  type="button"
                  onClick={() => setCommandQuery("")}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="ml-2 hidden sm:inline-flex items-center rounded border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/20 px-4 py-2 overflow-x-auto text-[11px]">
              <span className="text-muted-foreground font-semibold mr-1">Quick:</span>
              {[
                { label: "Merge", query: "merge" },
                { label: "Compress", query: "compress" },
                { label: "eSign", query: "esign" },
                { label: "Summarize", query: "summarize" },
                { label: "OCR", query: "ocr" },
                { label: "Protect", query: "protect" },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setCommandQuery(chip.query)}
                  className="cursor-pointer rounded-lg border border-border/60 bg-card px-2.5 py-0.5 font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2">
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {commandQuery ? `Matching Tools (${commandResults.length})` : "Popular Tools & Features"}
              </div>

              {commandResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No tools found for "{commandQuery}". Try searching for "convert", "split", or "sign".
                </div>
              ) : (
                <div className="space-y-1">
                  {commandResults.map((tool, index) => {
                    const Icon = tool.icon;
                    const isSelected = index === selectedResultIndex;
                    return (
                      <Link
                        key={tool.id}
                        to={getToolRoute(tool)}
                        onClick={() => setIsSearchModalOpen(false)}
                        onMouseEnter={() => setSelectedResultIndex(index)}
                        className={cn(
                          "flex items-center justify-between rounded-xl p-2.5 transition-all",
                          isSelected
                            ? "bg-primary/10 text-primary shadow-xs"
                            : "hover:bg-muted/70 text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              tool.accent
                            )}
                          >
                            <Icon className={cn("h-4 w-4", tool.accentText)} />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">
                                {tool.name}
                              </span>
                              {isAiTool(tool.id) && (
                                <span className="rounded bg-fuchsia-500/10 px-1 py-0.2 text-[8px] font-bold text-fuchsia-600 dark:text-fuchsia-400">
                                  AI
                                </span>
                              )}
                              <span className="hidden sm:inline-block text-[10px] text-muted-foreground">
                                • {tool.categories[1]}
                              </span>
                            </div>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {tool.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pl-2">
                          <span className="text-[10px] font-medium text-muted-foreground hidden sm:inline">
                            Jump
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Bottom Keyboard Shortcuts Helper */}
            <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[9px] font-mono">↑</kbd>
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[9px] font-mono">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[9px] font-mono">↵</kbd>
                  Open
                </span>
              </div>
              <span>Press <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[9px] font-mono">ESC</kbd> to exit</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── MOBILE DRAWER MENU ─── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-sm transition-opacity"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full max-w-[min(100%,22rem)] flex-col bg-card shadow-2xl animate-in slide-in-from-left duration-250">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <img
                  src="/logo.png"
                  alt="vigodesk.com"
                  className="h-11 sm:h-12 w-auto object-contain dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.7)] dark:brightness-110"
                />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="cursor-pointer rounded-xl p-2 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-4">

              {/* Core Links */}
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Navigation
                </p>
                {[
                  { to: "/workspace", match: "/workspace", label: "Tool Workspace", icon: Layers, tone: "text-blue-600" },
                  { to: "/esign", match: "/esign", label: "eSign Studio", icon: PenTool, tone: "text-blue-600" },
                  { to: "/letters", match: "/letters", label: "Letter Studio", icon: FileText, tone: "text-indigo-600" },
                  { to: "/diagrams", match: "/diagrams", label: "Diagram Studio", icon: GitBranch, tone: "text-orange-600" },
                  { to: "/webreports", match: "/webreports", label: "WebReports", icon: ScanSearch, tone: "text-emerald-600" },
                  { to: "/ai/summarize", match: "/ai", label: "AI Suite", icon: Bot, tone: "text-fuchsia-500" },
                  { to: "/enterprise", match: "/enterprise", label: "Your Cloud (BYOK)", icon: Cloud, tone: "text-sky-500" },
                  { to: "/desktop", match: "/desktop", label: "Desktop App", icon: Monitor, tone: "text-blue-600" },
                  { to: "/billing", match: "/billing", label: "Pricing & Plans", icon: Zap, tone: "text-amber-500" },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = navActive(location.pathname, item.match);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      {...prefetchHandlers(item.to)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                        active
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", item.tone)} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* All Tools Accordion in Mobile */}
              <div className="border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setMobileToolsOpen((prev) => !prev)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    All Tools Directory ({TOOLS.length})
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      mobileToolsOpen && "rotate-180"
                    )}
                  />
                </button>

                {mobileToolsOpen && (
                  <div className="mt-2 space-y-3">
                    <div className="relative px-1">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search all tools..."
                        value={mobileSearch}
                        onChange={(e) => setMobileSearch(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border bg-muted/40 pl-9 pr-3 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    {mobileFiltered ? (
                      <div className="space-y-0.5">
                        {mobileFiltered.length === 0 ? (
                          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                            No tools found
                          </p>
                        ) : (
                          mobileFiltered.map((tool) => {
                            const Icon = tool.icon;
                            return (
                              <Link
                                key={tool.id}
                                to={getToolRoute(tool)}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-muted"
                              >
                                <span
                                  className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-lg",
                                    tool.accent
                                  )}
                                >
                                  <Icon className={cn("h-3.5 w-3.5", tool.accentText)} />
                                </span>
                                <span className="truncate text-xs font-semibold">{tool.name}</span>
                              </Link>
                            );
                          })
                        )}
                      </div>
                    ) : (
                      TOOL_GROUPS.map((group) => (
                        <div key={group.category} className="space-y-0.5">
                          <p className="px-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                            {group.category}
                          </p>
                          {group.tools.map((tool) => {
                            const Icon = tool.icon;
                            return (
                              <Link
                                key={tool.id}
                                to={getToolRoute(tool)}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-muted"
                              >
                                <span
                                  className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                                    tool.accent
                                  )}
                                >
                                  <Icon className={cn("h-3.5 w-3.5", tool.accentText)} />
                                </span>
                                <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                                  {tool.name}
                                </span>
                                {isAiTool(tool.id) && (
                                  <span className="shrink-0 rounded bg-fuchsia-500/10 px-1 py-0.5 text-[8px] font-bold text-fuchsia-600">
                                    AI
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Mobile Footer Auth Section */}
            <div className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1 py-1">
                    <UserIcon className="h-4 w-4 shrink-0 text-blue-600" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{user.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="h-9 w-full rounded-xl text-xs font-semibold text-destructive"
                  >
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => openAuthModal("login")}
                    variant="outline"
                    className="h-9 rounded-xl text-xs font-semibold"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => openAuthModal("register")}
                    className="h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-semibold text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  AppLead,
  fetchAllLeads,
  leadsLast7Days,
  leadsThisMonth,
  leadsToday,
  leadsYTD,
  repliesSentCount,
  savedLeadsCount,
  totalLeadsAllTime,
} from "@/lib/mockAppData";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "viewed", label: "Viewed" },
  { value: "saved", label: "Saved" },
  { value: "replied", label: "Replied" },
  { value: "ignored", label: "Ignored" },
  { value: "responded", label: "Responded" },
];

const dateAddedPresets = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "ytd", label: "YTD" },
];

const postDateOptions = [
  { value: "any", label: "Any" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "last90", label: "Last 90 days" },
];

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const deriveDateAddedStart = (preset: string, reference: Date) => {
  const now = new Date(reference);
  switch (preset) {
    case "today":
      return startOfDay(now);
    case "last7":
      {
        const cutoff = startOfDay(now);
        cutoff.setDate(cutoff.getDate() - 6);
        return cutoff;
      }
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "ytd":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
};

const derivePostDateCutoff = (option: string, reference: Date) => {
  if (option === "any") {
    return null;
  }
  const now = new Date(reference);
  const cutoff = new Date(now);
  const days = option === "last7" ? 6 : option === "last30" ? 29 : 89;
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
};

const statusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<AppLead[]>([]);
  const [projectFilter, setProjectFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateAddedPreset, setDateAddedPreset] = useState("all");
  const [postDateFilter, setPostDateFilter] = useState("any");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    void fetchAllLeads().then(setLeads);
  }, []);

  const platformOptions = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((lead) => {
      if (!map.has(lead.platformKey)) {
        map.set(lead.platformKey, lead.platformLabel);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [leads]);

  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((lead) => {
      if (!map.has(lead.projectId)) {
        map.set(lead.projectId, lead.projectName || lead.projectId);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const now = new Date();
    const dateAddedStart = deriveDateAddedStart(dateAddedPreset, now);
    const postDateCutoff = derivePostDateCutoff(postDateFilter, now);
    const searchValue = searchTerm.trim().toLowerCase();

    return [...leads]
      .filter((lead) => {
        if (projectFilter && lead.projectId !== projectFilter) {
          return false;
        }
        if (platformFilter && lead.platformKey !== platformFilter) {
          return false;
        }
        if (statusFilter && lead.status !== statusFilter) {
          return false;
        }
        if (dateAddedStart) {
          const added = new Date(lead.dateAdded);
          if (added < dateAddedStart || added > now) {
            return false;
          }
        }
        if (postDateCutoff) {
          if (!lead.postDate) {
            return false;
          }
          const postDate = new Date(lead.postDate);
          if (postDate < postDateCutoff || postDate > now) {
            return false;
          }
        }
        if (searchValue) {
          const haystack = [lead.title, lead.context, lead.whyQualifies, lead.why_qualifies]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(searchValue)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const addedDiff = new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        if (addedDiff !== 0) {
          return addedDiff;
        }
        const aPost = a.postDate ? new Date(a.postDate).getTime() : 0;
        const bPost = b.postDate ? new Date(b.postDate).getTime() : 0;
        return bPost - aPost;
      });
  }, [leads, projectFilter, platformFilter, statusFilter, dateAddedPreset, postDateFilter, searchTerm]);

  const resetFilters = () => {
    setProjectFilter("");
    setPlatformFilter("");
    setStatusFilter("");
    setDateAddedPreset("all");
    setPostDateFilter("any");
    setSearchTerm("");
  };

  const pageSizeOptions = [25, 50, 100];
  const resetPageCount = () => setPageCount(1);
  const handleProjectFilterChange = (value: string) => {
    setProjectFilter(value);
    resetPageCount();
  };
  const handlePlatformFilterChange = (value: string) => {
    setPlatformFilter(value);
    resetPageCount();
  };
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    resetPageCount();
  };
  const handleDateAddedChange = (value: string) => {
    setDateAddedPreset(value);
    resetPageCount();
  };
  const handlePostDateChange = (value: string) => {
    setPostDateFilter(value);
    resetPageCount();
  };
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetPageCount();
  };
  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    resetPageCount();
  };

  const pagedLeads = useMemo(() => {
    return filteredLeads.slice(0, pageSize * pageCount);
  }, [filteredLeads, pageSize, pageCount]);

  const metrics = [
    { label: "Total leads (all time)", value: totalLeadsAllTime() },
    { label: "Today", value: leadsToday() },
    { label: "Last 7 days", value: leadsLast7Days() },
    { label: "This month", value: leadsThisMonth() },
    { label: "YTD", value: leadsYTD() },
    { label: "Saved leads", value: savedLeadsCount() },
    { label: "Replies sent (manual)", value: repliesSentCount() },
  ];

  const hasLeads = leads.length > 0;

  return (
    <AppShell>
      <div className="container">
        <section className="hero-card">
          <header className="flex-between">
            <div>
              <h1>Leads</h1>
              <p className="muted">Every lead ever found across all projects.</p>
            </div>
          </header>
          <div className="metrics-row">
            {metrics.map((metric) => (
              <div key={metric.label} className="metrics-card">
                <p className="metric-label">{metric.label}</p>
                <p className="metric-value">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="filters-bar">
          <div className="filters-grid">
            <div className="field filter-control">
              <label htmlFor="project-filter">Project</label>
                <select
                  id="project-filter"
                  value={projectFilter}
                  onChange={(event) => handleProjectFilterChange(event.target.value)}
                >
                <option value="">All projects</option>
                {projectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field filter-control">
              <label htmlFor="platform-filter">Platform</label>
                <select
                  id="platform-filter"
                  value={platformFilter}
                  onChange={(event) => handlePlatformFilterChange(event.target.value)}
                >
                <option value="">All platforms</option>
                {platformOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field filter-control">
              <label htmlFor="status-filter">Status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => handleStatusFilterChange(event.target.value)}
                >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field filter-control">
              <label htmlFor="date-added-filter">Date added</label>
                <select
                  id="date-added-filter"
                  value={dateAddedPreset}
                  onChange={(event) => handleDateAddedChange(event.target.value)}
                >
                {dateAddedPresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field filter-control">
              <label htmlFor="post-date-filter">Post date</label>
                <select
                  id="post-date-filter"
                  value={postDateFilter}
                  onChange={(event) => handlePostDateChange(event.target.value)}
                >
                {postDateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field filter-control">
              <label htmlFor="page-size-select">Page size</label>
                <select
                  id="page-size-select"
                  value={pageSize}
                  onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="field filter-control search-control">
              <label className="sr-only" htmlFor="lead-search">
                Search leads
              </label>
                <input
                  id="lead-search"
                  type="search"
                  placeholder="Search title, context, why it qualifies"
                  value={searchTerm}
                  onChange={(event) => handleSearchChange(event.target.value)}
                />
            </div>
          </div>
          <button className="btn btn-outline filter-clear" onClick={resetFilters}>
            Clear filters
          </button>
        </section>

        {!hasLeads && (
          <div className="notice" style={{ marginTop: "16px" }}>
            <p>No leads found yet.</p>
            <Link className="btn btn-primary" href="/dashboard">
              Go to dashboard
            </Link>
          </div>
        )}

        {hasLeads && filteredLeads.length === 0 && (
          <div className="notice" style={{ marginTop: "16px" }}>
            <p>No leads match your filters.</p>
            <button className="btn btn-outline" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        )}

        {hasLeads && filteredLeads.length > 0 && (
          <>
            <section className="lead-list" style={{ marginTop: "24px" }}>
              {pagedLeads.map((lead) => (
                <article key={lead.id} className="lead-card lead-row">
                  <div className="lead-row-top">
                    <span className="platform-badge">{lead.platformLabel}</span>
                    <span className="status-pill">{statusLabel(lead.status)}</span>
                  </div>
                  <h3>{lead.title}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    {lead.projectName}
                  </p>
                  <p>{lead.whyQualifies || lead.why_qualifies}</p>
                  <div className="lead-meta">
                    <span>Date added: {new Date(lead.dateAdded).toLocaleDateString()}</span>
                    <span>
                      Post date: {lead.postDate ? new Date(lead.postDate).toLocaleDateString() : "—"}
                    </span>
                    <span>Status: {statusLabel(lead.status)}</span>
                  </div>
                  <div className="lead-actions">
                    {lead.canonicalUrl || lead.post_url ? (
                      <a
                        className="btn btn-outline"
                        href={lead.canonicalUrl || lead.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      <>
                        <button className="btn btn-outline" disabled>
                          View
                        </button>
                        <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
                          No link available
                        </p>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </section>
            {filteredLeads.length > pageSize * pageCount && (
              <div className="flex-between" style={{ marginTop: "16px" }}>
                <button className="btn btn-primary" onClick={() => setPageCount((prev) => prev + 1)}>
                  Load more
                </button>
                <p className="muted" style={{ margin: 0 }}>
                  Showing {pagedLeads.length} of {filteredLeads.length} leads
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

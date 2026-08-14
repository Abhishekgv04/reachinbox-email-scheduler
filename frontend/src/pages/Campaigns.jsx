import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  Plus,
  Search,
  Send,
  XCircle,
  ChevronDown,
} from "lucide-react";

import { Link } from "react-router-dom";

import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { getDashboardCampaigns } from "../services/dashboardApi";

const STATUS_OPTIONS = [
  "ALL",
  "DRAFT",
  "SCHEDULED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

function Campaigns() {
  const { user } = useAuth();

  const [campaigns, setCampaigns] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("ALL");

  useEffect(() => {
    if (user?.id) {
      loadCampaigns();
    }
  }, [user?.id]);

  async function loadCampaigns() {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError("");

      const data =
        await getDashboardCampaigns(
          user.id
        );

      setCampaigns(data);
    } catch (error) {
      console.error(
        "Campaign loading error:",
        error
      );

      setError(
        "Unable to load campaigns."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredCampaigns =
    useMemo(() => {
      return campaigns.filter(
        (campaign) => {
          const matchesSearch =
            campaign.subject
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesStatus =
            status === "ALL" ||
            campaign.status === status;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      campaigns,
      search,
      status,
    ]);

  return (
    <Layout>
      <div className="min-h-full bg-[#f7f8fc] p-6 sm:p-8">

        {/* PAGE HEADER */}

        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>

            <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-zinc-500">
              CAMPAIGN MANAGEMENT
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Campaigns
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Create, schedule and manage your email campaigns.
            </p>

          </div>

          <Link
            to="/campaigns/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            <Plus size={17} />
            New Campaign
          </Link>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* MAIN CARD */}

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">

          {/* SEARCH / FILTER */}

          <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 md:flex-row">

            {/* SEARCH */}

            <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 focus-within:border-zinc-400">

              <Search
                size={16}
                className="shrink-0 text-zinc-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search campaigns..."
                className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />

            </div>

            {/* STATUS */}

            <div className="relative">

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="h-10 appearance-none rounded-lg border border-zinc-200 bg-white py-0 pl-3 pr-9 text-sm text-zinc-700 outline-none focus:border-zinc-400"
              >

                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ===
                      "ALL"
                        ? "All Status"
                        : option}
                    </option>
                  )
                )}

              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

            </div>

          </div>

          {/* TABLE HEADER */}

          <div className="hidden grid-cols-[2.5fr_1fr_1fr_1fr] bg-zinc-50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 md:grid">

            <div>Campaign</div>

            <div>Status</div>

            <div>Emails</div>

            <div>Created</div>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="px-5 py-14 text-center">

              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-800" />

              <p className="text-sm text-zinc-500">
                Loading campaigns...
              </p>

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            filteredCampaigns.length ===
              0 && (
              <div className="px-5 py-16 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">

                  <Mail
                    size={22}
                    className="text-zinc-400"
                  />

                </div>

                <h3 className="mt-4 text-sm font-semibold text-zinc-800">
                  No campaigns found
                </h3>

                <p className="mt-1 text-xs text-zinc-400">
                  Try changing your search or create a new campaign.
                </p>

              </div>
            )}

          {/* CAMPAIGNS */}

          {!loading &&
            filteredCampaigns.map(
              (campaign) => (
                <CampaignRow
                  key={campaign.id}
                  campaign={campaign}
                />
              )
            )}

        </div>

        {/* RESULT COUNT */}

        {!loading &&
          filteredCampaigns.length >
            0 && (
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">

              <span>
                Showing{" "}
                <span className="font-semibold text-zinc-600">
                  {
                    filteredCampaigns.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-zinc-600">
                  {campaigns.length}
                </span>{" "}
                campaigns
              </span>

            </div>
          )}

      </div>
    </Layout>
  );
}


/* =========================================
   CAMPAIGN ROW
========================================= */

function CampaignRow({
  campaign,
}) {
  const jobs =
    campaign.emailJobs || [];

  const sent = jobs.filter(
    (job) =>
      job.status === "SENT"
  ).length;

  const failed = jobs.filter(
    (job) =>
      job.status === "FAILED"
  ).length;

  const pending = jobs.filter(
    (job) =>
      job.status === "PENDING" ||
      job.status === "PROCESSING"
  ).length;

  const status =
    getStatusStyle(
      campaign.status
    );

  const createdDate =
    campaign.createdAt
      ? new Date(
          campaign.createdAt
        ).toLocaleDateString(
          "en-IN"
        )
      : "-";

  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      className="grid gap-4 border-t border-zinc-100 px-5 py-5 transition hover:bg-zinc-50 md:grid-cols-[2.5fr_1fr_1fr_1fr] md:items-center"
    >

      {/* CAMPAIGN */}

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">

          <Send
            size={17}
            className="text-zinc-600"
          />

        </div>

        <div className="min-w-0">

          <p className="truncate text-sm font-semibold text-zinc-900">
            {campaign.subject}
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            {jobs.length}{" "}
            {jobs.length === 1
              ? "recipient"
              : "recipients"}
          </p>

        </div>

      </div>

      {/* STATUS */}

      <div>

        <span
          className={`inline-flex rounded-md px-2 py-1 text-[9px] font-bold ${status.className}`}
        >
          {status.label}
        </span>

      </div>

      {/* EMAILS */}

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-1.5 text-xs text-zinc-500">

          <CheckCircle2
            size={14}
            className="text-emerald-500"
          />

          {sent}

        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500">

          <Clock3
            size={14}
            className="text-zinc-400"
          />

          {pending}

        </div>

        {failed > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-red-500">

            <XCircle size={14} />

            {failed}

          </div>
        )}

      </div>

      {/* CREATED */}

      <div className="flex items-center justify-between md:justify-start">

        <span className="text-xs text-zinc-500">
          {createdDate}
        </span>

        <ArrowRight
          size={15}
          className="text-zinc-300 md:hidden"
        />

      </div>

    </Link>
  );
}


/* =========================================
   STATUS STYLE
========================================= */

function getStatusStyle(status) {
  switch (status) {
    case "COMPLETED":
      return {
        label: "COMPLETED",
        className:
          "bg-emerald-50 text-emerald-700",
      };

    case "SCHEDULED":
      return {
        label: "SCHEDULED",
        className:
          "bg-blue-50 text-blue-700",
      };

    case "PROCESSING":
      return {
        label: "PROCESSING",
        className:
          "bg-amber-50 text-amber-700",
      };

    case "FAILED":
      return {
        label: "FAILED",
        className:
          "bg-red-50 text-red-700",
      };

    case "CANCELLED":
      return {
        label: "CANCELLED",
        className:
          "bg-zinc-100 text-zinc-600",
      };

    default:
      return {
        label: "DRAFT",
        className:
          "bg-zinc-100 text-zinc-600",
      };
  }
}

export default Campaigns;
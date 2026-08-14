import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  Plus,
  Send,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { getDashboardCampaigns } from "../services/dashboardApi";

function Dashboard() {
  const { user } = useAuth();

  const [campaigns, setCampaigns] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadCampaigns() {
      if (!user?.id) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getDashboardCampaigns(
            user.id
          );

        setCampaigns(data);
      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      loadCampaigns();
    }
  }, [user?.id]);

  const statistics = useMemo(() => {
    let totalEmails = 0;
    let sentEmails = 0;
    let failedEmails = 0;
    let pendingEmails = 0;

    campaigns.forEach(
      (campaign) => {
        campaign.emailJobs?.forEach(
          (job) => {
            totalEmails += 1;

            if (
              job.status === "SENT"
            ) {
              sentEmails += 1;
            }

            if (
              job.status === "FAILED"
            ) {
              failedEmails += 1;
            }

            if (
              job.status === "PENDING" ||
              job.status === "PROCESSING"
            ) {
              pendingEmails += 1;
            }
          }
        );
      }
    );

    return {
      campaigns:
        campaigns.length,

      totalEmails,

      sentEmails,

      failedEmails,

      pendingEmails,
    };
  }, [campaigns]);

  return (
    <Layout>
      <div className="min-h-full bg-[#f7f8fc] p-6 sm:p-8">

        {/* Header */}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-zinc-500">
              OVERVIEW
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Monitor your email campaigns and sending activity.
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

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Campaigns */}

          <div className="rounded-xl border border-zinc-200 bg-white p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
                <Send
                  size={17}
                  className="text-zinc-700"
                />
              </div>

              <p className="text-sm text-zinc-500">
                Campaigns
              </p>

            </div>

            <h2 className="mt-5 text-3xl font-bold text-zinc-900">
              {loading
                ? "—"
                : statistics.campaigns}
            </h2>

            <p className="mt-1 text-xs text-zinc-400">
              Total campaigns
            </p>

          </div>

          {/* Emails */}

          <div className="rounded-xl border border-zinc-200 bg-white p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
                <Mail
                  size={17}
                  className="text-zinc-700"
                />
              </div>

              <p className="text-sm text-zinc-500">
                Emails
              </p>

            </div>

            <h2 className="mt-5 text-3xl font-bold text-zinc-900">
              {loading
                ? "—"
                : statistics.totalEmails}
            </h2>

            <p className="mt-1 text-xs text-zinc-400">
              Total email jobs
            </p>

          </div>

          {/* Sent */}

          <div className="rounded-xl border border-zinc-200 bg-white p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2
                  size={17}
                  className="text-emerald-600"
                />
              </div>

              <p className="text-sm text-zinc-500">
                Sent
              </p>

            </div>

            <h2 className="mt-5 text-3xl font-bold text-emerald-600">
              {loading
                ? "—"
                : statistics.sentEmails}
            </h2>

            <p className="mt-1 text-xs text-zinc-400">
              Successfully delivered
            </p>

          </div>

          {/* Failed */}

          <div className="rounded-xl border border-zinc-200 bg-white p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                <XCircle
                  size={17}
                  className="text-red-600"
                />
              </div>

              <p className="text-sm text-zinc-500">
                Failed
              </p>

            </div>

            <h2 className="mt-5 text-3xl font-bold text-red-600">
              {loading
                ? "—"
                : statistics.failedEmails}
            </h2>

            <p className="mt-1 text-xs text-zinc-400">
              Failed email jobs
            </p>

          </div>

        </div>

        {/* Recent Campaigns */}

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">

          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-5">

            <div>

              <h2 className="text-base font-bold text-zinc-900">
                Recent Campaigns
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Your latest email campaigns
              </p>

            </div>

            <Link
              to="/campaigns"
              className="flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-900"
            >
              View all
              <ArrowRight size={14} />
            </Link>

          </div>

          {/* Loading */}

          {loading && (
            <div className="px-5 py-12 text-center text-sm text-zinc-500">
              Loading campaigns...
            </div>
          )}

          {/* Empty */}

          {!loading &&
            campaigns.length ===
              0 && (
              <div className="px-5 py-12 text-center">

                <Mail
                  size={28}
                  className="mx-auto text-zinc-300"
                />

                <p className="mt-3 text-sm font-medium text-zinc-700">
                  No campaigns yet
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Create your first email campaign.
                </p>

              </div>
            )}

          {/* Campaign list */}

          {!loading &&
            campaigns.length > 0 && (
              <div>

                {campaigns
                  .slice(0, 5)
                  .map(
                    (campaign) => (
                      <CampaignRow
                        key={
                          campaign.id
                        }
                        campaign={
                          campaign
                        }
                      />
                    )
                  )}

              </div>
            )}

        </div>

      </div>
    </Layout>
  );
}


/* ========================================
   CAMPAIGN ROW
======================================== */

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

  const getStatus = () => {
    if (
      campaign.status ===
      "COMPLETED"
    ) {
      return {
        label: "COMPLETED",
        className:
          "bg-emerald-50 text-emerald-700",
      };
    }

    if (
      campaign.status ===
      "FAILED"
    ) {
      return {
        label: "FAILED",
        className:
          "bg-red-50 text-red-700",
      };
    }

    if (
      campaign.status ===
      "SCHEDULED"
    ) {
      return {
        label: "SCHEDULED",
        className:
          "bg-blue-50 text-blue-700",
      };
    }

    if (
      campaign.status ===
      "PROCESSING"
    ) {
      return {
        label: "PROCESSING",
        className:
          "bg-amber-50 text-amber-700",
      };
    }

    return {
      label:
        campaign.status ||
        "DRAFT",
      className:
        "bg-zinc-100 text-zinc-600",
    };
  };

  const status = getStatus();

  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      className="grid gap-4 border-t border-zinc-100 px-5 py-5 transition hover:bg-zinc-50 sm:grid-cols-[2.5fr_1fr_1fr_1fr]"
    >

      {/* Name */}

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">

          <Send
            size={16}
            className="text-zinc-600"
          />

        </div>

        <div className="min-w-0">

          <p className="truncate text-sm font-semibold text-zinc-900">
            {campaign.subject}
          </p>

          <p className="mt-1 text-[11px] text-zinc-400">
            {jobs.length} recipients
          </p>

        </div>

      </div>

      {/* Status */}

      <div className="flex items-center">

        <span
          className={`rounded-md px-2 py-1 text-[9px] font-bold ${status.className}`}
        >
          {status.label}
        </span>

      </div>

      {/* Sent */}

      <div className="flex items-center gap-2 text-xs text-zinc-500">

        <CheckCircle2
          size={14}
          className="text-emerald-500"
        />

        {sent} sent

      </div>

      {/* Pending / Failed */}

      <div className="flex items-center gap-3 text-xs text-zinc-500">

        {failed > 0 ? (
          <>
            <XCircle
              size={14}
              className="text-red-500"
            />

            {failed} failed
          </>
        ) : (
          <>
            <Clock3
              size={14}
              className="text-zinc-400"
            />

            {pending} pending
          </>
        )}

      </div>

    </Link>
  );
}

export default Dashboard;
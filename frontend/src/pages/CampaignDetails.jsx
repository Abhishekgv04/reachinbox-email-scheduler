import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  XCircle,
  Play,
  Ban,
  Mail,
  RefreshCw,
} from "lucide-react";

import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

import {
  getCampaignById,
  startCampaign,
  cancelCampaign,
} from "../services/campaignApi";

function CampaignDetails() {
  const { id } = useParams();

  const { user } = useAuth();

  const [campaign, setCampaign] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================
  // LOAD CAMPAIGN
  // ========================================

  async function loadCampaign() {
    if (!user?.id || !id) return;

    try {
      setLoading(true);
      setError("");

      const data =
        await getCampaignById(
          id,
          user.id
        );

      setCampaign(data);
    } catch (error) {
      console.error(
        "Campaign details error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load campaign."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.id && id) {
      loadCampaign();
    }
  }, [id, user?.id]);

  // ========================================
  // START CAMPAIGN
  // ========================================

  async function handleStart() {
    if (!user?.id || !id) return;

    try {
      setActionLoading(true);
      setError("");

      const updatedCampaign =
        await startCampaign(
          id,
          user.id
        );

      setCampaign(updatedCampaign);
    } catch (error) {
      console.error(
        "Start campaign error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to start campaign."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ========================================
  // CANCEL CAMPAIGN
  // ========================================

  async function handleCancel() {
    if (!user?.id || !id) return;

    try {
      setActionLoading(true);
      setError("");

      const updatedCampaign =
        await cancelCampaign(
          id,
          user.id
        );

      setCampaign(updatedCampaign);
    } catch (error) {
      console.error(
        "Cancel campaign error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to cancel campaign."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <RefreshCw
              size={18}
              className="animate-spin"
            />

            Loading campaign...
          </div>
        </div>
      </Layout>
    );
  }

  // ========================================
  // CAMPAIGN NOT FOUND
  // ========================================

  if (!campaign) {
    return (
      <Layout>
        <div className="p-8">

          <Link
            to="/campaigns"
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeft size={16} />

            Back to campaigns
          </Link>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error ||
              "Campaign not found."}
          </div>

        </div>
      </Layout>
    );
  }

  // ========================================
  // CALCULATE STATISTICS
  // ========================================

  const jobs =
    campaign.emailJobs || [];

  const total = jobs.length;

  const sent = jobs.filter(
    (job) => job.status === "SENT"
  ).length;

  const failed = jobs.filter(
    (job) =>
      job.status === "FAILED"
  ).length;

  const pending = jobs.filter(
    (job) =>
      job.status === "PENDING"
  ).length;

  const processing = jobs.filter(
    (job) =>
      job.status === "PROCESSING"
  ).length;

  const progress =
    total === 0
      ? 0
      : Math.round(
          (sent / total) * 100
        );

  // ========================================
  // BUTTON CONDITIONS
  // ========================================

  const canStart =
    campaign.status === "DRAFT";

  const canCancel =
    campaign.status ===
      "SCHEDULED" ||
    campaign.status ===
      "PROCESSING";

  // ========================================
  // PAGE
  // ========================================

  return (
    <Layout>
      <div className="min-h-full bg-[#f7f8fc] p-6 sm:p-8">

        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div className="flex items-start gap-4">

            <Link
              to="/campaigns"
              className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>

              <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-zinc-500">
                CAMPAIGN DETAILS
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                {campaign.subject}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Campaign ID:{" "}
                {campaign.id}
              </p>

            </div>

          </div>

          {/* ACTION BUTTONS */}

          <div className="flex gap-2">

            {canStart && (
              <button
                onClick={handleStart}
                disabled={
                  actionLoading
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play size={15} />

                {actionLoading
                  ? "Starting..."
                  : "Start Campaign"}
              </button>
            )}

            {canCancel && (
              <button
                onClick={
                  handleCancel
                }
                disabled={
                  actionLoading
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Ban size={15} />

                {actionLoading
                  ? "Cancelling..."
                  : "Cancel Campaign"}
              </button>
            )}

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STATUS + PROGRESS */}

        <div className="mb-6 grid gap-5 lg:grid-cols-3">

          {/* STATUS */}

          <div className="rounded-xl border border-zinc-200 bg-white p-5">

            <div className="mb-4 flex items-center justify-between">

              <span className="text-xs font-semibold text-zinc-500">
                STATUS
              </span>

              <StatusBadge
                status={
                  campaign.status
                }
              />

            </div>

            <p className="text-sm text-zinc-500">
              Current campaign state
            </p>

          </div>

          {/* PROGRESS */}

          <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-2">

            <div className="mb-3 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-zinc-500">
                  DELIVERY PROGRESS
                </p>

                <p className="mt-1 text-sm text-zinc-900">
                  {sent} of {total}{" "}
                  emails sent
                </p>

              </div>

              <span className="text-xl font-bold text-zinc-900">
                {progress}%
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">

              <div
                className="h-full rounded-full bg-zinc-900 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* STATISTICS */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <Stat
            label="Total"
            value={total}
            icon={
              <Mail size={17} />
            }
          />

          <Stat
            label="Sent"
            value={sent}
            icon={
              <CheckCircle2
                size={17}
              />
            }
          />

          <Stat
            label="Pending"
            value={
              pending +
              processing
            }
            icon={
              <Clock3 size={17} />
            }
          />

          <Stat
            label="Failed"
            value={failed}
            icon={
              <XCircle size={17} />
            }
          />

        </div>

        {/* CAMPAIGN INFORMATION */}

        <div className="mb-6 grid gap-6 lg:grid-cols-2">

          {/* EMAIL CONTENT */}

          <div className="rounded-xl border border-zinc-200 bg-white">

            <div className="border-b border-zinc-200 p-5">

              <h2 className="text-base font-semibold text-zinc-900">
                Email Content
              </h2>

            </div>

            <div className="p-5">

              <p className="mb-2 text-xs font-semibold text-zinc-500">
                SUBJECT
              </p>

              <p className="mb-5 text-sm font-medium text-zinc-900">
                {campaign.subject}
              </p>

              <p className="mb-2 text-xs font-semibold text-zinc-500">
                BODY
              </p>

              <div className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                {campaign.body}
              </div>

            </div>

          </div>

          {/* CAMPAIGN SETTINGS */}

          <div className="rounded-xl border border-zinc-200 bg-white">

            <div className="border-b border-zinc-200 p-5">

              <h2 className="text-base font-semibold text-zinc-900">
                Campaign Settings
              </h2>

            </div>

            <div className="divide-y divide-zinc-100">

              <InfoRow
                label="Start Time"
                value={formatDate(
                  campaign.startAt
                )}
              />

              <InfoRow
                label="Delay"
                value={`${campaign.delaySeconds} seconds`}
              />

              <InfoRow
                label="Hourly Limit"
                value={`${campaign.hourlyLimit} emails/hour`}
              />

              <InfoRow
                label="Recipients"
                value={`${total} recipients`}
              />

            </div>

          </div>

        </div>

        {/* RECIPIENT DELIVERY */}

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">

          <div className="border-b border-zinc-200 p-5">

            <h2 className="text-base font-semibold text-zinc-900">
              Recipient Delivery
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Track the delivery status of every recipient.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-zinc-50">

                <tr className="border-b border-zinc-200">

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                    Recipient
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                    Attempts
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                    Sent At
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                    Error
                  </th>

                </tr>

              </thead>

              <tbody>

                {jobs.map(
                  (job) => (
                    <tr
                      key={job.id}
                      className="border-b border-zinc-100 last:border-0"
                    >

                      <td className="px-5 py-4 text-sm font-medium text-zinc-800">
                        {
                          job.recipientEmail
                        }
                      </td>

                      <td className="px-5 py-4">

                        <StatusBadge
                          status={
                            job.status
                          }
                        />

                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-500">
                        {job.attempts}
                      </td>

                      <td className="px-5 py-4 text-xs text-zinc-500">
                        {job.sentAt
                          ? formatDate(
                              job.sentAt
                            )
                          : "—"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-xs text-red-500">
                        {job.errorMessage ||
                          "—"}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </Layout>
  );
}


/* ========================================
   STAT COMPONENT
======================================== */

function Stat({
  label,
  value,
  icon,
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">

      <div className="flex items-center gap-2 text-zinc-500">

        {icon}

        <span className="text-xs font-medium">
          {label}
        </span>

      </div>

      <p className="mt-4 text-2xl font-bold text-zinc-900">
        {value}
      </p>

    </div>
  );
}


/* ========================================
   INFO ROW COMPONENT
======================================== */

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">

      <span className="text-xs text-zinc-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-zinc-800">
        {value}
      </span>

    </div>
  );
}


/* ========================================
   STATUS BADGE
======================================== */

function StatusBadge({
  status,
}) {
  const styles = {
    DRAFT:
      "bg-zinc-100 text-zinc-600",

    SCHEDULED:
      "bg-blue-50 text-blue-700",

    PROCESSING:
      "bg-amber-50 text-amber-700",

    COMPLETED:
      "bg-emerald-50 text-emerald-700",

    FAILED:
      "bg-red-50 text-red-700",

    CANCELLED:
      "bg-zinc-100 text-zinc-600",
  };

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold ${
        styles[status] ||
        styles.DRAFT
      }`}
    >
      {status}
    </span>
  );
}


/* ========================================
   DATE FORMATTER
======================================== */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString();
}

export default CampaignDetails;
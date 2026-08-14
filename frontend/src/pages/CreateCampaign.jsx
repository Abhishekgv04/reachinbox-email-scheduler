import { useEffect, useState } from "react";
import { ArrowLeft, Send, Plus, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { getSenders } from "../services/senderApi";
import { createCampaign } from "../services/campaignApi";

function CreateCampaign() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [senders, setSenders] =
    useState([]);

  const [loadingSenders, setLoadingSenders] =
    useState(true);

  const [subject, setSubject] =
    useState("");

  const [body, setBody] =
    useState("");

  const [senderId, setSenderId] =
    useState("");

  const [recipientInput, setRecipientInput] =
    useState("");

  const [recipients, setRecipients] =
    useState([]);

  const [startAt, setStartAt] =
    useState("");

  const [delaySeconds, setDelaySeconds] =
    useState(2);

  const [hourlyLimit, setHourlyLimit] =
    useState(200);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ========================================
  // LOAD SENDERS
  // ========================================

  useEffect(() => {
    async function loadSenders() {
      if (!user?.id) return;

      try {
        setLoadingSenders(true);

        const data =
          await getSenders(user.id);

        setSenders(data);

        if (data.length > 0) {
          setSenderId(data[0].id);
        }
      } catch (error) {
        console.error(
          "Sender loading error:",
          error
        );

        setError(
          "Unable to load senders."
        );
      } finally {
        setLoadingSenders(false);
      }
    }

    if (user?.id) {
      loadSenders();
    }
  }, [user?.id]);

  // ========================================
  // ADD RECIPIENT
  // ========================================

  function addRecipient() {
    const email =
      recipientInput
        .trim()
        .toLowerCase();

    if (!email) {
      return;
    }

    if (!isValidEmail(email)) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    if (recipients.includes(email)) {
      setError(
        "This recipient has already been added."
      );

      return;
    }

    setRecipients((prev) => [
      ...prev,
      email,
    ]);

    setRecipientInput("");
    setError("");
  }

  // ========================================
  // REMOVE RECIPIENT
  // ========================================

  function removeRecipient(email) {
    setRecipients((prev) =>
      prev.filter(
        (recipient) =>
          recipient !== email
      )
    );
  }

  // ========================================
  // ENTER KEY
  // ========================================

  function handleRecipientKeyDown(
    event
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      addRecipient();
    }
  }

  // ========================================
  // CREATE CAMPAIGN
  // ========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!user?.id) {
      setError(
        "You are not authenticated. Please sign in again."
      );

      return;
    }

    if (!subject.trim()) {
      setError(
        "Campaign subject is required."
      );

      return;
    }

    if (!body.trim()) {
      setError(
        "Email body is required."
      );

      return;
    }

    if (!senderId) {
      setError(
        "Please select a sender."
      );

      return;
    }

    if (recipients.length === 0) {
      setError(
        "Please add at least one recipient."
      );

      return;
    }

    if (!startAt) {
      setError(
        "Please select a start date and time."
      );

      return;
    }

    try {
      setLoading(true);

      const campaign =
        await createCampaign(
          {
            senderId,

            subject:
              subject.trim(),

            body:
              body.trim(),

            startAt:
              new Date(
                startAt
              ).toISOString(),

            delaySeconds:
              Number(
                delaySeconds
              ),

            hourlyLimit:
              Number(
                hourlyLimit
              ),

            recipients,
          },
          user.id
        );

      console.log(
        "Campaign created:",
        campaign
      );

      setSuccess(
        "Campaign created successfully."
      );

      setTimeout(() => {
        navigate(
          `/campaigns/${campaign.id}`
        );
      }, 700);

    } catch (error) {
      console.error(
        "Create campaign error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create campaign."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-full bg-[#f7f8fc] p-6 sm:p-8">

        {/* HEADER */}

        <div className="mb-7 flex items-start gap-4">

          <Link
            to="/campaigns"
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>

            <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-zinc-500">
              CAMPAIGN MANAGEMENT
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Create Campaign
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Create and schedule a new email campaign.
            </p>

          </div>

        </div>

        {/* MESSAGES */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-4xl"
        >

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">

            {/* BASIC DETAILS */}

            <div className="border-b border-zinc-200 p-6">

              <h2 className="text-base font-semibold text-zinc-900">
                Campaign Details
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Configure the content and sender for your campaign.
              </p>

              <div className="mt-6 space-y-5">

                {/* SUBJECT */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-zinc-700">
                    Subject
                  </label>

                  <input
                    type="text"
                    value={subject}
                    onChange={(e) =>
                      setSubject(
                        e.target.value
                      )
                    }
                    placeholder="Enter email subject..."
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400"
                  />

                </div>

                {/* BODY */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-zinc-700">
                    Email Body
                  </label>

                  <textarea
                    value={body}
                    onChange={(e) =>
                      setBody(
                        e.target.value
                      )
                    }
                    placeholder="Write your email content..."
                    rows={8}
                    className="w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400"
                  />

                </div>

                {/* SENDER */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-zinc-700">
                    Sender
                  </label>

                  <select
                    value={senderId}
                    onChange={(e) =>
                      setSenderId(
                        e.target.value
                      )
                    }
                    disabled={
                      loadingSenders
                    }
                    className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                  >

                    <option value="">
                      {loadingSenders
                        ? "Loading senders..."
                        : "Select a sender"}
                    </option>

                    {senders.map(
                      (sender) => (
                        <option
                          key={sender.id}
                          value={sender.id}
                        >
                          {sender.name} —{" "}
                          {sender.email}
                        </option>
                      )
                    )}

                  </select>

                  {!loadingSenders &&
                    senders.length ===
                      0 && (
                      <p className="mt-2 text-xs text-red-500">
                        No senders available. Please add a sender first.
                      </p>
                    )}

                </div>

              </div>

            </div>

            {/* RECIPIENTS */}

            <div className="border-b border-zinc-200 p-6">

              <h2 className="text-base font-semibold text-zinc-900">
                Recipients
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Add the email addresses that should receive this campaign.
              </p>

              <div className="mt-5 flex gap-2">

                <input
                  type="email"
                  value={recipientInput}
                  onChange={(e) =>
                    setRecipientInput(
                      e.target.value
                    )
                  }
                  onKeyDown={
                    handleRecipientKeyDown
                  }
                  placeholder="recipient@example.com"
                  className="h-11 flex-1 rounded-lg border border-zinc-200 px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400"
                />

                <button
                  type="button"
                  onClick={
                    addRecipient
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  <Plus size={16} />
                  Add
                </button>

              </div>

              {recipients.length >
                0 && (
                <div className="mt-4 flex flex-wrap gap-2">

                  {recipients.map(
                    (email) => (
                      <div
                        key={email}
                        className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-700"
                      >

                        <span>
                          {email}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeRecipient(
                              email
                            )
                          }
                          className="text-zinc-400 transition hover:text-red-500"
                        >
                          <X
                            size={14}
                          />
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

              <p className="mt-3 text-xs text-zinc-400">
                {recipients.length}{" "}
                {recipients.length ===
                1
                  ? "recipient"
                  : "recipients"}{" "}
                added
              </p>

            </div>

            {/* SCHEDULING */}

            <div className="p-6">

              <h2 className="text-base font-semibold text-zinc-900">
                Scheduling
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Control when and how quickly emails are sent.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-3">

                {/* START AT */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-zinc-700">
                    Start Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) =>
                      setStartAt(
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                  />

                </div>

                {/* DELAY */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-zinc-700">
                    Delay Between Emails
                  </label>

                  <div className="relative">

                    <input
                      type="number"
                      min="1"
                      value={
                        delaySeconds
                      }
                      onChange={(e) =>
                        setDelaySeconds(
                          e.target.value
                        )
                      }
                      className="h-11 w-full rounded-lg border border-zinc-200 px-3 pr-16 text-sm outline-none focus:border-zinc-400"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                      seconds
                    </span>

                  </div>

                </div>

                {/* HOURLY LIMIT */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-zinc-700">
                    Hourly Limit
                  </label>

                  <div className="relative">

                    <input
                      type="number"
                      min="1"
                      value={
                        hourlyLimit
                      }
                      onChange={(e) =>
                        setHourlyLimit(
                          e.target.value
                        )
                      }
                      className="h-11 w-full rounded-lg border border-zinc-200 px-3 pr-16 text-sm outline-none focus:border-zinc-400"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                      emails/hr
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 bg-zinc-50 p-5 sm:flex-row sm:justify-end">

              <Link
                to="/campaigns"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={16} />

                {loading
                  ? "Creating..."
                  : "Create Campaign"}
              </button>

            </div>

          </div>

        </form>

      </div>
    </Layout>
  );
}

// ========================================
// EMAIL VALIDATION
// ========================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export default CreateCampaign;
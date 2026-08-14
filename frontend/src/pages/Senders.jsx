import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Edit3,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Server,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

import {
  getSenders,
  createSender,
  updateSender,
  deleteSender,
  testSmtpConnection,
  testExistingSender,
} from "../services/senderApi";

function Senders() {
  const { user } = useAuth();

  const [senders, setSenders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [editingSender, setEditingSender] =
    useState(null);

  const [testing, setTesting] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [testingId, setTestingId] =
    useState(null);

  const [message, setMessage] =
    useState(null);

  /*
   * Load senders for the
   * currently authenticated user.
   */
  useEffect(() => {
    if (user?.id) {
      loadSenders();
    }
  }, [user?.id]);

  async function loadSenders() {
    if (!user?.id) return;

    try {
      setLoading(true);

      const data =
        await getSenders(user.id);

      setSenders(data);
    } catch (error) {
      console.error(
        "Load senders error:",
        error
      );

      showMessage(
        "error",
        "Unable to load senders."
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingSender(null);
    setShowModal(true);
  }

  function openEditModal(sender) {
    setEditingSender(sender);
    setShowModal(true);
  }

  function closeModal() {
    if (saving || testing) return;

    setShowModal(false);
    setEditingSender(null);
  }

  async function handleSave(formData) {
    try {
      setSaving(true);
      setMessage(null);

      if (editingSender) {
        await updateSender(
  editingSender.id,
  user.id,
  formData
);

        showMessage(
          "success",
          "Sender updated successfully."
        );
      } else {
        await createSender({
          ...formData,
          userId: user.id,
        });

        showMessage(
          "success",
          "Sender created successfully."
        );
      }

      setShowModal(false);
      setEditingSender(null);

      await loadSenders();
    } catch (error) {
      console.error(
        "Save sender error:",
        error
      );

      showMessage(
        "error",
        error.response?.data?.message ||
          "Failed to save sender."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleTest(formData) {
    try {
      setTesting(true);

      await testSmtpConnection(formData);

      showMessage(
        "success",
        "SMTP connection successful."
      );

      return true;
    } catch (error) {
      console.error(
        "SMTP test error:",
        error
      );

      showMessage(
        "error",
        error.response?.data?.message ||
          "SMTP connection failed."
      );

      throw error;
    } finally {
      setTesting(false);
    }
  }

  async function handleTestExisting(
    senderId
  ) {
    if (!user?.id) return;

    try {
      setTestingId(senderId);
      setMessage(null);

      await testExistingSender(
        senderId,
        user.id
      );

      showMessage(
        "success",
        "SMTP connection successful."
      );
    } catch (error) {
      console.error(
        "Existing SMTP test error:",
        error
      );

      showMessage(
        "error",
        error.response?.data?.message ||
          "SMTP connection failed."
      );
    } finally {
      setTestingId(null);
    }
  }

  async function handleDelete(sender) {
    const confirmed =
      window.confirm(
        `Delete "${sender.name}"?`
      );

    if (!confirmed) return;

    if (!user?.id) return;

    try {
      setDeletingId(sender.id);
      setMessage(null);

      await deleteSender(
        sender.id,
        user.id
      );

      showMessage(
        "success",
        "Sender deleted successfully."
      );

      await loadSenders();
    } catch (error) {
      console.error(
        "Delete sender error:",
        error
      );

      showMessage(
        "error",
        error.response?.data?.message ||
          "Failed to delete sender."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function showMessage(
    type,
    text
  ) {
    setMessage({
      type,
      text,
    });

    setTimeout(() => {
      setMessage(null);
    }, 4000);
  }

  /*
   * Wait for authentication.
   */
  if (!user) {
    return (
      <Layout>
        <div className="flex min-h-full items-center justify-center bg-[#f7f8fc] p-6">
          <Loader2
            size={25}
            className="animate-spin text-zinc-400"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-full bg-[#f7f8fc] p-6 sm:p-8">

        {/* HEADER */}

        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-zinc-500">
              SENDER MANAGEMENT
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Senders
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Manage your email sending accounts.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={loadSenders}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              <Plus size={17} />

              Add Sender
            </button>

          </div>

        </div>

        {/* MESSAGE */}

        {message && (
          <div
            className={`mb-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
              message.type ===
              "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type ===
            "success" ? (
              <CheckCircle2
                size={17}
              />
            ) : (
              <XCircle size={17} />
            )}

            {message.text}
          </div>
        )}

        {/* INFO CARD */}

        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5">

          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
              <Server
                size={18}
                className="text-zinc-600"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Sending accounts
              </h2>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Connect your SMTP accounts to send campaign emails.
                SMTP passwords are stored only on the backend and
                are never displayed here.
              </p>
            </div>

          </div>

        </div>

        {/* SENDERS CARD */}

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">

          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-5">

            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                All Senders
              </h2>

              <p className="mt-1 text-xs text-zinc-400">
                {senders.length}{" "}
                {senders.length === 1
                  ? "sending account"
                  : "sending accounts"}
              </p>
            </div>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">

              <Loader2
                size={25}
                className="animate-spin text-zinc-400"
              />

              <p className="mt-3 text-sm text-zinc-500">
                Loading senders...
              </p>

            </div>
          ) : senders.length === 0 ? (
            <EmptyState
              onAdd={openAddModal}
            />
          ) : (
            <div>

              {/* DESKTOP HEADER */}

              <div className="hidden grid-cols-[2fr_2.5fr_1.5fr_1fr] bg-zinc-50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 md:grid">

                <div>Sender</div>
                <div>Email</div>
                <div>SMTP</div>
                <div>Actions</div>

              </div>

              {senders.map(
                (sender) => (
                  <SenderRow
                    key={sender.id}
                    sender={sender}
                    onEdit={
                      openEditModal
                    }
                    onDelete={
                      handleDelete
                    }
                    onTest={
                      handleTestExisting
                    }
                    deleting={
                      deletingId ===
                      sender.id
                    }
                    testing={
                      testingId ===
                      sender.id
                    }
                  />
                )
              )}

            </div>
          )}

        </div>

      </div>

      {/* MODAL */}

      {showModal && (
        <SenderModal
          sender={editingSender}
          saving={saving}
          testing={testing}
          onClose={closeModal}
          onSave={handleSave}
          onTest={handleTest}
        />
      )}

    </Layout>
  );
}


/* =========================================
   SENDER ROW
========================================= */

function SenderRow({
  sender,
  onEdit,
  onDelete,
  onTest,
  deleting,
  testing,
}) {
  return (
    <div className="grid gap-4 border-t border-zinc-100 px-5 py-5 md:grid-cols-[2fr_2.5fr_1.5fr_1fr] md:items-center">

      {/* SENDER */}

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">

          <Mail
            size={17}
            className="text-zinc-600"
          />

        </div>

        <div className="min-w-0">

          <p className="truncate text-sm font-semibold text-zinc-900">
            {sender.name}
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            Limit: {sender.hourlyLimit}/hour
          </p>

        </div>

      </div>

      {/* EMAIL */}

      <div className="min-w-0">

        <p className="truncate text-sm text-zinc-600">
          {sender.email}
        </p>

        <p className="mt-1 truncate text-xs text-zinc-400">
          {sender.smtpUser}
        </p>

      </div>

      {/* SMTP */}

      <div>

        <div className="mb-1 flex items-center gap-2">

          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">

            <CheckCircle2
              size={11}
            />

            CONNECTED

          </span>

        </div>

        <p className="text-[11px] text-zinc-400">
          {sender.smtpHost}:
          {sender.smtpPort}
        </p>

      </div>

      {/* ACTIONS */}

      <div className="flex items-center gap-2">

        <button
          onClick={() =>
            onTest(sender.id)
          }
          disabled={testing}
          title="Test connection"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50"
        >
          {testing ? (
            <Loader2
              size={14}
              className="animate-spin"
            />
          ) : (
            <RefreshCw size={14} />
          )}
        </button>

        <button
          onClick={() =>
            onEdit(sender)
          }
          title="Edit sender"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
        >
          <Edit3 size={14} />
        </button>

        <button
          onClick={() =>
            onDelete(sender)
          }
          disabled={deleting}
          title="Delete sender"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-red-100 bg-white text-red-500 transition hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2
              size={14}
              className="animate-spin"
            />
          ) : (
            <Trash2 size={14} />
          )}
        </button>

      </div>

    </div>
  );
}


/* =========================================
   EMPTY STATE
========================================= */

function EmptyState({ onAdd }) {
  return (
    <div className="px-5 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">

        <Mail
          size={22}
          className="text-zinc-400"
        />

      </div>

      <h3 className="mt-4 text-sm font-semibold text-zinc-800">
        No senders yet
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-zinc-400">
        Add an SMTP sending account to start
        sending email campaigns.
      </p>

      <button
        onClick={onAdd}
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-zinc-800"
      >
        <Plus size={14} />

        Add Sender
      </button>

    </div>
  );
}


/* =========================================
   SENDER MODAL
========================================= */

function SenderModal({
  sender,
  saving,
  testing,
  onClose,
  onSave,
  onTest,
}) {
  const [testMessage, setTestMessage] =
    useState(null);

  const [form, setForm] =
    useState({
      name: sender?.name || "",
      email: sender?.email || "",
      smtpHost:
        sender?.smtpHost ||
        "smtp.ethereal.email",
      smtpPort:
        sender?.smtpPort || 587,
      smtpUser:
        sender?.smtpUser || "",
      smtpPass: "",
      hourlyLimit:
        sender?.hourlyLimit || 200,
    });

  function updateField(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const data = {
      ...form,
      smtpPort: Number(
        form.smtpPort
      ),
      hourlyLimit: Number(
        form.hourlyLimit
      ),
    };

    onSave(data);
  }

  async function handleTestConnection() {
    const data = {
      smtpHost: form.smtpHost,
      smtpPort: Number(form.smtpPort),
      smtpUser: form.smtpUser,
      smtpPass: form.smtpPass,
    };

    try {
      setTestMessage(null);

      await onTest(data);

      setTestMessage({
        type: "success",
        text: "SMTP connection successful.",
      });
    } catch (error) {
      console.error(
        "SMTP modal test error:",
        error
      );

      setTestMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "SMTP connection failed.",
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">

        {/* MODAL HEADER */}

        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">

          <div>

            <h2 className="text-base font-semibold text-zinc-900">
              {sender
                ? "Edit Sender"
                : "Add Sender"}
            </h2>

            <p className="mt-1 text-xs text-zinc-400">
              Configure your SMTP sending account.
            </p>

          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={18} />
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          <div className="grid gap-5 sm:grid-cols-2">

            <Input
              label="Sender Name"
              value={form.name}
              onChange={(value) =>
                updateField(
                  "name",
                  value
                )
              }
              placeholder="Abhi Ethereal Sender"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(value) =>
                updateField(
                  "email",
                  value
                )
              }
              placeholder="you@example.com"
              required
            />

            <Input
              label="SMTP Host"
              value={form.smtpHost}
              onChange={(value) =>
                updateField(
                  "smtpHost",
                  value
                )
              }
              placeholder="smtp.ethereal.email"
              required
            />

            <Input
              label="SMTP Port"
              type="number"
              value={form.smtpPort}
              onChange={(value) =>
                updateField(
                  "smtpPort",
                  value
                )
              }
              placeholder="587"
              required
            />

            <Input
              label="SMTP Username"
              value={form.smtpUser}
              onChange={(value) =>
                updateField(
                  "smtpUser",
                  value
                )
              }
              placeholder="SMTP username"
              required
            />

            <Input
              label={
                sender
                  ? "New SMTP Password (optional)"
                  : "SMTP Password"
              }
              type="password"
              value={form.smtpPass}
              onChange={(value) =>
                updateField(
                  "smtpPass",
                  value
                )
              }
              placeholder={
                sender
                  ? "Leave empty to keep current password"
                  : "SMTP password"
              }
              required={!sender}
            />

          </div>

          <Input
            label="Hourly Sending Limit"
            type="number"
            value={form.hourlyLimit}
            onChange={(value) =>
              updateField(
                "hourlyLimit",
                value
              )
            }
            placeholder="200"
            required
          />

          {/* TEST */}

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">

            <div className="flex items-start gap-3">

              <Server
                size={17}
                className="mt-0.5 text-zinc-500"
              />

              <div className="flex-1">

                <p className="text-xs font-semibold text-zinc-800">
                  Test SMTP connection
                </p>

                <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                  Verify the SMTP credentials before
                  saving this sender.
                </p>

                <button
                  type="button"
                  onClick={
                    handleTestConnection
                  }
                  disabled={testing}
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
                >
                  {testing ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw
                        size={14}
                      />
                      Test Connection
                    </>
                  )}
                </button>

                {testMessage && (
                  <div
                    className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                      testMessage.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {testMessage.type === "success" ? (
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0"
                      />
                    ) : (
                      <XCircle
                        size={15}
                        className="mt-0.5 shrink-0"
                      />
                    )}

                    <span className="break-words">
                      {testMessage.text}
                    </span>
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="flex justify-end gap-3 border-t border-zinc-200 pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={
                saving || testing
              }
              className="h-10 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving && (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Saving..."
                : sender
                ? "Update Sender"
                : "Save Sender"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================
   INPUT
========================================= */

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-xs font-medium text-zinc-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
      />

    </label>
  );
}

export default Senders;
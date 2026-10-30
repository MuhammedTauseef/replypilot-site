"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

type AgentConfig = {
  agent_name?: string;
  greeting?: string;
  tone?: string;
  language?: string;
  business_hours?: string;
  auto_reply?: string;
};

interface ServiceItem {
  name: string;
  price: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface Business {
  business_name: string;
  industry: string;
  website: string;
  business_description: string;
  whatsapp_number: string;
  services: ServiceItem[];
  faqs: FaqItem[];
}

const TONES = ["friendly", "professional", "playful", "formal"];

const EMPTY_BUSINESS: Business = {
  business_name: "",
  industry: "",
  website: "",
  business_description: "",
  whatsapp_number: "",
  services: [],
  faqs: [],
};

/** /dashboard/client/agent — agent configuration + business details (owner only). */
export default function AgentConfigPage() {
  const [config, setConfig] = useState<AgentConfig>({});
  const [business, setBusiness] = useState<Business>(EMPTY_BUSINESS);
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/agent-config")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setConfig({
          ...(d.agent_config || {}),
          // The wizard never asks for an agent name — inherit the business
          // name until the client sets one explicitly.
          agent_name:
            d.agent_config?.agent_name || d.business?.business_name || "",
        });
        setStatus(d.agent_status || "draft");
        if (d.business) {
          setBusiness({
            business_name: d.business.business_name || "",
            industry: d.business.industry || "",
            website: d.business.website || "",
            business_description: d.business.business_description || "",
            whatsapp_number: d.business.whatsapp_number || "",
            services: Array.isArray(d.business.services) ? d.business.services : [],
            faqs: Array.isArray(d.business.faqs) ? d.business.faqs : [],
          });
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  function set(key: keyof AgentConfig, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setBiz(key: keyof Business, value: string) {
    setBusiness((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setService(i: number, key: keyof ServiceItem, value: string) {
    setBusiness((prev) => ({
      ...prev,
      services: prev.services.map((s, j) => (j === i ? { ...s, [key]: value } : s)),
    }));
    setSaved(false);
  }

  function setFaq(i: number, key: keyof FaqItem, value: string) {
    setBusiness((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f, j) => (j === i ? { ...f, [key]: value } : f)),
    }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/agent-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, ...business }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function doReset() {
    if (resetting) return;
    setResetting(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/agent-config", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed.");
      setConfig({});
      setStatus("draft");
      setSaved(true);
      setConfirmingReset(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed.");
      setConfirmingReset(false);
    } finally {
      setResetting(false);
    }
  }

  if (loading)
    return (
      <main className="admin-wrap">
        <p style={{ color: "var(--muted)" }}>Loading agent settings…</p>
      </main>
    );
  if (error && Object.keys(config).length === 0 && !business.business_name)
    return (
      <main className="admin-wrap">
        <p style={{ color: "#ef4444" }}>{error}</p>
      </main>
    );

  const field = (label: string, key: keyof AgentConfig, placeholder: string, multiline = false) => (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: ".9rem", fontWeight: 600 }}>{label}</label>
      {multiline ? (
        <textarea
          className="admin-input"
          value={config[key] || ""}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={1000}
        />
      ) : (
        <input
          className="admin-input"
          value={config[key] || ""}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholder}
          maxLength={200}
        />
      )}
    </div>
  );

  const bizField = (
    label: string,
    key: "business_name" | "industry" | "website" | "business_description" | "whatsapp_number",
    placeholder: string,
    multiline = false
  ) => (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: ".9rem", fontWeight: 600 }}>{label}</label>
      {multiline ? (
        <textarea
          className="admin-input"
          value={business[key]}
          onChange={(e) => setBiz(key, e.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={2000}
        />
      ) : (
        <input
          className="admin-input"
          value={business[key]}
          onChange={(e) => setBiz(key, e.target.value)}
          placeholder={placeholder}
          maxLength={200}
        />
      )}
    </div>
  );

  const sectionTitle = (text: string) => (
    <h3 style={{ margin: "14px 0 0", fontSize: "1.05rem" }}>{text}</h3>
  );

  return (
    <main className="admin-wrap">
      <div style={{ display: "grid", gap: 18, maxWidth: 640 }}>
        <div>
          <h2 style={{ margin: "0 0 6px" }}>Agent configuration</h2>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: ".95rem" }}>
            Customize how your AI agent talks to your customers. Status:{" "}
            <span className="badge badge-gold">{status}</span>
          </p>
        </div>

        {error && <p style={{ color: "#ef4444" }}>{error}</p>}
        {saved && <p style={{ color: "#22c55e" }}>✓ Saved successfully.</p>}

        {field("Agent name", "agent_name", "e.g. Sara — your virtual assistant")}
        {field("Greeting message", "greeting", "e.g. Hi! Welcome to our salon. How can I help?", true)}

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: ".9rem", fontWeight: 600 }}>Tone</label>
          <select
            className="admin-input"
            value={config.tone || "friendly"}
            onChange={(e) => set("tone", e.target.value)}
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {field("Language", "language", "e.g. English, Urdu, Roman Urdu")}
        {field("Business hours", "business_hours", "e.g. Mon–Sat, 10am–8pm PKT", true)}
        {field("Auto-reply note", "auto_reply", "e.g. We reply within 2 hours during business hours.", true)}

        {sectionTitle("Business details")}
        <p style={{ color: "var(--muted)", margin: 0, fontSize: ".95rem" }}>
          These are the details you entered during setup — your agent answers from
          them. Edit anything here and save; the change applies to your agent
          straight away.
        </p>
        {bizField("Business name", "business_name", "e.g. Akbar Autos")}
        {bizField("Industry", "industry", "e.g. Car repair")}
        {bizField("Website", "website", "e.g. https://yourbusiness.com")}
        {bizField("WhatsApp number", "whatsapp_number", "e.g. +92 300 0000000")}
        {bizField("About your business", "business_description", "A short description of what your business does.", true)}

        {sectionTitle("Services & prices")}
        {business.services.length === 0 && (
          <p style={{ color: "var(--muted)", margin: 0, fontSize: ".95rem" }}>
            No services yet — add the services your agent should quote to customers.
          </p>
        )}
        {business.services.map((s, i) => (
          <div key={i} style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                className="admin-input"
                style={{ flex: "2 1 180px", width: "auto" }}
                value={s.name}
                onChange={(e) => setService(i, "name", e.target.value)}
                placeholder="Service name"
                maxLength={120}
              />
              <input
                className="admin-input"
                style={{ flex: "1 1 110px", width: "auto" }}
                value={s.price}
                onChange={(e) => setService(i, "price", e.target.value)}
                placeholder="Price"
                maxLength={60}
              />
              <button
                type="button"
                className="btn-small btn-danger"
                onClick={() =>
                  setBusiness((prev) => ({
                    ...prev,
                    services: prev.services.filter((_, j) => j !== i),
                  }))
                }
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div>
          <button
            type="button"
            className="btn-small"
            onClick={() =>
              setBusiness((prev) => ({
                ...prev,
                services: [...prev.services, { name: "", price: "" }],
              }))
            }
          >
            + Add a service
          </button>
        </div>

        {sectionTitle("FAQs")}
        {business.faqs.length === 0 && (
          <p style={{ color: "var(--muted)", margin: 0, fontSize: ".95rem" }}>
            No FAQs yet — add the questions customers ask most, with the answers
            your agent should give.
          </p>
        )}
        {business.faqs.map((f, i) => (
          <div key={i} style={{ display: "grid", gap: 6 }}>
            <input
              className="admin-input"
              value={f.q}
              onChange={(e) => setFaq(i, "q", e.target.value)}
              placeholder="Question"
              maxLength={300}
            />
            <textarea
              className="admin-input"
              value={f.a}
              onChange={(e) => setFaq(i, "a", e.target.value)}
              placeholder="Answer"
              rows={2}
              maxLength={1000}
            />
            <div>
              <button
                type="button"
                className="btn-small btn-danger"
                onClick={() =>
                  setBusiness((prev) => ({
                    ...prev,
                    faqs: prev.faqs.filter((_, j) => j !== i),
                  }))
                }
              >
                Remove FAQ
              </button>
            </div>
          </div>
        ))}
        <div>
          <button
            type="button"
            className="btn-small"
            onClick={() =>
              setBusiness((prev) => ({
                ...prev,
                faqs: [...prev.faqs, { q: "", a: "" }],
              }))
            }
          >
            + Add an FAQ
          </button>
        </div>

        <div>
          <button className="btn-primary" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save configuration"}
          </button>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--line)",
            paddingTop: 18,
            display: "grid",
            gap: 10,
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Start again</h3>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: ".95rem" }}>
            Reset clears your agent&rsquo;s configuration — its name, greeting, tone
            and generated setup — and puts the status back to draft. Your business
            details above stay saved so you can rebuild quickly, and your documents,
            conversations and billing are not touched.
          </p>
          <div>
            <button className="btn-small btn-danger" disabled={resetting} onClick={() => setConfirmingReset(true)}>
              {resetting ? "Resetting…" : "Reset agent configuration"}
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmingReset}
        title="Reset agent configuration?"
        message="This clears the agent's name, greeting, tone and generated setup, and puts the status back to draft. Your business details, documents and billing stay as they are."
        confirmLabel="Reset"
        busy={resetting}
        onConfirm={doReset}
        onCancel={() => {
          if (!resetting) setConfirmingReset(false);
        }}
      />
    </main>
  );
}

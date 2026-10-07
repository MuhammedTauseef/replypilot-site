"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { DEMOS, DEMO_GROUPS, demosByGroup, type DemoPersona } from "@/lib/demos";

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "What services do you provide?",
  "How much does it cost?",
  "How does the free demo work?",
  "Do you work with my kind of business?",
];

function personaPayload(d: DemoPersona | null) {
  if (!d) return undefined;
  return { name: d.name, business: d.business, blurb: d.blurb };
}

/**
 * /demo — full-page live AI demo with all 12 previous demo businesses.
 * Pick a business → the agent roleplays as that business's assistant.
 * Powered by /api/chat (keys stay server-side).
 */
export default function DemoPage() {
  const [demo, setDemo] = useState<DemoPersona | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi, I'm ReplyPilot — pick a demo business below, or just ask me about getting an AI agent for your own business.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [msgs, busy]);

  function pick(d: DemoPersona | null) {
    if (busy) return;
    setDemo(d);
    setMsgs([
      {
        role: "assistant",
        text: d
          ? d.welcome
          : "Back to ReplyPilot mode — ask me about getting an AI agent for your business.",
      },
    ]);
    setInput("");
  }

  async function send(text: string) {
    const clean = text.trim().slice(0, 800);
    if (!clean || busy) return;
    const next = [...msgs, { role: "user" as const, text: clean }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-12),
          persona: personaPayload(demo),
        }),
      });
      const data = (await res.json()) as { reply?: string };
      setMsgs([
        ...next,
        { role: "assistant", text: data.reply || "Sorry — please try again." },
      ]);
    } catch {
      setMsgs([
        ...next,
        { role: "assistant", text: "Network hiccup — please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function clear() {
    if (busy) return;
    setMsgs([
      {
        role: "assistant",
        text: demo
          ? demo.welcome
          : "Chat cleared — ask me anything about getting an AI agent for your business.",
      },
    ]);
  }

  return (
    <main>
      <section className="hero" style={{ padding: 0 }}>
        <div
          className="wrap hero-inner"
          style={{ paddingTop: 64, paddingBottom: 48 }}
        >
          <span className="eyebrow">Live demo</span>
          <h1
            className="hero-statement"
            style={{ fontSize: "clamp(2.4rem,6vw,4.4rem)" }}
          >
            Try the AI agent<span className="dot">.</span>
          </h1>
          <p className="hero-sub" style={{ maxWidth: "36ch" }}>
            Pick any of the 13 demo businesses and chat with its AI assistant —
            the same kind of agent we build for real businesses.
          </p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 56 }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          {/* Demo picker — all 12 previous demos */}
          <div style={{ marginBottom: 26 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: ".8rem",
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "#9a7c4e",
                marginBottom: 14,
              }}
            >
              Choose a demo business
            </div>
            <div style={{ display: "grid", gap: 18 }}>
              {DEMO_GROUPS.map((g) => (
                <div key={g.key}>
                  <div
                    style={{
                      fontSize: ".85rem",
                      fontWeight: 700,
                      color: "#1b2653",
                      marginBottom: 8,
                    }}
                  >
                    {g.heading}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {demosByGroup(g.key).map((d) => {
                      const active = demo?.name === d.name;
                      return (
                        <button
                          key={d.name}
                          type="button"
                          onClick={() => pick(active ? null : d)}
                          aria-pressed={active}
                          style={{
                            border: `1.5px solid ${active ? "#0a172a" : "#e5e7eb"}`,
                            background: active ? "#0a172a" : "#fff",
                            color: active ? "#fff" : "#1b2653",
                            borderRadius: 999,
                            padding: "9px 16px",
                            fontSize: ".86rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {d.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {demo && (
              <p style={{ color: "#4b5563", fontSize: ".92rem", marginTop: 14 }}>
                You&apos;re chatting with the AI assistant of{" "}
                <strong>{demo.name}</strong> ({demo.business}). Tap again to go
                back to ReplyPilot mode.
              </p>
            )}
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 22px 60px rgba(0,45,115,.12)",
            }}
          >
            <div className="chat-head" style={{ borderRadius: 0 }}>
              <span className="ava">{demo ? demo.name.charAt(0) : "R"}</span>
              <div>
                <b>{demo ? `${demo.name} Assistant` : "ReplyPilot Assistant"}</b>
                <small>
                  <i /> Online — replies instantly
                </small>
              </div>
              <button onClick={clear} aria-label="Clear chat" title="Clear chat">
                ⟳
              </button>
            </div>
            <div
              className="chat-body"
              ref={bodyRef}
              style={{ minHeight: 380, maxHeight: 480 }}
            >
              {msgs.map((m, i) => (
                <div key={i} className={`cmsg ${m.role}`}>
                  {m.text}
                </div>
              ))}
              {busy && (
                <div className="ctyping" aria-label="Assistant is typing">
                  <i />
                  <i />
                  <i />
                </div>
              )}
            </div>
            <div className="cchips">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
            <form className="chat-input" onSubmit={onSubmit}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                aria-label="Type your message"
                maxLength={800}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>

          <div
            style={{
              marginTop: 36,
              background: "#0a172a",
              color: "#fff",
              borderRadius: 18,
              padding: "clamp(28px,4vw,44px)",
              display: "grid",
              gap: 18,
              alignItems: "center",
            }}
          >
            <h2
              style={{ margin: 0, fontSize: "1.7rem", letterSpacing: "-.02em" }}
            >
              Like what you see? Get one for your business — $200.
            </h2>
            <p style={{ margin: 0, color: "#b9c6e2" }}>
              Trained on your products, your prices, your FAQs. Live in 48
              hours, with a free custom demo first.
            </p>
            <div>
              <Link href="/#contact" className="btn btn-gold">
                Get Your AI Agent — $200{" "}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

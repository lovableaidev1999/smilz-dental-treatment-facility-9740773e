import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Phone, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CLINIC_INFO } from "@/lib/constants";

type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the Smilz Dental assistant 🦷. Ask me anything about dental treatments, oral hygiene or our clinic. For personal advice, I'll connect you with Dr. Dibyendu Dutta on WhatsApp.\n\n_Conversations may be reviewed to improve our service._",
};

const getSessionId = (): string => {
  if (typeof window === "undefined") return "";
  try {
    let sid = localStorage.getItem("smilz_chat_session");
    if (!sid) {
      sid = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem("smilz_chat_session", sid);
    }
    return sid;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

const DentalChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("dental-chat", {
        body: {
          messages: next.filter((m) => m.role !== "assistant" || m !== WELCOME),
          session_id: getSessionId(),
        },
      });
      if (error) throw error;
      const reply = (data as any)?.reply ?? "Sorry, I couldn't reach the assistant. Please WhatsApp us at +91 8961775554.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please WhatsApp us at +91 8961775554 or call 8961775554 — we'll help you right away.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const wa = `https://wa.me/${CLINIC_INFO.whatsapp}?text=${encodeURIComponent("Hi, I'd like advice from Dr. Dutta.")}`;

  return (
    <>
      {/* Launcher — sits above WhatsApp FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open dental assistant chat"
          className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-elevated hover:shadow-hover transition-all duration-300 group"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="hidden sm:inline text-sm font-semibold">Ask Smilz AI</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-card border border-border rounded-2xl shadow-elevated flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-heading font-semibold text-sm">Smilz Dental Assistant</p>
              <p className="text-[11px] opacity-80">Dental questions • Powered by AI</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="p-1 rounded hover:bg-primary-foreground/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                    : "mr-auto bg-card border border-border text-foreground rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="mr-auto bg-card border border-border rounded-2xl px-3 py-2 text-sm flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            )}
          </div>

          {/* Hand-off CTAs */}
          <div className="px-3 py-2 border-t border-border bg-card flex flex-wrap gap-2">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold px-2 py-2 rounded-md bg-dental-green text-primary-foreground hover:opacity-90"
            >
              <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a
              href={`tel:${CLINIC_INFO.phone}`}
              className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold px-2 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
            >
              <Phone className="h-3.5 w-3.5" /> Call
            </a>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold px-2 py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Calendar className="h-3.5 w-3.5" /> Book
            </Link>
          </div>

          {/* Input */}
          <div className="p-2 border-t border-border bg-card flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder="Ask a dental question…"
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-h-28"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DentalChatbot;

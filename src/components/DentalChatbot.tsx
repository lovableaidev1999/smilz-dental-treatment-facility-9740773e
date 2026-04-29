import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Phone, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const WHATSAPP_NUMBER = "918961775554";
const PHONE_TEL = "8961775554";

const STARTER_QUESTIONS = [
  "How much do dental implants cost?",
  "Do you treat children?",
  "What are your clinic timings?",
  "Is root canal painful?",
];

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Hi! 👋 I'm the Smilz virtual assistant. Ask me anything about dental treatments, our services, or visiting the clinic in Garia, Kolkata.",
};

function getSessionId(): string {
  try {
    const k = "smilz_chat_session";
    let id = localStorage.getItem(k);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(k, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

const DentalChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("dental-chat", {
        body: {
          session_id: getSessionId(),
          messages: next.filter((m) => m.role !== "assistant" || m !== WELCOME).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;
      if ((data as any)?.error) {
        toast.error((data as any).error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I'm having trouble right now. Please WhatsApp us at +91 8961775554 — we'll respond quickly.",
          },
        ]);
        return;
      }

      const reply = (data as any)?.reply ?? "Sorry, no response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error("chat error:", e);
      toast.error("Could not reach the assistant. Please try WhatsApp.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach our assistant. Please WhatsApp us at +91 8961775554 or call directly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const wContext = encodeURIComponent(
    `Hi, I was chatting on smilz.net and would like to know more about: ${
      [...messages].reverse().find((m) => m.role === "user")?.content?.slice(0, 200) ?? "dental treatment"
    }`,
  );

  return (
    <>
      {/* Floating bubble — bottom-right, stacked above WhatsApp FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-elevated hover:shadow-hover transition-all duration-300 group"
          aria-label="Open Smilz Assistant chat"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="hidden sm:inline text-sm font-semibold">Ask Smilz Assistant</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[380px] h-[560px] max-h-[calc(100vh-3rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <div className="font-heading font-semibold text-sm leading-tight">Smilz Assistant</div>
                <div className="text-[11px] text-primary-foreground/80">Dental questions • Garia, Kolkata</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-md hover:bg-primary-foreground/10"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-muted/20">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:120ms]" />
                    <span className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            )}

            {/* Starter chips after the welcome */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs bg-card border border-border hover:border-primary hover:text-primary transition-colors rounded-full px-3 py-1.5"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Handoff CTAs */}
          {lastAssistant && messages.length > 1 && (
            <div className="border-t border-border bg-card px-3 py-2 flex gap-2 flex-wrap">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${wContext}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-dental-green text-primary-foreground rounded-md px-3 py-2 hover:opacity-90 transition"
              >
                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
              </a>
              <a
                href={`tel:${PHONE_TEL}`}
                className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md px-3 py-2 hover:opacity-90 transition"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
              <a
                href="/contact"
                className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold border border-primary text-primary rounded-md px-3 py-2 hover:bg-primary hover:text-primary-foreground transition"
              >
                <Calendar className="h-3.5 w-3.5" /> Book Visit
              </a>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-border bg-card p-2 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a dental treatment..."
              disabled={loading}
              className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 w-9 flex items-center justify-center bg-primary text-primary-foreground rounded-full disabled:opacity-50 hover:opacity-90 transition"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="px-3 pb-2 text-[10px] text-muted-foreground text-center">
            AI assistant — for advice please contact the clinic directly.
          </div>
        </div>
      )}
    </>
  );
};

export default DentalChatbot;

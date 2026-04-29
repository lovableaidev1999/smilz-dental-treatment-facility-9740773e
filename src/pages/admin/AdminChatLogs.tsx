import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Conversation {
  id: string;
  session_id: string;
  started_at: string;
  last_message_at: string;
  visitor_meta: any;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const AdminChatLogs = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("chatbot_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    else setConversations((data as Conversation[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("chatbot_messages")
        .select("*")
        .eq("conversation_id", selected.id)
        .order("created_at", { ascending: true });
      if (error) toast.error(error.message);
      else setMessages((data as Message[]) ?? []);
    })();
  }, [selected]);

  const deleteConversation = async (id: string) => {
    if (!confirm("Delete this conversation and all its messages?")) return;
    const { error } = await supabase.from("chatbot_conversations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setSelected(null);
    loadConversations();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Chat Logs</h1>
          <p className="text-sm text-muted-foreground">Visitor conversations with the Smilz Assistant chatbot.</p>
        </div>
        <Button variant="outline" onClick={loadConversations}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-1 bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-semibold text-sm">
            Conversations ({conversations.length})
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No conversations yet.</div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/40 transition ${
                    selected?.id === c.id ? "bg-muted/60" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    {new Date(c.last_message_at).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    Session: {c.session_id.slice(0, 8)}…
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Transcript */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden flex flex-col min-h-[60vh]">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Select a conversation to view the transcript.
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-semibold">Transcript</div>
                  <div className="text-xs text-muted-foreground">
                    Started {new Date(selected.started_at).toLocaleString()}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteConversation(selected.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border rounded-bl-sm"
                      }`}
                    >
                      {m.content}
                      <div className={`text-[10px] mt-1 opacity-70`}>
                        {new Date(m.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatLogs;

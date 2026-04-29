import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ChatConversation = {
  id: string;
  session_id: string;
  started_at: string;
  last_message_at: string;
  message_count: number;
  language: string | null;
  detected_locality: string | null;
  detected_intent: string | null;
  detected_service: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  is_lead: boolean;
  reviewed: boolean;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export const useConversations = () =>
  useQuery({
    queryKey: ["chat_conversations"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("chat_conversations")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(500);
      if (error) {
        console.warn("[useConversations]", error.message);
        return [] as ChatConversation[];
      }
      return (data ?? []) as ChatConversation[];
    },
  });

export const useConversationMessages = (conversationId: string | null) =>
  useQuery({
    queryKey: ["chat_messages", conversationId],
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!conversationId) return [] as ChatMessage[];
      const { data, error } = await (supabase.from as any)("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) {
        console.warn("[useConversationMessages]", error.message);
        return [] as ChatMessage[];
      }
      return (data ?? []) as ChatMessage[];
    },
  });

export const useUserMessages = () =>
  useQuery({
    queryKey: ["chat_messages_user"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("chat_messages")
        .select("content, created_at")
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) {
        console.warn("[useUserMessages]", error.message);
        return [] as { content: string; created_at: string }[];
      }
      return (data ?? []) as { content: string; created_at: string }[];
    },
  });

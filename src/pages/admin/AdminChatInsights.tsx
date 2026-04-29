import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Download, MapPin, FileText, Flame, RefreshCw } from "lucide-react";
import {
  useConversations,
  useConversationMessages,
  useUserMessages,
  type ChatConversation,
} from "@/hooks/useChatInsights";
import { Link } from "react-router-dom";

/* ------------------------------ Helpers ------------------------------ */

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const csvEscape = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/* normalize a question: lowercase, strip punctuation, collapse spaces */
const normalize = (s: string) =>
  s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

/* ------------------------------ Page ------------------------------ */

const AdminChatInsights = () => {
  const { data: conversations = [], isLoading, refetch } = useConversations();
  const { data: userMessages = [] } = useUserMessages();

  /* -------- filters (Conversations tab) -------- */
  const [language, setLanguage] = useState("");
  const [intent, setIntent] = useState("");
  const [service, setService] = useState("");
  const [leadsOnly, setLeadsOnly] = useState(false);
  const [unreviewedOnly, setUnreviewedOnly] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      if (language && c.language !== language) return false;
      if (intent && c.detected_intent !== intent) return false;
      if (service && c.detected_service !== service) return false;
      if (leadsOnly && !c.is_lead) return false;
      if (unreviewedOnly && c.reviewed) return false;
      if (search) {
        const hay = `${c.detected_locality ?? ""} ${c.detected_intent ?? ""} ${c.detected_service ?? ""}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [conversations, language, intent, service, leadsOnly, unreviewedOnly, search]);

  /* -------- drawer -------- */
  const [openConv, setOpenConv] = useState<ChatConversation | null>(null);
  const { data: drawerMsgs = [] } = useConversationMessages(openConv?.id ?? null);

  /* -------- Top Questions tab -------- */
  const [windowDays, setWindowDays] = useState(30);

  const topQuestions = useMemo(() => {
    const cutoff = Date.now() - windowDays * 86400000;
    const counts = new Map<string, { display: string; count: number }>();
    for (const m of userMessages) {
      if (new Date(m.created_at).getTime() < cutoff) continue;
      const key = normalize(m.content).slice(0, 200);
      if (key.length < 4) continue;
      const prev = counts.get(key);
      if (prev) prev.count += 1;
      else counts.set(key, { display: m.content.trim().slice(0, 240), count: 1 });
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 100);
  }, [userMessages, windowDays]);

  /* -------- GEO Opportunities tab -------- */
  const geoRows = useMemo(() => {
    const map = new Map<string, { count: number; services: Map<string, number>; leads: number }>();
    for (const c of conversations) {
      const loc = c.detected_locality;
      if (!loc) continue;
      const row = map.get(loc) ?? { count: 0, services: new Map(), leads: 0 };
      row.count += 1;
      if (c.is_lead) row.leads += 1;
      if (c.detected_service) {
        row.services.set(c.detected_service, (row.services.get(c.detected_service) ?? 0) + 1);
      }
      map.set(loc, row);
    }
    return [...map.entries()]
      .map(([locality, v]) => ({
        locality,
        count: v.count,
        leads: v.leads,
        topServices: [...v.services.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([s]) => s),
      }))
      .sort((a, b) => b.count - a.count);
  }, [conversations]);

  /* -------- distinct dropdown values -------- */
  const distinct = (key: keyof ChatConversation) =>
    [...new Set(conversations.map((c) => (c[key] as string) ?? "").filter(Boolean))].sort();

  return (
    <>
      <Helmet>
        <title>Chat Insights · Smilz CMS</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Chat Insights
            </h1>
            <p className="text-sm text-muted-foreground">
              Real visitor questions from "Ask Smilz AI" — fuel for SEO, GEO and lead follow-up.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Conversations</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{conversations.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Hot Leads</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-dental-green">
              {conversations.filter((c) => c.is_lead).length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Unique Localities</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{geoRows.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Unreviewed</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{conversations.filter((c) => !c.reviewed).length}</CardContent>
          </Card>
        </div>

        <Tabs defaultValue="conversations" className="w-full">
          <TabsList>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="questions">Top Questions (SEO)</TabsTrigger>
            <TabsTrigger value="geo">GEO Opportunities</TabsTrigger>
          </TabsList>

          {/* ---------- Conversations ---------- */}
          <TabsContent value="conversations" className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Search locality / intent / service…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
              <select className="border rounded h-9 px-2 text-sm bg-background" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="">All languages</option>
                {distinct("language").map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <select className="border rounded h-9 px-2 text-sm bg-background" value={intent} onChange={(e) => setIntent(e.target.value)}>
                <option value="">All intents</option>
                {distinct("detected_intent").map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <select className="border rounded h-9 px-2 text-sm bg-background" value={service} onChange={(e) => setService(e.target.value)}>
                <option value="">All services</option>
                {distinct("detected_service").map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={leadsOnly} onChange={(e) => setLeadsOnly(e.target.checked)} /> Leads only
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={unreviewedOnly} onChange={(e) => setUnreviewedOnly(e.target.checked)} /> Unreviewed
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadCsv(
                    `chat-conversations-${new Date().toISOString().slice(0, 10)}.csv`,
                    filtered.map((c) => ({
                      date: c.last_message_at,
                      language: c.language,
                      locality: c.detected_locality,
                      intent: c.detected_intent,
                      service: c.detected_service,
                      messages: c.message_count,
                      is_lead: c.is_lead,
                      reviewed: c.reviewed,
                    })),
                  )
                }
              >
                <Download className="h-4 w-4 mr-1.5" /> Export CSV
              </Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Lang</th>
                    <th className="text-left px-3 py-2">Locality</th>
                    <th className="text-left px-3 py-2">Intent</th>
                    <th className="text-left px-3 py-2">Service</th>
                    <th className="text-right px-3 py-2">Msgs</th>
                    <th className="text-left px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</td></tr>
                  )}
                  {!isLoading && filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No conversations yet. Once visitors use "Ask Smilz AI", they'll appear here.
                    </td></tr>
                  )}
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setOpenConv(c)}
                      className="border-t border-border hover:bg-muted/40 cursor-pointer"
                    >
                      <td className="px-3 py-2 whitespace-nowrap">{formatDate(c.last_message_at)}</td>
                      <td className="px-3 py-2">{c.language ?? "—"}</td>
                      <td className="px-3 py-2">{c.detected_locality ?? "—"}</td>
                      <td className="px-3 py-2">{c.detected_intent ?? "—"}</td>
                      <td className="px-3 py-2">{c.detected_service ?? "—"}</td>
                      <td className="px-3 py-2 text-right">{c.message_count}</td>
                      <td className="px-3 py-2 space-x-1">
                        {c.is_lead && <Badge className="bg-dental-green text-primary-foreground"><Flame className="h-3 w-3 mr-1" />Lead</Badge>}
                        {!c.reviewed && <Badge variant="outline">New</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ---------- Top Questions ---------- */}
          <TabsContent value="questions" className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Window:</span>
              {[30, 90, 365].map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={windowDays === d ? "default" : "outline"}
                  onClick={() => setWindowDays(d)}
                >
                  {d} days
                </Button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">
                Use these as titles for new blog posts &amp; FAQs.
              </span>
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">Question</th>
                    <th className="text-right px-3 py-2 w-20">Asked</th>
                    <th className="text-right px-3 py-2 w-64">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {topQuestions.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">No questions in this window yet.</td></tr>
                  )}
                  {topQuestions.map((q, i) => {
                    const titleCase = q.display.charAt(0).toUpperCase() + q.display.slice(1);
                    return (
                      <tr key={i} className="border-t border-border">
                        <td className="px-3 py-2">{titleCase}</td>
                        <td className="px-3 py-2 text-right font-semibold">{q.count}</td>
                        <td className="px-3 py-2 text-right space-x-1">
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/admin/blog/new?title=${encodeURIComponent(titleCase)}`}>
                              <FileText className="h-3.5 w-3.5 mr-1" /> Blog Post
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ---------- GEO Opportunities ---------- */}
          <TabsContent value="geo" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Visitor-revealed neighborhoods. Add high-traffic ones to{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">scripts/location-pages.config.mjs</code>{" "}
              to auto-generate dedicated landing pages with LocalBusiness schema.
            </p>

            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">Locality</th>
                    <th className="text-right px-3 py-2 w-24">Convs</th>
                    <th className="text-right px-3 py-2 w-24">Leads</th>
                    <th className="text-left px-3 py-2">Top services</th>
                    <th className="text-right px-3 py-2 w-48">Suggested page</th>
                  </tr>
                </thead>
                <tbody>
                  {geoRows.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No locality data yet.</td></tr>
                  )}
                  {geoRows.map((g) => {
                    const slug = `dentist-in-${g.locality.toLowerCase().replace(/\s+/g, "-")}`;
                    return (
                      <tr key={g.locality} className="border-t border-border">
                        <td className="px-3 py-2 font-medium flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {g.locality}
                        </td>
                        <td className="px-3 py-2 text-right">{g.count}</td>
                        <td className="px-3 py-2 text-right text-dental-green font-semibold">{g.leads}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {g.topServices.length ? g.topServices.join(", ") : "—"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/{slug}</code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Drawer: full transcript */}
        <Sheet open={!!openConv} onOpenChange={(o) => !o && setOpenConv(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Conversation</SheetTitle>
            </SheetHeader>
            {openConv && (
              <div className="mt-4 space-y-4">
                <div className="text-xs text-muted-foreground space-x-2">
                  <span>{formatDate(openConv.started_at)}</span>
                  {openConv.language && <Badge variant="outline">{openConv.language}</Badge>}
                  {openConv.detected_locality && <Badge variant="outline"><MapPin className="h-3 w-3 mr-1" />{openConv.detected_locality}</Badge>}
                  {openConv.detected_intent && <Badge variant="outline">{openConv.detected_intent}</Badge>}
                  {openConv.detected_service && <Badge variant="outline">{openConv.detected_service}</Badge>}
                  {openConv.is_lead && <Badge className="bg-dental-green text-primary-foreground"><Flame className="h-3 w-3 mr-1" />Lead</Badge>}
                </div>
                <div className="space-y-2">
                  {drawerMsgs.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground ml-6"
                          : "bg-muted text-foreground mr-6"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                  {drawerMsgs.length === 0 && (
                    <p className="text-sm text-muted-foreground">No messages stored.</p>
                  )}
                </div>
                <div className="pt-3 border-t border-border flex gap-2">
                  <Button asChild size="sm" className="bg-dental-green hover:bg-dental-green/90 text-primary-foreground">
                    <a
                      href={`https://wa.me/918961775554?text=${encodeURIComponent(
                        "Hi! Following up on your recent enquiry on smilz.net.",
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp follow-up
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default AdminChatInsights;

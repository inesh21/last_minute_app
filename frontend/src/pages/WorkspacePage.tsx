import { useState } from "react";
import {
  FileText, Layers, Mail, Plus, ExternalLink,
  Loader2, AlertCircle,
} from "lucide-react";
import { Card, Badge, Btn } from "../components/shared";
import { api, type GmailMessage, type WorkspaceItem } from "../services/api";

type Tab = "gmail" | "create";

export function WorkspacePage() {
  const [tab, setTab] = useState<Tab>("gmail");
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsLoaded, setEmailsLoaded] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [createdItems, setCreatedItems] = useState<WorkspaceItem[]>([]);
  const [creating, setCreating] = useState<string | null>(null);
  const [createError, setCreateError] = useState("");

  const [draftOpen, setDraftOpen] = useState(false);
  const [draftTo, setDraftTo] = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftSending, setDraftSending] = useState(false);

  const [docTitle, setDocTitle] = useState("");
  const [slidesTitle, setSlidesTitle] = useState("");

  const loadEmails = async () => {
    setEmailsLoading(true);
    setEmailError("");
    try {
      const result = await api.getGmailMessages("", 20);
      setEmails(result.messages);
      setEmailsLoaded(true);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : "Failed to load emails");
    } finally {
      setEmailsLoading(false);
    }
  };

  const createDraft = async () => {
    if (!draftTo.trim() || !draftSubject.trim()) return;
    setDraftSending(true);
    setCreateError("");
    try {
      const result = await api.createGmailDraft(draftTo, draftSubject, draftBody);
      setCreatedItems(prev => [{
        type: "draft",
        title: draftSubject,
        url: result.url,
        id: result.draft_id,
        createdAt: new Date().toLocaleString(),
      }, ...prev]);
      setDraftOpen(false);
      setDraftTo("");
      setDraftSubject("");
      setDraftBody("");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create draft");
    } finally {
      setDraftSending(false);
    }
  };

  const createDoc = async () => {
    const title = docTitle.trim() || "Untitled Document";
    setCreating("doc");
    setCreateError("");
    try {
      const result = await api.createGoogleDoc(title);
      setCreatedItems(prev => [{
        type: "doc",
        title: result.title,
        url: result.url,
        id: result.document_id,
        createdAt: new Date().toLocaleString(),
      }, ...prev]);
      setDocTitle("");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create document");
    } finally {
      setCreating(null);
    }
  };

  const createSlides = async () => {
    const title = slidesTitle.trim() || "Untitled Presentation";
    setCreating("slides");
    setCreateError("");
    try {
      const result = await api.createGoogleSlides(title);
      setCreatedItems(prev => [{
        type: "slides",
        title: result.title,
        url: result.url,
        id: result.presentation_id,
        createdAt: new Date().toLocaleString(),
      }, ...prev]);
      setSlidesTitle("");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create presentation");
    } finally {
      setCreating(null);
    }
  };

  const typeIcon = (type: WorkspaceItem["type"]) => {
    switch (type) {
      case "doc": return <FileText size={14} className="text-blue-500" />;
      case "slides": return <Layers size={14} className="text-amber-500" />;
      case "draft": return <Mail size={14} className="text-green-500" />;
    }
  };

  const typeBadge = (type: WorkspaceItem["type"]) => {
    switch (type) {
      case "doc": return <Badge variant="blue">Doc</Badge>;
      case "slides": return <Badge variant="amber">Slides</Badge>;
      case "draft": return <Badge variant="green">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Google Workspace</h2>
        <div className="flex gap-2">
          <Btn
            variant={tab === "gmail" ? "primary" : "secondary"}
            onClick={() => setTab("gmail")}
          >
            <Mail size={14} /> Gmail
          </Btn>
          <Btn
            variant={tab === "create" ? "primary" : "secondary"}
            onClick={() => setTab("create")}
          >
            <Plus size={14} /> Create
          </Btn>
        </div>
      </div>

      {createError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle size={14} /> {createError}
        </div>
      )}

      {tab === "gmail" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Btn variant="primary" onClick={loadEmails} disabled={emailsLoading}>
              {emailsLoading ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              {emailsLoaded ? "Refresh Inbox" : "Load Gmail"}
            </Btn>
            <Btn variant="secondary" onClick={() => setDraftOpen(true)}>
              <Plus size={14} /> New Draft
            </Btn>
          </div>

          {draftOpen && (
            <Card>
              <h3 className="text-sm font-medium mb-3">Create Gmail Draft</h3>
              <div className="space-y-2">
                <input
                  value={draftTo}
                  onChange={e => setDraftTo(e.target.value)}
                  placeholder="To (email address)"
                  className="w-full bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50"
                />
                <input
                  value={draftSubject}
                  onChange={e => setDraftSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50"
                />
                <textarea
                  value={draftBody}
                  onChange={e => setDraftBody(e.target.value)}
                  placeholder="Email body..."
                  rows={4}
                  className="w-full bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50 resize-none"
                />
                <div className="flex gap-2">
                  <Btn variant="primary" onClick={createDraft} disabled={draftSending}>
                    {draftSending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                    Save Draft
                  </Btn>
                  <Btn variant="secondary" onClick={() => setDraftOpen(false)}>Cancel</Btn>
                </div>
              </div>
            </Card>
          )}

          {emailError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle size={14} /> {emailError}
              <Btn variant="secondary" onClick={loadEmails} className="ml-auto text-xs">Retry</Btn>
            </div>
          )}

          {emailsLoaded && emails.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No emails found.</p>
          )}

          {!emailsLoaded && !emailsLoading && (
            <p className="text-sm text-muted-foreground text-center py-8">Click "Load Gmail" to fetch your recent messages.</p>
          )}

          <div className="space-y-2">
            {emails.map(email => (
              <Card key={email.id} className="p-3">
                <div className="flex items-start gap-3">
                  <Mail size={14} className="text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{email.subject || "(no subject)"}</p>
                    <p className="text-xs text-muted-foreground truncate">{email.from || "Unknown sender"}</p>
                    {email.snippet && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{email.snippet}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{email.date || ""}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-blue-500" />
              <h3 className="text-sm font-medium">Google Docs</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Create a new Google Document. It will open in your browser.</p>
            <input
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              placeholder="Document title (optional)"
              className="w-full bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50 mb-3"
            />
            <Btn variant="primary" onClick={createDoc} disabled={creating === "doc"}>
              {creating === "doc" ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create Document
            </Btn>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={16} className="text-amber-500" />
              <h3 className="text-sm font-medium">Google Slides</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Create a new Google Slides presentation.</p>
            <input
              value={slidesTitle}
              onChange={e => setSlidesTitle(e.target.value)}
              placeholder="Presentation title (optional)"
              className="w-full bg-input-background rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/50 mb-3"
            />
            <Btn variant="primary" onClick={createSlides} disabled={creating === "slides"}>
              {creating === "slides" ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create Presentation
            </Btn>
          </Card>
        </div>
      )}

      {createdItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recently Created</h3>
          {createdItems.map((item, i) => (
            <Card key={i} className="p-3">
              <div className="flex items-center gap-3">
                {typeIcon(item.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {typeBadge(item.type)}
                    <span className="text-sm font-medium truncate">{item.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.createdAt}</p>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Open <ExternalLink size={12} />
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

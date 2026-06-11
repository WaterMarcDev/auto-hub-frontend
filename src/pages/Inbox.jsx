import { useEffect, useState, useRef, useCallback } from "react";
import { Drawer, App, Modal, Input } from "antd";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Helpers ────────────────────────────────────────────────────────────────

const cleanBody = (html) => {
    if (!html) return "";
    return html
        .replace(/On .*wrote:/gi, "")
        .replace(/You've received this email because[\s\S]*/gi, "")
        .replace(/If you feel you received it by mistake[\s\S]*/gi, "")
        .replace(/\uFFFD/g, "-")
        .replace(/\n\s*\n/g, "\n")
        .trim();
};

// Detects whether body is rich HTML (not just plain text with occasional tags)
const isRichHtml = (body) => {
    if (!body) return false;
    return (
        /<(html|head|body|table|tbody|tr|td|div|span|p|img|a|h[1-6]|ul|ol|li|br|hr|style|font)[^>]*>/i.test(body)
    );
};

// Helper function by shiva
// const normalizeEmailContent = (html) => {
//     if (!html) return "";

//     const parser = new DOMParser();
//     const doc = parser.parseFromString(html, "text/html");

//     return (
//         doc.body?.innerText ||
//         doc.body?.textContent ||
//         html
//     )
//         .replace(/\n{3,}/g, "\n\n")
//         .trim();
// }
// end here

// Strips dangerous tags/events but keeps all layout/styling intact (for iframe)
// added by shiva
const sanitizeForIframe = (html) => {
    if (!html) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove dangerous elements
    doc.querySelectorAll(
        "script, iframe, object, embed, svg, form"
    ).forEach(el => el.remove());

    // Remove meta refresh
    doc.querySelectorAll('meta[http-equiv="refresh"]').forEach(el => el.remove());

    // Remove event handlers

    doc.querySelectorAll("img").forEach(img => {
        const src = (img.getAttribute("src") || "").toLowerCase();

        if (
            src.includes(".ct.sendgrid.net/wf/open") ||
            src.includes("service.tiktok.com/wf/open") ||
            src.includes(".tiktok.com/wf/open")
        ) {
            img.remove();
        }
    });

    doc.querySelectorAll("link").forEach(link => {
        const rel = (link.getAttribute("rel") || "").toLowerCase();

        if (
            rel.includes("preload") ||
            rel.includes("modulepreload")
        ) {
            link.remove();
        }
    });

    doc.querySelectorAll("*").forEach(el => {
        [...el.attributes].forEach(attr => {
            if (attr.name.toLowerCase().startsWith("on")) {
                el.removeAttribute(attr.name);
            }

            if (
                (attr.name === "href" || attr.name === "src") &&
                attr.value.toLowerCase().startsWith("javascript:")
            ) {
                el.removeAttribute(attr.name);
            }
        });
    });

    return doc.body.innerHTML;
};
// end here
// const sanitizeForIframe = (html) => {
//     if (!html) return "";
//     return html
//         .replace(/<script[\s\S]*?<\/script>/gi, "")
//         .replace(/<script[^>]*\/>/gi, "")   //added by shiva
//         .replace(/<script[^>]*>/gi, "")    //added by shiva
//         .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
//         .replace(/<object[\s\S]*?<\/object>/gi, "")
//         .replace(/<embed[\s\S]*?(\/\s*>|<\/embed>)/gi, "")
//         .replace(/@font-face\s*{[\s\S]*?}/gi, "")  //remove external fonts by shiva
//         .replace(/<meta[^>]*http-equiv=["']?refresh["']?[^>]*>/gi, "")   //added by shiva
//         .replace(/<svg[\s\S]*?<\/svg>/gi, "")   //added by shiva
//         .replace(/<img[^>]+src=["']https:\/\/[^"']*(?:tiktok\.com|service\.tiktok\.com)\/wf\/open[^"']*["'][^>]*>/gi, "")   //added by shiva
//         .replace(
//         /<img[^>]+src=["']https:\/\/[^"']*\.ct\.sendgrid\.net\/wf\/open[^"']*["'][^>]*>/gi,
//         ""
//         )
//         .replace(/\son\w+\s*=\s*(["'])[\s\S]*?\1/gi, "")
//         .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
//         .replace(/href\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, 'href="#"');
// };

function formatTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = (now - date) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    const isYesterday =
        now.toDateString() !== date.toDateString() &&
        new Date(now - 86400000).toDateString() === date.toDateString();
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── IframeEmailBody ─────────────────────────────────────────────────────────
// Renders HTML email in a sandboxed iframe with auto-height, white background.
// This is exactly how Gmail/Outlook render HTML emails safely.

function IframeEmailBody({ html }) {
    const iframeRef = useRef(null);
    const [height, setHeight] = useState(80);

    const sanitized = sanitizeForIframe(html);

    // Wrap in a minimal HTML shell that resets to white background
    const doc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0 !important;
    padding: 0;
    width: auto !important;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #202124;
    word-break: break-word;
  }
  img { max-width: 100%; height: auto; }
  a { color: #1a73e8; }
  table,
  tbody,
  tr,
  td,
  div { 
        max-height: none !important;
        overflow: visible !important;
    }
</style>
</head>
<body>${sanitized}</body>
</html>`;

    const onLoad = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        try {
            const doc = iframe.contentDocument;
            if (!doc) return;

            const body = doc.body;

            const h = Math.max(
                body?.scrollHeight || 0,
                body?.offsetHeight || 0
            );

            setHeight(h + 10);
        } catch (_) {}
    }, []);

    // const onLoad = useCallback(() => {
    //     const iframe = iframeRef.current;
    //     if (!iframe) return;
    //     try {
    //         const body = iframe.contentDocument?.body;
    //         if (body) {
    //             const h = body.scrollHeight;
    //             setHeight(Math.max(h + 24, 80));
    //         }
    //     } catch (_) { }
    // }, []);

    return (
        <iframe
            ref={iframeRef}
            srcDoc={doc}
            sandbox="allow-same-origin allow-popups"
            onLoad={onLoad}
            style={{
                width: "100%",
                height: `${height}px`,
                border: "none",
                borderRadius: "8px",
                display: "block",
                background: "#fff",
            }}
            title="email-body"
        />
    );
}

// ─── PlainTextBody ───────────────────────────────────────────────────────────
// Renders plain-text email body — strips "From X" header line, shows clean text

function PlainTextBody({ body, isYou }) {
    const cleaned = cleanBody(body)
        // Remove "From Name\n\n\n" style headers that appear in some messages
        .replace(/^From [^\n]+\n+/i, "")
        .trim();

    return (
        <span style={{ whiteSpace: "pre-wrap", lineHeight: 1.65, wordBreak: "break-word" }}>
            {cleaned || "(No message content)"}
        </span>
    );
}

// ─── MessageBubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");

    const isYou = msg.sender_email?.toLowerCase().includes("support@autohubexpress.us");
    const isHtml = isRichHtml(msg.body);
    // added by shiva
    // const isEbay = 
    //     msg.sender_email?.toLowerCase().includes("ebay") ||
    //     msg.subject?.toLowerCase().includes("ebay");
    // end here
    const isForward = /^Fwd(\[\d+\])?/i.test(msg.subject || "");

    const senderLabel = isYou
        ? "You"
        : msg.sender_name ||
        (msg.sender_email?.includes("<")
            ? msg.sender_email.split("<")[0].trim()
            : msg.sender_email?.split("@")[0] || "Unknown");

    const getImageUrl = (file) => {
        if (file?.url && typeof file.url === "string" && file.url.startsWith("http") &&
            !file.url.includes("undefined") && !file.url.includes("null")) {
            return file.url;
        }
        if (file?.filename) return `https://api.autohubexpress.us/uploads/${file.filename}`;
        return "https://placehold.co/300x200?text=No+Image";
    };

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isYou ? "flex-end" : "flex-start",
                    marginBottom: "20px",
                }}
            >
                {/* Sender + time */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "5px",
                        fontSize: "12px",
                        color: "#6b7280",
                    }}
                >
                    {!isYou && (
                        <div
                            style={{
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                background: "#3b82f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#fff",
                                flexShrink: 0,
                            }}
                        >
                            {senderLabel[0]?.toUpperCase() || "?"}
                        </div>
                    )}
                    <span style={{ fontWeight: 500, color: "#9ca3af" }}>{senderLabel}</span>
                    <span>·</span>
                    <span>{formatTime(msg.created_at)}</span>
                </div>

                {/* Bubble */}
                <div
                    style={{
                        maxWidth: isYou ? "78%" : "100%",
                        width: isYou ? "auto" : "100%",
                        borderRadius: isYou ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                        background: isYou ? "#2563eb" : "#1e293b",
                        border: isYou ? "none" : "1px solid #2d3748",
                        padding: isHtml && !isYou ? "0" : "12px 16px",
                        fontSize: "14px",
                        color: "#f1f5f9",
                        lineHeight: "1.65",
                        overflow: "hidden",
                    }}
                >
                    {/* ── Forwarded email ── */}
                    {isForward ? (
                        <div style={{ padding: "12px 16px" }}>
                            <div style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: "rgba(255,255,255,0.55)",
                                marginBottom: "10px",
                            }}>
                                Forwarded Email
                            </div>
                            {(() => {
                                const body = cleanBody(msg.body);
                                const fwdToMatch = body.match(/Forwarded To:\s*(.*)/i);
                                const fwdTo = fwdToMatch?.[1] || "";
                                const cleanMsg = body
                                    .replace(/Forwarded To:.*(\n)?/i, "")
                                    .replace(fwdTo, "")
                                    .trim();
                                return (
                                    <>
                                        <div style={{
                                            borderLeft: "2px solid rgba(255,255,255,0.25)",
                                            paddingLeft: "12px",
                                            marginBottom: "12px",
                                            fontSize: "13px",
                                            color: "rgba(255,255,255,0.7)",
                                            lineHeight: 1.7,
                                        }}>
                                            {fwdTo && <div><span style={{ opacity: 0.6 }}>To:</span> {fwdTo}</div>}
                                            <div><span style={{ opacity: 0.6 }}>Subject:</span> {msg.subject}</div>
                                        </div>
                                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                                            {cleanMsg.split("\n").map((line, i) => {
                                                if (line.trim().startsWith("📎")) {
                                                    const cleaned = line.replace("📎 ", "");
                                                    const [filename, url] = cleaned.split("|||");
                                                    return (
                                                        <div key={i} style={{ marginTop: "8px" }}>
                                                            <a href={url} target="_blank" rel="noreferrer"
                                                                style={{
                                                                    color: "#93c5fd",
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "6px",
                                                                    background: "rgba(255,255,255,0.08)",
                                                                    padding: "6px 12px",
                                                                    borderRadius: "8px",
                                                                    textDecoration: "none",
                                                                    fontSize: "13px",
                                                                }}>
                                                                📎 {filename}
                                                            </a>
                                                        </div>
                                                    );
                                                }
                                                return <div key={i}>{line}</div>;
                                            })}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                    // ) : isHtml && !isYou && isEbay ? (
                    //     <IframeEmailBody html={msg.body} />
                    // ) : (
                    //     <PlainTextBody
                    //         body={
                    //             isHtml
                    //                 ? normalizeEmailContent(msg.body)
                    //                 : msg.body
                    //         }
                    //         isYou={isYou}
                    //     />
                    // )
                    // end here
                    
                    ) : isHtml && !isYou ? (
                        /* ── Rich HTML email → iframe with white bg ── */
                        <IframeEmailBody html={msg.body} />
                    ) : (
                        /* ── Plain text ── */
                        <PlainTextBody body={msg.body} isYou={isYou} />
                    )
                    }
                </div>

                {/* Attachments */}
                {msg.attachments?.length > 0 && (
                    <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "8px", maxWidth: "100%" }}>
                        {msg.attachments.map((file, i) =>
                            file.filename?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ? (
                                <img
                                    key={i}
                                    src={getImageUrl(file)}
                                    alt={file.originalname || file.filename}
                                    onClick={() => {
                                        setPreviewImage(getImageUrl(file));
                                        setPreviewTitle(file.originalname || file.filename);
                                        setPreviewOpen(true);
                                    }}
                                    onError={(e) => { e.currentTarget.src = "https://placehold.co/300x200?text=Image+Not+Found"; }}
                                    style={{
                                        width: "160px", height: "110px", objectFit: "cover",
                                        borderRadius: "10px", cursor: "pointer",
                                        border: "1px solid #334155",
                                        transition: "opacity 0.15s",
                                    }}
                                />
                            ) : (
                                <a
                                    key={i}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        color: "#93c5fd", textDecoration: "none",
                                        display: "inline-flex", alignItems: "center", gap: "8px",
                                        background: "#0f172a", border: "1px solid #334155",
                                        padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
                                    }}
                                >
                                    📎 {file.originalname || file.filename}
                                </a>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* Image preview modal */}
            <Modal
                open={previewOpen}
                footer={null}
                onCancel={() => { setPreviewOpen(false); setPreviewImage(""); setPreviewTitle(""); }}
                centered
                width="80%"
                styles={{ body: { background: "#0f172a", padding: "16px", borderRadius: "16px" } }}
            >
                <div style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 600, marginBottom: "12px", wordBreak: "break-word" }}>
                    {previewTitle}
                </div>
                <img
                    src={previewImage}
                    alt="preview"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found"; }}
                    style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "10px" }}
                />
            </Modal>
        </>
    );
}

// ─── Main Inbox Component ────────────────────────────────────────────────────

export default function Inbox() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [thread, setThread] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState("all");
    const [isSending, setIsSending] = useState(false);
    const [forwardModalOpen, setForwardModalOpen] = useState(false);
    const [forwardEmail, setForwardEmail] = useState("");
    const [forwardMessage, setForwardMessage] = useState("");
    const [isForwarding, setIsForwarding] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [forwardAttachments, setForwardAttachments] = useState([]);

    const selectedEmailRef = useRef(null);
    const threadEndRef = useRef(null);
    const { message } = App.useApp();
    const emailsPerPage = 20;

    const filteredEmails =
        filter === "all" ? emails : emails.filter((e) => e.status === filter);
    const unreadCount = filteredEmails.filter((e) => e.status === "unread").length;
    const indexOfLastEmail = currentPage * emailsPerPage;
    const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
    const currentEmails = filteredEmails.slice(indexOfFirstEmail, indexOfLastEmail);
    const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);

    useEffect(() => { selectedEmailRef.current = selectedEmail; }, [selectedEmail]);

    // Auto-scroll to bottom of thread when new message arrives
    useEffect(() => {
        if (thread.length > 0) {
            setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    }, [thread.length]);

    useEffect(() => {
        const total = Math.ceil(filteredEmails.length / emailsPerPage);
        if (currentPage > total) setCurrentPage(total || 1);
    }, [emails]);

    useEffect(() => {
        const fetchEmails = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/email/all`);
                const data = await res.json();
                setEmails(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmails();
    }, []);

    // Real-time socket
    useEffect(() => {
        let socket;
        import("socket.io-client")
            .then(({ io }) => {
                socket = io(import.meta.env.VITE_SOCKET_URL || "https://api.autohubexpress.us");
                socket.on("new_email", (data) => {
                    const newEmail = data.email || data;
                    setEmails((prev) => [newEmail, ...prev]);
                    if (selectedEmailRef.current?.thread_id === newEmail.thread_id) {
                        setThread((prev) => {
                            if (prev.some((e) => e._id === newEmail._id)) return prev;
                            return [...prev, newEmail];
                        });
                    }
                });
            })
            .catch(() => { });
        return () => socket?.disconnect();
    }, []);

    const handleForwardMail = async () => {
        if (!forwardEmail.trim()) { message.warning("Enter recipient email"); return; }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(forwardEmail)) { message.warning("Enter a valid email address"); return; }
        if (isForwarding) return;
        try {
            setIsForwarding(true);
            const formData = new FormData();
            formData.append("to", forwardEmail);
            formData.append("message", forwardMessage);
            formData.append("originalEmail", JSON.stringify(selectedEmail));
            forwardAttachments.forEach((f) => formData.append("attachments", f));
            const res = await fetch(`${API_URL}/email/forward`, { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) { message.error(data.error || "Invalid email address"); return; }
            message.success("Email forwarded successfully");
            setForwardModalOpen(false);
            setForwardEmail("");
            setForwardMessage("");
            setForwardAttachments([]);
        } catch (err) {
            console.error(err);
            message.error("Forward failed");
        } finally {
            setIsForwarding(false);
        }
    };

    const sendReply = async () => {
        if (!replyText.trim()) { message.warning("Write something first"); return; }
        if (isSending) return;
        try {
            setIsSending(true);
            const to = selectedEmail.sender_email.match(/<(.+)>/)?.[1] || selectedEmail.sender_email;
            const formData = new FormData();
            formData.append("to", to);
            formData.append("subject", selectedEmail.subject);
            formData.append("message", replyText);
            attachments.forEach((f) => formData.append("attachments", f));
            await fetch(`${API_URL}/email/reply`, { method: "POST", body: formData });    // added const res by shiva
            // const data = await res.json().catch(() => ({}));  //added by shiva

            // added by shiva
            // if (!res.ok) {
            //     message.error(data.error || `Failed to send reply (${res.status})`);
            //     return;  // don't clear text, don't refresh thread
            // }
            // end here
            message.success("Reply sent");
            setReplyText("");
            setAttachments([]);
            const [emailsRes, threadRes] = await Promise.all([
                fetch(`${API_URL}/email/all`),
                fetch(`${API_URL}/email/thread/${selectedEmail._id}`),
            ]);
            setEmails(await emailsRes.json());
            const threadData = await threadRes.json();
            setThread(Array.isArray(threadData) ? threadData : []);
        } catch (err) {
            console.error(err);
            message.error("Failed to send reply");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .inbox-row:hover { background: #1e2d45 !important; }
            `}</style>

            <div style={{ padding: "16px", color: "#cbd5e1", paddingBottom: "80px", minHeight: "100vh" }}>

                {/* ── Header ── */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", gap: "10px", flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#f1f5f9" }}>
                        📩 Inbox
                    </h2>
                    {unreadCount > 0 && (
                        <span style={{
                            background: "#2563eb", color: "#fff", borderRadius: "999px",
                            padding: "2px 8px", fontSize: "12px", fontWeight: 600,
                        }}>
                            {unreadCount}
                        </span>
                    )}

                    {/* Filter buttons */}
                    <div style={{ display: "flex", gap: "6px", marginLeft: "16px" }}>
                        {["all", "unread", "read", "replied"].map((type) => (
                            <button
                                key={type}
                                onClick={() => { setFilter(type); setCurrentPage(1); }}
                                style={{
                                    padding: "4px 12px", borderRadius: "6px", border: "none",
                                    cursor: "pointer", fontSize: "12px", fontWeight: 500,
                                    background: filter === type ? "#2563eb" : "#1e293b",
                                    color: filter === type ? "#fff" : "#94a3b8",
                                    transition: "all 0.15s",
                                }}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                            <span
                                onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
                                style={{
                                    cursor: currentPage > 1 ? "pointer" : "default",
                                    opacity: currentPage > 1 ? 1 : 0.3,
                                    fontSize: "20px", color: "#94a3b8", padding: "4px 6px",
                                    lineHeight: 1,
                                }}
                            >‹</span>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <span
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    style={{
                                        minWidth: "30px", height: "30px", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        borderRadius: "6px", cursor: "pointer", fontSize: "13px",
                                        border: page === currentPage ? "1px solid #3b82f6" : "1px solid transparent",
                                        color: page === currentPage ? "#fff" : "#94a3b8",
                                        background: page === currentPage ? "#1e3a6e" : "transparent",
                                        fontWeight: page === currentPage ? 600 : 400,
                                    }}
                                >
                                    {page}
                                </span>
                            ))}
                            <span
                                onClick={() => currentPage < totalPages && setCurrentPage((p) => p + 1)}
                                style={{
                                    cursor: currentPage < totalPages ? "pointer" : "default",
                                    opacity: currentPage < totalPages ? 1 : 0.3,
                                    fontSize: "20px", color: "#94a3b8", padding: "4px 6px",
                                    lineHeight: 1,
                                }}
                            >›</span>
                        </div>
                    )}
                </div>

                {/* ── Email list ── */}
                <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #1e293b" }}>
                    {loading ? (
                        <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            justifyContent: "center", height: "400px", color: "#94a3b8",
                        }}>
                            <div style={{
                                width: "40px", height: "40px",
                                border: "3px solid rgba(255,255,255,0.08)",
                                borderTop: "3px solid #3b82f6",
                                borderRadius: "50%",
                                animation: "spin 0.8s linear infinite",
                                marginBottom: "16px",
                            }} />
                            <div style={{ fontSize: "15px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px" }}>
                                Loading Inbox...
                            </div>
                            <div style={{ fontSize: "13px", color: "#64748b" }}>Fetching your emails</div>
                        </div>
                    ) : emails.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📭</div>
                            <div style={{ fontSize: "15px" }}>No emails yet</div>
                        </div>
                    ) : (
                        currentEmails.map((email, idx) => {
                            const isSelected = selectedEmail?._id === email._id;
                            const isUnread = email.status === "unread";
                            const name = email.sender_name || email.sender_email.split("@")[0];

                            return (
                                <div
                                    key={email._id}
                                    className="inbox-row"
                                    onClick={async () => {
                                        setSelectedEmail(email);
                                        const template = `Hi ${name.split(" ")[0]},\n\nThank you for reaching out.\n\n`;
                                        setReplyText(template);
                                        const res = await fetch(`${API_URL}/email/thread/${email._id}`);
                                        const data = await res.json();
                                        setThread(Array.isArray(data) ? data : []);
                                        if (email.status === "unread") {
                                            await fetch(`${API_URL}/email/mark-read/${email._id}`, { method: "PATCH" });
                                            setEmails((prev) =>
                                                prev.map((e) =>
                                                    e._id === email._id
                                                        ? { ...e, status: e.status === "replied" ? "replied" : "read" }
                                                        : e
                                                )
                                            );
                                        }
                                    }}
                                    style={{
                                        padding: "12px 16px",
                                        borderBottom: idx < currentEmails.length - 1 ? "1px solid #1a2540" : "none",
                                        borderLeft: isSelected ? "3px solid #3b82f6" : "3px solid transparent",
                                        background: isSelected ? "#1e2d45" : isUnread ? "#172032" : "#111827",
                                        cursor: "pointer",
                                        transition: "background 0.12s",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        {/* Avatar */}
                                        <div style={{
                                            width: "36px", height: "36px", borderRadius: "50%",
                                            background: isUnread ? "#2563eb" : "#334155",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0,
                                        }}>
                                            {name[0]?.toUpperCase() || "?"}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{
                                                        fontSize: "14px",
                                                        fontWeight: isUnread ? 700 : 500,
                                                        color: isUnread ? "#f1f5f9" : "#94a3b8",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        maxWidth: "180px",
                                                    }}>
                                                        {name}
                                                    </span>
                                                    {isUnread && (
                                                        <span style={{
                                                            width: "7px", height: "7px", borderRadius: "50%",
                                                            background: "#3b82f6", flexShrink: 0, display: "inline-block",
                                                        }} />
                                                    )}
                                                </div>
                                                <span style={{ fontSize: "11px", color: "#4b5563", whiteSpace: "nowrap", marginLeft: "8px" }}>
                                                    {formatTime(email.created_at)}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: "13px",
                                                fontWeight: isUnread ? 600 : 400,
                                                color: isUnread ? "#e2e8f0" : "#6b7280",
                                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                                marginBottom: "2px",
                                            }}>
                                                {email.subject || "(No Subject)"}
                                            </div>
                                            <div style={{
                                                fontSize: "12px", color: "#4b5563",
                                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                            }}>
                                                {email.status === "replied"
                                                    ? "✓ Replied"
                                                    : cleanBody(email.body || "")
                                                        .replace(/<[^>]+>/g, "")
                                                        .slice(0, 80) || "No preview available"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Email Detail Drawer ── */}
            <Drawer
                title={
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>
                        {selectedEmail?.subject || "Email"}
                    </span>
                }
                placement="right"
                onClose={() => { setSelectedEmail(null); setThread([]); setAttachments([]); }}
                open={!!selectedEmail}
                width={680}
                styles={{
                    header: { background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "14px 20px" },
                    body: { background: "#0f172a", padding: "0" },
                    mask: { backdropFilter: "blur(2px)" },
                }}
            >
                {selectedEmail && (
                    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

                        {/* ── Email header card ── */}
                        <div style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #1e293b",
                            background: "#0f172a",
                        }}>
                            <div style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", marginBottom: "10px", lineHeight: 1.4 }}>
                                {selectedEmail.subject || "(No Subject)"}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                    width: "34px", height: "34px", borderRadius: "50%", background: "#2563eb",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0,
                                }}>
                                    {(selectedEmail.sender_name || selectedEmail.sender_email)[0]?.toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>
                                        {selectedEmail.sender_name || selectedEmail.sender_email.split("@")[0]}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {selectedEmail.sender_email.match(/<(.+)>/)?.[1] || selectedEmail.sender_email}
                                    </div>
                                </div>
                                <div style={{ fontSize: "12px", color: "#4b5563", flexShrink: 0 }}>
                                    {formatTime(selectedEmail.created_at)}
                                </div>
                            </div>
                        </div>

                        {/* ── Thread messages ── */}
                        <div style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                        }}>
                            {thread.length === 0 ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "120px", color: "#4b5563", fontSize: "13px" }}>
                                    Loading conversation...
                                </div>
                            ) : (
                                thread.map((msg) => <MessageBubble key={msg._id} msg={msg} />)
                            )}
                            <div ref={threadEndRef} />
                        </div>

                        {/* ── Reply area ── */}
                        <div style={{
                            borderTop: "1px solid #1e293b",
                            background: "#0a1628",
                            padding: "16px 20px 20px",
                        }}>
                            {/* Attachment button + chips */}
                            <div style={{ marginBottom: "10px" }}>
                                <input
                                    id="replyAttachmentInput"
                                    type="file"
                                    multiple
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files);
                                        const oversized = files.find((f) => f.size > 20 * 1024 * 1024);
                                        if (oversized) { message.error("Max file size is 20MB"); return; }
                                        setAttachments((prev) => [...prev, ...files]);
                                        e.target.value = "";
                                    }}
                                />
                                {attachments.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                                        {attachments.map((file, i) => (
                                            <div key={i} style={{
                                                background: "#1e293b", border: "1px solid #334155",
                                                borderRadius: "6px", padding: "5px 10px",
                                                display: "flex", alignItems: "center", gap: "8px",
                                                fontSize: "12px", color: "#e2e8f0", maxWidth: "200px",
                                            }}>
                                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    📄 {file.name}
                                                </span>
                                                <span
                                                    onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                                                    style={{ cursor: "pointer", color: "#ef4444", fontWeight: 700, flexShrink: 0 }}
                                                >✕</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Textarea */}
                            <div style={{
                                background: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: "12px",
                                overflow: "hidden",
                            }}>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={async (e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            await sendReply();
                                        }
                                    }}
                                    placeholder="Write a reply… (Enter to send, Shift+Enter for new line)"
                                    style={{
                                        width: "100%", minHeight: "100px", maxHeight: "200px",
                                        padding: "12px 14px",
                                        background: "transparent",
                                        border: "none",
                                        color: "#e2e8f0",
                                        fontSize: "14px",
                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                                        lineHeight: 1.6,
                                        resize: "vertical",
                                        outline: "none",
                                    }}
                                />

                                {/* Action bar inside textarea box */}
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "8px 12px",
                                    borderTop: "1px solid #2d3f55",
                                }}>
                                    <label
                                        htmlFor="replyAttachmentInput"
                                        style={{
                                            display: "inline-flex", alignItems: "center", gap: "6px",
                                            color: "#64748b", cursor: "pointer", fontSize: "13px",
                                            padding: "4px 8px", borderRadius: "6px",
                                            transition: "color 0.15s",
                                        }}
                                        title="Attach files"
                                    >
                                        📎 <span>Attach</span>
                                    </label>

                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                            onClick={() => setForwardModalOpen(true)}
                                            style={{
                                                background: "transparent", border: "1px solid #334155",
                                                padding: "6px 14px", borderRadius: "7px",
                                                color: "#94a3b8", cursor: "pointer", fontSize: "13px",
                                                fontWeight: 500,
                                            }}
                                        >
                                            Forward
                                        </button>
                                        <button
                                            disabled={isSending}
                                            onClick={sendReply}
                                            style={{
                                                background: isSending ? "#1e3a6e" : "#2563eb",
                                                border: "none", padding: "6px 18px", borderRadius: "7px",
                                                color: "#fff", cursor: isSending ? "not-allowed" : "pointer",
                                                fontSize: "13px", fontWeight: 600,
                                                opacity: isSending ? 0.7 : 1,
                                                display: "flex", alignItems: "center", gap: "6px",
                                                transition: "background 0.15s",
                                            }}
                                        >
                                            {isSending && (
                                                <span style={{
                                                    width: "12px", height: "12px",
                                                    border: "2px solid #fff", borderTop: "2px solid transparent",
                                                    borderRadius: "50%", display: "inline-block",
                                                    animation: "spin 0.6s linear infinite",
                                                }} />
                                            )}
                                            {isSending ? "Sending…" : "Send"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* ── Forward Modal ── */}
            <Modal
                title="Forward Email"
                open={forwardModalOpen}
                okText="Send"
                cancelText="Cancel"
                onCancel={() => { setForwardModalOpen(false); setForwardAttachments([]); setForwardEmail(""); setForwardMessage(""); }}
                onOk={handleForwardMail}
                confirmLoading={isForwarding}
            >
                <Input
                    placeholder="Recipient email address"
                    value={forwardEmail}
                    onChange={(e) => setForwardEmail(e.target.value)}
                    onPressEnter={(e) => e.preventDefault()}
                    style={{ marginBottom: 12 }}
                />
                <Input.TextArea
                    rows={4}
                    placeholder="Add a message (optional)…"
                    value={forwardMessage}
                    onChange={(e) => setForwardMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleForwardMail(); } }}
                />

                <div style={{ marginTop: "14px" }}>
                    <input
                        id="forwardAttachmentInput"
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const files = Array.from(e.target.files);
                            const oversized = files.find((f) => f.size > 20 * 1024 * 1024);
                            if (oversized) { message.error("Max file size is 20MB"); return; }
                            setForwardAttachments((prev) => [...prev, ...files]);
                            e.target.value = "";
                        }}
                    />
                    <label
                        htmlFor="forwardAttachmentInput"
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            background: "#1e293b", color: "#cbd5e1", border: "1px solid #334155",
                            padding: "7px 14px", borderRadius: "8px", cursor: "pointer",
                            fontSize: "13px", fontWeight: 500,
                        }}
                    >
                        📎 Attach Files
                    </label>
                    {forwardAttachments.length > 0 && (
                        <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {forwardAttachments.map((file, i) => (
                                <div key={i} style={{
                                    background: "#0f172a", border: "1px solid #334155",
                                    borderRadius: "6px", padding: "5px 10px",
                                    display: "flex", alignItems: "center", gap: "8px",
                                    color: "#e2e8f0", fontSize: "12px", maxWidth: "200px",
                                }}>
                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {file.name}</span>
                                    <span onClick={() => setForwardAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                                        style={{ cursor: "pointer", color: "#ef4444", fontWeight: 700, flexShrink: 0 }}>✕</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}

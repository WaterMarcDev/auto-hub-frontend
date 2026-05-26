import { useEffect, useState, useRef } from "react";
import { Drawer, App, Modal, Input } from "antd";    // added Modal, Input
import { io } from "socket.io-client";


const API_URL = import.meta.env.VITE_API_URL;             //added by shiva

const cleanBody = (html) => {

    if (!html) return "";

    return html

        // remove reply headers
        .replace(/On .*wrote:/gi, "")

        // remove unsubscribe/footer section
        .replace(
            /You've received this email because[\s\S]*/gi,
            ""
        )

        .replace(
            /If you feel you received it by mistake[\s\S]*/gi,
            ""
        )

        // fix broken encoding characters
        .replace(/�/g, "-")

        // remove extra spaces
        .replace(/\n\s*\n/g, "\n")

        .trim();
};

// formatTime function by shiva
function formatTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);

    const diff = (now - date) / 1000;

    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + "min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "hr ago";

    const isYesterday =
        now.toDateString() !== date.toDateString() &&
        new Date(now - 86400000).toDateString() === date.toDateString();

    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString("en-In", {
        day: "numeric",
        month: "short"
    });
}
// end here

export default function Inbox() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);   // spinner loading state by shiva
    const [selectedEmail, setSelectedEmail] = useState(null);   //added by shiva
    const [replyText, setReplyText] = useState("");
    const [thread, setThread] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);  //states 
    const [filter, setFilter] = useState("all");   // all / unread / read
    const [isSending, setIsSending] = useState(false);  // loading state
    // Forward states by shiva
    const [forwardModalOpen, setForwardModalOpen] = useState(false);
    const [forwardEmail, setForwardEmail] = useState("");
    const [forwardMessage, setForwardMessage] = useState("");
    // Forward loading by shiva
    const [isForwarding, setIsForwarding] = useState(false);

    // Attachments states by shiva
    const [attachments, setAttachments] = useState([]);
    const [forwardAttachments, setForwardAttachments] = useState([]);
    // end here

    // Image preview states
    const [previewOpen, setPreviewOpen] = useState(false);

    const [previewImage, setPreviewImage] = useState("");

    const [previewTitle, setPreviewTitle] = useState("");
    // end here

    // Real time update Usestate
    const selectedEmailRef = useRef(null);
    // end here

    const { message } = App.useApp();   // added by shiva
    const emailsPerPage = 20;

    const indexOfLastEmail = currentPage * emailsPerPage;  //calculations 
    const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
    const filteredEmails =
        filter === "all"
            ? emails
            : emails.filter((e) => e.status === filter);

    const unreadCount = filteredEmails.filter(e => e.status === "unread").length;    // compute unread count


    const currentEmails = filteredEmails.slice(indexOfFirstEmail, indexOfLastEmail);

    const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);

    // Sync REF by shiva
    useEffect(() => {
        selectedEmailRef.current = selectedEmail;
    }, [selectedEmail]);

    // Safe attachment image URL by shiva
    const getImageUrl = (file) => {

        // use backend URL directly if exists
        if (file?.url &&
            typeof file.url === "string" &&
            file.url.startsWith("http") &&
            !file.url.includes("undefined") &&
            !file.url.includes("null")
        ) {
            return file.url;
        }


        // fallback for old records
        if (
            file?.filename &&
            typeof file.filename === "string"
        ) {
            return `https://api.autohubexpress.us/uploads/${file.filename}`;
        }

        // final fallback
        return "https://placehold.co/300x200?text=No+Image";
    };
    // end here




    // Forward Mail Function by shiva
    const handleForwardMail = async () => {

        if (!forwardEmail.trim()) {

            message.warning(
                "Enter recipient email"
            );

            return;
        }

        // Email validation by shiva
        const emailRegex =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(forwardEmail)) {

            message.warning(
                "Enter valid email"
            );

            return
        }
        // end here

        if (isForwarding) return;

        try {

            setIsForwarding(true);

            const formData = new FormData();

            formData.append(
                "to",
                forwardEmail
            );

            formData.append(
                "message",
                forwardMessage
            );

            formData.append(
                "originalEmail",
                JSON.stringify(selectedEmail)
            );

            forwardAttachments.forEach(file => {

                formData.append(
                    "attachments",
                    file
                );
            });

            const res = await fetch(
                `${API_URL}/email/forward`,
                {
                    method: "POST",
                    body: formData
                }
            );


            // const res = await fetch(
            //     `${API_URL}/email/forward`,
            //     {
            //         method: "POST",

            //         headers: {
            //             "Content-Type":
            //                 "application/json",
            //         },

            //         body: JSON.stringify({

            //             to: forwardEmail,

            //             message:
            //                 forwardMessage,

            //             originalEmail:
            //                 selectedEmail,
            //         }),
            //     }
            // );

            const data = await res.json();

            if (!res.ok) {

                message.error(
                    data.error ||
                    "Invalid Email Address"
                );

                return;
            }

            message.success(
                "Email forwarded"
            );

            setForwardModalOpen(false);

            setForwardEmail("");
            setForwardMessage("");
            setForwardAttachments([]);  // clear forward attachments after success

        } catch (err) {

            console.error(err);

            message.error(
                "Forward failed"
            );
        } finally {
            setIsForwarding(false);
        }
    };
    // end here

    useEffect(() => {
        const total = Math.ceil(filteredEmails.length / emailsPerPage);

        if (currentPage > total) {
            setCurrentPage(total || 1);
        }
    }, [emails]);


    // Adding Spinner -> By Shiva
    useEffect(() => {

        const fetchEmails = async () => {

            try {

                setLoading(true);

                const res = await fetch(
                    `${API_URL}/email/all`
                );

                // // Debug type only for testing by shiva
                // await new Promise(
                //     resolve =>
                //         setTimeout(resolve, 2000)
                // );
                // // end here

                const data =
                    await res.json();

                setEmails(data);

            } catch (err) {

                console.error(err);

            } finally {

                setLoading(false);
            }
        };

        fetchEmails();

    }, []);
    // end here
    // useEffect(() => {
    //     fetch(`${API_URL}/email/all`)
    //         .then(res => res.json())
    //         .then(data => setEmails(data))
    //         .catch(err => console.error(err));
    // }, []);

    // Real Time UPDATE by shiva
    useEffect(() => {
        const socket = io(
            import.meta.env.VITE_SOCKET_URL ||
            "https://api.autohubexpress.us"
        );

        socket.on("new_email", (data) => {
            const newEmail = data.email || data;

            // update inbox instantly
            setEmails(prev => [newEmail, ...prev]);

            // update thread if open
            if (
                selectedEmailRef.current &&
                newEmail.thread_id === selectedEmailRef.current.thread_id
            ) {
                setThread(prev => {
                    const exists =
                        prev.some(
                            e => e._id === newEmail._id
                        );

                    if (exists) {
                        return prev;
                    }

                    return [...prev, newEmail];
                });
            }
        });

        return () => socket.disconnect();
    }, []);
    // end here



    return (
        <>
            {/* Adding Spinner by shiva */}
            <style>
                {`
                @keyframes spin {
                    100% {
                        transform: rotate(360deg);
                    }
                }
                .email-html-body img {
                    width: 100% !important;
                    max-width: 100% !important;
                    height: auto !important;
                    border-radius: 12px;
                    margin-top: 14px;
                    display: block;
                    object-fit: contain;
                }
                
                .email-html-body table {
                    width: 100% !important;
                }
                
                .email-html-body {
                    overflow-x: auto;
                    line-height: 1.7;
                }
                
                .email-html-body a {
                    color: #60a5fa;
                    word-break: break-word;
                    display: inline-block;
                }
                `}
            </style>
            {/* end here */}

            <div style={{ padding: "16px", color: "#cbd5e1", paddingBottom: "80px", minHeight: "100vh", }}>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "20px",
                        gap: "10px",
                    }}
                >
                    <h2 style={{ margin: 0 }}>📩 Inbox</h2>

                    {unreadCount > 0 && (
                        <span style={{
                            background: "#3b82f6",
                            color: "#fff",
                            borderRadius: "999px",
                            padding: "2px 8px",
                            fontSize: "12px",
                            fontWeight: "600"
                        }}>
                            {unreadCount}
                        </span>
                    )}

                    {/* 🔥 FILTER BUTTONS  */}
                    <div style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
                        {["all", "unread", "read"].map((type) => (
                            <button
                                key={type}
                                onClick={() => {
                                    setFilter(type);
                                    setCurrentPage(1); // reset page
                                }}
                                style={{
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                    background:
                                        filter === type ? "#3b82f6" : "#1e293b",
                                    color: filter === type ? "#fff" : "#94a3b8",
                                    fontSize: "12px"
                                }}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>


                    {/* 🔥 FINAL PAGINATION UI (LIKE YOUR IMAGE) */}
                    <div
                        style={{
                            marginTop: "16px",
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: "8px",
                            marginLeft: "auto",
                        }}
                    >
                        {/* LEFT ARROW */}
                        <span
                            onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
                            style={{
                                cursor: currentPage > 1 ? "pointer" : "default",
                                opacity: currentPage > 1 ? 1 : 0.3,
                                fontSize: "18px",
                                color: "#94a3b8",
                                padding: "6px"
                            }}
                        >
                            ‹
                        </span>

                        {/* PAGE NUMBERS */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <span
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                style={{
                                    minWidth: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "14px",

                                    // ACTIVE STYLE (LIKE YOUR IMAGE)
                                    border: page === currentPage ? "1px solid #3b82f6" : "1px solid transparent",
                                    color: page === currentPage ? "#fff" : "#94a3b8",
                                    background: page === currentPage ? "#1e293b" : "transparent"
                                }}
                            >
                                {page}
                            </span>
                        ))}

                        {/* RIGHT ARROW */}
                        <span
                            onClick={() =>
                                currentPage < totalPages && setCurrentPage((p) => p + 1)
                            }
                            style={{
                                cursor: currentPage < totalPages ? "pointer" : "default",
                                opacity: currentPage < totalPages ? 1 : 0.3,
                                fontSize: "18px",
                                color: "#94a3b8",
                                padding: "6px"
                            }}
                        >
                            ›
                        </span>
                    </div>
                </div>

                <div style={{ borderRadius: "8px", overflow: "hidden", minHeight: "500px", }}>
                    {loading ? (

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "420px",
                                color: "#94a3b8",
                            }}
                        >

                            {/* Spinner */}
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    border:
                                        "4px solid rgba(255,255,255,0.12)",

                                    borderTop:
                                        "4px solid #3b82f6",

                                    borderRadius: "50%",

                                    animation:
                                        "spin 0.8s linear infinite",

                                    marginBottom: "18px",
                                }}
                            />

                            <div
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    color: "#e2e8f0",
                                    marginBottom: "6px",
                                }}
                            >
                                Loading Inbox...
                            </div>

                            <div
                                style={{
                                    fontSize: "14px",
                                    color: "#64748b",
                                }}
                            >
                                Fetching your emails
                            </div>

                        </div>

                    ) : emails.length === 0 ? (
                        <p>No emails yet</p>
                    ) : (
                        currentEmails.map((email) => (
                            <div
                                key={email._id}
                                onClick={async () => {
                                    setSelectedEmail(email);

                                    // Add template when email opens
                                    const name = email.sender_email.includes("<")
                                        ? email.sender_email.split("<")[0].trim()
                                        : email.sender_email.split("@")[0];

                                    const template = `
Hey ${name},
                                
Thank you for reaching out.
`;

                                    setReplyText(template);
                                    // end here

                                    // fetch thread here
                                    const res = await fetch(
                                        `${API_URL}/email/thread/${email._id}`
                                    );
                                    const data = await res.json();
                                    setThread(Array.isArray(data) ? data : []);
                                    // end here fetch

                                    if (email.status === "unread") {
                                        await fetch(
                                            `${API_URL}/email/mark-read/${email._id}`,
                                            { method: "PATCH" }
                                        );

                                        setEmails((prev) =>
                                            prev.map((e) =>
                                                e._id === email._id ? { ...e, status: "read" } : e
                                            )
                                        );
                                    }
                                }}  //added by shiva

                                style={{
                                    padding: "12px 15px",
                                    borderBottom: "1px solid #2c3a55",

                                    borderLeft:
                                        selectedEmail?._id === email._id
                                            ? "3px solid #3b82f6"
                                            : "3px solid transparent",
                                    background:
                                        selectedEmail?._id === email._id
                                            ? "#1e293b"     // selected color
                                            : email.status === "unread"
                                                ? "#22304d"      //highlight unread
                                                : "#1a2338",    // normal color
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedEmail?._id !== email._id) {
                                        e.currentTarget.style.background = "#22304d";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedEmail?._id !== email._id) {
                                        e.currentTarget.style.background =
                                            email.status === "unread" ? "#22304d" : "#1a2338";
                                    }
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

                                    {/* Avatar */}
                                    <div
                                        style={{
                                            width: "38px",
                                            height: "38px",
                                            borderRadius: "50%",
                                            background: "#3b82f6",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "14px",
                                            fontWeight: "bold",
                                            color: "#fff"
                                        }}
                                    >
                                        {(() => {
                                            const raw = email.sender_email;
                                            const name = raw.includes("<")
                                                ? raw.split("<")[0].trim()
                                                : raw;

                                            return name[0].toUpperCase();
                                        })()}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                                            {/* LEFT: Name + Badge */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                {(() => {
                                                    const raw = email.sender_email;
                                                    const name = raw.includes("<")
                                                        ? raw.split("<")[0].trim()
                                                        : raw.split("@")[0];

                                                    return (
                                                        <span
                                                            style={{
                                                                color: email.status === "unread" ? "#e2e8f0" : "#94a3b8",
                                                                fontWeight: email.status === "unread" ? "700" : "400"
                                                            }}
                                                        >
                                                            {name}
                                                        </span>
                                                    );
                                                })()}

                                                {/* ✅ NEW BADGE LOCATION */}
                                                {email.status === "unread" && (
                                                    <span style={{
                                                        color: "#3b82f6",
                                                        fontSize: "11px",
                                                        fontWeight: "500"
                                                    }}>
                                                        ● New
                                                    </span>
                                                )}
                                            </div>


                                            {/* Time */}
                                            <span style={{ fontSize: "12px", color: "#6b7280" }}>
                                                {formatTime(email.created_at)}
                                            </span>
                                        </div>

                                        {/* Subject + Preview */}
                                        <div style={{ fontSize: "14px" }}>
                                            <div
                                                style={{
                                                    color: email.status === "unread" ? "#f1f5f9" : "#cbd5e1",
                                                    fontWeight: email.status === "unread" ? "700" : "400"
                                                }}
                                            >
                                                {email.subject || "(No Subject)"}
                                            </div>
                                            {/* Preview + Badge */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                }}
                                            >
                                                {/* Preview */}
                                                <div
                                                    style={{
                                                        color: email.status === "unread" ? "#a1a1aa" : "#64748b",
                                                        fontSize: "13px"
                                                    }}
                                                >
                                                    {email.body
                                                        ?.replace(/<[^>]+>/g, "")
                                                        .replace(/\s+/g, " ")
                                                        .trim()
                                                        .substring(0, 60)}...
                                                </div>

                                                {/* New Badge Position */}
                                                {/* {email.status === "unread" && (
                                                <span style={{
                                                    color: "#3b82f6",
                                                    fontSize: "11px",
                                                    fontWeight: "500",
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    ● New
                                                </span>
                                            )} */}
                                            </div>
                                        </div>
                                    </div>



                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* added by shiva */}
                <Drawer
                    title="Inbox"                     //{selectedEmail?.subject}
                    placement="right"
                    onClose={() => setSelectedEmail(null)}
                    open={!!selectedEmail}
                    width={500}
                >
                    {selectedEmail && (
                        <div style={{ padding: "16px", color: "#cbd5e1" }}>

                            {/* SUBJECT */}
                            {/* <div style={{ marginBottom: "20px" }}>
                            <h2
                                style={{
                                    margin: 0,
                                    color: "#e2e8f0",
                                    fontWeight: 600,
                                    letterSpacing: "0.3px",
                                }}
                            >
                                {selectedEmail.subject}
                            </h2>
                        </div> */}

                            {/* SENDER SECTION */}
                            {/* CLEAN EMAIL HEADER */}
                            <div style={{ marginBottom: "16px" }}>

                                {/* SUBJECT */}
                                <div style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#e2e8f0",
                                    marginBottom: "10px"
                                }}>
                                    {selectedEmail.subject || "(No Subject)"}
                                </div>

                                {/* SENDER ROW */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: "13px",
                                    color: "#94a3b8"
                                }}>
                                    <div>
                                        <span style={{ color: "#e2e8f0", fontWeight: 500 }}>
                                            {selectedEmail.sender_email.split("<")[0].trim()}
                                        </span>
                                        {" <"}
                                        {selectedEmail.sender_email.match(/<(.+)>/)?.[1] || selectedEmail.sender_email}
                                        {">"}
                                    </div>

                                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                                        {formatTime(selectedEmail.created_at)}
                                    </div>
                                </div>

                            </div>

                            {/* DIVIDER */}
                            <div style={{
                                height: "1px",
                                background: "#1f2937",
                                margin: "12px 0 20px"
                            }} />

                            {/* BODY */}
                            <div
                                style={{
                                    fontSize: "14px",
                                    lineHeight: "1.6",
                                    color: "#e5e7eb",
                                    marginTop: "12px",
                                    whiteSpace: "pre-wrap"
                                }}
                            >
                                {(Array.isArray(thread) ? thread : []).map((msg) => {
                                    const isYou = msg.sender_email.includes("autohubexpress");

                                    const isHtmlEmail =
                                        !isYou &&
                                        (
                                            msg.body?.includes("<img") ||
                                            msg.body?.includes("<table") ||
                                            msg.body?.includes("<html") ||
                                            msg.body?.includes("<div")    //Some ecommerce emails only use nested <div> layouts.
                                        );

                                    return (
                                        <div
                                            key={msg._id}
                                            style={{
                                                marginBottom: "16px",
                                                textAlign: isYou ? "right" : "left",
                                            }}
                                        >
                                            {/* Sender */}
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#94a3b8",
                                                    marginBottom: "4px",
                                                    display: "flex",
                                                    justifyContent: isYou ? "flex-end" : "flex-start",
                                                    gap: "8px",
                                                }}
                                            >
                                                <span>
                                                    {isYou
                                                        ? "You"
                                                        : msg.sender_email.includes("<")
                                                            ? msg.sender_email.split("<")[0].trim()
                                                            : msg.sender_email.split("@")[0]
                                                    }
                                                </span>
                                                <span style={{ color: "#64748b" }}>
                                                    • {formatTime(msg.created_at)}
                                                </span>
                                            </div>

                                            {/* Message */}
                                            <div
                                                style={
                                                    isHtmlEmail
                                                        ? {
                                                            background: "#1e293b",
                                                            padding: "18px",
                                                            borderRadius: "16px",
                                                            marginTop: "10px",
                                                            overflowX: "auto",
                                                            width: "100%",
                                                            maxWidth: "100%"
                                                        }
                                                        : {
                                                            display: "inline-block",
                                                            padding: "12px 16px",
                                                            borderRadius: "16px",
                                                            background: isYou ? "#3b82f6" : "#1e293b",
                                                            color: "#f8fafc",
                                                            maxWidth: "75%",
                                                            fontSize: "14px",
                                                            lineHeight: "1.6",
                                                            textAlign: "left",
                                                            whiteSpace: "pre-wrap",
                                                            wordBreak: "break-word"
                                                        }
                                                }

                                            // dangerouslySetInnerHTML={{ __html: cleanBody(msg.body) }}
                                            >
                                                {/^Fwd(\[\d+\])?/i.test(msg.subject)
                                                    ? (() => {

                                                        const body = cleanBody(msg.body);

                                                        const forwardedToMatch =
                                                            body.match(
                                                                /Forwarded To:\s*(.*)/i
                                                            );

                                                        const forwardedTo =
                                                            forwardedToMatch?.[1] || "";

                                                        const cleanMessage =
                                                            body
                                                                .replace(
                                                                    /Forwarded To:.*(\n)?/i,
                                                                    ""
                                                                )
                                                                .replace(
                                                                    forwardedTo,
                                                                    ""
                                                                )
                                                                .trim();

                                                        return (
                                                            <div>

                                                                {/* Forward Header */}
                                                                <div
                                                                    style={{
                                                                        fontSize: "13px",
                                                                        color: "rgba(255,255,255,0.75)",
                                                                        marginBottom: "12px",
                                                                        fontWeight: "500",
                                                                        letterSpacing: "0.3px",
                                                                        textTransform: "uppercase",
                                                                        fontSize: "11px",
                                                                    }}
                                                                >
                                                                    Forwarded Email
                                                                </div>

                                                                {/* Forward Meta */}
                                                                <div
                                                                    style={{
                                                                        borderLeft:
                                                                            "3px solid rgba(255,255,255,0.35)",

                                                                        paddingLeft: "12px",

                                                                        marginBottom: "12px",

                                                                        lineHeight: "1.7",
                                                                    }}
                                                                >
                                                                    <div>
                                                                        <span
                                                                            style={{
                                                                                opacity: 0.7
                                                                            }}
                                                                        >
                                                                            To:
                                                                        </span>{" "}

                                                                        {forwardedTo}
                                                                    </div>

                                                                    <div>
                                                                        <span
                                                                            style={{
                                                                                opacity: 0.7
                                                                            }}
                                                                        >
                                                                            Subject:
                                                                        </span>{" "}

                                                                        {msg.subject}
                                                                    </div>
                                                                </div>

                                                                {/* Forward Body */}
                                                                <div
                                                                    style={{
                                                                        whiteSpace: "pre-wrap",
                                                                        lineHeight: "1.7",
                                                                        textAlign: "left",
                                                                        marginTop: "16px",
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            whiteSpace: "pre-wrap",
                                                                            lineHeight: "1.7",
                                                                            textAlign: "left",
                                                                            marginTop: "16px",
                                                                        }}
                                                                    >

                                                                        {cleanMessage
                                                                            .split("\n")
                                                                            .map((line, index) => {

                                                                                const isAttachment =
                                                                                    line.trim().startsWith("📎");

                                                                                if (isAttachment) {

                                                                                    const cleaned =
                                                                                        line.replace("📎 ", "");

                                                                                    const [filename, url] =
                                                                                        cleaned.split("|||");

                                                                                    return (

                                                                                        <div
                                                                                            key={index}
                                                                                            style={{
                                                                                                marginTop: "10px",
                                                                                                background: "rgba(255,255,255,0.08)",
                                                                                                padding: "10px 14px",
                                                                                                borderRadius: "10px",
                                                                                                display: "flex",
                                                                                                alignItems: "center",
                                                                                                gap: "10px",
                                                                                                width: "fit-content",
                                                                                                maxWidth: "100%",
                                                                                                overflow: "hidden"
                                                                                            }}
                                                                                        >
                                                                                            <a
                                                                                                href={url}
                                                                                                target="_blank"
                                                                                                rel="noreferrer"
                                                                                                style={{
                                                                                                    color: "#fff",
                                                                                                    textDecoration: "none",
                                                                                                    cursor: "pointer"
                                                                                                }}
                                                                                            >
                                                                                                📎 {filename}
                                                                                            </a>
                                                                                        </div>
                                                                                    );
                                                                                }

                                                                                return (
                                                                                    <div key={index}>
                                                                                        {line}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                    </div>
                                                                    {/* {cleanMessage} */}
                                                                </div>

                                                            </div>
                                                        );

                                                    })()
                                                    : (
                                                        <>
                                                            {/* Existing HTML Rendering */}
                                                            <div
                                                                className="email-html-body"

                                                                dangerouslySetInnerHTML={{
                                                                    __html: cleanBody(msg.body)
                                                                        .replace(/📎.*$/gm, "")
                                                                }}
                                                            />

                                                            {/* Attachment Preview */}
                                                            {/* Attachments */}
                                                            {msg.attachments?.length > 0 && (

                                                                <div
                                                                    style={{
                                                                        marginTop: "10px",
                                                                        display: "flex",
                                                                        flexDirection: "column",
                                                                        gap: "10px"
                                                                    }}
                                                                >

                                                                    {msg.attachments.map((file, i) => (

                                                                        <div key={i}>


                                                                            {/* IMAGE PREVIEW */}
                                                                            {file.filename?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ? (

                                                                                <div
                                                                                    style={{
                                                                                        background: "rgba(255,255,255,0.04)",
                                                                                        padding: "8px",
                                                                                        borderRadius: "16px",
                                                                                        marginTop: "10px",
                                                                                        width: "fit-content"
                                                                                    }}
                                                                                >
                                                                                    {/* To preview the image added by shiva */}
                                                                                    <img
                                                                                        src={getImageUrl(file)}
                                                                                        alt={file.originalname || file.filename}

                                                                                        onClick={() => {

                                                                                            setPreviewImage(
                                                                                                getImageUrl(file)
                                                                                            );

                                                                                            setPreviewTitle(
                                                                                                file.originalname || file.filename
                                                                                            );

                                                                                            setPreviewOpen(true);
                                                                                        }}

                                                                                        onError={(e) => {
                                                                                            console.log("BROKEN IMAGE:", getImageUrl(file));

                                                                                            e.currentTarget.src =
                                                                                                "https://placehold.co/300x200?text=Image+Not+Found";
                                                                                        }}

                                                                                        style={{
                                                                                            width: "220px",
                                                                                            maxWidth: "100%",
                                                                                            borderRadius: "14px",
                                                                                            cursor: "pointer",
                                                                                            marginTop: "12px",
                                                                                            objectFit: "cover",
                                                                                            border: "1px solid rgba(255,255,255,0.08)",
                                                                                            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                                                                                            display: "block",
                                                                                            transition: "0.2s ease"
                                                                                        }}
                                                                                    />
                                                                                    {/* end here */}
                                                                                </div>



                                                                            ) : (

                                                                                /* FILE ATTACHMENT */
                                                                                <a
                                                                                    href={file.url}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"

                                                                                    style={{
                                                                                        color: "#fff",
                                                                                        textDecoration: "none",
                                                                                        display: "inline-flex",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                        background: "rgba(255,255,255,0.08)",
                                                                                        padding: "8px 12px",
                                                                                        borderRadius: "8px",
                                                                                        marginTop: "6px"
                                                                                    }}
                                                                                >
                                                                                    📎 {file.originalname || file.filename}
                                                                                </a>
                                                                            )}

                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}


                                                        </>
                                                    )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* {selectedEmail.body} */}
                            </div>

                            {/* Attachments Added by shiva */}
                            <div style={{ marginTop: "14px" }}>
                                {/* Hidden Input */}
                                <input
                                    id="replyAttachmentInput"
                                    type="file"
                                    multiple
                                    style={{ display: "none" }}

                                    onChange={(e) => {
                                        const files = Array.from(e.target.files);
                                        const oversized = files.find(
                                            file => file.size > 20 * 1024 * 1024
                                        );

                                        if (oversized) {
                                            message.error(
                                                "File size must be less than 20MB"
                                            );
                                            return;
                                        }

                                        setAttachments(prev => [
                                            ...prev,
                                            ...files
                                        ]);
                                    }}
                                />
                                {/* Custom Button */}
                                <label
                                    htmlFor="replyAttachmentInput"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        background: "#1e293b",
                                        color: "#cbd5e1",
                                        border: "1px solid #334155",
                                        padding: "8px 14px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight: 500
                                    }}
                                >
                                    📎 Attach Files
                                </label>
                                {/* Selected Files */}
                                {attachments.length > 0 && (
                                    <div
                                        style={{
                                            marginTop: "12px",
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "8px",
                                            // fontSize: "12px",
                                            // color: "#94a3b8"
                                        }}
                                    >
                                        {attachments.map((file, index) => (

                                            <div
                                                key={index}
                                                style={{
                                                    background: "#0f172a",
                                                    border: "1px solid #334155",
                                                    borderRadius: "8px",
                                                    padding: "8px 10px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    color: "#e2e8f0",
                                                    fontSize: "12px",
                                                    maxWidth: "220px"
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap"
                                                    }}
                                                >
                                                    📄 {file.name}
                                                </span>

                                                <span
                                                    onClick={() => {

                                                        setAttachments(prev =>
                                                            prev.filter((_, i) =>
                                                                i !== index
                                                            )
                                                        );
                                                    }}
                                                    style={{
                                                        cursor: "pointer",
                                                        color: "#ef4444",
                                                        fontWeight: "bold"
                                                    }}
                                                >
                                                    ✕
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* end here */}

                            {/* Reply  */}
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}

                                onKeyDown={async (e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();

                                        if (!replyText.trim()) {
                                            message.warning("Write something first");
                                            return;
                                        }

                                        if (isSending) return;

                                        try {
                                            setIsSending(true);

                                            const to =
                                                selectedEmail.sender_email.match(/<(.+)>/)?.[1] ||
                                                selectedEmail.sender_email;

                                            // Replace Reply API Logic with FormData
                                            const formData = new FormData();

                                            formData.append("to", to);
                                            formData.append(
                                                "subject",
                                                selectedEmail.subject
                                            );

                                            formData.append(
                                                "message",
                                                replyText
                                            );

                                            attachments.forEach(file => {
                                                formData.append(
                                                    "attachments",
                                                    file
                                                );
                                            });

                                            await fetch(`${API_URL}/email/reply`, {
                                                method: "POST",
                                                body: formData
                                            });




                                            // await fetch(`${API_URL}/email/reply`, {
                                            //     method: "POST",
                                            //     headers: {
                                            //         "Content-Type": "application/json"
                                            //     },
                                            //     body: JSON.stringify({
                                            //         to,
                                            //         subject: selectedEmail.subject,
                                            //         message: replyText
                                            //     })
                                            // });

                                            message.success("Reply sent");
                                            setReplyText("");
                                            setAttachments([]);   // added by shiva for attachments

                                            // refresh emails
                                            const res = await fetch(`${API_URL}/email/all`);
                                            const data = await res.json();
                                            setEmails(data);

                                            // refresh thread
                                            const threadRes = await fetch(
                                                `${API_URL}/email/thread/${selectedEmail._id}`
                                            );
                                            const threadData = await threadRes.json();
                                            setThread(Array.isArray(threadData) ? threadData : []);

                                        } catch (err) {
                                            console.error(err);
                                            message.error("Failed to send");
                                        } finally {
                                            setIsSending(false);
                                        }
                                    }
                                }}


                                placeholder="Write your reply..."
                                style={{
                                    width: "100%",
                                    marginTop: "16px",
                                    padding: "14px",
                                    minHeight: "180px",
                                    borderRadius: "8px",
                                    background: "#0f172a",
                                    border: "1px solid #334155",
                                    color: "#e2e8f0",
                                    fontSize: "14px",
                                    fontFamily: "Arial, sans-serif",
                                    lineHeight: "1.6",
                                    resize: "vertical",
                                    outline: "none"
                                }}
                            />

                            {/* ACTIONS */}
                            <div
                                style={{
                                    marginTop: "18px",
                                    display: "flex",
                                    gap: "20px",
                                }}
                            >

                                {/* <div
                                style={{
                                    height: "1px",
                                    background: "#1f2937",
                                    marginBottom: "16px",
                                }}
                            /> */}
                                <button
                                    disabled={isSending}
                                    onClick={async () => {
                                        if (!replyText.trim()) {
                                            message.warning("Write something first");
                                            return;
                                        }

                                        if (isSending) return    // prevent double click

                                        try {
                                            setIsSending(true);  // Start loading
                                            // extract actual email
                                            const to =
                                                selectedEmail.sender_email.match(/<(.+)>/)?.[1] ||
                                                selectedEmail.sender_email;

                                            // Replace Reply API Logic with FormData
                                            const formData = new FormData();

                                            formData.append("to", to);
                                            formData.append(
                                                "subject",
                                                selectedEmail.subject
                                            );

                                            formData.append(
                                                "message",
                                                replyText
                                            );

                                            attachments.forEach(file => {
                                                formData.append(
                                                    "attachments",
                                                    file
                                                );
                                            });

                                            await fetch(`${API_URL}/email/reply`, {
                                                method: "POST",
                                                body: formData
                                            });


                                            // await fetch(`${API_URL}/email/reply`, {
                                            //     method: "POST",
                                            //     headers: {
                                            //         "Content-Type": "application/json"
                                            //     },
                                            //     body: JSON.stringify({
                                            //         to,
                                            //         subject: selectedEmail.subject,
                                            //         message: replyText
                                            //     })
                                            // });

                                            message.success("Reply sent");
                                            setReplyText("");
                                            setAttachments([]);   // added by shiva

                                            // Optional: only reset if not already on page 1
                                            // if (currentPage !== 1) {
                                            //     setCurrentPage(1);
                                            // }
                                            // Refresh email list 
                                            const res = await fetch(`${API_URL}/email/all`);
                                            const data = await res.json();
                                            setEmails(data);

                                            // Refresh Thread also
                                            const threadRes = await fetch(
                                                `${API_URL}/email/thread/${selectedEmail._id}`
                                            );
                                            const threadData = await threadRes.json();
                                            setThread(Array.isArray(threadData) ? threadData : []);

                                        } catch (err) {
                                            console.error(err);
                                            message.error("Failed to send");
                                        } finally {
                                            setIsSending(false);    // stop loading
                                        }
                                    }}
                                    style={{
                                        background: isSending ? "#64748b" : "#3b82f6",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        color: "#fff",
                                        cursor: isSending ? "not-allowed" : "pointer",
                                        fontWeight: 500,
                                        opacity: isSending ? 0.7 : 1,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                    }}
                                >
                                    {isSending && (
                                        <span
                                            style={{
                                                width: "14px",
                                                height: "14px",
                                                border: "2px solid #fff",
                                                borderTop: "2px solid transparent",
                                                borderRadius: "50%",
                                                display: "inline-block",
                                                animation: "spin 0.6s linear infinite"
                                            }}
                                        />
                                    )}
                                    {isSending ? "Sending..." : "Send Reply"}
                                </button>

                                <button
                                    onClick={() =>
                                        setForwardModalOpen(true)
                                    }
                                    style={{
                                        background: "#334155",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        color: "#cbd5e1",
                                        cursor: "pointer",
                                    }}
                                >
                                    Forward
                                </button>

                                {/* <button
                                onClick={async () => {
                                    if (!selectedEmail) return;

                                    try {
                                        // 🔥 CALL BACKEND (IMPORTANT)
                                        await fetch(
                                            `${API_URL}/email/mark-read/${selectedEmail._id}`,
                                            { method: "PATCH" }
                                        );

                                        // 🔥 UPDATE UI
                                        setEmails((prev) =>
                                            prev.map((e) =>
                                                e._id === selectedEmail._id ? { ...e, status: "read" } : e
                                            )
                                        );

                                        setSelectedEmail((prev) => ({ ...prev, status: "read" }));

                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                style={{
                                    background: "#334155",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "6px",
                                    color: "#cbd5e1",
                                    cursor: "pointer",
                                }}
                            >
                                Mark as Read
                            </button> */}
                            </div>

                        </div>
                    )}
                </Drawer>
                {/* Forward Modal by shiva */}
                <Modal
                    title="Forward Email"
                    open={forwardModalOpen}
                    okText="Send Forward"
                    cancelText="Cancel"
                    onCancel={() => {
                        setForwardModalOpen(false);
                        setForwardAttachments([]);
                        setForwardEmail("");
                        setForwardMessage("");

                    }}
                    onOk={handleForwardMail}
                    confirmLoading={isForwarding}
                // onOk={async () => {

                //     if (!forwardEmail.trim()) {
                //         message.warning(
                //             "Enter recipient email"
                //         );
                //         return;
                //     }

                //     try {

                //         await fetch(
                //             `${API_URL}/email/forward`,
                //             {
                //                 method: "POST",

                //                 headers: {
                //                     "Content-Type":
                //                         "application/json",
                //                 },

                //                 body: JSON.stringify({

                //                     to: forwardEmail,

                //                     message:
                //                         forwardMessage,

                //                     originalEmail:
                //                         selectedEmail,
                //                 }),
                //             }
                //         );

                //         message.success(
                //             "Email forwarded"
                //         );

                //         setForwardModalOpen(false);

                //         setForwardEmail("");
                //         setForwardMessage("");

                //     } catch (err) {

                //         console.error(err);

                //         message.error(
                //             "Forward failed"
                //         );
                //     }
                // }}
                >
                    <Input
                        placeholder="Recipient Email"
                        value={forwardEmail}
                        onPressEnter={(e) => {
                            e.preventDefault();
                        }}
                        onChange={(e) =>
                            setForwardEmail(
                                e.target.value
                            )
                        }
                        style={{ marginBottom: 14 }}
                    />

                    <Input.TextArea
                        rows={4}
                        placeholder="Add message..."
                        value={forwardMessage}
                        onChange={(e) =>
                            setForwardMessage(
                                e.target.value
                            )
                        }

                        // Added by shiva On click Enter to forward the mail
                        onKeyDown={(e) => {

                            if (
                                e.key === "Enter" &&
                                !e.shiftKey
                            ) {
                                e.preventDefault();

                                handleForwardMail();
                            }
                        }}
                    // end here
                    />

                    {/* Forward Modal Attachments by shiva */}
                    <div style={{ marginTop: "14px" }}>

                        <input
                            id="forwardAttachmentInput"
                            type="file"
                            multiple
                            style={{ display: "none" }}

                            onChange={(e) => {

                                const files = Array.from(e.target.files);

                                const oversized = files.find(
                                    file => file.size > 20 * 1024 * 1024
                                );

                                if (oversized) {

                                    message.error(
                                        "File size must be less than 20MB"
                                    );

                                    return;
                                }

                                setForwardAttachments(prev => [
                                    ...prev,
                                    ...files
                                ]);
                            }}
                        />

                        <label
                            htmlFor="forwardAttachmentInput"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                background: "#1e293b",
                                color: "#cbd5e1",
                                border: "1px solid #334155",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: 500
                            }}
                        >
                            📎 Attach Files
                        </label>

                        {forwardAttachments.length > 0 && (

                            <div
                                style={{
                                    marginTop: "12px",
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "8px"
                                }}
                            >

                                {forwardAttachments.map((file, index) => (

                                    <div
                                        key={index}
                                        style={{
                                            background: "#0f172a",
                                            border: "1px solid #334155",
                                            borderRadius: "8px",
                                            padding: "8px 10px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            color: "#e2e8f0",
                                            fontSize: "12px",
                                            maxWidth: "220px"
                                        }}
                                    >

                                        <span
                                            style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            📄 {file.name}
                                        </span>

                                        <span
                                            onClick={() => {

                                                setForwardAttachments(prev =>
                                                    prev.filter((_, i) =>
                                                        i !== index
                                                    )
                                                );
                                            }}
                                            style={{
                                                cursor: "pointer",
                                                color: "#ef4444",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            ✕
                                        </span>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>




                    {/* <div style={{ marginTop: "14px" }}>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => {

                                const files = Array.from(e.target.files);

                                const oversized = files.find(
                                    file => file.size > 20 * 1024 * 1024
                                );

                                if (oversized) {
                                    message.error(
                                        "File size must be less than 20MB"
                                    );
                                    return;
                                }

                                setForwardAttachments(files);
                            }}
                        />

                        {forwardAttachments.length > 0 && (
                            <div
                                style={{
                                    marginTop: "8px",
                                    fontSize: "12px",
                                    color: "#94a3b8"
                                }}
                            >
                                {forwardAttachments.map(file => (
                                    <div key={file.name}>
                                        📎 {file.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div> */}
                    {/* end here */}
                </Modal>
                {/* end here */}
            </div>

            {/* IMAGE PREVIEW MODAL by shiva */}
            <Modal
                open={previewOpen}
                footer={null}
                onCancel={() => {
                    setPreviewOpen(false);
                    setPreviewImage("");
                    setPreviewTitle("");
                }}

                centered

                width="75%"

                bodyStyle={{
                    background: "#0f172a",
                    padding: "18px",
                    borderRadius: "16px"
                }}
            >
                <div
                    style={{
                        color: "#e2e8f0",
                        fontSize: "15px",
                        fontWeight: 600,
                        marginBottom: "14px",
                        wordBreak: "break-word"
                    }}
                >
                    {previewTitle}
                </div>

                <img
                    src={previewImage}
                    alt="preview"

                    onError={(e) => {
                        e.currentTarget.src =
                            "https://placehold.co/600x400?text=Image+Not+Found";
                    }}

                    style={{
                        width: "100%",
                        maxHeight: "80vh",
                        objectFit: "contain",
                        borderRadius: "12px",
                        background: "#020617"
                    }}
                />
            </Modal>

        </>

    );
}
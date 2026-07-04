import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import styles from "./Ai.module.css";

// ── React Icons ──────────────────────────────
import { HiPlus, HiArrowLeft, HiArrowUp } from "react-icons/hi2";
import { BsChatLeftText, BsTrash3 } from "react-icons/bs";
import { FiSun, FiMoon, FiSidebar, FiAlertCircle } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { RiRobot2Fill, RiAi } from "react-icons/ri";
import { IoSparkles } from "react-icons/io5";
import { MdLaptopMac, MdPhoneIphone, MdHeadphones, MdWatch } from "react-icons/md";
import Navbar from "../components/navbar";

// ── Suggestion chips for the welcome screen ──
const SUGGESTIONS = [
    { Icon: MdLaptopMac, text: "Best laptop under ₹60,000 for coding" },
    { Icon: MdPhoneIphone, text: "Compare latest smartphones under ₹30,000" },
    { Icon: MdHeadphones, text: "Recommend noise-cancelling headphones" },
    { Icon: MdWatch, text: "Best smartwatches for fitness tracking" },
];

// ── Get time-based greeting ─────────────────
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
}

// ── Simple markdown-to-HTML renderer ─────────
function renderMarkdown(text) {
    if (!text) return "";

    let html = text
        // Escape HTML entities
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")

        // Code blocks (```)
        .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")

        // Inline code
        .replace(/`([^`]+)`/g, "<code>$1</code>")

        // Bold
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

        // Italic
        .replace(/\*(.+?)\*/g, "<em>$1</em>")

        // Headings (h3 max in chat)
        .replace(/^### (.+)$/gm, "<h4>$1</h4>")
        .replace(/^## (.+)$/gm, "<h3>$1</h3>")

        // Horizontal rules
        .replace(/^---+$/gm, "<hr/>")

        // Unordered list items
        .replace(/^[-•] (.+)$/gm, "<li>$1</li>")

        // Ordered list items
        .replace(/^\d+\.\s(.+)$/gm, "<li>$1</li>");

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, "<ul>$1</ul>");

    // Paragraphs — split by double newlines
    html = html
        .split(/\n\n+/)
        .map(block => {
            block = block.trim();
            if (!block) return "";
            if (
                block.startsWith("<h") ||
                block.startsWith("<ul") ||
                block.startsWith("<ol") ||
                block.startsWith("<pre") ||
                block.startsWith("<hr")
            ) {
                return block;
            }
            return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
        })
        .join("");

    return html;
}

// ── Format timestamp ────────────────────────
function formatTime(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;

    const hours = date.getHours();
    const mins = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;
    const m = mins.toString().padStart(2, "0");

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
        return `${h}:${m} ${ampm}`;
    }

    // Otherwise show date
    return `${date.getDate()}/${date.getMonth() + 1} ${h}:${m} ${ampm}`;
}

// ══════════════════════════════════════════════
//  Main AI Chat Component
// ══════════════════════════════════════════════
const Ai = () => {
    // ── State ────────────────────────────────
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [conversations, setConversations] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("");

    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const { theme, toggleTheme } = useTheme();

    // ── Auto-scroll to bottom ────────────────
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, scrollToBottom]);

    // ── Fetch current user + conversations on mount ─
    useEffect(() => {
        const init = async () => {
            try {
                const userRes = await api.get("/api/auth/me");
                setUserEmail(userRes.data.email || userRes.data.username || "");
                const name = userRes.data.name || userRes.data.email || "User";
                const displayName = name.includes("@") ? name.split("@")[0] : name;
                setUserName(userRes.data.name);
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
            loadConversations();
        };
        init();
    }, []);

    // ── Auto-resize textarea ─────────────────
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
    }, [input]);

    // ── API: Load all conversations ──────────
    const loadConversations = async () => {
        try {
            const res = await api.get("/api/chat/conversations");
            setConversations(res.data || []);
        } catch (err) {
            // Endpoint might not exist yet — gracefully degrade
            console.error("Failed to load conversations:", err);
            setConversations([]);
        }
    };

    // ── API: Load messages for a conversation ─
    const loadMessages = async (convId) => {
        try {
            const res = await api.get(`/api/chat/${convId}`);
            const data = res.data || [];
            setMessages(
                data.map((m) => ({
                    role: m.role === "USER" ? "user" : "ai",
                    text: m.message,
                    timestamp: m.createdAt,
                }))
            );
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    };

    // ── Switch active conversation ───────────
    const switchChat = async (convId) => {
        setActiveId(convId);
        setSidebarOpen(false);
        await loadMessages(convId);
    };

    // ── Create new conversation ──────────────
    const createNewChat = () => {
        setActiveId(null);
        setMessages([]);
        setInput("");
        setSidebarOpen(false);
    };

    // ── Delete a conversation ────────────────
    const deleteChat = async (e, convId) => {
        e.stopPropagation();
        try {
            await api.delete(`/api/chat/${convId}`);
            setConversations((prev) => prev.filter((c) => c.id !== convId));
            if (activeId === convId) {
                setActiveId(null);
                setMessages([]);
            }
        } catch (err) {
            console.error("Failed to delete conversation:", err);
        }
    };

    // ── Send message ─────────────────────────
    const sendMessage = async (overrideText) => {
        const text = (overrideText || input).trim();
        if (!text || loading) return;

        // Add user message to UI immediately
        const userMsg = { role: "user", text, timestamp: new Date().toISOString() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            let convId = activeId;

            // If no active conversation, create one first
            // Backend expects: dto.message = email, authentication provides the title
            if (!convId) {
                const createRes = await api.post("/api/chat", { message: userEmail });
                convId = createRes.data.id;
                setActiveId(convId);
                // Refresh sidebar
                loadConversations();
            }

            // Send the actual user message
            const res = await api.post(`/api/chat/${convId}/addMessage`, {
                message: text,
            });

            const aiMsg = {
                role: "ai",
                text: res.data.message,
                timestamp: res.data.createdAt,
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
            console.error("Send message failed:", err);
            setMessages((prev) => [
                ...prev,
                {
                    role: "error",
                    text: "Something went wrong. Please try again.",
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // ── Handle suggestion chip click ─────────
    const handleSuggestion = (text) => {
        setInput(text);
        sendMessage(text);
    };

    const renderInputBox = (isCentered = false) => (
        <div className={`${styles.inputContainer} ${isCentered ? styles.inputContainerCentered : ""}`}>
            <div className={styles.inputBox}>
                <textarea
                    ref={isCentered ? null : textareaRef}
                    className={styles.inputTextarea}
                    placeholder="Ask anything"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={loading}
                />
                <button
                    className={`${styles.sendBtn} ${input.trim() ? styles.sendBtnActive : ""}`}
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    aria-label="Send message"
                >
                    <HiArrowUp size={18} />
                </button>
            </div>
            <div className={styles.inputDisclaimer}>
                TechMart AI can make mistakes. Verify important product information.
            </div>
        </div>
    );

    // ── Handle keyboard shortcuts ────────────
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // ══════════════════════════════════════════
    //  Render
    // ══════════════════════════════════════════
    return (
        <div>
        <Navbar searchVal="" setSearchVal={() => {}} />
        <div className={styles.aiPage}>
            {/* ── Sidebar Overlay (mobile) ─── */}
            {sidebarOpen && (
                <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar ──────────────────── */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
                <div className={styles.sidebarHeader}>
                    <button className={styles.newChatBtn} onClick={createNewChat}>
                        <span className={styles.newChatIcon}>
                            <HiPlus size={18} />
                        </span>
                        New chat
                    </button>
                </div>

                <nav className={styles.sidebarNav}>
                    {conversations.length > 0 && (
                        <div className={styles.sidebarLabel}>Recent</div>
                    )}
                    {conversations.map((convo) => (
                        <div
                            key={convo.id}
                            className={`${styles.chatItem} ${convo.id === activeId ? styles.chatItemActive : ""}`}
                            onClick={() => switchChat(convo.id)}
                        >
                            <span className={styles.chatItemIcon}>
                                <BsChatLeftText size={14} />
                            </span>
                            <span className={styles.chatItemTitle}>{convo.title}</span>
                            <button
                                className={styles.chatDeleteBtn}
                                onClick={(e) => deleteChat(e, convo.id)}
                                title="Delete conversation"
                            >
                                <BsTrash3 size={13} />
                            </button>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div className={styles.sidebarEmpty}>
                            <BsChatLeftText size={28} opacity={0.3} />
                            <span>No conversations yet</span>
                        </div>
                    )}
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link to="/" className={styles.backLink}>
                        <HiArrowLeft size={16} />
                        Back to TechMart
                    </Link>
                </div>
            </aside>

            {/* ── Main Chat Area ──────────── */}
            <main className={styles.mainArea}>

                {/* Chat / Welcome */}
                {messages.length === 0 && !loading ? (
                    <div className={styles.welcomeScreen}>
                        <h1 className={styles.welcomeTitle}>
                            {getGreeting()}, {userName || "User"}<span className={styles.welcomeGradient}>.</span>
                        </h1>
                        <p className={styles.welcomeSubtitle}>
                            Where should we begin?
                        </p>
                        {renderInputBox(true)}
                    </div>
                ) : (
                    <div className={styles.chatContainer}>
                        <div className={styles.messagesWrap}>
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`${styles.messageRow} ${msg.role === "user" ? styles.messageRowUser : msg.role === "error" ? styles.messageRowError : styles.messageRowAi}`}
                                >
                                    <div className={`${styles.avatar} ${msg.role === "user" ? styles.avatarUser : styles.avatarAi}`}>
                                        {msg.role === "user" ? (
                                            <FaUser size={14} />
                                        ) : (
                                            <RiAi size={16} />
                                        )}
                                    </div>
                                    <div className={styles.messageContent}>
                                        <div className={styles.messageSender}>
                                            {msg.role === "user" ? "You" : msg.role === "error" ? "Error" : "TechMart AI"}
                                            <span className={styles.messageTime}>{formatTime(msg.timestamp)}</span>
                                        </div>
                                        {msg.role === "error" ? (
                                            <div className={styles.errorBubble}>
                                                <FiAlertCircle size={16} />
                                                {msg.text}
                                            </div>
                                        ) : msg.role === "user" ? (
                                            <div className={styles.messageText}>
                                                <p>{msg.text}</p>
                                            </div>
                                        ) : (
                                            <div
                                                className={styles.messageText}
                                                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {loading && (
                                <div className={styles.typingRow}>
                                    <div className={`${styles.avatar} ${styles.avatarAi}`}>
                                        <RiAi size={16} />
                                    </div>
                                    <div className={styles.messageContent}>
                                        <div className={styles.messageSender}>TechMart AI</div>
                                        <div className={styles.typingBubble}>
                                            <span className={styles.typingDot} />
                                            <span className={styles.typingDot} />
                                            <span className={styles.typingDot} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>
                    </div>
                )}

                {/* Input Area */}
                {(messages.length > 0 || loading) && (
                    <div className={styles.inputArea}>
                        <div className={styles.inputGradient} />
                        {renderInputBox(false)}
                    </div>
                )}
            </main>
        </div>
        </div>
    );
};

export default Ai;
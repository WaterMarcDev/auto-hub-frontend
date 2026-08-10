import { useState } from "react";
import { Popover } from "antd";
import {
    GlobalOutlined,
    TeamOutlined,
    InstagramOutlined,
    FacebookOutlined,
    WhatsAppOutlined,
    TikTokOutlined,
    ShoppingOutlined,
    GoogleOutlined,
    MessageOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons";

// Shared visual language for every "source" value across Part Request and
// Junk Car Request (the two models use slightly different vocabularies —
// "Online"/"Offline" vs "Manual" — so this keys by the union of both).
// Icons are the primary differentiator (not color alone), since several
// channels share a color family on purpose to keep the palette restrained.
const SOURCE_STYLES = {
    Online: { icon: GlobalOutlined, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    Website: { icon: GlobalOutlined, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    Offline: { icon: TeamOutlined, color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
    Manual: { icon: TeamOutlined, color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
    Instagram: { icon: InstagramOutlined, color: "#C13584", bg: "#FDF2F8", border: "#FBCFE8" },
    Facebook: { icon: FacebookOutlined, color: "#1877F2", bg: "#EFF6FF", border: "#BFDBFE" },
    WhatsApp: { icon: WhatsAppOutlined, color: "#0D9C58", bg: "#F0FDF4", border: "#BBF7D0" },
    TikTok: { icon: TikTokOutlined, color: "#111827", bg: "#F3F4F6", border: "#D1D5DB" },
    eBay: { icon: ShoppingOutlined, color: "#0D9488", bg: "#F0FDFA", border: "#99F6E4" },
    "Google Business": { icon: GoogleOutlined, color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
    SMS: { icon: MessageOutlined, color: "#475569", bg: "#F8FAFC", border: "#E2E8F0" },
    Other: { icon: QuestionCircleOutlined, color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
};

const FALLBACK_STYLE = SOURCE_STYLES.Other;

function Chip({ value, styleFor, size, interactive, active }) {
    const { icon: Icon, color, bg, border } = styleFor(value);

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: size === "sm" ? "3px 10px" : "5px 12px",
                borderRadius: 999,
                background: bg,
                border: `1px solid ${active ? color : border}`,
                color,
                fontSize: size === "sm" ? 12 : 13,
                fontWeight: 600,
                lineHeight: 1.4,
                whiteSpace: "nowrap",
                cursor: interactive ? "pointer" : "default",
                userSelect: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
                boxShadow: active ? `0 0 0 1px ${color}33` : "none",
            }}
        >
            <Icon style={{ fontSize: size === "sm" ? 12 : 13 }} />
            {value || "Unknown"}
        </span>
    );
}

/**
 * Premium, non-dropdown source display/selector. At rest it renders a single
 * colored chip (never a "Select ▼" control). When `onChange` is provided the
 * chip becomes a click target that opens a small popover grid of selectable
 * source pills; without `onChange` it renders as a static, read-only badge.
 */
export default function SourceBadge({ value, options, onChange, disabled, readOnlyReason }) {
    const [open, setOpen] = useState(false);

    const styleFor = (v) => SOURCE_STYLES[v] || FALLBACK_STYLE;

    const interactive = Boolean(onChange) && !disabled;

    const trigger = (
        <span title={!interactive && readOnlyReason ? readOnlyReason : undefined}>
            <Chip value={value} styleFor={styleFor} interactive={interactive} />
        </span>
    );

    if (!interactive) {
        return trigger;
    }

    return (
        <Popover
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomLeft"
            content={
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 6,
                        maxWidth: 300,
                    }}
                >
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                setOpen(false);
                                if (opt.value !== value) onChange(opt.value);
                            }}
                        >
                            <Chip
                                value={opt.value}
                                styleFor={styleFor}
                                size="sm"
                                interactive
                                active={opt.value === value}
                            />
                        </div>
                    ))}
                </div>
            }
        >
            {trigger}
        </Popover>
    );
}

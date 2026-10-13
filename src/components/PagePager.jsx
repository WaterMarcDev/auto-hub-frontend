import { LeftOutlined, RightOutlined, DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";

/**
 * «  ‹ Prev  [n-1] [n] [n+1]  Next ›  » — at most 3 page numbers around the
 * current page. First/Prev are disabled on page 1, Next/Last on the last page.
 * Hidden when there is only one page.
 */
const PagePager = ({ page, totalPages, onChange, disabled = false }) => {
  if (totalPages <= 1) return null;

  const windowStart = Math.max(1, Math.min(page - 1, totalPages - 2));
  const pages = Array.from({ length: Math.min(3, totalPages) }, (_, i) => windowStart + i);
  const items = [
    { key: "first", label: <DoubleLeftOutlined />, target: 1, title: "First page" },
    { key: "prev", label: <><LeftOutlined /> Prev</>, target: page - 1, title: "Previous page" },
    ...pages.map((p) => ({ key: p, label: p, target: p, title: `Page ${p}` })),
    { key: "next", label: <>Next <RightOutlined /></>, target: page + 1, title: "Next page" },
    { key: "last", label: <DoubleRightOutlined />, target: totalPages, title: "Last page" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
      <style>{`.page-pager-btn:not(:disabled):not([aria-current]):hover { border-color: #5b3fa6 !important; color: #f1f5f9 !important; }`}</style>
      {items.map(({ key, label, target, title }) => {
        const active = key === page;
        const off = disabled || (typeof key === "string" && (target < 1 || target > totalPages || target === page));
        return (
          <button
            key={key}
            type="button"
            title={title}
            className="page-pager-btn"
            disabled={off}
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(target)}
            style={{
              minWidth: "36px", height: "36px", padding: "0 12px",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
              borderRadius: "8px", fontSize: "13px", fontWeight: active ? 600 : 500,
              border: `1px solid ${active ? "#5b3fa6" : "#334155"}`,
              background: active ? "#5b3fa6" : "#1e293b",
              color: active ? "#fff" : "#cbd5e1",
              cursor: off ? "default" : "pointer",
              opacity: off && !active ? 0.4 : 1,
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default PagePager;

// Print a check-in's invoice (Invoice buttons on the Check-In lists).
//
// The invoice HTML is fetched first, so a server error (expired login,
// missing check-in, template error) is shown as a message instead of the
// error text being loaded into the print frame and sent to the printer.
// The HTML then goes into a hidden same-origin iframe (srcdoc) and is
// printed once: the page's own ?autoPrint script does not run there, so there
// is no second print dialog.
import api from "./api";

const errorText = (err) => {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) {
    const text = data.trim();
    if (text.startsWith("{")) {
      // JSON error ({ error } / { message }) read as text.
      try {
        const json = JSON.parse(text);
        if (json?.error || json?.message) return String(json.error || json.message);
      } catch {
        // not JSON
      }
    } else if (!text.startsWith("<")) {
      // 404 / 500 answers of the print endpoint are plain text.
      return text.slice(0, 200);
    }
  }
  return data?.error || err?.message || "Failed to load invoice";
};

/**
 * Fetches an invoice page from the API (e.g. "/checkins/<id>/print-invoice")
 * and prints it once. Also used by Element Hub.
 * @param {string} path API path of the HTML invoice
 * @returns {Promise<void>} resolves once the print dialog was opened;
 *   rejects with an Error whose message can be shown to the user.
 */
export const printInvoiceFromApi = async (path) => {
  let html;
  try {
    const res = await api.get(path, {
      responseType: "text",
      headers: { Accept: "text/html" },
    });
    html = typeof res.data === "string" ? res.data : "";
  } catch (err) {
    throw new Error(errorText(err));
  }
  if (!html.trim()) throw new Error("The invoice is empty. Please try again.");

  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, {
      position: "fixed",
      right: "0",
      bottom: "0",
      width: "1px",
      height: "1px",
      opacity: "0",
      border: "0",
      pointerEvents: "none",
    });

    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      try {
        iframe.parentNode?.removeChild(iframe);
      } catch {
        // ignore
      }
    };

    iframe.onload = () => {
      const win = iframe.contentWindow;
      if (!win) {
        remove();
        reject(new Error("Failed to open print dialog"));
        return;
      }
      // Remove the frame only after printing is done (print() blocks in
      // some browsers and not in others).
      win.addEventListener?.("afterprint", () => setTimeout(remove, 500));
      try {
        win.focus();
        win.print();
        resolve();
      } catch (e) {
        console.error("Print error:", e);
        remove();
        reject(new Error("Failed to open print dialog"));
        return;
      }
      // Fallback clean-up if "afterprint" never fires.
      setTimeout(remove, 60000);
    };

    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
};

/**
 * @param {string} checkInId
 */
export const printCheckInInvoice = async (checkInId) => {
  if (!checkInId) throw new Error("Check-in not found");
  return printInvoiceFromApi(`/checkins/${checkInId}/print-invoice`);
};

export default printCheckInInvoice;

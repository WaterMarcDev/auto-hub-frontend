import { useCallback, useEffect, useRef } from "react";

const AUTOSAVE_DELAY_MS = 800;

// The server answers 404 (lead gone) or 409 (lead already picked up by staff
// / too old) when an existing lead can't be updated any more — the form then
// starts a fresh lead with everything it has.
const RESTART_STATUSES = [404, 409];

const isEmpty = (value) => value === undefined || value === null || value === "";

/**
 * Progressive lead capture against a unified create-or-update endpoint
 * (POST without leadId -> create, POST with leadId -> update).
 *
 * - The first successful save stores the returned leadId; every later save
 *   sends it, so one form session only ever produces one lead.
 * - Saves run one at a time, so a slow first create can't race a second
 *   create from fast typing or a double-click.
 * - Autosaves only send fields that changed since the last successful save.
 *
 * @param {string} endpoint      API path, e.g. "/part-request"
 * @param {object} createDefaults extra fields sent only when creating
 */
export function useLeadCapture(endpoint, createDefaults = {}) {
    const leadIdRef = useRef(null);
    const savedRef = useRef({});
    const queueRef = useRef(Promise.resolve());
    const timerRef = useRef(null);
    const generationRef = useRef(0);
    const createDefaultsRef = useRef(createDefaults);
    createDefaultsRef.current = createDefaults;

    const post = useCallback(async (payload) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    }, [endpoint]);

    const create = useCallback(async (values) => {
        const payload = { ...createDefaultsRef.current };
        Object.entries(values).forEach(([key, value]) => {
            if (!isEmpty(value)) payload[key] = value;
        });
        return { result: await post(payload), sent: payload };
    }, [post]);

    /**
     * @param {object}  values  current form values (already normalized)
     * @param {boolean} full    send every value (final submit) instead of
     *                          only the changed ones
     */
    const save = useCallback((values, { full = false } = {}) => {
        const generation = generationRef.current;

        const task = async () => {
            // The form was reset while this save was queued.
            if (generation !== generationRef.current) return { ok: true, skipped: true };

            let attempt;

            if (!leadIdRef.current) {
                attempt = await create(values);
            } else {
                const payload = {};
                Object.entries(values).forEach(([key, value]) => {
                    if (value === undefined) return;
                    if (full || (value ?? "") !== (savedRef.current[key] ?? "")) payload[key] = value;
                });

                if (Object.keys(payload).length === 0) return { ok: true, skipped: true };

                attempt = {
                    result: await post({ ...payload, leadId: leadIdRef.current }),
                    sent: payload,
                };

                if (!attempt.result.ok && RESTART_STATUSES.includes(attempt.result.status)) {
                    leadIdRef.current = null;
                    savedRef.current = {};
                    attempt = await create(values);
                }
            }

            const { result, sent } = attempt;

            if (result.ok && generation === generationRef.current) {
                if (result.data?.leadId) leadIdRef.current = result.data.leadId;
                savedRef.current = { ...savedRef.current, ...sent };
            }

            return result;
        };

        const run = queueRef.current.then(task, task);
        queueRef.current = run.catch(() => {});
        return run;
    }, [create, post]);

    const cancelAutosave = useCallback(() => {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }, []);

    /**
     * Debounced background save. `getDraft` runs when the timer fires and
     * returns the values to save, or null when there isn't enough yet to
     * create a lead.
     */
    const scheduleAutosave = useCallback((getDraft) => {
        cancelAutosave();
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            const draft = getDraft();
            if (!draft) return;
            save(draft).catch((error) => console.warn("Lead autosave failed:", error));
        }, AUTOSAVE_DELAY_MS);
    }, [cancelAutosave, save]);

    // Final submit: stop pending autosaves and save everything.
    const submit = useCallback((values) => {
        cancelAutosave();
        return save(values, { full: true });
    }, [cancelAutosave, save]);

    // Start over (after a successful submit) — the next save creates a new lead.
    const reset = useCallback(() => {
        cancelAutosave();
        generationRef.current += 1;
        leadIdRef.current = null;
        savedRef.current = {};
    }, [cancelAutosave]);

    useEffect(() => cancelAutosave, [cancelAutosave]);

    return { scheduleAutosave, submit, reset, getLeadId: () => leadIdRef.current };
}

export default useLeadCapture;

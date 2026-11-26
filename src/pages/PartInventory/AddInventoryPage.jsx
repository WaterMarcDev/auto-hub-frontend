import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Table,
    Checkbox,
    InputNumber,
    Select,
    Input,
    Button,
    Modal,
    message,
} from "antd";
import { DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";

import TitleBox from "../../components/TitleBox";
import CameraUpload from "../../components/CameraUpload";
import PageContentWrapper from "../../components/PageContentWrapper";
import { isRemovedPart } from "../../utils/removedParts";
import UnitInput from "../../components/UnitInput";
import NumericInput from "../../components/NumericInput";
import { TEXT_LIMITS, cleanText, weightError } from "../../components/inventory/fieldRules";

import {
    inventoryAPI,
    uploadAPI,
    assetTagsAPI,
    partAPI,
} from "../../utils/api";

const toTitle = (s) =>
    s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (c) => c.toUpperCase());

// Key of a catalog part in an intake's partDetails.parts ("Front Bumper" ->
// "frontBumper"): the same key the Car Intake Step 3 table (CarDiagnosis.jsx)
// uses when it saves the parts.
const intakePartKey = (name) => {
    const words = String(name || "")
        .replace(/[^a-zA-Z0-9 ]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!words.length) return "";
    return (
        words[0].toLowerCase() +
        words
            .slice(1)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join("")
    );
};

const EditableCell = ({ value: initial, onCommit, placeholder, numeric = false, maxLength }) => {
    const [val, setVal] = useState(initial ?? "");

    useEffect(() => setVal(initial ?? ""), [initial]);

    // Weight: numbers only, 0 - 10,000 with up to 2 decimals.
    if (numeric) {
        const error = weightError(val);
        return (
            <>
                <NumericInput
                    size="small"
                    value={val}
                    placeholder={placeholder}
                    maxLength={8}
                    status={error ? "error" : undefined}
                    onChange={setVal}
                    onBlur={() => onCommit(val)}
                    onPressEnter={() => onCommit(val)}
                />
                {error && (
                    <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 2 }}>{error}</div>
                )}
            </>
        );
    }

    // Text: spaces at the ends are dropped when the value is committed.
    const commit = () => onCommit(cleanText(val) ?? "");
    return (
        <Input
            size="small"
            value={val}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={(e) => setVal(e.target.value)}
            onBlur={commit}
            onPressEnter={commit}
        />
    );
};

const AddInventoryPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [inventoryRecord, setInventoryRecord] = useState(null);
    const [inventoryParts, setInventoryParts] = useState({});
    const [partImages, setPartImages] = useState({});
    const [loading, setLoading] = useState(false);

    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");

    const [tagCache, setTagCache] = useState({});
    const searchDebounceRef = useRef(null);

    useEffect(() => {
        if (!state?.record) {
            message.error("Invalid inventory data");
            navigate(-1);
            return;
        }

        const record = state.record;

        (async () => {
            let existingPartNames = new Set();
            try {
                const res = await inventoryAPI.getByVIN(record.vin);
                const items = res.data?.inventoryItems || res.inventoryItems || [];
                existingPartNames = new Set(items.map((i) => i.partName));
            } catch (err) {
                console.error("Failed to load existing inventory for VIN", err);
            }

            // Catalog units, keyed like the Car Intake Step 3 rows, for parts
            // whose intake record has no unit (see maxUnit below).
            let catalogUnits = {};
            try {
                const res = await partAPI.getAll({ limit: 1000 });
                const list = res?.data?.parts || res?.data || [];
                if (Array.isArray(list)) {
                    list.forEach((cp) => {
                        const k = intakePartKey(cp.name);
                        const u = Number(cp.unit);
                        if (k && !(k in catalogUnits) && Number.isFinite(u) && u > 0) {
                            catalogUnits[k] = u;
                        }
                    });
                }
            } catch (err) {
                console.error("Failed to load parts catalog", err);
            }

            const allSelectedKeys = Object.keys(record.partDetails.parts || {}).filter(
                // Parts removed from the CRM (A1, A2, Windshield, Heated Windshield)
                // are not added to inventory.
                (key) => record.partDetails.parts[key]?.selected && !isRemovedPart(key)
            );

            const parts = {};
            allSelectedKeys.forEach((key) => {
                // Already in active Inventory for this VIN — nothing left to do
                // for this part, so it isn't shown as something to add again.
                if (existingPartNames.has(key)) return;

                const p = record.partDetails.parts[key];
                // Unit cannot go above what was recorded for this part at
                // Car Intake (Step 3 caps that at the catalog unit). When
                // the intake has no unit, the catalog unit is the cap.
                // The server applies the same rule (bulkCreateInventory).
                const recorded = Number(p.unit);
                const maxUnit =
                    Number.isFinite(recorded) && recorded > 0
                        ? recorded
                        : catalogUnits[key];
                parts[key] = {
                    extracted: !!p.extracted,
                    cleaned: !!p.cleaned,
                    unit: p.unit || 0,
                    maxUnit,
                    placed: p.placed || "",
                    dimensions: p.dimensions || "",
                    weight: p.weight || "",
                    quality: p.quality || "",
                    label: key,
                };
            });


            setInventoryRecord(record);
            setInventoryParts(parts);

            // Intakes saved before the Step 3 weight rule may hold weights
            // the inventory refuses (e.g. 3 decimals): say which, so they
            // can be fixed in the Weight column before Submit.
            const badWeights = Object.values(parts)
                .filter((p) => weightError(p.weight))
                .map((p) => toTitle(p.label));
            if (badWeights.length) {
                message.warning(
                    `Fix the Weight for: ${badWeights.join(", ")} (a number up to 15,000 with at most 2 decimals) before submitting.`,
                    8
                );
            }
        })();
    }, [state, navigate]);

    const handleInventoryChange = (key, field, value) => {
        setInventoryParts((prev) => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }));
    };

    const handleImageUpload = (key, res) => {
        const imageUrl = res?.imageUrl || res?.url || res;
        if (!imageUrl) return message.error("Invalid image");
        setPartImages((prev) => ({ ...prev, [key]: imageUrl }));
        message.success("Image uploaded successfully");
    };

    const handleRemoveImage = (key) => {
        setPartImages((prev) => ({ ...prev, [key]: null }));
        message.success("Image removed");
    };

    const handlePreviewImage = (url) => {
        setImagePreviewUrl(url);
        setImagePreviewVisible(true);
    };


    const fetchAvailableTags = async ({ partId, page = 1, search = "" }) => {
        if (!partId) return;

        const cache = tagCache[partId];
        if (cache?.loading) return;
        if (page > 1 && cache && !cache.hasMore) return;

        setTagCache((prev) => ({
            ...prev,
            [partId]: { ...(prev[partId] || {}), loading: true },
        }));

        try {
            const res = await assetTagsAPI.available({
                page,
                limit: 20,
                search,
            });

            const { tags, pagination } = res.data;

            setTagCache((prev) => {
                const prevEntry = prev[partId] || {};
                return {
                    ...prev,
                    [partId]: {
                        tags: page === 1 ? tags : [...(prevEntry.tags || []), ...tags],
                        page,
                        hasMore: page < pagination.pages,
                        loading: false,
                        inputValue: prevEntry.inputValue ?? "",
                        search,
                    },
                };
            });
        } catch {
            setTagCache((prev) => ({
                ...prev,
                [partId]: { ...(prev[partId] || {}), loading: false },
            }));
        }
    };

    const attachAssetTag = async (tagId, partId) => {
        try {
            console.log(tagId, partId);
            // await assetTagsAPI.attach(tagId, { partId });
            // message.success("Asset tag attached");

            // setTagCache((prev) => ({
            //     ...prev,
            //     [partId]: { ...prev[partId], inputValue: "" },
            // }));
        } catch {
            message.error("Failed to attach asset tag");
        }
    };

    const submitInventory = async () => {
        const partsToCreate = Object.keys(inventoryParts)
            .filter((k) => inventoryParts[k].extracted)
            .map((k) => ({ key: k, ...inventoryParts[k] }));

        if (!partsToCreate.length) {
            message.info("No extracted parts selected");
            return;
        }

        const badWeight = partsToCreate.find((p) => weightError(p.weight));
        if (badWeight) {
            message.error(`${toTitle(badWeight.label)}: ${weightError(badWeight.weight)}`);
            return;
        }

        const tooManyUnits = partsToCreate.find(
            (p) => p.maxUnit !== undefined && Number(p.unit) > p.maxUnit
        );
        if (tooManyUnits) {
            message.error(
                `${toTitle(tooManyUnits.label)}: Unit cannot be more than ${tooManyUnits.maxUnit} (recorded at Car Intake)`
            );
            return;
        }

        const longDimensions = partsToCreate.find(
            (p) => (cleanText(p.dimensions) || "").length > TEXT_LIMITS.dimensions
        );
        if (longDimensions) {
            message.error(
                `${toTitle(longDimensions.label)}: Dimensions must be at most ${TEXT_LIMITS.dimensions} characters`
            );
            return;
        }

        setLoading(true);
        try {
            // One request for the whole car (one request per part tripped the
            // API rate limit). Only the parts ticked "Extracted" are sent; the
            // server skips parts already in inventory, adds each of the others
            // on its own, attaches asset tags, and moves the car to
            // "part-added-to-inventory" once every selected part is in.
            const res = await inventoryAPI.bulkCreate({
                carIntakeId: inventoryRecord._id,
                vin: inventoryRecord.vin,
                make: inventoryRecord.carDetails.make,
                model: inventoryRecord.carDetails.model,
                trim: inventoryRecord.carDetails.trim,
                year: inventoryRecord.carDetails.year,
                color: inventoryRecord.carDetails.color,
                parts: partsToCreate.map((p) => ({
                    partName: p.label,
                    unit: p.unit,
                    cleaned: p.cleaned,
                    quality: p.quality,
                    location: cleanText(p.placed),
                    weight: cleanText(p.weight),
                    dimensions: cleanText(p.dimensions),
                    image: partImages[p.key] || null,
                    assetTagId: p.assetTagId || null,
                })),
            });

            const { created = 0, failed = 0, results = [], stillMissing = [] } = res.data || {};
            const tagProblems = results.filter((r) => r.tagMessage).map((r) => toTitle(r.partName));

            if (tagProblems.length) {
                message.warning(`Asset tag not attached for: ${tagProblems.join(", ")}`);
            }

            if (failed > 0) {
                // Stay on the page with only the parts that still need adding,
                // so Submit can simply be pressed again.
                // Name each failed part with the server's reason (e.g. a bad weight).
                const failedNames = results
                    .filter((r) => r.status === "failed")
                    .map((r) => (r.message ? `${toTitle(r.partName)} (${r.message})` : toTitle(r.partName)));
                const done = new Set(results.filter((r) => r.status !== "failed").map((r) => r.partName));
                setInventoryParts((prev) => {
                    const next = {};
                    for (const k of Object.keys(prev)) {
                        if (!done.has(prev[k].label)) next[k] = prev[k];
                    }
                    return next;
                });
                message.error(
                    `Added ${created} part(s). ${failed} part(s) could not be added: ${failedNames.join(", ")}`
                );
                return;
            }

            if (stillMissing.length === 0) {
                message.success("Inventory added successfully");
            } else {
                message.success(
                    `Added ${created} part(s) — ${stillMissing.length} part(s) still missing`
                );
            }

            navigate(-1);
        } catch (err) {
            message.error(err?.response?.data?.message || "Failed to add inventory");
        } finally {
            setLoading(false);
        }
    };

    // Calculate currently used tags across all parts to prevent duplicates
    const usedTags = useMemo(() => {
        return new Set(
            Object.values(inventoryParts)
                .map((p) => p.assetTagId)
                .filter(Boolean)
        );
    }, [inventoryParts]);

    const dataSource = Object.keys(inventoryParts).map((k) => ({
        key: k,
        name: toTitle(inventoryParts[k].label),
        inventoryId: inventoryParts[k]._id || null,
    }));

    // Independent select-all state per column: each is derived only from its
    // own field across all parts, never from the other column.
    const extractedSelectAllState = useMemo(() => {
        const keys = Object.keys(inventoryParts);
        if (!keys.length) return { checked: false, indeterminate: false };
        const checkedCount = keys.filter((k) => inventoryParts[k]?.extracted).length;
        return {
            checked: checkedCount === keys.length,
            indeterminate: checkedCount > 0 && checkedCount < keys.length,
        };
    }, [inventoryParts]);

    const cleanedSelectAllState = useMemo(() => {
        const keys = Object.keys(inventoryParts);
        if (!keys.length) return { checked: false, indeterminate: false };
        const checkedCount = keys.filter((k) => inventoryParts[k]?.cleaned).length;
        return {
            checked: checkedCount === keys.length,
            indeterminate: checkedCount > 0 && checkedCount < keys.length,
        };
    }, [inventoryParts]);

    const handleExtractedSelectAll = (e) => {
        const checked = e.target.checked;
        setInventoryParts((prev) => {
            const next = {};
            for (const k of Object.keys(prev)) {
                next[k] = { ...prev[k], extracted: checked };
            }
            return next;
        });
    };

    const handleCleanedSelectAll = (e) => {
        const checked = e.target.checked;
        setInventoryParts((prev) => {
            const next = {};
            for (const k of Object.keys(prev)) {
                next[k] = { ...prev[k], cleaned: checked };
            }
            return next;
        });
    };

    const columns = [
        {
            title: (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span>Extracted</span>
                    <Checkbox
                        checked={extractedSelectAllState.checked}
                        indeterminate={extractedSelectAllState.indeterminate}
                        onChange={handleExtractedSelectAll}
                        title="Select all Extracted"
                    />
                </div>
            ),
            width: 90,
            align: "center",
            render: (_, r) => (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div
                        style={{
                            width: 18,
                            height: 18,
                            border: "1.5px solid white",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Checkbox
                            checked={inventoryParts[r.key]?.extracted}
                            onChange={(e) =>
                                handleInventoryChange(r.key, "extracted", e.target.checked)
                            }
                            style={{ margin: 0 }}
                        />
                    </div>
                </div>
            ),

        },
        {
            title: (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span>Cleaned</span>
                    <Checkbox
                        checked={cleanedSelectAllState.checked}
                        indeterminate={cleanedSelectAllState.indeterminate}
                        onChange={handleCleanedSelectAll}
                        title="Select all Cleaned"
                    />
                </div>
            ),
            width: 90,
            align: "center",
            render: (_, r) => (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div
                        style={{
                            width: 18,
                            height: 18,
                            border: "1.5px solid white",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Checkbox
                            checked={inventoryParts[r.key]?.cleaned}
                            onChange={(e) =>
                                setInventoryParts((prev) => ({
                                    ...prev,
                                    [r.key]: {
                                        ...prev[r.key],
                                        cleaned: e.target.checked,
                                        extracted: e.target.checked || prev[r.key].extracted,
                                    },
                                }))
                            }
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Part Name",
            dataIndex: "name",
            width: 130,
            fixed: "left",
        },
        {
            title: "Unit",
            width: 90,
            render: (_, r) => {
                // Capped at the unit recorded at Car Intake (QA 077).
                const max = inventoryParts[r.key]?.maxUnit;
                return (
                    <UnitInput
                        size="small"
                        min={0}
                        max={max}
                        title={max !== undefined ? `Up to ${max} (recorded at Car Intake)` : undefined}
                        style={{ width: "100%" }}
                        value={inventoryParts[r.key]?.unit}
                        onChange={(v) => {
                            let next = v;
                            if (max !== undefined && Number(next) > max) next = max;
                            handleInventoryChange(r.key, "unit", next);
                        }}
                    />
                );
            },
        },
        {
            title: "Quality",
            width: 100,
            render: (_, r) => (
                <Select
                    size="small"
                    style={{ width: "100%" }}
                    value={inventoryParts[r.key]?.quality || undefined}
                    onChange={(v) => handleInventoryChange(r.key, "quality", v)}
                    popupMatchSelectWidth={false}
                    dropdownMatchSelectWidth={false}
                >
                    <Select.Option value="Good">Good</Select.Option>
                    <Select.Option value="Average">Average</Select.Option>
                    <Select.Option value="OK">OK</Select.Option>
                    <Select.Option value="Broken">Broken</Select.Option>
                </Select>
            ),
        },
        {
            title: "Location",
            width: 140,
            render: (_, r) => (
                <EditableCell
                    value={inventoryParts[r.key]?.placed}
                    placeholder="Location"
                    maxLength={TEXT_LIMITS.location}
                    onCommit={(v) => handleInventoryChange(r.key, "placed", v)}
                />
            ),
        },
        {
            title: "Weight",
            width: 120,
            render: (_, r) => (
                <EditableCell
                    value={inventoryParts[r.key]?.weight}
                    placeholder="Weight"
                    onCommit={(v) => handleInventoryChange(r.key, "weight", v)}
                    numeric
                />
            ),
        },
        {
            title: "Dimensions",
            width: 160,
            render: (_, r) => (
                <EditableCell
                    value={inventoryParts[r.key]?.dimensions}
                    placeholder="Dimensions"
                    maxLength={TEXT_LIMITS.dimensions}
                    onCommit={(v) => handleInventoryChange(r.key, "dimensions", v)}
                />
            ),
        },
        {
            title: "Images",
            width: 180,
            render: (_, r) => {
                const img = partImages[r.key];

                // Thumbnail and delete button side by side (the button used
                // to sit on top of the image's corner: QA 039).
                return img ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img
                            src={uploadAPI.getImageUrl(img)}
                            alt="Part"
                            title="Click to preview"
                            style={{
                                width: 60,
                                height: 45,
                                objectFit: "cover",
                                borderRadius: 4,
                                cursor: "pointer",
                                flexShrink: 0,
                            }}
                            onClick={() =>
                                handlePreviewImage(uploadAPI.getImageUrl(img))
                            }
                        />
                        <Button
                            icon={<DeleteOutlined />}
                            type="text"
                            size="small"
                            danger
                            title="Remove image"
                            aria-label="Remove image"
                            onClick={() => handleRemoveImage(r.key)}
                            style={{ flexShrink: 0 }}
                        />
                    </div>
                ) : (
                    <CameraUpload
                        autoUpload
                        showPreview={false}
                        onImageUpload={(res) => handleImageUpload(r.key, res)}
                    />
                );
            },
        },
        {
            title: "Asset Tag",
            width: 260,
            render: (_, record) => {
                const partId = record.key;
                const cache = tagCache[partId] || {};
                const tags = cache.tags || [];

                return (
                    <Select
                        showSearch
                        placeholder="Search asset tag"
                        style={{ width: "100%" }}
                        searchValue={cache.inputValue ?? ""}
                        filterOption={false}
                        loading={cache.loading}
                        value={inventoryParts[record.key]?.assetTagId || undefined}
                        notFoundContent={cache.loading ? "Searching..." : "No such tag"}
                        onFocus={() => {
                            if (!cache.tags) {
                                fetchAvailableTags({ partId, page: 1 });
                            }
                        }}
                        onSearch={(value) => {
                            setTagCache((prev) => ({
                                ...prev,
                                [partId]: { ...(prev[partId] || {}), inputValue: value },
                            }));

                            clearTimeout(searchDebounceRef.current);
                            searchDebounceRef.current = setTimeout(() => {
                                fetchAvailableTags({ partId, page: 1, search: value });
                            }, 400);
                        }}
                        onPopupScroll={(e) => {
                            const t = e.target;
                            if (
                                t.scrollTop + t.offsetHeight >= t.scrollHeight - 10 &&
                                cache.hasMore &&
                                !cache.loading
                            ) {
                                fetchAvailableTags({
                                    partId,
                                    page: (cache.page || 1) + 1,
                                    search: cache.search || "",
                                });
                            }
                        }}
                        onChange={(barcodeString) => {
                            handleInventoryChange(
                                record.key,
                                "assetTagId", // Using this field to store the tag barcode string
                                barcodeString
                            );
                        }}
                    >
                        {tags.map((t) => {
                            // Disable if used by another part (but not if used by *this* part)
                            const isSelected =
                                usedTags.has(t.barcodeString) &&
                                inventoryParts[record.key]?.assetTagId !== t.barcodeString;

                            return (
                                <Select.Option
                                    key={t.id}
                                    value={t.barcodeString}
                                    disabled={isSelected}
                                >
                                    {t.barcodeString} {isSelected ? "(Selected)" : ""}
                                </Select.Option>
                            );
                        })}
                    </Select>
                );
            },
        },
    ];


    return (
        <>
            <TitleBox
                title="Add to Inventory"
                routes={["Scrap Yard", "Inventory"]}
                current="Add To Inventory"
            />

            <PageContentWrapper>
                <Table
                    columns={columns.map(col => ({
                        ...col,
                        onHeaderCell: () => ({
                            style: {
                                textAlign: "center",
                                whiteSpace: "nowrap",
                                fontWeight: 600,
                                verticalAlign: "middle",
                            },
                        }),
                    }))}
                    dataSource={dataSource}
                    pagination={false}
                    rowKey="key"
                    sticky
                    scroll={{
                        x: 1600,
                        y: "calc(100vh - 320px)",
                    }}
                    size="small"
                    bordered
                    // columns={columns}
                    // dataSource={dataSource}
                    // pagination={false}
                    // rowKey="key"
                    // scroll={{ y: "calc(100vh - 320px)" }}
                    // size="small"
                    // bordered
                    // tableLayout="auto"
                />

                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                        Return to list
                    </Button>
                    <Button type="primary" loading={loading} onClick={submitInventory}>
                        Submit
                    </Button>
                </div>

                <Modal
                    open={imagePreviewVisible}
                    footer={null}
                    onCancel={() => setImagePreviewVisible(false)}
                    width={800}
                >
                    <img src={imagePreviewUrl} alt="preview" style={{ width: "100%" }} />
                </Modal>
            </PageContentWrapper>
        </>
    );
};

export default AddInventoryPage;

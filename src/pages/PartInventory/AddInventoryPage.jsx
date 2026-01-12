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

import {
    inventoryAPI,
    carIntakeAPI,
    uploadAPI,
    assetTagsAPI,
} from "../../utils/api";

const EditableCell = ({ value: initial, onCommit, placeholder }) => {
    const [val, setVal] = useState(initial ?? "");

    useEffect(() => setVal(initial ?? ""), [initial]);

    return (
        <Input
            size="small"
            value={val}
            placeholder={placeholder}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => onCommit(val)}
            onPressEnter={() => onCommit(val)}
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
        const parts = {};

        Object.keys(record.partDetails.parts || {}).forEach((key) => {
            const p = record.partDetails.parts[key];
            if (p?.selected) {
                parts[key] = {
                    extracted: !!p.extracted,
                    cleaned: !!p.cleaned,
                    unit: p.unit || 0,
                    placed: p.placed || "",
                    dimensions: p.dimensions || "",
                    weight: p.weight || "",
                    quality: p.quality || "",
                    label: key,
                };
            }
        });

        setInventoryRecord(record);
        setInventoryParts(parts);
    }, [state, navigate]);

    const handleInventoryChange = (key, field, value) => {
        setInventoryParts((prev) => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }));
    };

    const toTitle = (s) =>
        s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (c) => c.toUpperCase());

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

        setLoading(true);
        try {
            for (const p of partsToCreate) {
                const res = await inventoryAPI.create({
                    partName: p.label,
                    unit: p.unit,
                    cleaned: p.cleaned,
                    quality: p.quality,
                    location: p.placed,
                    weight: p.weight,
                    dimensions: p.dimensions,
                    make: inventoryRecord.carDetails.make,
                    model: inventoryRecord.carDetails.model,
                    trim: inventoryRecord.carDetails.trim,
                    year: inventoryRecord.carDetails.year,
                    vin: inventoryRecord.vin,
                    color: inventoryRecord.carDetails.color,
                    image: partImages[p.key] || null,
                });
                const inventoryId = res.data?.data?._id || res.data?._id || res._id;

                const selectedTagId = p.assetTagId;
                if (selectedTagId) {
                    await assetTagsAPI.attach(selectedTagId, { inventoryId: inventoryId });
                }
            }

            await carIntakeAPI.updateStatus(
                inventoryRecord._id,
                "part-added-to-inventory"
            );

            message.success("Inventory added successfully");
            navigate(-1);
        } catch {
            message.error("Failed to add inventory");
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

    const columns = [
        {
            title: "Extracted",
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
            title: "Cleaned",
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
            width: 160,
        },
        {
            title: "Unit",
            width: 90,
            render: (_, r) => (
                <InputNumber
                    size="small"
                    min={0}
                    style={{ width: "100%" }}
                    value={inventoryParts[r.key]?.unit}
                    onChange={(v) => handleInventoryChange(r.key, "unit", v)}
                />
            ),
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
                    onCommit={(v) => handleInventoryChange(r.key, "dimensions", v)}
                />
            ),
        },
        {
            title: "Images",
            width: 180,
            render: (_, r) => {
                const img = partImages[r.key];

                return img ? (
                    <div style={{ position: "relative", width: 70 }}>
                        <img
                            src={uploadAPI.getImageUrl(img)}
                            alt="Part"
                            style={{ width: 60, cursor: "pointer" }}
                            onClick={() =>
                                handlePreviewImage(uploadAPI.getImageUrl(img))
                            }
                        />
                        <Button
                            icon={<DeleteOutlined />}
                            type="text"
                            size="small"
                            danger
                            onClick={() => handleRemoveImage(r.key)}
                            style={{
                                position: "absolute",
                                top: -6,
                                right: -6,
                            }}
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
            width: 200,
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
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    rowKey="key"
                    scroll={{ y: "calc(100vh - 320px)" }}
                    size="small"
                    bordered
                    tableLayout="auto"
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

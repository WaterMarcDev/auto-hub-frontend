import React, { useEffect, useState } from "react";
import { Button, Table, Space, Card, InputNumber, message } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import PageContentWrapper from "../components/PageContentWrapper";
import TitleBox from "../components/TitleBox";
import { inventoryAPI } from "../utils/api";

const ViewPartsPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const vin = state?.vin;
    const inventoryItems = state?.inventoryItems;

    const [loading, setLoading] = useState(false);
    const [parts, setParts] = useState([]);

    // Manual price inline-edit: which row (by _id) is currently being
    // edited, the in-progress value, and a per-save loading flag. Saving
    // only patches the single edited row's state — the rest of the table
    // (and its data source) is left untouched, no full refetch.
    const [editingPriceId, setEditingPriceId] = useState(null);
    const [priceDraft, setPriceDraft] = useState(null);
    const [savingPrice, setSavingPrice] = useState(false);

    useEffect(() => {
        if (!vin) {
            navigate(-1);
            return;
        }
        console.log("VIN: ", vin);
        setParts(inventoryItems || []);
    }, [vin]);

    const startEditingPrice = (record) => {
        setEditingPriceId(record._id);
        setPriceDraft(record.price ?? null);
    };

    const cancelEditingPrice = () => {
        setEditingPriceId(null);
        setPriceDraft(null);
    };

    const savePrice = async (id) => {
        setSavingPrice(true);
        try {
            const res = await inventoryAPI.updatePrice(id, priceDraft);
            const updatedPrice = res.data?.inventory?.price ?? priceDraft ?? null;
            setParts((prev) =>
                prev.map((p) => (p._id === id ? { ...p, price: updatedPrice } : p))
            );
            setEditingPriceId(null);
            setPriceDraft(null);
        } catch (err) {
            console.error("Failed to update price", err);
            message.error(
                err.response?.data?.message || "Failed to update price"
            );
        } finally {
            setSavingPrice(false);
        }
    };


    return (
        <React.Fragment>
            <TitleBox
                title="Parts List"
                routes={["Scrap Yard", "Inventory List",]}
                current={"Parts"}
            />
            <PageContentWrapper>
                <Card
                    title={<span>Parts for VIN {state?.vin} </span>}
                    extra={
                        <Space>
                            <Button
                                type="primary"
                                onClick={() => navigate(-1)}
                            >
                                Go Back
                            </Button>
                        </Space>
                    }
                >
                    <Table
                        dataSource={parts}
                        rowKey={(r, i) => r._id || r.sku || `part-${i}`}
                        loading={loading}
                        pagination={false}
                        size="small"
                        bordered
                        scroll={{
                            y: "calc(100vh - 260px)",
                            x: "max-content"
                        }}
                        columns={[
                            {
                                title: "S. No.",
                                render: (_, __, i) => i + 1,
                                width: 80,
                                fixed: "left",
                            },
                            {
                                title: "Part Name",
                                dataIndex: "partName",
                                render: (t) => (
                                    <div style={{ minWidth: 150 }}>
                                        {t
                                            ?.replace(/([A-Z])/g, " $1")
                                            .replace(/[_-]/g, " ")
                                            .replace(/^./, (s) => s.toUpperCase())}
                                    </div>
                                ),
                            },
                            {
                                title: "Make",
                                dataIndex: ["make", "name"],
                                render: (t) => <div style={{ minWidth: 100 }}>{t}</div>,
                            },
                            {
                                title: "Model",
                                dataIndex: ["model", "name"],
                                render: (t) => <div style={{ minWidth: 100 }}>{t}</div>,
                            },
                            {
                                title: "Trim",
                                dataIndex: ["trim", "name"],
                                render: (t) => <div style={{ minWidth: 100 }}>{t}</div>,
                            },
                            {
                                title: "Unit",
                                dataIndex: "unit",
                                render: (t) => <div style={{ minWidth: 80 }}>{t}</div>,
                            },
                            {
                                title: "Quality",
                                dataIndex: "quality",
                                render: (t) => <div style={{ minWidth: 100 }}>{t}</div>,
                            },
                            {
                                title: "Cleaned",
                                dataIndex: "cleaned",
                                render: (c) => (
                                    <div style={{ minWidth: 80 }}>{c ? "Yes" : "No"}</div>
                                ),
                            },
                            {
                                title: "Weight",
                                dataIndex: "weight",
                                render: (t) => <div style={{ minWidth: 80 }}>{t}</div>,
                            },
                            {
                                title: "Dimensions",
                                dataIndex: "dimensions",
                                render: (t) => <div style={{ minWidth: 100 }}>{t}</div>,
                            },
                            {
                                title: "Location",
                                dataIndex: "location",
                                render: (t) => <div style={{ minWidth: 100 }}>{t}</div>,
                            },
                            {
                                title: "SKU",
                                dataIndex: "sku",
                                render: (t) => <div style={{ minWidth: 120 }}>{t}</div>,
                            },
                            {
                                title: "Price",
                                dataIndex: "price",
                                width: 140,
                                render: (price, record) => {
                                    const isEditing = editingPriceId === record._id;

                                    if (isEditing) {
                                        return (
                                            <Space.Compact>
                                                <InputNumber
                                                    size="small"
                                                    min={0}
                                                    step={0.01}
                                                    precision={2}
                                                    autoFocus
                                                    value={priceDraft}
                                                    onChange={(val) => setPriceDraft(val)}
                                                    onPressEnter={() => savePrice(record._id)}
                                                    style={{ width: 90 }}
                                                />
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    icon={<CheckOutlined />}
                                                    loading={savingPrice}
                                                    onClick={() => savePrice(record._id)}
                                                />
                                                <Button
                                                    size="small"
                                                    icon={<CloseOutlined />}
                                                    disabled={savingPrice}
                                                    onClick={cancelEditingPrice}
                                                />
                                            </Space.Compact>
                                        );
                                    }

                                    return (
                                        <div
                                            style={{ minWidth: 90, cursor: "pointer" }}
                                            onClick={() => startEditingPrice(record)}
                                        >
                                            {price != null ? `$${Number(price).toFixed(2)}` : "N/A"}
                                        </div>
                                    );
                                },
                            },
                            {
                                title: "Barcode",
                                dataIndex: "barcodeString",
                                fixed: "right",
                                width: 150,
                                render: (barcode) => (
                                    <div style={{ minWidth: 100 }}>
                                        {barcode || "Unassigned"}
                                    </div>
                                ),
                            },

                        ]}
                    />
                </Card>
            </PageContentWrapper>
        </React.Fragment>
    );
};

export default ViewPartsPage;

import React, { useEffect, useState } from "react";
import { Button, Table, Space, Card } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import PageContentWrapper from "../components/PageContentWrapper";
import TitleBox from "../components/TitleBox";

const ViewPartsPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const vin = state?.vin;
    const inventoryItems = state?.inventoryItems;

    const [loading, setLoading] = useState(false);
    const [parts, setParts] = useState([]);



    useEffect(() => {
        if (!vin) {
            navigate(-1);
            return;
        }
        console.log("VIN: ", vin);
        setParts(inventoryItems || []);
    }, [vin]);


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

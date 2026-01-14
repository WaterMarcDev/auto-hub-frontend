/* eslint-disable no-unused-vars */
import TitleBox from "../../components/TitleBox";
import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Card, message, Select } from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import PageContentWrapper from "../../components/PageContentWrapper";
import { assetTagsAPI } from "../../utils/api";
import GenerateTagsModal from "../../components/GenerateTagsModal";
import ViewTagModal from "../../components/ViewTagModal";


const List = () => {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [generateTagsModalVisible, setGenerateTagsModalVisible] = useState(false);
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [digits, setDigits] = useState(10);
    const [viewTagModalVisible, setViewTagModalVisible] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);


    const handleSearch = () => {
        setSearch(searchInput);
    };

    function toTitleFromCamelCase(input) {
        if (input == null) return "";

        return String(input)
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/\b\w/g, char => char.toUpperCase());
    }


    const formatTagDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        if (isNaN(d)) return "";

        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const yyyy = d.getFullYear();

        return `${mm}-${dd}-${yyyy}`;
    };
    const fetchTags = async (p = 1, l = limit) => {
        setLoading(true);
        try {
            const params = { page: p, limit: l };

            const res = await assetTagsAPI.getAll(params);
            const data = res.data || res;

            const tags = (data.tags || []).map(tag => {
                let inventoryDisplay = "Unassigned";

                if (tag.inventoryId && typeof tag.inventoryId === 'object') {
                    const inv = tag.inventoryId;
                    const parts = [
                        toTitleFromCamelCase(inv.partName),
                        inv.make?.name,
                        inv.model?.name,
                        inv.trim?.name,
                        inv.year
                    ].filter(Boolean);

                    if (parts.length > 0) {
                        inventoryDisplay = parts.join(' - ');
                    }
                }

                return {
                    barcodeString: tag.barcodeString,
                    isUsed: tag.isUsed ? "Used" : "Available",
                    inventoryId: inventoryDisplay,
                    updatedAt: formatTagDate(tag.updatedAt),
                };
            });

            setTags(tags);

            if (data.pagination) {
                setPage(data.pagination.page || p);
                setLimit(data.pagination.limit || l);
                setTotal(data.pagination.total || 0);
            }
        } catch (err) {
            console.error("Failed to fetch asset tags", err);
            message.error(`Failed to fetch tags: ${err.message}`);
            setTags([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, [search]);

    return (
        <>
            <TitleBox
                title="Asset Tags"
                routes={["Scrap Yard", "Inventory"]}
                current="Asset Tags"
            />
            <PageContentWrapper>
                <Card
                    title={<span>Asset Tags</span>}
                    extra={
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setGenerateTagsModalVisible(true)}>
                            Generate
                        </Button>
                    }
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "16px",
                            marginBottom: 16,
                            flexWrap: "wrap",
                        }}
                    >
                        {/* <Space.Compact style={{ flex: 1, maxWidth: 600 }} size="middle">
                            <Input
                                placeholder="Search by part"
                                value={searchInput}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                }}
                                onPressEnter={handleSearch}
                                size="middle"
                                style={{ width: "100%" }}
                            />
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleSearch}
                                size="middle"
                            >
                                Search
                            </Button>
                        </Space.Compact> */}
                    </div>

                    <Table
                        dataSource={tags}
                        rowKey={(r) => r._id}
                        loading={loading}
                        // onRow={(record) => ({
                        //     onClick: () => {
                        //         setSelectedTag(record);
                        //         setViewTagModalVisible(true);
                        //     },
                        // })}
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} items`,
                            onChange: (p, ps) =>
                                fetchTags(
                                    p,
                                    ps,
                                ),
                        }}
                        size="small"
                        tableLayout="auto"
                        bordered
                        scroll={{
                            y: "calc(100vh - 450px)",
                        }}
                        columns={[
                            {
                                title: "S. No.",
                                key: "sr",
                                width: 80,
                                minWidth: 80,
                                fixed: "left",
                                render: (_, __, i) => (page - 1) * limit + i + 1,
                            },
                            {
                                title: "Tag Code",
                                dataIndex: "barcodeString",
                                key: "tagCode",
                                minWidth: 130,
                                fixed: "left",
                                render: (text, record) => {
                                    if (!text) return "N/A";
                                    return (
                                        <span
                                            style={{
                                                color: "#1768dc",
                                                cursor: "pointer",

                                                fontWeight: 500,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = "#ffffff";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = "#1768dc";
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTag(record);
                                                setViewTagModalVisible(true);
                                            }}
                                        >
                                            {text}
                                        </span>
                                    );
                                },
                            },
                            {
                                title: "Assigned",
                                dataIndex: "isUsed",
                                key: "used",
                                minWidth: 50,
                            },
                            {
                                title: "Inventory Assigned",
                                dataIndex: "inventoryId",
                                key: "partAssigned",
                                minWidth: 100,
                            },
                            {
                                title: "Last Updated",
                                dataIndex: "updatedAt",
                                key: "updatedAt",
                                minWidth: 80,
                            }
                        ]}
                        className="dark-table"
                    />
                </Card>
                <GenerateTagsModal visible={generateTagsModalVisible}
                    onCancel={() => setGenerateTagsModalVisible(false)}
                    onSuccess={() => {
                        setGenerateTagsModalVisible(false);
                        fetchTags();

                    }}
                    initial={{
                        start: start || null,
                        end: end || null,
                        digits: digits || null
                    }}

                />
                <ViewTagModal
                    visible={viewTagModalVisible}
                    tag={selectedTag}
                    onClose={() => {
                        setViewTagModalVisible(false);
                        setSelectedTag(null);
                    }}
                />
            </PageContentWrapper>
        </>
    );
};

export default List;

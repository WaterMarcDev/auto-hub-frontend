import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Input,
  DatePicker,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { waiverAPI } from "../../utils/api";
import dayjs from "dayjs";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";

const { RangePicker } = DatePicker;

const WaiverList = () => {
  const navigate = useNavigate();
  const [waivers, setWaivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    startDate: null,
    endDate: null,
  });

  const fetchWaivers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      const response = await waiverAPI.getAll(params);
      setWaivers(response.data.waivers || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || 0,
      }));
    } catch (err) {
      console.error("Error fetching waivers:", err);
      message.error("Failed to fetch waivers");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    fetchWaivers();
  }, [fetchWaivers]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchWaivers();
  };

  const handleReset = () => {
    setFilters({
      search: "",
      startDate: null,
      endDate: null,
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
    setTimeout(() => fetchWaivers(), 100);
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const columns = [
    {
      title: "Sr. No.",
      key: "srNo",
      fixed: "left",
      minWidth: 70,
      render: (text, record, index) => {
        const currentPage = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Customer Type",
      dataIndex: "customerType",
      key: "customerType",
      width: 120,
      render: (type) => (
        <Tag color={type === "seller" ? "blue" : "green"}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Seller",
      dataIndex: "seller",
      key: "seller",
      minWidth: 160,
      render: (seller, record) =>
        seller ? (
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/waivers/${record._id}`)}
          >
            {`${seller.firstName} ${seller.lastName}`}
          </Button>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Buyer",
      dataIndex: "buyer",
      key: "buyer",
      minWidth: 160,
      render: (buyer, record) =>
        buyer ? (
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/waivers/${record._id}`)}
          >
            {`${buyer.firstName} ${buyer.lastName}`}
          </Button>
        ) : (
          "N/A"
        ),
    },
    {
      title: "ID Proof Type",
      dataIndex: "idProofType",
      key: "idProofType",
      width: 150,
      render: (text) => text || "N/A",
    },
    {
      title: "ID Proof Number",
      dataIndex: "idProofNumber",
      key: "idProofNumber",
      width: 150,
      render: (text) => text || "N/A",
    },
    {
      title: "Payment Amount",
      dataIndex: "payment",
      key: "payment",
      minWidth: 180,
      render: (payment) => (
        <div style={{ textAlign: "right", minWidth: 140 }}>
          {payment?.amount ? `$${payment.amount.toFixed(2)}` : "N/A"}
        </div>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Action",
      key: "action",
      minWidth: 140,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            onClick={() => navigate(`/waivers/${record._id}`)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <TitleBox title="Waiver Lists" routes={["Waivers"]} current="List" />

      <PageContentWrapper>
        <Card title="Waivers">
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/waivers/add")}
            >
              Create Waiver
            </Button>
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: 16,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Space.Compact style={{ flex: 1, maxWidth: 600 }} size="middle">
              <Input
                placeholder="Search by ID proof, seller, or buyer"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  if (!e.target.value) {
                    handleSearch();
                  }
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
            </Space.Compact>

            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={handleReset} size="middle">
                Reset
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={waivers}
            tableLayout="auto"
            loading={loading}
            rowKey={(record) => record._id}
            scroll={{
              x: "max-content",
              y: "calc(100vh - 510px)",
            }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            onChange={handleTableChange}
            size="small"
            bordered
            className="dark-table"
            sticky
          />
        </Card>
      </PageContentWrapper>
    </div>
  );
};

export default WaiverList;

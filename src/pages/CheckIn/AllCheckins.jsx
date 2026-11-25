import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card, Table, Input, Select, message, Tag, Button, Space } from "antd";
import PersonsCell from "../../components/CheckIn/PersonsCell";
import { PrinterOutlined } from "@ant-design/icons";
import { checkInAPI } from "../../utils/api";
import printCheckInInvoice from "../../utils/printCheckInInvoice";
import { cacheManager } from "../../utils/cacheManager";
import { useDebounce } from "../../hooks/useDebounce";
import getStatusColor from "../../utils/statusColors";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";

const { Option } = Select;

const AllCheckins = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const predefinedSearch = params.get("search") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(predefinedSearch);
  const [statusFilter, setStatusFilter] = useState(null);
  const [printingId, setPrintingId] = useState(null);

  const debouncedSearch = useDebounce(search, 350);
  const initialRenderRef = useRef(true);

  const fetchItems = useCallback(
    async (opts = {}) => {
      const currentPage = opts.page || page;
      const currentLimit = opts.limit || limit;
      const currentSearch = opts.search !== undefined ? opts.search : search;
      const currentStatus = opts.status !== undefined ? opts.status : statusFilter;
      const cacheKey = `checkins:all:${currentPage}:${currentLimit}:${currentSearch}:${currentStatus || "all"}`;

      const cached = cacheManager.get(cacheKey);
      if (cached && !opts.force) {
        setItems(cached.items || []);
        setTotal(cached.total || 0);
        setPage(cached.page || currentPage);
        setLimit(cached.limit || currentLimit);
      } else if (!cached) {
        setLoading(true);
      }

      try {
        const p = {
          page: currentPage,
          limit: currentLimit,
          search: currentSearch,
          ...(currentStatus ? { status: currentStatus } : {}),
        };
        const res = await checkInAPI.getAll(p);
        const data = res.data || res;
        cacheManager.set(cacheKey, data, 60);
        setItems(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || p.page);
        setLimit(data.limit || p.limit);
      } catch (err) {
        console.error(err);
        message.error(
          err.response?.data?.error || err.message || "Failed to fetch checkins"
        );
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search, statusFilter]
  );

  // Real-time cache subscription
  useEffect(() => {
    const unsub = cacheManager.subscribe("checkins", () => {
      fetchItems({ force: true });
    });
    return () => unsub();
  }, [fetchItems]);

  useEffect(() => {
    fetchItems({ page: 1, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Search trigger on debounced input change
  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    fetchItems({ page: 1, limit, search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleTableChange = (p) => {
    fetchItems({ page: p.current, limit: p.pageSize });
  };

  const handlePrintInvoice = async (record) => {
    if (printingId || !record?._id) return;
    setPrintingId(record._id);
    try {
      await printCheckInInvoice(record._id);
      // The server marks the invoice as printed.
      setItems((prev) =>
        prev.map((it) => (it._id === record._id ? { ...it, invoicePrinted: true } : it))
      );
      cacheManager.invalidate("checkins");
    } catch (err) {
      console.error("Print invoice error:", err);
      message.error(err?.message || "Failed to load invoice");
    } finally {
      setPrintingId(null);
    }
  };

  const columns = [
    { title: "Token", dataIndex: "checkInToken", key: "token" },
    {
      title: "Customer",
      key: "customer",
      render: (_, rec) =>
        `${rec.customer?.firstName || ""} ${
          rec.customer?.lastName || ""
        }`.trim() || "N/A",
    },
    {
      title: "Checked In",
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (d) => (d ? dayjs(d).format("MMM DD, YYYY HH:mm") : "-"),
    },
    {
      title: "Checked Out",
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      render: (d) => (d ? dayjs(d).format("MMM DD, YYYY HH:mm") : "-"),
    },
    {
      title: "Persons",
      key: "persons",
      render: (_, rec) => <PersonsCell checkIn={rec} />,
    },
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (v) => v || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Invoice Printed",
      dataIndex: "invoicePrinted",
      key: "invoicePrinted",
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, rec) => (
        <Space>
          <Button
            size="small"
            icon={<PrinterOutlined />}
            loading={printingId === rec._id}
            disabled={Boolean(printingId && printingId !== rec._id)}
            onClick={() => handlePrintInvoice(rec)}
            title="Print Invoice"
          >
            Invoice
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <TitleBox title="Check-Ins" routes={["CheckIns"]} current="All" />
      <PageContentWrapper>
        <Card title="All Check-Ins">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <Input.Search
                placeholder="Search token or customer"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onSearch={() => fetchItems({ page: 1, limit, search })}
                enterButton
              />
              <Select
                allowClear
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(v) => setStatusFilter(v)}
                style={{ width: 200 }}
              >
                <Option value="checked-in">Checked In</Option>
                <Option value="checked-out">Checked Out</Option>
              </Select>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={items}
            rowKey={(r) => r._id}
            loading={loading}
            pagination={{ current: page, pageSize: limit, total }}
            onChange={handleTableChange}
            size="small"
          />
        </Card>
      </PageContentWrapper>
    </div>
  );
};

export default AllCheckins;

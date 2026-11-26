import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card, Table, Button, Space, Input, Modal, message, Tag } from "antd";
import PersonsCell from "../../components/CheckIn/PersonsCell";
import CellText from "../Customer/CellText";
import { personsList } from "../../utils/checkInPersons";
import { PrinterOutlined } from "@ant-design/icons";
import { checkInAPI } from "../../utils/api";
import printCheckInInvoice from "../../utils/printCheckInInvoice";
import { cacheManager } from "../../utils/cacheManager";
import { useDebounce } from "../../hooks/useDebounce";
import getStatusColor from "../../utils/statusColors";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import CreateCheckInModal from "../../components/CheckIn/CreateCheckInModal";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const CheckedInList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmRecord, setConfirmRecord] = useState(null);
  const [printingId, setPrintingId] = useState(null);

  const debouncedSearch = useDebounce(search, 350);
  const initialRenderRef = useRef(true);

  const fetchItems = useCallback(
    async (opts = {}) => {
      const currentPage = opts.page || page;
      const currentLimit = opts.limit || limit;
      const currentSearch = opts.search !== undefined ? opts.search : search;
      const cacheKey = `checkins:checked-in:${currentPage}:${currentLimit}:${currentSearch}`;

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
        const params = {
          page: currentPage,
          limit: currentLimit,
          search: currentSearch,
          status: "checked-in",
        };
        const res = await checkInAPI.getAll(params);
        const data = res.data || res;
        cacheManager.set(cacheKey, data, 60);
        setItems(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || params.page);
        setLimit(data.limit || params.limit);
      } catch (err) {
        console.error(err);
        message.error(
          err.response?.data?.error || err.message || "Failed to load check-ins"
        );
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search]
  );

  // Subscribe to real-time check-in updates/invalidations across all staff
  useEffect(() => {
    const unsub = cacheManager.subscribe("checkins", () => {
      fetchItems({ force: true });
    });
    return () => unsub();
  }, [fetchItems]);

  useEffect(() => {
    fetchItems({ page: 1, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search trigger on debounced input change
  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    fetchItems({ page: 1, limit, search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleSearch = () => {
    fetchItems({ page: 1, limit, search, force: true });
  };

  const handleTableChange = (p) => {
    fetchItems({ page: p.current, limit: p.pageSize });
  };

  const confirmCheckout = (record) => {
    setConfirmRecord(record);
    setConfirmVisible(true);
  };

  const handleConfirmOk = async () => {
    if (!confirmRecord) return;
    setConfirmVisible(false);
    await doCheckout(confirmRecord._id);
    setConfirmRecord(null);
  };

  const handleConfirmCancel = () => {
    setConfirmVisible(false);
    setConfirmRecord(null);
  };

  const doCheckout = async (id) => {
    try {
      await checkInAPI.checkout(id);
      message.success("Checked out");
      cacheManager.invalidate("checkins");
      fetchItems({ page, limit, force: true });
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.error || err.message || "Failed to checkout"
      );
    }
  };

  const handlePrintInvoice = async (record) => {
    if (printingId || !record?._id) return;
    setPrintingId(record._id);
    try {
      await printCheckInInvoice(record._id);
      // The server marks the invoice as printed; refresh the lists.
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
      // Long names stay on one line ("...", full name on hover).
      render: (_, rec) => (
        <CellText
          text={`${rec.customer?.firstName || ""} ${rec.customer?.lastName || ""}`.trim()}
        />
      ),
    },
    {
      title: "Checked In",
      dataIndex: "checkInTime",
      key: "checkInTime",
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
      render: (v) => <CellText text={v}>{v ? undefined : "-"}</CellText>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
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
          <Button size="small" onClick={() => confirmCheckout(rec)}>
            Checkout
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <TitleBox title="Check-Ins" routes={["CheckIns"]} current="Checked In" />
      <PageContentWrapper>
        <Card title="Currently Checked-In">
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
                onSearch={handleSearch}
                enterButton
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={() => navigate("/checkins/all")}>
                View All
              </Button>
              <Button type="primary" onClick={() => setCreateOpen(true)}>
                New Check-In
              </Button>
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

      <CreateCheckInModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          cacheManager.invalidate("checkins");
          fetchItems({ page: 1, limit, force: true });
        }}
      />

      <Modal
        title="Confirm Checkout"
        visible={confirmVisible}
        onOk={handleConfirmOk}
        onCancel={handleConfirmCancel}
        okText="Checkout"
        cancelText="Cancel"
      >
        <p>
          {confirmRecord ? (
            <>
              <div>
                {`Checkout ${confirmRecord.checkInToken} for ${
                  confirmRecord.customer?.firstName || "N/A"
                }?`}
              </div>
              <div>{`Persons: 1 + ${confirmRecord.numberOfPersons || 0}`}</div>
              {personsList(confirmRecord).map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: "#9ca3af" }}>
                  {i + 1}. {p.fullName} · {p.mobileNo}
                </div>
              ))}
            </>
          ) : (
            "Are you sure?"
          )}
        </p>
      </Modal>
    </div>
  );
};

export default CheckedInList;

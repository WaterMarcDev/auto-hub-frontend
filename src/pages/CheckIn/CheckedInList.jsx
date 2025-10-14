import React, { useEffect, useState, useCallback } from "react";
import { Card, Table, Button, Space, Input, Modal, message, Tag } from "antd";
import { checkInAPI } from "../../utils/api";
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

  const fetchItems = useCallback(
    async (opts = {}) => {
      setLoading(true);
      try {
        const params = {
          page: opts.page || page,
          limit: opts.limit || limit,
          search: opts.search ?? search,
          status: "checked-in",
        };
        const res = await checkInAPI.getAll(params);
        const data = res.data || res;
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

  useEffect(() => {
    fetchItems({ page: 1, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchItems({ page: 1, limit, search });
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
      fetchItems({ page, limit });
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.error || err.message || "Failed to checkout"
      );
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
      title: "Persons",
      key: "persons",
      render: (_, rec) => {
        const n = rec.numberOfPersons || 0;
        return `1 + ${n}`;
      },
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
        onCreated={() => fetchItems({ page: 1, limit })}
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

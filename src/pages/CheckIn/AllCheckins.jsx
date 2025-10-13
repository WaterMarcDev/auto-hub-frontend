import React, { useEffect, useState, useCallback } from "react";
import { Card, Table, Button, Space, Input, Select, message } from "antd";
import { checkInAPI } from "../../utils/api";
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

  const fetchItems = useCallback(
    async (opts = {}) => {
      setLoading(true);
      try {
        const p = {
          page: opts.page || page,
          limit: opts.limit || limit,
          search: opts.search ?? search,
          ...(statusFilter ? { status: statusFilter } : {}),
        };
        const res = await checkInAPI.getAll(p);
        const data = res.data || res;
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

  useEffect(() => {
    fetchItems({ page: 1, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleTableChange = (p) => {
    fetchItems({ page: p.current, limit: p.pageSize });
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

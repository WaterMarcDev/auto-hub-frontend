import React, { useState, useEffect } from "react";
import {
  message,
  Table,
  Tag,
  Button,
  Space,
  Card,
  Popover,
  Checkbox,
  Input,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { carIntakeAPI, assetTagsAPI } from "../../utils/api";
import TitleBox from "../../components/TitleBox";
import getStatusColor from "../../utils/statusColors";
import PageContentWrapper from "../../components/PageContentWrapper";
import { useNavigate } from "react-router-dom";

const PartInventoryAdd = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [carIntakes, setCarIntakes] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // ------------------ navigation ------------------

  const openInventoryPage = (record) => {
    if (!record?.partDetails) {
      message.error("No parts found for this record");
      return;
    }

    navigate("/inventory/add", {
      state: { record },
    });
  };

  // ------------------ columns ------------------

  const allColumns = [
    {
      title: "S. No.",
      key: "srNo",
      fixed: "left",
      width: 70,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "VIN No.",
      dataIndex: "vin",
      key: "vin",
      fixed: "left",
      width: 200,
    },
    {
      title: "Make",
      dataIndex: ["carDetails", "make"],
      key: "make",
      width: 120,
      render: (v) => v || "N/A",
    },
    {
      title: "Model",
      dataIndex: ["carDetails", "model"],
      key: "model",
      width: 120,
      render: (v) => v || "N/A",
    },
    {
      title: "Year",
      dataIndex: ["carDetails", "year"],
      key: "year",
      width: 80,
      render: (v) => v || "N/A",
    },
    {
      title: "Color",
      dataIndex: ["carDetails", "color"],
      key: "color",
      width: 120,
      render: (v) => v || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || "Intake"}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 160,
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() => openInventoryPage(record)}
        >
          Add To Inventory
        </Button>
      ),
    },
  ];

  // ------------------ column visibility ------------------

  const getColKey = (c) => c.key || c.dataIndex?.[0] || "";
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.map(getColKey)
  );

  const displayedColumns = allColumns.filter((c) =>
    visibleColumns.includes(getColKey(c))
  );

  // ------------------ data fetch ------------------

  const fetchCarIntakes = async (page = pagination.current, limit = pagination.pageSize, search = searchValue) => {
    setLoading(true);
    try {
      const res = await carIntakeAPI.getAll({
        page,
        limit,
        status: "payment-done",
        search,
        forInventory: true,
      });

      const data = res.data || res;

      setCarIntakes(data.carIntakes || []);
      if (data.pagination) {
        setPagination({
          current: data.pagination.page,
          pageSize: data.pagination.limit,
          total: data.pagination.total,
        });
      }
    } catch (e) {
      message.error(
        e?.response?.data?.error || "Failed to fetch car intakes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarIntakes();
  }, [pagination.current, pagination.pageSize]);

  // ------------------ UI ------------------

  return (
    <>
      <TitleBox
        title="Add Inventory"
        routes={["Scrap Yard", "Inventory"]}
        current="Add Inventory"
      />

      <PageContentWrapper>
        <Card
          title="Car Lists"
          extra={
            <Popover
              placement="bottomRight"
              content={
                <div style={{ maxWidth: 280 }}>
                  {allColumns.map((col) => {
                    const key = getColKey(col);
                    return (
                      <Checkbox
                        key={key}
                        checked={visibleColumns.includes(key)}
                        onChange={(e) =>
                          setVisibleColumns((prev) =>
                            e.target.checked
                              ? [...prev, key]
                              : prev.filter((k) => k !== key)
                          )
                        }
                      >
                        {col.title}
                      </Checkbox>
                    );
                  })}
                </div>
              }
            >
              <Button>Columns</Button>
            </Popover>
          }
        >
          <Space.Compact style={{ marginBottom: 16, maxWidth: 600 }}>
            <Input
              placeholder="Search VIN / Make / Model"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={() => fetchCarIntakes(1, pagination.pageSize)}
            />
            <Button
              icon={<SearchOutlined />}
              type="primary"
              onClick={() => fetchCarIntakes(1, pagination.pageSize)}
            >
              Search
            </Button>
          </Space.Compact>

          <Table
            columns={displayedColumns}
            dataSource={carIntakes}
            loading={loading}
            rowKey={(r) => r._id || r.vin}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            onChange={(p) =>
              setPagination({
                current: p.current,
                pageSize: p.pageSize,
                total: pagination.total,
              })
            }
            bordered
            size="small"
          />
        </Card>
      </PageContentWrapper>
    </>
  );
};

export default PartInventoryAdd;

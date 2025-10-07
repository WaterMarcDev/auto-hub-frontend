import React from "react";
import { partAPI, uploadAPI } from "../../utils/api";
import {
  notification,
  Button,
  Card,
  Table,
  Space,
  Popover,
  Popconfirm,
  Checkbox,
  Image,
  Input,
  Tooltip,
} from "antd";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import PartForm from "./PartForm";

const Part = () => {
  const [parts, setParts] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [open, setOpen] = React.useState(false);
  const [selectedPart, setSelectedPart] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");

  const [notificationApi, contextHolder] = notification.useNotification();

  // Debounced fetch: when pagination or search changes, refetch parts
  React.useEffect(() => {
    let cancelled = false;
    const getParts = async () => {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (search && String(search).trim() !== "") params.search = search.trim();

      const { data } = await partAPI.getAll(params);
      if (cancelled) return;
      setParts(data.parts);
      setPagination(data.pagination);
    };

    getParts();

    return () => {
      cancelled = true;
    };
  }, [success, pagination.page, pagination.limit, search]);

  // Debounce search input -> update `search` after delay
  React.useEffect(() => {
    const t = setTimeout(() => {
      setPagination((p) => ({ ...p, page: 1 }));
      setSearch(searchInput);
    }, 300);

    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => {
    if (error) {
      notificationApi.error({
        message: "Error",
        description: error,
        duration: 3,
      });
      setError(null);
    }
  }, [error, notificationApi]);

  React.useEffect(() => {
    if (success) {
      notificationApi.success({
        message: "Success",
        description: success,
        duration: 3,
      });
      setSuccess(null);
    }
  }, [success, notificationApi]);

  const columns = [
    {
      title: "Sr. No.",
      key: "srNo",
      render: (text, record, index) =>
        (pagination.page - 1) * pagination.limit + index + 1,
    },
    {
      title: "Part Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Short Name",
      dataIndex: "shortName",
      key: "shortName",
    },
    {
      title: "Part Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Part Weight",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Part Dimensions",
      dataIndex: "dimensions",
      key: "dimensions",
      width: 150,
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (src) => {
        if (!src) return <span style={{ color: "#999" }}>No image</span>;
        const url = uploadAPI.getImageUrl(src);
        return (
          <Image
            src={url}
            width={40}
            style={{
              objectFit: "cover",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            placeholder={
              <div style={{ width: 50, height: 30, background: "#f0f0f0" }} />
            }
          />
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      render: (text, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedPart(record);
                setOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <Popconfirm
              title={`Delete part "${record.name}"?`}
              onConfirm={async () => {
                try {
                  await partAPI.delete(record._id);
                  setSuccess("Part deleted successfully");
                  setPagination((p) => ({ ...p }));
                } catch (err) {
                  setError(
                    err.response?.data?.message ||
                      err.message ||
                      "Delete failed"
                  );
                }
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getColKey = (col) =>
    col.key
      ? String(col.key)
      : Array.isArray(col.dataIndex)
      ? String(col.dataIndex[0])
      : String(col.dataIndex || "");

  const [visibleColumns, setVisibleColumns] = React.useState(
    columns.map((c) => getColKey(c))
  );

  const toggleColumn = (key, checked) => {
    setVisibleColumns((prev) => {
      if (checked) return Array.from(new Set([...prev, key]));
      return prev.filter((k) => k !== key);
    });
  };

  const selectedAllColumns = (checked) => {
    if (checked) setVisibleColumns(columns.map((c) => getColKey(c)));
    else setVisibleColumns([]);
  };

  const displayedColumns = columns.filter((c) =>
    visibleColumns.includes(getColKey(c))
  );

  return (
    <React.Fragment>
      {contextHolder}
      <PartForm
        open={open}
        setOpen={setOpen}
        part={selectedPart}
        setPart={setSelectedPart}
        setSuccess={setSuccess}
        setError={setError}
      />
      <TitleBox
        title="Add Inventory Parts"
        routes={["Scrap yard", "Master"]}
        current="Add Inventory Parts"
      />
      <PageContentWrapper>
        <Card title="Inventory Parts">
          {/* Toolbar: search (left) and controls (right) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <Space.Compact style={{ flex: 1, maxWidth: 520 }} size="middle">
              <Input
                placeholder="Search parts by name"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (!e.target.value) {
                    setSearch("");
                  }
                }}
                onPressEnter={() => {
                  setPagination((p) => ({ ...p, page: 1 }));
                  setSearch(searchInput);
                }}
                style={{ width: "100%" }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPagination((p) => ({ ...p, page: 1 }));
                  setSearch(searchInput);
                }}
              >
                Search
              </Button>
            </Space.Compact>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Popover
                placement="bottomRight"
                content={
                  <div style={{ maxWidth: 320 }}>
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>
                      Columns
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <Button
                        size="small"
                        onClick={() => selectedAllColumns(true)}
                      >
                        Show All
                      </Button>
                      <Button
                        size="small"
                        onClick={() => selectedAllColumns(false)}
                      >
                        Clear
                      </Button>
                    </div>
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                      {columns.map((col) => {
                        const key = getColKey(col);
                        return (
                          <div key={key} style={{ marginBottom: 6 }}>
                            <Checkbox
                              checked={visibleColumns.includes(key)}
                              onChange={(e) =>
                                toggleColumn(key, e.target.checked)
                              }
                            >
                              {col.title}
                            </Checkbox>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                }
              >
                <Button>Columns</Button>
              </Popover>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedPart(null);
                  setOpen(true);
                }}
              >
                Add New
              </Button>
            </div>
          </div>

          <Table
            columns={displayedColumns}
            dataSource={parts}
            rowKey="_id"
            size="middle"
            bordered
            scroll={{ y: 360 }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, limit) => {
                setPagination({
                  page,
                  limit,
                });
              },
            }}
          />
        </Card>
      </PageContentWrapper>
    </React.Fragment>
  );
};

export default Part;

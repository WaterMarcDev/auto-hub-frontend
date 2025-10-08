import React from "react";
import { trimAPI, makeAPI, modelAPI } from "../../utils/api";
import {
  Button,
  Card,
  Checkbox,
  notification,
  Popover,
  Table,
  Input,
  Select,
} from "antd";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import TrimForm from "./TrimForm";

const Trim = () => {
  const [trims, setTrims] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [open, setOpen] = React.useState(false);
  const [selectedTrim, setSelectedTrim] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [search, setSearch] = React.useState("");
  const [makeOptions, setMakeOptions] = React.useState([]);
  const [selectedMake, setSelectedMake] = React.useState(null);
  const [modelOptions, setModelOptions] = React.useState([]);
  const [selectedModelFilter, setSelectedModelFilter] = React.useState(null);

  const [notificationApi, contextHolder] = notification.useNotification();

  React.useEffect(() => {
    const getTrims = async () => {
      const params = { page: pagination.page, limit: pagination.limit };
      if (search && String(search).trim() !== "")
        params.search = String(search).trim();
      if (selectedMake) params.make = selectedMake;
      if (selectedModelFilter) params.model = selectedModelFilter;
      const { data } = await trimAPI.getAll(params);
      setTrims(data.trims);
      setPagination(data.pagination);
    };
    getTrims();
  }, [
    success,
    pagination.page,
    pagination.limit,
    search,
    selectedMake,
    selectedModelFilter,
  ]);

  // Load makes for filter
  React.useEffect(() => {
    let mounted = true;
    const loadMakes = async () => {
      try {
        const { data } = await makeAPI.getAll({ limit: 1000 });
        if (!mounted) return;
        const items = data.makes || data || [];
        setMakeOptions(items.map((m) => ({ label: m.name, value: m._id })));
      } catch {
        // ignore
      }
    };
    loadMakes();
    return () => (mounted = false);
  }, []);

  // Load models when make changes for model filter
  React.useEffect(() => {
    let mounted = true;
    const loadModels = async () => {
      if (!selectedMake) {
        setModelOptions([]);
        setSelectedModelFilter(null);
        return;
      }
      try {
        const { data } = await modelAPI.getAll({
          make: selectedMake,
          limit: 1000,
        });
        if (!mounted) return;
        const items = data.models || data || [];
        setModelOptions(items.map((m) => ({ label: m.name, value: m._id })));
      } catch {
        // ignore
      }
    };
    loadModels();
    return () => (mounted = false);
  }, [selectedMake]);

  const handleDelete = async (id) => {
    try {
      await trimAPI.delete(id);
      setSuccess("Trim deleted successfully.");
      // refresh
      const { data } = await trimAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
      });
      setTrims(data.trims);
      setPagination(data.pagination);
    } catch (err) {
      setError(err?.message || "Failed to delete trim.");
    }
  };

  const [deletePopoverVisible, setDeletePopoverVisible] = React.useState(null);

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
      render: (text, record, index) => index + 1,
    },
    { title: "Car Make Name", key: "carMake", dataIndex: ["make", "name"] },
    { title: "Car Model Name", key: "carModel", dataIndex: ["model", "name"] },
    {
      title: "Trim Name",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "Short Name",
      key: "shortName",
      dataIndex: "shortName",
    },
    {
      title: "Description",
      key: "description",
      dataIndex: "description",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            type="text"
            style={{ color: "#1890ff" }}
            onClick={() => {
              setSelectedTrim(record);
              setOpen(true);
            }}
            icon={<EditOutlined />}
          />
          <Popover
            placement="top"
            open={deletePopoverVisible === record._id}
            content={
              <div>
                <div>Are you sure to delete this trim?</div>
                <div style={{ marginTop: 8, textAlign: "right" }}>
                  <Button
                    size="small"
                    danger
                    onClick={async () => {
                      await handleDelete(record._id);
                      setDeletePopoverVisible(null);
                    }}
                    style={{ marginRight: 8 }}
                  >
                    Yes
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setDeletePopoverVisible(null)}
                  >
                    No
                  </Button>
                </div>
              </div>
            }
            trigger="click"
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeletePopoverVisible(record._id)}
            />
          </Popover>
        </div>
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
      <TrimForm
        open={open}
        setOpen={setOpen}
        trim={selectedTrim}
        setTrim={setSelectedTrim}
        setSuccess={setSuccess}
        setError={setError}
      />
      <TitleBox
        title="Add Car Trim"
        routes={["Scrap Yard", "Master"]}
        current="Add Car Trim"
      />
      <PageContentWrapper>
        <Card
          title="Car Trim"
          extra={
            <div style={{ display: "flex", gap: 8 }}>
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
                  setSelectedTrim(null);
                  setOpen(true);
                }}
              >
                Add Car Trim
              </Button>
            </div>
          }
        >
          {/* Filters row: second row below card header */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 12,
              marginTop: 8,
              alignItems: "center",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <Select
              placeholder="Filter by Make"
              style={{ width: 220 }}
              allowClear
              options={makeOptions}
              value={selectedMake}
              onChange={(val) => setSelectedMake(val)}
            />
            <Select
              placeholder="Filter by Model"
              style={{ width: 220 }}
              allowClear
              options={modelOptions}
              value={selectedModelFilter}
              onChange={(val) => setSelectedModelFilter(val)}
            />
            <Input
              placeholder="Search trims"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280 }}
            />
          </div>

          <Table
            columns={displayedColumns}
            dataSource={trims}
            rowKey="_id"
            scroll={{ y: 200 }}
            size="small"
            bordered
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, limit) => {
                setPagination((prev) => ({
                  ...prev,
                  page,
                  limit,
                }));
              },
            }}
          />
        </Card>
      </PageContentWrapper>
    </React.Fragment>
  );
};

export default Trim;

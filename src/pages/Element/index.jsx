import React from "react";
import { elementAPI } from "../../utils/api";
import {
  notification,
  Button,
  Card,
  Table,
  Space,
  Popover,
  Checkbox,
  Input,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import ElementForm from "./ElementForm";

const Element = () => {
  const [elements, setElements] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [open, setOpen] = React.useState(false);
  const [selectedElement, setSelectedElement] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [search, setSearch] = React.useState("");

  const [notificationApi, contextHolder] = notification.useNotification();

  const fetchElements = React.useCallback(async () => {
    try {
      const { data } = await elementAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });
      setElements(data.elements);
      setPagination(data.pagination);
    } catch (err) {
      setError(err?.message || "Failed to fetch elements.");
    }
  }, [pagination.page, pagination.limit, search]);

  React.useEffect(() => {
    fetchElements();
  }, [fetchElements, success]);

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
    {
      title: "Element Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Short Name",
      dataIndex: "shortName",
      key: "shortName",
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Dimensions",
      dataIndex: "dimensions",
      key: "dimensions",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button
            size="small"
            type="text"
            style={{ color: "#1890ff" }}
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedElement(record);
              setOpen(true);
            }}
          />
          <Popover
            placement="top"
            content={
              <div>
                <div>Are you sure to delete this element?</div>
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
            open={deletePopoverVisible === record._id}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeletePopoverVisible(record._id)}
            />
          </Popover>
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

  const [deletePopoverVisible, setDeletePopoverVisible] = React.useState(null);

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

  const handleDelete = async (id) => {
    try {
      await elementAPI.delete(id);
      setSuccess("Element deleted successfully.");
      fetchElements();
    } catch (err) {
      setError(err?.message || "Failed to delete element.");
    }
  };

  return (
    <React.Fragment>
      {contextHolder}
      <ElementForm
        open={open}
        setOpen={setOpen}
        element={selectedElement}
        setElement={setSelectedElement}
        setSuccess={setSuccess}
        setError={setError}
      />
      <TitleBox
        title="Add Scrap Elements"
        routes={["Scrap yard", "Master"]}
        current="Add Scrap Elements"
      />
      <PageContentWrapper>
        <Card
          title="Scrap Elements"
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Input
                  placeholder="Search Elements"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 220 }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedElement(null);
                    setOpen(true);
                  }}
                >
                  Add New
                </Button>
              </div>
            </div>
          }
        >
          <Table
            columns={displayedColumns}
            dataSource={elements}
            rowKey="_id"
            size="small"
            bordered
            scroll={{ y: 200 }}
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

export default Element;

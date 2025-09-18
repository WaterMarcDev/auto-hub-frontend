import React from "react";
import { partAPI, uploadAPI } from "../../utils/api";
import {
  notification,
  Button,
  Card,
  Table,
  Space,
  Popover,
  Checkbox,
  Image,
} from "antd";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import { PlusOutlined } from "@ant-design/icons";
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

  const [notificationApi, contextHolder] = notification.useNotification();

  React.useEffect(() => {
    const getParts = async () => {
      const { data } = await partAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
      });
      setParts(data.parts);
      setPagination(data.pagination);
    };

    getParts();
  }, [success, pagination.page, pagination.limit]);

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
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedPart(record);
              setOpen(true);
            }}
          >
            Edit
          </Button>
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
        <Card
          title="Inventory Parts"
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
                  setSelectedPart(null);
                  setOpen(true);
                }}
              >
                Add New
              </Button>
            </div>
          }
        >
          <Table
            columns={displayedColumns}
            dataSource={parts}
            rowKey="_id"
            size="small"
            bordered
            scroll={{ y: 285 }}
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

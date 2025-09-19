import React from "react";
import TitleBox from "../../components/TitleBox";
import { Button, Card, Checkbox, Popover, Table, notification } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { makeAPI } from "../../utils/api";
import MakeForm from "./MakeForm";

const Make = () => {
  const [makes, setMakes] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [open, setOpen] = React.useState(false);
  const [selectedMake, setSelectedMake] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [error, setError] = React.useState(null);

  const [notificationApi, contextHolder] = notification.useNotification();

  const getMakes = async () => {
    const { data } = await makeAPI.getAll({
      page: pagination.page,
      limit: pagination.limit,
    });
    setMakes(data.makes);
    setPagination(data.pagination);
  };

  React.useEffect(() => {
    getMakes();
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
  }, [error]);

  React.useEffect(() => {
    if (success) {
      notificationApi.success({
        message: "Success",
        description: success,
        duration: 3,
      });
      setSuccess(null);
    }
  }, [success]);

  const columns = [
    {
      title: "Sr. No.",
      key: "srNo",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Make Name",
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
            type="link"
            onClick={() => {
              setSelectedMake(record);
              setOpen(true);
            }}
          >
            Edit
          </Button>
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
      <MakeForm
        open={open}
        setOpen={setOpen}
        make={selectedMake}
        setMake={setSelectedMake}
        setSuccess={setSuccess}
        setError={setError}
      />
      <TitleBox
        title="Add Car Makes"
        routes={["Scrap Yard", "Master"]}
        current="Add Car Make"
      />
      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card
            title="Car Make"
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
                    setSelectedMake(null);
                    setOpen(true);
                  }}
                >
                  Add New Make
                </Button>
              </div>
            }
          >
            <Table
              columns={displayedColumns}
              dataSource={makes}
              rowKey="id"
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
                  setPagination({
                    page,
                    limit,
                  });
                },
              }}
            />
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Make;

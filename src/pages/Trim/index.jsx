import React from "react";
import { trimAPI } from "../../utils/api";
import { Button, Card, notification, Table } from "antd";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import { PlusOutlined } from "@ant-design/icons";
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

  const [notificationApi, contextHolder] = notification.useNotification();

  React.useEffect(() => {
    const getTrims = async () => {
      const { data } = await trimAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
      });
      setTrims(data.trims);
      setPagination(data.pagination);
    };
    getTrims();
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
            type="link"
            onClick={() => {
              setSelectedTrim(record);
              setOpen(true);
            }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

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
          <Table
            columns={columns}
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

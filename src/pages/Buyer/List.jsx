import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  message,
  Input,
  Space,
  Modal,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { buyerAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";

const BuyerList = () => {
  const [buyers, setBuyers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const navigate = useNavigate();

  const fetchBuyers = async (params = {}) => {
    setLoading(true);
    try {
      const res = await buyerAPI.getAll({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
      });

      const data = res.data || res;
      const fetchedBuyers = data.buyers || [];
      setBuyers(fetchedBuyers);

      setPagination({
        page: params.page || 1,
        limit: params.limit || 10,
        total: data.pagination?.total || fetchedBuyers.length,
      });
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.error || err.message || "Failed to fetch buyers"
      );
    } finally {
      setLoading(false);
    }
  };

  // Universal search function
  const handleSearch = (value) => {
    const trimmedValue = value.trim();
    setSearchValue(trimmedValue);
    fetchBuyers({ page: 1, limit: pagination.limit, search: trimmedValue });
  };

  // Clear search
  const handleSearchClear = () => {
    setSearchValue("");
    fetchBuyers({ page: 1, limit: pagination.limit, search: "" });
  };

  const INITIAL_LIMIT = 10;

  useEffect(() => {
    fetchBuyers({ page: 1, limit: INITIAL_LIMIT });
  }, []);

  const handleDelete = async (id) => {
    try {
      await buyerAPI.delete(id);
      message.success("Buyer deleted successfully");
      fetchBuyers();
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.error || err.message || "Failed to delete buyer"
      );
    }
  };

  const columns = [
    {
      title: "Sr. No.",
      key: "srNo",
      width: 80,
      render: (text, record, index) => {
        const currentPage = pagination.page || 1;
        const pageSize = pagination.limit || 10;
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Name",
      dataIndex: "firstName",
      key: "name",
      render: (firstName, rec) => `${firstName || ""} ${rec.lastName || ""}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => email || "N/A",
    },
    {
      title: "Mobile",
      dataIndex: "mobileNo",
      key: "mobileNo",
      render: (mobile) => mobile || "N/A",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc) => desc || "N/A",
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
      render: (text, rec) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/buyer/edit/${rec._id}`)}
            title="Edit"
          />
          <Popconfirm
            title="Are you sure you want to delete this buyer?"
            onConfirm={() => handleDelete(rec._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              type="primary"
              danger
              icon={<DeleteOutlined />}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <TitleBox title="Buyer Lists" routes={["Buyers"]} current="List" />

      <PageContentWrapper>
        <Card title="Buyers">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <Space.Compact style={{ flex: 1, maxWidth: 600 }} size="middle">
              <Input
                placeholder="Search buyers by name, email, or mobile number..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  if (!e.target.value) {
                    handleSearchClear();
                  }
                }}
                onPressEnter={() => handleSearch(searchValue)}
                size="middle"
                style={{ width: "100%" }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => handleSearch(searchValue)}
                size="middle"
              >
                Search
              </Button>
            </Space.Compact>

            <Button
              type="primary"
              size="middle"
              onClick={() => navigate("/buyer/register")}
            >
              + New Buyer
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={buyers}
            rowKey={(r) => r._id || r.email}
            loading={loading}
            size="small"
            bordered={true}
            scroll={{ y: "calc(100vh - 510px)" }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} buyers`,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) => {
                fetchBuyers({ page, limit: pageSize, search: searchValue });
              },
            }}
          />
        </Card>
      </PageContentWrapper>
    </div>
  );
};

export default BuyerList;

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  notification,
  Tag,
  Space,
  Modal,
  Input,
  Form,
} from "antd";
import { EditOutlined, KeyOutlined, PlusOutlined } from "@ant-design/icons";
import { userAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import { useAuth } from "../../hooks/useAuth";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const [notificationApi, contextHolder] = notification.useNotification();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: "Failed to fetch users",
        description: err.response?.data?.error || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    try {
      await userAPI.resetPassword(selectedUser._id, values.password);
      notificationApi.success({ message: "Password reset successfully" });
      setResetModalVisible(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: "Failed to reset password",
        description: err.response?.data?.error || err.message,
      });
    }
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, rec) => `${rec.first_name} ${rec.last_name}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "red" : role === "manager" ? "blue" : "green"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, rec) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/users/edit/${rec._id}`)}
          >
            Edit
          </Button>
          <Button
            icon={<KeyOutlined />}
            size="small"
            onClick={() => {
              setSelectedUser(rec);
              setResetModalVisible(true);
            }}
          >
            Reset Password
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <TitleBox title="User Management" routes={["Users"]} current="List" />
      <PageContentWrapper>
        <Card
          title="Users"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/users/add")}
            >
              Add New User
            </Button>
          }
        >
          <Table
            dataSource={users}
            columns={columns}
            rowKey="_id"
            loading={loading}
          />
        </Card>

        <Modal
          title={`Reset Password for ${selectedUser?.first_name}`}
          open={resetModalVisible}
          onCancel={() => {
            setResetModalVisible(false);
            setSelectedUser(null);
          }}
          footer={null}
        >
          <Form onFinish={handleResetPassword} layout="vertical">
            <Form.Item
              name="password"
              label="New Password"
              rules={[
                { required: true, message: "Please enter new password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={['password']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your password!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The new password that you entered do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            <div style={{ textAlign: "right" }}>
              <Button type="primary" htmlType="submit">
                Reset Password
              </Button>
            </div>
          </Form>
        </Modal>
      </PageContentWrapper>
    </div>
  );
};

export default UserList;

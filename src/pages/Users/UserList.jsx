import React, { useEffect, useRef, useState } from "react";
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
import { passwordRules, PASSWORD_MAX_LENGTH } from "../../utils/password";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [resetForm] = Form.useForm();
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

  // One click = one request = one message: ignore further submits while a
  // reset is in flight (the ref guards against clicks before re-render).
  const resetInFlight = useRef(false);

  const closeResetModal = () => {
    setResetModalVisible(false);
    setSelectedUser(null);
    resetForm.resetFields();
  };

  const handleResetPassword = async (values) => {
    if (resetInFlight.current || !selectedUser) return;
    resetInFlight.current = true;
    setResetting(true);
    try {
      await userAPI.resetPassword(selectedUser._id, values.password);
      notificationApi.success({
        key: "reset-password",
        message: "Password reset successfully",
      });
      closeResetModal();
    } catch (err) {
      console.error(err);
      notificationApi.error({
        key: "reset-password",
        message: "Failed to reset password",
        description: err.response?.data?.error || err.message,
      });
    } finally {
      resetInFlight.current = false;
      setResetting(false);
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
      render: (role) => {
        let color = "default";
        switch (role) {
          case "admin":
            color = "red";
            break;
          case "manager":
            color = "blue";
            break;
          case "staff":
            color = "green";
            break;
          case "front_desk":
            color = "cyan";
            break;
          case "scraper":
            color = "orange";
            break;
          default:
            color = "default";
        }
        return (
          <Tag color={color}>
            {role.toUpperCase()}
          </Tag>
        );
      },
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
            if (!resetting) closeResetModal();
          }}
          afterClose={() => resetForm.resetFields()}
          maskClosable={!resetting}
          footer={null}
        >
          <Form
            form={resetForm}
            onFinish={handleResetPassword}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="password"
              label="New Password"
              rules={[
                ...passwordRules,
              ]}
            >
              <Input.Password autoComplete="new-password" maxLength={PASSWORD_MAX_LENGTH} />
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
                <Input.Password autoComplete="new-password" maxLength={PASSWORD_MAX_LENGTH} />
              </Form.Item>
            <div style={{ textAlign: "right" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetting}
                disabled={resetting}
              >
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

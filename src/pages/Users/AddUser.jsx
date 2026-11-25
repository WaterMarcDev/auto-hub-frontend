import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  notification,
  Spin,
} from "antd";
import { userAPI } from "../../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import { emailRule, normalizeEmail } from "../../utils/email";
import { passwordRules, PASSWORD_MAX_LENGTH } from "../../utils/password";

const { Option } = Select;

// Same limit as the backend (utils/userName.js, User model maxlength).
const MAX_NAME_LENGTH = 50;
const nameRules = (label) => [
  { required: true, whitespace: true, message: `${label} is required` },
  { max: MAX_NAME_LENGTH, message: `${label} can be at most ${MAX_NAME_LENGTH} characters` },
];
const trimName = (v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v);

const AddUser = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams(); // If present, we are in edit mode
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [notificationApi, contextHolder] = notification.useNotification();

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    setFetching(true);
    try {
      const res = await userAPI.getById(id);
      const user = res.data.user;
      form.setFieldsValue({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      });
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: "Failed to fetch user details",
        description: err.response?.data?.error || err.message,
      });
      navigate("/users/list");
    } finally {
      setFetching(false);
    }
  };

  const onFinish = async (formValues) => {
    const values = {
      ...formValues,
      first_name: trimName(formValues.first_name),
      last_name: trimName(formValues.last_name),
    };
    setLoading(true);
    try {
      if (isEdit) {
        await userAPI.update(id, values);
        notificationApi.success({ message: "User updated successfully" });
      } else {
        await userAPI.create(values);
        notificationApi.success({ message: "User created successfully" });
      }
      navigate("/users/list");
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: `Failed to ${isEdit ? "update" : "create"} user`,
        description: err.response?.data?.error || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {contextHolder}
      <TitleBox
        title={isEdit ? "Edit User" : "Add New User"}
        routes={["Users"]}
        current={isEdit ? "Edit" : "Add"}
      />
      <PageContentWrapper>
        <Card title={isEdit ? "Edit User Details" : "New User Details"}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ role: "staff" }}
          >
            <div className="row">
              <div className="col-md-6">
                <Form.Item
                  name="first_name"
                  label="First Name"
                  rules={nameRules("First name")}
                >
                  <Input placeholder="John" maxLength={MAX_NAME_LENGTH} />
                </Form.Item>
              </div>
              <div className="col-md-6">
                <Form.Item
                  name="last_name"
                  label="Last Name"
                  rules={nameRules("Last name")}
                >
                  <Input placeholder="Doe" maxLength={MAX_NAME_LENGTH} />
                </Form.Item>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Item
                  name="email"
                  label="Email"
                  normalize={normalizeEmail}
                  rules={[
                    { required: true, message: "Email is required" },
                    emailRule,
                  ]}
                >
                  <Input placeholder="john@example.com" />
                </Form.Item>
              </div>
              <div className="col-md-6">
                <Form.Item
                  name="role"
                  label="Role"
                  rules={[{ required: true, message: "Role is required" }]}
                >
                  <Select>
                    <Option value="admin">Admin</Option>
                    <Option value="manager">Manager</Option>
                    <Option value="staff">Staff</Option>
                    <Option value="front_desk">Front Desk</Option>
                    <Option value="scraper">Scraper</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>

            {!isEdit && (
              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={passwordRules}
                  >
                    <Input.Password
                      placeholder="******"
                      maxLength={PASSWORD_MAX_LENGTH}
                      autoComplete="new-password"
                    />
                  </Form.Item>
                </div>
              </div>
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? "Update User" : "Create User"}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => navigate("/users/list")}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </PageContentWrapper>
    </div>
  );
};

export default AddUser;

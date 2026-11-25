import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Button,
  notification,
  Spin,
  Typography,
  Divider,
  Modal,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { entryFeeAPI } from "../../utils/api";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import NumericInput from "../../components/NumericInput";

const { Text } = Typography;

// Same limits as the server (controllers/entryFee.controller.js).
const ENTRY_FEE_MIN = 0;
const ENTRY_FEE_MAX = 1000;
const ENTRY_FEE_ERROR = `Entry fee must be a number from $${ENTRY_FEE_MIN} to $${ENTRY_FEE_MAX} with at most 2 decimal places`;

const validateEntryFee = (_, value) => {
  if (value === undefined || value === null || value === "") return Promise.resolve();
  const n = Number(value);
  const ok =
    Number.isFinite(n) &&
    n >= ENTRY_FEE_MIN &&
    n <= ENTRY_FEE_MAX &&
    /^\d+(\.\d{1,2})?$/.test(String(value));
  return ok ? Promise.resolve() : Promise.reject(new Error(ENTRY_FEE_ERROR));
};

const EntryFeeSetting = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [setting, setSetting] = useState(null);
  const [notificationApi, notificationContextHolder] = notification.useNotification();
  const [modal, modalContextHolder] = Modal.useModal();

  useEffect(() => {
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    setFetching(true);
    try {
      const res = await entryFeeAPI.get();
      const settingData = res.data.setting;
      setSetting(settingData);
      form.setFieldsValue({
        entryFee: settingData.entryFee,
      });
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: "Failed to fetch setting",
        description: err.response?.data?.error || err.message,
      });
    } finally {
      setFetching(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await entryFeeAPI.update({ entryFee: Number(values.entryFee) });
      notificationApi.success({ message: "Entry fee updated successfully" });
      setSetting(res.data.setting);
      form.setFieldsValue({ entryFee: res.data.setting?.entryFee });
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: "Failed to update entry fee",
        description: err.response?.data?.error || err.message,
      });
      // Nothing was saved: show the stored fee again.
      if (setting) form.setFieldsValue({ entryFee: setting.entryFee });
    } finally {
      setLoading(false);
    }
  };

  const showConfirm = (values) => {
    modal.confirm({
      title: 'Do you want to update the entry fee?',
      icon: <ExclamationCircleOutlined />,
      content: `The new entry fee will be $${Number(values.entryFee).toFixed(2)}. This will affect all new entries.`,
      okText: 'Update',
      cancelText: 'Cancel',
      onOk: async () => {
        await onFinish(values);
      },
    });
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
      {notificationContextHolder}
      {modalContextHolder}
      <TitleBox
        title="Entry Fee Setting"
        routes={["Admin"]}
        current="Entry Fee"
      />
      <PageContentWrapper>
        <div className="row">
          <div className="col-md-6">
            <Card title="Manage Entry Fee">
              <Form
                form={form}
                layout="vertical"
                onFinish={showConfirm}
              >
                <Form.Item
                  name="entryFee"
                  label="Entry Fee (USD)"
                  extra={`From $${ENTRY_FEE_MIN} to $${ENTRY_FEE_MAX}, at most 2 decimal places.`}
                  rules={[
                    { required: true, message: "Entry fee is required" },
                    { validator: validateEntryFee },
                  ]}
                >
                  <NumericInput
                    mode="number"
                    size="large"
                    min={ENTRY_FEE_MIN}
                    max={ENTRY_FEE_MAX}
                    precision={2}
                    step={0.5}
                    prefix="$"
                    className="crm-number-box"
                    style={{ width: '100%' }}
                    errorMessage={ENTRY_FEE_ERROR}
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} size="large">
                    Update Entry Fee
                  </Button>
                </Form.Item>
              </Form>

              <Divider />

              {setting && !setting.isDefault && (
                <div style={{ marginTop: '20px' }}>
                  <Typography.Title level={5}>Last Update Info</Typography.Title>
                  <p>
                    <Text strong>Updated By:</Text> {setting.updatedBy?.first_name} {setting.updatedBy?.last_name} ({setting.updatedBy?.email})
                  </p>
                  <p>
                    <Text strong>Updated At:</Text> {new Date(setting.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </PageContentWrapper>
    </div>
  );
};

export default EntryFeeSetting;

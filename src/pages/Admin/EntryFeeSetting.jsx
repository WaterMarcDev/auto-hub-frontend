import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  InputNumber,
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

const { Text } = Typography;
const { confirm } = Modal;

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
      const res = await entryFeeAPI.update(values);
      notificationApi.success({ message: "Entry fee updated successfully" });
      setSetting(res.data.setting);
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: "Failed to update entry fee",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const showConfirm = (values) => {
    modal.confirm({
      title: 'Do you want to update the entry fee?',
      icon: <ExclamationCircleOutlined />,
      content: `The new entry fee will be $${values.entryFee}. This will affect all new entries.`,
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
                  rules={[
                    { required: true, message: "Entry fee is required" },
                    { type: 'number', min: 0, message: "Fee cannot be negative" }
                  ]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    step={0.5}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    style={{ width: '100%' }}
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

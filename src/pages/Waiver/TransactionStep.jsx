import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  InputNumber,
  Space,
} from "antd";
import SignatureCanvas from "../../components/SignatureCanvas";

const { Option } = Select;
const { TextArea } = Input;

const TransactionStep = ({ data, onComplete, onBack, loading }) => {
  const [form] = Form.useForm();
  const [employeeSignature, setEmployeeSignature] = useState(
    data.employeeSignature || ""
  );

  const onFinish = (values) => {
    if (!employeeSignature) {
      form.setFields([
        {
          name: "employeeSignature",
          errors: ["Please upload employee signature"],
        },
      ]);
      return;
    }

    const result = {
      transactionData: {
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        description: values.description || "",
      },
      employeeSignature,
    };

    onComplete(result);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <div style={{ marginBottom: 16 }}>
        <h5>Transaction Information</h5>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Amount"
            name="amount"
            rules={[
              { required: true, message: "Please enter amount" },
              {
                type: "number",
                min: 0.01,
                message: "Amount must be greater than 0",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter amount"
              prefix="$"
              precision={2}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Payment Method"
            name="paymentMethod"
            rules={[
              { required: true, message: "Please select payment method" },
            ]}
          >
            <Select placeholder="Select payment method">
              <Option value="Cash">Cash</Option>
              <Option value="Check">Check</Option>
              <Option value="Bank Transfer">Bank Transfer</Option>
              <Option value="Zelle">Zelle</Option>
              <Option value="Credit Card">Credit Card</Option>
              <Option value="Debit Card">Debit Card</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Description" name="description">
        <TextArea
          rows={4}
          placeholder="Enter transaction description or notes"
        />
      </Form.Item>

      <div style={{ marginTop: 32, marginBottom: 16 }}>
        <h5>Employee Signature</h5>
      </div>

      <Form.Item label="Upload Signature" name="employeeSignature" required>
        <SignatureCanvas
          value={employeeSignature}
          onChange={(url) => {
            setEmployeeSignature(url);
            form.setFields([{ name: "employeeSignature", errors: [] }]);
          }}
        />
      </Form.Item>

      <Form.Item style={{ marginTop: 32 }}>
        <Space>
          <Button onClick={onBack} size="large">
            Back
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
          >
            Create Waiver
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TransactionStep;

import React, { useState } from "react";
import {
  Card,
  Steps,
  Button,
  message,
  Radio,
  Tabs,
  Form,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import { useNavigate } from "react-router-dom";
import CameraUpload from "../../components/CameraUpload";
import { waiverAPI } from "../../utils/api";
import CustomerInfoStep from "./CustomerInfoStep";
import TransactionStep from "./TransactionStep";

const { Step } = Steps;

const AddWaiver = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form data state
  const [waiverData, setWaiverData] = useState({
    customerType: "seller", // seller or buyer
    customerMode: "select", // select or create
    // Customer info
    sellerId: null,
    sellerData: null,
    buyerId: null,
    buyerData: null,
    // ID Proof info
    idProofType: "",
    idProofNumber: "",
    idProofImage: "",
    signatureImage: "",
    // Transaction info (step 2)
    transactionData: null,
    employeeSignature: "",
  });

  const handleCustomerInfoComplete = (data) => {
    setWaiverData((prev) => ({
      ...prev,
      ...data,
    }));
    setCurrentStep(1);
  };

  const handleTransactionComplete = async (data) => {
    setLoading(true);
    try {
      // Combine all data
      const payload = {
        customerType: waiverData.customerType,
        idProofType: waiverData.idProofType,
        idProofNumber: waiverData.idProofNumber,
        idProofImage: waiverData.idProofImage,
        signatureImage: waiverData.signatureImage,
        transactionData: data.transactionData,
        employeeSignature: data.employeeSignature,
      };

      // Add seller or buyer data based on customerType
      if (waiverData.customerType === "seller") {
        if (waiverData.sellerId) {
          payload.sellerId = waiverData.sellerId;
        } else if (waiverData.sellerData) {
          payload.sellerData = waiverData.sellerData;
        }
      } else {
        if (waiverData.buyerId) {
          payload.buyerId = waiverData.buyerId;
        } else if (waiverData.buyerData) {
          payload.buyerData = waiverData.buyerData;
        }
      }

      console.log("Submitting waiver:", payload);

      await waiverAPI.create(payload);
      message.success("Waiver created successfully");
      navigate("/waivers");
    } catch (err) {
      console.error("Error creating waiver:", err);
      const errMsg =
        err.response?.data?.error || err.message || "Failed to create waiver";
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(0);
  };

  const steps = [
    {
      title: "Customer Info",
      content: (
        <CustomerInfoStep
          data={waiverData}
          onComplete={handleCustomerInfoComplete}
        />
      ),
    },
    {
      title: "Transaction",
      content: (
        <TransactionStep
          data={waiverData}
          onComplete={handleTransactionComplete}
          onBack={handleBack}
          loading={loading}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="page-title-box">
        <div className="page-title">
          <h4>Create Waiver</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Waivers</a>
            </li>
            <li className="breadcrumb-item active">Create</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card>
            <Steps current={currentStep} style={{ marginBottom: 24 }}>
              {steps.map((item) => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
            <div className="steps-content">{steps[currentStep].content}</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddWaiver;

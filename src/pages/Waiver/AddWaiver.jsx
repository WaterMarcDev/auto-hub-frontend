import React, { useState } from "react";
import { Card, Steps, message } from "antd";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../../utils/api";
import CustomerInfoStep from "./CustomerInfoStep";
import CreateCheckInModal from "../../components/CheckIn/CreateCheckInModal";

const { Step } = Steps;

const AddWaiver = () => {
  const navigate = useNavigate();
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState(null);

  // initial data passed to the step (stateless here)
  const initialData = {
    customerType: "seller",
    customerMode: "select",
    sellerId: null,
    sellerData: null,
    buyerId: null,
    buyerData: null,
    idProofType: "",
    idProofNumber: "",
    idProofImage: "",
    signatureImage: "",
  };

  const handleCustomerInfoComplete = async (data) => {
    // Final submission: create a Customer record via customers API, then create waiver
    try {
      // Build customer payload from the CustomerInfoStep values
      const customerPayload = {
        type: data.type || "customer",
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        email: data.email || undefined,
        mobileNo: data.mobileNo || undefined,
        idProofType: data.idProofType || undefined,
        idProofNumber: data.idProofNumber || undefined,
        idProofImage: data.idProofImage || undefined,
        signature: data.signature || undefined,
        linkedSeller: data.linkedSeller || null,
        linkedBuyer: data.linkedBuyer || null,
      };

      // If linked seller/buyer IDs are provided but key fields are missing, fetch them from customerAPI
      if (
        customerPayload.linkedSeller &&
        !customerPayload.firstName &&
        !customerPayload.lastName
      ) {
        try {
          const res = await customerAPI.getById(customerPayload.linkedSeller);
          const person = res.data || res;
          if (person) {
            customerPayload.firstName =
              customerPayload.firstName ||
              person.firstName ||
              person.first_name;
            customerPayload.lastName =
              customerPayload.lastName || person.lastName || person.last_name;
            customerPayload.email = customerPayload.email || person.email;
            customerPayload.mobileNo =
              customerPayload.mobileNo || person.mobileNo || person.mobile_no;
          }
        } catch (error) {
          // ignore and proceed with whatever data we have
          console.error("linkedSeller fetch error", error);
        }
      }

      if (
        customerPayload.linkedBuyer &&
        !customerPayload.firstName &&
        !customerPayload.lastName
      ) {
        try {
          const res = await customerAPI.getById(customerPayload.linkedBuyer);
          const person = res.data || res;
          if (person) {
            customerPayload.firstName =
              customerPayload.firstName ||
              person.firstName ||
              person.first_name;
            customerPayload.lastName =
              customerPayload.lastName || person.lastName || person.last_name;
            customerPayload.email = customerPayload.email || person.email;
            customerPayload.mobileNo =
              customerPayload.mobileNo || person.mobileNo || person.mobile_no;
          }
        } catch (error) {
          // ignore and proceed
          console.error("linkedBuyer fetch error", error);
        }
      }

      // Create customer via customerAPI only
      const customerRes = await customerAPI.create(customerPayload);
      const createdCustomer = customerRes.data || customerRes;

      console.log("Customer created via waiver form:", createdCustomer);
      message.success("Customer created successfully");
      setCreatedCustomer(createdCustomer);
      setCheckInModalOpen(true);
    } catch (err) {
      console.error("Error creating waiver/customer:", err);
      const errMsg =
        err.response?.data?.error || err.message || "Failed to create waiver";
      message.error(errMsg);
    } finally {
      // finished
    }
  };

  const steps = [
    {
      title: "Customer Info",
      content: (
        <CustomerInfoStep
          data={initialData}
          onComplete={handleCustomerInfoComplete}
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
            <div className="steps-content">{steps[0].content}</div>
          </Card>
        </div>
      </div>

      <CreateCheckInModal
        open={checkInModalOpen}
        preSelectedCustomer={createdCustomer}
        onClose={() => {
          setCheckInModalOpen(false);
          setCreatedCustomer(null);
          navigate("/waivers");
        }}
        onCreated={() => {
          setCheckInModalOpen(false);
          setCreatedCustomer(null);
          navigate("/checkins");
        }}
      />
    </div>
  );
};

export default AddWaiver;

import React, { useState } from "react";
import { Card, Steps, message } from "antd";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../../utils/api";
import { DEFAULT_CUSTOMER_TYPE } from "./customerTypeOptions";
import CustomerInfoStep from "./CustomerInfoStep";
import CreateCheckInModal from "../../components/CheckIn/CreateCheckInModal";
import { useCustomerCreate } from "../../hooks/useCustomerCreate";

const { Step } = Steps;

const AddWaiver = () => {
  const navigate = useNavigate();
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState(null);
  // Same name as an existing customer: staff compare the profiles first.
  const { createCustomer, sameNameModal } = useCustomerCreate();

  // initial data passed to the step (stateless here)
  const initialData = {
    type: DEFAULT_CUSTOMER_TYPE,
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
    // Final submission: create a Customer record via the customers API only.
    // This flow does NOT create a Waiver document.
    try {
      // Build customer payload from the CustomerInfoStep values
      const customerPayload = {
        type: data.type || DEFAULT_CUSTOMER_TYPE,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        email: data.email || undefined,
        mobileNo: data.mobileNo || undefined,
        waiverDate: data.waiverDate || undefined,
        idProofType: data.idProofType || undefined,
        idProofNumber: data.idProofNumber || undefined,
        idProofImage: data.idProofImage || undefined,
        // The backend persists the captured signature in `signatureImage`
        // (the same field used by Customer/Seller/Buyer registration).
        signatureImage: data.signature || undefined,
        description: data.description || undefined,
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
      const result = await createCustomer(customerPayload);
      if (result.cancelled) return; // popup closed: nothing saved
      if (result.existing) {
        // Staff confirmed it is the existing customer: no new record.
        message.info(`Continuing with the existing customer ${[result.customer.firstName, result.customer.lastName].filter(Boolean).join(" ")}.`, 5);
        setCreatedCustomer(result.customer);
        setCheckInModalOpen(true);
        return;
      }
      const createdCustomer = result.customer;

      message.success("Customer created successfully");
      setCreatedCustomer(createdCustomer);
      setCheckInModalOpen(true);
    } catch (err) {
      // Returning customer: the server found a customer with the same phone
      // number or ID (409) and sent it back. No duplicate is created: the
      // existing customer is used as-is and goes straight to Check-In.
      const existing = err.response?.status === 409 ? err.response?.data?.existingCustomer : null;
      if (existing) {
        const name = [existing.firstName, existing.lastName].filter(Boolean).join(" ") || "this customer";
        message.info(
          `Existing customer found: ${name}${existing.mobileNo ? ` (${existing.mobileNo})` : ""}. Continuing with the existing customer.`,
          5
        );
        setCreatedCustomer(existing);
        setCheckInModalOpen(true);
        return;
      }
      console.error("Error creating waiver/customer:", err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to create waiver";
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
          initialValues={initialData}
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

      {sameNameModal}
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

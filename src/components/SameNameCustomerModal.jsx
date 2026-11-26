// Same-name check when creating a customer.
//
// Two people can share a name, so a name match is not treated as the same
// person automatically. The server answers 409 SAME_NAME_CUSTOMER with the
// existing profiles; this popup shows them next to the details being added
// (phone, ID, signature) and staff choose:
//   - "Same customer – use this one"  -> the existing customer is used, or
//   - "Different person – create new" -> the customer is created
//                                        (sent again with confirmNewCustomer).
// A matching phone number or ID is still the same person (409
// DUPLICATE_CUSTOMER) and never reaches this popup.
//
// Usage (src/hooks/useCustomerCreate.jsx):
//   const { createCustomer, sameNameModal } = useCustomerCreate();
//   const result = await createCustomer(payload);
//   // result: { customer, existing: false } created
//   //         { customer, existing: true }  staff picked an existing customer
//   //         { cancelled: true }           popup closed, nothing saved
//   // other errors (incl. DUPLICATE_CUSTOMER) are thrown as before.
//   ...render {sameNameModal} once in the page.
import React from "react";
import { Modal, Button, Row, Col, Card, Typography, Image, Tag } from "antd";
import { uploadAPI } from "../utils/api";
import { displayPhone } from "../utils/phone";

const { Text } = Typography;

const fullName = (c) => [c?.firstName, c?.lastName].filter(Boolean).join(" ") || "-";
const imageUrl = (path) => (path ? uploadAPI.getImageUrl(path) : null);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 8 }}>
    <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
      {label}
    </Text>
    <div style={{ wordBreak: "break-word" }}>{children || "-"}</div>
  </div>
);

const SignatureBox = ({ src }) =>
  src ? (
    <Image
      src={src}
      alt="Signature"
      height={70}
      style={{ objectFit: "contain", background: "#fff", borderRadius: 4, maxWidth: "100%" }}
    />
  ) : (
    <Text type="secondary">No signature</Text>
  );

const Profile = ({ customer, signatureSrc, idImageSrc }) => (
  <>
    <Field label="Name">{fullName(customer)}</Field>
    <Field label="Phone">{customer?.mobileNo ? displayPhone(customer.mobileNo) : null}</Field>
    <Field label="ID">
      {customer?.idProofType || customer?.idProofNumber
        ? `${customer.idProofType || ""} ${customer.idProofNumber || ""}`.trim()
        : null}
    </Field>
    {idImageSrc && (
      <Field label="ID image">
        <Image src={idImageSrc} alt="ID" height={60} style={{ objectFit: "cover", borderRadius: 4 }} />
      </Field>
    )}
    <Field label="Signature">
      <SignatureBox src={signatureSrc} />
    </Field>
  </>
);

export const SameNameCustomerModal = ({ open, newCustomer, matches, onUseExisting, onCreateNew, onCancel, creating }) => (
  <Modal
    open={open}
    title={`A customer named ${fullName(newCustomer)} already exists`}
    onCancel={onCancel}
    width={matches.length > 1 ? 900 : 720}
    maskClosable={false}
    destroyOnClose
    footer={[
      <Button key="cancel" onClick={onCancel} disabled={creating}>
        Cancel
      </Button>,
      <Button key="new" type="primary" onClick={onCreateNew} loading={creating}>
        Different person – create new
      </Button>,
    ]}
  >
    <Text>
      Compare the phone, ID and signature. If it is the same person, use the existing customer;
      otherwise create a new customer.
    </Text>
    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
      <Col xs={24} md={matches.length > 1 ? 8 : 12}>
        <Card size="small" title={<Tag color="blue">You are adding</Tag>} style={{ height: "100%" }}>
          <Profile
            customer={newCustomer}
            signatureSrc={imageUrl(newCustomer?.signatureImage)}
            idImageSrc={imageUrl(newCustomer?.idProofImage)}
          />
        </Card>
      </Col>
      {matches.map((c) => (
        <Col key={c._id} xs={24} md={matches.length > 1 ? 8 : 12}>
          <Card size="small" title={<Tag color="green">Existing customer</Tag>} style={{ height: "100%" }}>
            <Profile customer={c} signatureSrc={imageUrl(c.signatureImage)} idImageSrc={imageUrl(c.idProofImage)} />
            <Button block onClick={() => onUseExisting(c)} disabled={creating}>
              Same customer – use this one
            </Button>
          </Card>
        </Col>
      ))}
    </Row>
  </Modal>
);

export default SameNameCustomerModal;

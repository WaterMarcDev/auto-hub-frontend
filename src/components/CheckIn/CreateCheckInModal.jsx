import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  List,
  Card,
  Descriptions,
  Checkbox,
  Typography,
} from "antd";
import SignatureCanvas from "../SignatureCanvas";
import NumericInput from "../NumericInput";
import UnitInput from "../UnitInput";
import PersonsDetailsModal from "./PersonsDetailsModal";
import { emptyPerson, isPersonComplete } from "../../utils/checkInPersons";
import { customerAPI, checkInAPI, uploadAPI } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";
import { displayPhone } from "../../utils/phone";

const { Option } = Select;

// The check-in form follows "For Administrative Purposes only" on the paper
// U-PULL FORM: Type of Payment, Amount, Name of Employee and Signature of
// employee (all required). Payment is mandatory and taken at check-in, so
// there is no "Payment done before entering the yard?" question.
// Hidden, not removed (set to true to bring them back):
//  - the Seller / Buyer / Both "Type" (U-Pull customers are buyers), and
//  - the waiver text + agreement (the customer already agreed on the waiver).
const SHOW_CHECKIN_TYPE = false;
const SHOW_WAIVER_IN_CHECKIN = false;
const DEFAULT_CHECKIN_TYPE = "buyer";

// Number of Persons = people entering the yard WITH the customer (the
// customer is not counted; shown as "1 + n"). Each one gives Full Name,
// Mobile No. and Signature in a popup.
export const MAX_EXTRA_PERSONS = 20;

// Entry amount, in dollars.
export const CHECKIN_AMOUNT_MIN = 1;
export const CHECKIN_AMOUNT_MAX = 10;

// Form control that shows nothing (the selected customer's id lives in the
// form; the customer is picked from the list above).
const HiddenValue = () => null;

const CreateCheckInModal = ({ open, onClose, onCreated, preSelectedCustomer }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [persons, setPersons] = useState([]); // details of the extra persons
  const [personsOpen, setPersonsOpen] = useState(false);
  const completePersons = persons.filter(isPersonComplete).length;

  // Keep one details entry per person; open the popup when there is anyone
  // whose details are still missing.
  const applyNumberOfPersons = (value, openPopup) => {
    const n = Math.min(Math.max(Number(value) || 0, 0), MAX_EXTRA_PERSONS);
    const next = Array.from({ length: n }, (_, i) => persons[i] || emptyPerson());
    setPersons(next);
    if (openPopup && n > 0 && next.some((p) => !isPersonComplete(p))) setPersonsOpen(true);
    return next;
  };
  const { user } = useAuth();
  const employeeName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.name || ""
    : "";

  // Changing it remounts the signature pad, so a new check-in never shows
  // (or re-uses) the previous check-in's signature.
  const [signatureKey, setSignatureKey] = useState(0);
  // Latest search text; answers to older searches are ignored.
  const searchRef = React.useRef("");
  searchRef.current = searchValue;

  const fetchCustomers = async (text = searchValue) => {
    const search = String(text || "").trim();
    // The customer list stays empty until something is typed.
    if (!search) {
      setCustomers([]);
      return;
    }
    try {
      const res = await customerAPI.getAll({
        page: 1,
        limit: 50,
        search,
      });
      if (String(searchRef.current || "").trim() !== search) return; // outdated answer
      const data = res.data || res;
      const list = data.customers || data.sellers || data.buyers || [];
      setCustomers(list);
    } catch (err) {
      console.error(err);
    }
  };

  // Do not fetch customers automatically when modal opens — default list should be empty.
  // Fetch only when user types a search (see searchValue effect below).

  React.useEffect(() => {
    // refetch when search changes
    if (!open) return;
    const t = setTimeout(() => fetchCustomers(searchValue), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  // Every time the modal opens it starts as a new, empty check-in: nothing
  // from the previous check-in (customer, search text, payment, signature,
  // persons...) is kept, whether it was saved or cancelled.
  React.useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedCustomer(null);
      setSearchValue("");
      setCustomers([]);
      setPersons([]);
      setPersonsOpen(false);
      setSignatureKey((k) => k + 1);
      form.setFieldsValue({
        amount: 2,
        numberOfPersons: 0,
        type: DEFAULT_CHECKIN_TYPE,
        // Prefilled with the logged-in employee; can be changed.
        ...(employeeName ? { employeeName } : {}),
      });

      // Auto-select pre-selected customer if provided
      if (preSelectedCustomer) {
        setSelectedCustomer(preSelectedCustomer);
        form.setFieldsValue({ customer: preSelectedCustomer._id });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preSelectedCustomer]);

  // One click = one check-in: a second click while saving is ignored.
  const savingRef = React.useRef(false);
  const handleFinish = async (values) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setLoading(true);
    try {
      const payload = {
        customer: values.customer,
        type: values.type || DEFAULT_CHECKIN_TYPE,
        transaction: {
          amount: Number(values.amount),
          paymentMethod: values.paymentMethod,
        },
        numberOfPersons: Number(values.numberOfPersons) || 0,
        persons: persons.slice(0, Number(values.numberOfPersons) || 0),
        employeeName: values.employeeName?.trim(),
        employeeSignature: values.employeeSignature,
      };
      const res = await checkInAPI.create(payload);
      message.success("Check-in created");
      // Clear the form (the next opening resets it again).
      setPersons([]);
      setSelectedCustomer(null);
      setSearchValue("");
      setCustomers([]);
      form.resetFields();
      setSignatureKey((k) => k + 1);
      onCreated && onCreated(res.data || res);
      onClose();
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.error || err.message || "Failed to create check-in"
      );
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Check-In"
      open={open}
      onCancel={onClose}
      footer={null}
      width={620}
      style={{
        top: 24,
        maxWidth: "calc(100vw - 32px)",
        margin: "0 auto",
      }}
      styles={{
        body: {
          maxHeight: "calc(85vh - 100px)",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "8px",
        },
      }}
      bodyStyle={{
        maxHeight: "calc(85vh - 100px)",
        overflowY: "auto",
        overflowX: "hidden",
        paddingRight: "8px",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ amount: 2, type: DEFAULT_CHECKIN_TYPE }}
        style={{ maxWidth: "100%", overflowX: "hidden" }}
      >
        <Form.Item label="Customer" required style={{ marginBottom: 12 }}>
          <Input.Search
            placeholder="Search customer by name, email, or mobile"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={(v) => fetchCustomers(v)}
            enterButton
          />

          <div style={{ marginTop: 8 }}>
            <List
              size="small"
              bordered
              dataSource={customers}
              locale={{ emptyText: "No customers found" }}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedCustomer(item);
                    // set form field (and clear its "select a customer" error)
                    form.setFieldsValue({ customer: item._id });
                    form.validateFields(["customer"]).catch(() => {});
                    // hide the list and clear the search box after selection
                    setCustomers([]);
                    setSearchValue("");
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {`${item.firstName || ""} ${item.lastName || ""
                          }`.trim() ||
                          item.email ||
                          item.mobileNo}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#999",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {item.email || "N/A"} • {displayPhone(item.mobileNo)}
                      </div>
                    </div>
                    <div>
                      <Button
                        type={
                          selectedCustomer && selectedCustomer._id === item._id
                            ? "primary"
                            : "default"
                        }
                        size="small"
                      >
                        {selectedCustomer && selectedCustomer._id === item._id
                          ? "Selected"
                          : "Select"}
                      </Button>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>

          {/* Holds the selected customer's id. Only its error message is
              visible (the field itself renders nothing). */}
          <Form.Item
            name="customer"
            rules={[{ required: true, message: "Please select a customer" }]}
            style={{ marginBottom: 0 }}
          >
            <HiddenValue />
          </Form.Item>
        </Form.Item>

        {selectedCustomer ? (
          <Card
            style={{ marginBottom: 12, maxWidth: "100%" }}
            title="Customer Preview"
            extra={
              <Button
                onClick={() => {
                  setSelectedCustomer(null);
                  form.resetFields(["customer"]);
                  setCustomers([]);
                }}
              >
                Clear
              </Button>
            }
          >
            <Descriptions
              column={1}
              bordered
              size="small"
              style={{ width: "100%", wordBreak: "break-word" }}
              contentStyle={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
              <Descriptions.Item label="Name">
                {`${selectedCustomer.firstName || ""} ${selectedCustomer.lastName || ""
                  }`.trim()}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedCustomer.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mobile">
                {displayPhone(selectedCustomer.mobileNo)}
              </Descriptions.Item>
              <Descriptions.Item label="ID Proof">
                {selectedCustomer.idProofImage ? (
                  <div style={{ maxWidth: 180 }}>
                    <img
                      src={uploadAPI.getImageUrl(selectedCustomer.idProofImage)}
                      alt="ID"
                      style={{
                        width: "100%",
                        maxHeight: 140,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ color: "#999" }}>No ID proof</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Signature">
                {selectedCustomer.signatureImage ? (
                  <div
                    style={{
                      maxWidth: 180,
                      background: "#fff",
                      padding: 8,
                      borderRadius: 4,
                    }}
                  >
                    <img
                      src={uploadAPI.getImageUrl(
                        selectedCustomer.signatureImage
                      )}
                      alt="Sig"
                      style={{
                        width: "100%",
                        maxHeight: 80,
                        objectFit: "contain",
                        background: "#fff",
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ color: "#999" }}>No signature</div>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : null}

        {SHOW_CHECKIN_TYPE ? (
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select placeholder="Select type">
              <Option value="seller">Seller</Option>
              <Option value="buyer">Buyer</Option>
              <Option value="both">Both</Option>
            </Select>
          </Form.Item>
        ) : (
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>
        )}

        <Form.Item
          name="numberOfPersons"
          label="Number of Persons (with the customer)"
          extra="People entering the yard together with the customer, not counting the customer. 0 if the customer comes alone."
          rules={[
            { required: true, message: "Please enter the number of persons (0 if none)" },
            {
              validator: (_, value) => {
                const n = Number(value) || 0;
                if (n > MAX_EXTRA_PERSONS) {
                  return Promise.reject(new Error(`At most ${MAX_EXTRA_PERSONS} persons`));
                }
                const done = persons.slice(0, n).filter(isPersonComplete).length;
                return done < n
                  ? Promise.reject(new Error(`Add the details of all ${n} persons (${done} of ${n} done)`))
                  : Promise.resolve();
              },
            },
          ]}
        >
          <UnitInput
            min={0}
            max={MAX_EXTRA_PERSONS}
            className="crm-number-box"
            style={{ width: "100%" }}
            placeholder="0"
            onChange={(v) => applyNumberOfPersons(v, false)}
            onBlur={(e) => applyNumberOfPersons(e.target.value, true)}
            onPressEnter={(e) => {
              e.preventDefault();
              applyNumberOfPersons(e.target.value, true);
            }}
          />
        </Form.Item>
        {persons.length > 0 && (
          <div style={{ marginTop: -12, marginBottom: 16 }}>
            <Button size="small" onClick={() => setPersonsOpen(true)}>
              {completePersons === persons.length
                ? `Edit persons' details (${persons.length})`
                : `Add persons' details (${completePersons} of ${persons.length} done)`}
            </Button>
          </div>
        )}
        <PersonsDetailsModal
          open={personsOpen}
          persons={persons}
          onCancel={() => setPersonsOpen(false)}
          onSave={(details) => {
            setPersons(details);
            setPersonsOpen(false);
            form.validateFields(["numberOfPersons"]).catch(() => {});
          }}
        />

        <Typography.Title
          level={5}
          italic
          style={{ marginTop: 8, marginBottom: 16 }}
        >
          For Administrative Purposes only
        </Typography.Title>

        <Form.Item
          name="paymentMethod"
          label="Type of Payment"
          rules={[
            { required: true, message: "Please select the type of payment" },
          ]}
        >
          <Select placeholder="Select payment method">
            <Option value="Cash">Cash</Option>
            <Option value="Bank Transfer">Bank Transfer</Option>
            <Option value="Zelle">Zelle</Option>
            <Option value="Card">Card</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount? (in $)"
          rules={[
            { required: true, message: "Please enter the amount" },
            {
              validator: (_, value) =>
                value === undefined || value === null || value === "" ||
                (Number(value) >= CHECKIN_AMOUNT_MIN && Number(value) <= CHECKIN_AMOUNT_MAX)
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(`Amount must be between $${CHECKIN_AMOUNT_MIN} and $${CHECKIN_AMOUNT_MAX}`)
                    ),
            },
          ]}
        >
          <NumericInput
            mode="number"
            min={CHECKIN_AMOUNT_MIN}
            max={CHECKIN_AMOUNT_MAX}
            precision={2}
            className="crm-number-box"
            style={{ width: "100%" }}
            placeholder={`${CHECKIN_AMOUNT_MIN} - ${CHECKIN_AMOUNT_MAX}`}
            errorMessage={`Enter a number between ${CHECKIN_AMOUNT_MIN} and ${CHECKIN_AMOUNT_MAX}`}
            maxMessage={`Entry fee can be at most $${CHECKIN_AMOUNT_MAX}`}
          />
        </Form.Item>

        <Form.Item
          name="employeeName"
          label="Name of Employee"
          rules={[
            { required: true, whitespace: true, message: "Please enter the employee's name" },
            { max: 100, message: "Name can be at most 100 characters" },
          ]}
        >
          <Input placeholder="Enter employee name" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="employeeSignature"
          label="Signature of employee"
          rules={[
            { required: true, message: "Please draw the employee signature and click Save Signature" },
          ]}
        >
          <SignatureCanvas
            key={signatureKey}
            value={form.getFieldValue("employeeSignature")}
            onChange={(val) => form.setFieldsValue({ employeeSignature: val })}
          />
        </Form.Item>

        {SHOW_WAIVER_IN_CHECKIN && (
        <>
        {/* Waiver Terms and Conditions */}
        <div
          style={{
            backgroundColor: "#fff8e1",
            border: "2px solid #ffc107",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
            maxWidth: "100%",
            boxSizing: "border-box",
            wordBreak: "break-word",
          }}
        >
          <h4 style={{ color: "#d84315", marginBottom: "12px", fontWeight: "bold", fontSize: "14px" }}>
            WAIVER AND LIABILITY RELEASE
          </h4>
          <div style={{ lineHeight: "1.6", color: "#424242", fontSize: "13px" }}>
            <p style={{ marginBottom: "10px" }}>
              <strong>All parts are sold 'as is,' with no warranties, expressed or implied.</strong> By entering the premises, individuals do so at their own risk and agree to release Autohub Management, its employees, and agents from any liability for physical injuries or incidents that may occur while on-site.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Customers further agree to hold Autohub Management, its employees, and agents harmless from any liability related to part malfunctions or any incidents involving a vehicle or person after part installation.
            </p>
            <p style={{ marginBottom: "0", color: "#d84315", fontWeight: "600" }}>
              For your safety, closed-toe shoes, shirts, and long pants are required to enter the yard.
            </p>
          </div>
        </div>

        <Form.Item
          name="agreeToTerms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error("You must agree to the terms and conditions to proceed")),
            },
          ]}
        >
          <Checkbox>
            <strong>I have read and agreed to the above waiver and liability release terms</strong>
          </Checkbox>
        </Form.Item>
        </>
        )}

        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateCheckInModal;

import React, { useState, useEffect } from "react";
import {
  message,
  Table,
  Tag,
  Button,
  Space,
  Card,
  Modal,
  Popover,
  Checkbox,
  Switch,
  InputNumber,
  Input,
  Select,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { carIntakeAPI, uploadAPI, inventoryAPI } from "../../utils/api";
import AddInventoryModal from "../../components/AddInventoryModal";
import CameraUpload from "../../components/CameraUpload";
import TitleBox from "../../components/TitleBox";
import getStatusColor from "../../utils/statusColors";
import PageContentWrapper from "../../components/PageContentWrapper";

const PartInventoryAdd = () => {
  const [loading, setLoading] = useState(false);
  const [carIntakes, setCarIntakes] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState(null);
  const [docModalIsPdf, setDocModalIsPdf] = useState(false);
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [addInventoryModalVisible, setAddInventoryModalVisible] =
    useState(false);
  const [inventoryRecord, setInventoryRecord] = useState(null);
  const [inventoryParts, setInventoryParts] = useState({});
  const [partImages, setPartImages] = useState({}); // Store images for each part
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  // Ensure modal preview container is above fixed header/sidebar
  const getPreviewContainer = () => {
    let el = document.getElementById("image-preview-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "image-preview-root";
      el.style.zIndex = "2000";
      document.body.appendChild(el);
    }
    return el;
  };

  // Define table columns (allColumns) — these will be filtered by user selection
  const allColumns = [
    {
      title: "Sr. No.",
      key: "srNo",
      fixed: "left",
      minWidth: 70,
      render: (text, record, index) =>
        (pagination?.current - 1) * pagination?.pageSize + index + 1 ||
        index + 1,
    },
    {
      title: "VIN No.",
      dataIndex: "vin",
      key: "vin",
      fixed: "left",
      minWidth: 200,
    },
    {
      title: "Make",
      dataIndex: ["carDetails", "make"],
      key: "make",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Year",
      dataIndex: ["carDetails", "year"],
      key: "year",
      minWidth: 80,
      render: (text) => text || "N/A",
    },
    {
      title: "Model",
      dataIndex: ["carDetails", "model"],
      key: "model",
      minWidth: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Trim",
      dataIndex: ["carDetails", "trim"],
      key: "trim",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Color",
      dataIndex: ["carDetails", "color"],
      key: "color",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Body Class",
      dataIndex: ["carDetails", "bodyClass"],
      key: "bodyClass",
      minWidth: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Transmission",
      dataIndex: ["carDetails", "transmission"],
      key: "transmission",
      minWidth: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Drive",
      dataIndex: ["carDetails", "drive"],
      key: "drive",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Fuel Type",
      dataIndex: ["carDetails", "fuelType"],
      key: "fuelType",
      minWidth: 150,
      render: (text) => text || "N/A",
    },
    {
      title: "Chassis No.",
      dataIndex: ["carDetails", "chassisNo"],
      key: "chassisNo",
      minWidth: 180,
      render: (text) => text || "N/A",
    },
    {
      title: "Engine",
      dataIndex: ["carDetails", "engine"],
      key: "engine",
      minWidth: 100,
      render: (text, record) => text || record?.carDetails?.engineNo || "N/A",
    },
    {
      title: "Scrap Yard",
      dataIndex: ["carDetails", "scrapYardName"],
      key: "scrapYardName",
      minWidth: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Scrap Yard Location",
      dataIndex: ["carDetails", "scrapYardLocation"],
      key: "scrapYardLocation",
      minWidth: 180,
      render: (text) => text || "N/A",
    },
    {
      title: "Keys",
      key: "keys",
      minWidth: 80,
      render: (_, record) => {
        const cd = record.carDetails || {};
        const hasKeys = cd.keys ?? cd.hasKeys ?? false;
        return (
          <Tag color={hasKeys ? "blue" : "red"}>{hasKeys ? "Yes" : "No"}</Tag>
        );
      },
    },
    {
      title: "Seller",
      dataIndex: "seller",
      key: "sellerName",
      minWidth: 200,
      render: (seller) => {
        if (!seller) return "N/A";
        const name = `${seller.firstName || ""} ${
          seller.lastName || ""
        }`.trim();

        return (
          <div>
            <div style={{ fontWeight: 600 }}>{name || "N/A"}</div>
          </div>
        );
      },
    },
    // email is displayed together with seller info above; keep a compact column for finalPrice next
    {
      title: "Final Price",
      dataIndex: ["price", "finalPrice"],
      key: "finalPrice",
      minWidth: 100,
      render: (price) => `$${price || "0"}`,
    },
    {
      title: "Documents",
      key: "documents",
      minWidth: 160,
      render: (_, record) => {
        const docs = record?.kyc?.documents || {};
        const dl = docs.driversLicense || docs.drivers_license || null;
        const rc = docs.carRegistration || docs.car_registration || null;

        const openDoc = (url) => {
          if (!url) return;
          const lower = String(url).toLowerCase();
          const isPdf = lower.endsWith(".pdf");
          setDocModalIsPdf(isPdf);
          setDocModalUrl(url);
          setDocModalVisible(true);
        };

        return (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {dl ? (
              <Tag
                color="blue"
                style={{ cursor: "pointer" }}
                onClick={() => openDoc(uploadAPI.getImageUrl(dl))}
              >
                DL
              </Tag>
            ) : null}
            {rc ? (
              <Tag
                color="green"
                style={{ cursor: "pointer" }}
                onClick={() => openDoc(uploadAPI.getImageUrl(rc))}
              >
                RC
              </Tag>
            ) : null}
            {!dl && !rc ? <Tag color="red">None</Tag> : null}
          </div>
        );
      },
    },
    {
      title: "Paid In",
      dataIndex: ["payment", "paymentMethod"],
      key: "paymentMethod",
      minWidth: 120,
      render: (method) => <Tag color="green">{method || "N/A"}</Tag>,
    },
    {
      title: "Inventory",
      dataIndex: "inventoryAdded",
      key: "inventoryAdded",
      minWidth: 100,
      render: (inventoryAdded) => (
        <Tag color={inventoryAdded ? "green" : "red"}>
          {inventoryAdded ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Seller Copy Printed",
      dataIndex: "sellerCopyPrinted",
      key: "sellerCopyPrinted",
      minWidth: 150,
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Document Printed",
      dataIndex: "documentPrinted",
      key: "documentPrinted",
      minWidth: 140,
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Receipt Printed",
      dataIndex: "receiptPrinted",
      key: "receiptPrinted",
      minWidth: 130,
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      minWidth: 150,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || "Intake"}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      minWidth: 160,
      render: (text, record) => (
        <Space>
          <Button type="primary" onClick={() => openInventoryModal(record)}>
            Add To Inventory
          </Button>
        </Space>
      ),
    },
  ];

  // Helper to derive a stable key for a column
  const getColKey = (col) =>
    col.key
      ? String(col.key)
      : Array.isArray(col.dataIndex)
      ? String(col.dataIndex[0])
      : String(col.dataIndex || "");

  // State: which columns are currently visible (by key)
  const [visibleColumns, setVisibleColumns] = React.useState(
    allColumns.map((c) => getColKey(c))
  );

  const toggleColumn = (key, checked) => {
    setVisibleColumns((prev) => {
      if (checked) return Array.from(new Set([...prev, key]));
      return prev.filter((k) => k !== key);
    });
  };

  const selectAllColumns = (checked) => {
    if (checked) setVisibleColumns(allColumns.map((c) => getColKey(c)));
    else setVisibleColumns([]);
  };

  // Compute displayed columns maintaining original order
  const displayedColumns = allColumns.filter((c) =>
    visibleColumns.includes(getColKey(c))
  );

  // Fetch car intakes data
  const fetchCarIntakes = async () => {
    setLoading(true);
    try {
      console.log(
        "Fetching car intakes, page:",
        pagination.current,
        "limit:",
        pagination.pageSize
      );
      const res = await carIntakeAPI.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        status: "payment-done",
      });
      const data = res.data || res;
      setCarIntakes(data.carIntakes || data);
      if (data.pagination) {
        setPagination({
          current: data.pagination.page,
          pageSize: data.pagination.limit,
          total: data.pagination.total,
        });
      }
    } catch (error) {
      message.error(
        `Failed to fetch car intakes: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarIntakes();
  }, [pagination.current, pagination.pageSize]);

  // Build inventory data for selected parts of a given record
  const openInventoryModal = (record) => {
    if (!record || !record.partDetails) {
      message.error("No parts found for this record");
      return;
    }

    // Determine which keys represent part entries (object with 'selected')
    const parts = Object.keys(record.partDetails.parts || {}).filter((k) => {
      const v = record.partDetails.parts[k];
      return (
        v &&
        typeof v === "object" &&
        Object.prototype.hasOwnProperty.call(v, "selected")
      );
    });

    console.log(record);
    const selectedParts = {};
    parts.forEach((key) => {
      const p = record.partDetails.parts[key] || {};
      if (p.selected) {
        selectedParts[key] = {
          extracted: !!p.extracted || false,
          cleaned: !!p.cleaned || false,
          placed: (p.placed && String(p.placed)) || "",
          unit: p.unit || 0,
          dimensions: p.dimensions || p.dimensions || "",
          weight: p.weight || "",
          quality: p.quality || "",
          label: key,
        };
      }
    });

    setInventoryRecord(record);
    setInventoryParts(selectedParts);
    setPartImages({}); // Reset images when opening modal
    setInventoryModalVisible(true);
  };

  const handleInventoryChange = (partKey, field, value) => {
    setInventoryParts((prev) => ({
      ...prev,
      [partKey]: {
        ...(prev[partKey] || {}),
        [field]: value,
      },
    }));
  };

  // Handle image upload for parts
  const handleImageUpload = (partKey, result) => {
    console.log("Image upload result:", result);

    // Extract the image URL from the result
    // The backend returns: { imageUrl, filename, originalName, size, mimetype }
    const imageUrl =
      result?.imageUrl ||
      result?.url ||
      result?.path ||
      result?.filename ||
      result;

    console.log("Extracted imageUrl:", imageUrl);

    if (!imageUrl) {
      message.error("Failed to get image URL from upload response");
      return;
    }

    // Replace with single image instead of appending
    setPartImages((prev) => ({
      ...prev,
      [partKey]: imageUrl, // Single image, not an array
    }));

    message.success("Image uploaded successfully");
  };

  // Remove image from part
  const handleRemoveImage = (partKey) => {
    setPartImages((prev) => ({
      ...prev,
      [partKey]: null,
    }));
    message.success("Image removed");
  };

  // Preview image
  const handlePreviewImage = (url) => {
    setImagePreviewUrl(url);
    setImagePreviewVisible(true);
  };

  // Editable cell similar to CarDiagnosis to keep local typing state and commit on blur/enter
  const EditableCell = ({
    value: initial,
    onCommit,
    disabled,
    placeholder,
  }) => {
    const [val, setVal] = useState(initial ?? "");

    useEffect(() => setVal(initial ?? ""), [initial]);

    const commit = () => {
      if (onCommit) onCommit(val);
    };

    return (
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onPressEnter={commit}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          backgroundColor: disabled ? undefined : "#4b5563",
          borderColor: "#6b7280",
          color: "white",
        }}
      />
    );
  };

  const submitInventory = async () => {
    if (!inventoryRecord) {
      message.error("No inventory record selected");
      return;
    }

    const partsToCreate = Object.keys(inventoryParts)
      .filter((k) => !!inventoryParts[k]?.extracted)
      .map((k) => ({ key: k, ...inventoryParts[k] }));

    if (partsToCreate.length === 0) {
      message.info("No extracted parts selected to add to inventory.");
      setInventoryModalVisible(false);
      setInventoryRecord(null);
      setInventoryParts({});
      setPartImages({});
      return;
    }

    setLoading(true);
    try {
      const results = [];
      for (const p of partsToCreate) {
        // partShortName will be resolved on the backend; nothing to compute here

        const payload = {
          partName: p.label || p.key || p.name,
          unit: p.unit || 0,
          cleaned: !!p.cleaned,
          quality: p.quality || "",
          location: p.placed || p.location || "",
          weight: p.weight || "",
          dimensions: p.dimensions || "",
          make: inventoryRecord?.carDetails?.make || "",
          model: inventoryRecord?.carDetails?.model || "",
          trim: inventoryRecord?.carDetails?.trim || "",
          vin: inventoryRecord?.vin || inventoryRecord?._id || "",
          year: inventoryRecord?.carDetails?.year || "",
          // partShortName resolved server-side
          color: inventoryRecord?.carDetails?.color || "",
          image: partImages[p.key] || null, // Include single image
        };

        try {
          const res = await inventoryAPI.create(payload);
          results.push({ part: p.key, ok: true, data: res.data || res });
        } catch (err) {
          console.error("Failed to create inventory for part", p.key, err);
          results.push({ part: p.key, ok: false, error: err });
        }
      }

      const created = results.filter((r) => r.ok).length;
      const failed = results.length - created;

      if (created > 0) {
        message.success(`Created ${created} inventory item(s).`);
        // Update car intake status to indicate parts were added to inventory
        try {
          const intakeId = inventoryRecord?._id || inventoryRecord?.vin;
          if (intakeId) {
            await carIntakeAPI.updateStatus(
              intakeId,
              "part-added-to-inventory"
            );
            // refresh intakes after status change
            await fetchCarIntakes();
          }
        } catch (e) {
          console.error("Failed to update car intake status:", e);
        }
      }
      if (failed > 0) {
        message.error(`Failed to create ${failed} inventory item(s).`);
      }

      // Optionally refresh car intakes to reflect inventoryAdded flags
      fetchCarIntakes();
    } catch (error) {
      console.error(error);
      message.error("An unexpected error occurred while creating inventory.");
    } finally {
      setLoading(false);
      setInventoryModalVisible(false);
      setInventoryRecord(null);
      setInventoryParts({});
      setPartImages({});
    }
  };

  // Determine whether all selected parts are marked as extracted
  const _partKeys = Object.keys(inventoryParts || {});
  const allExtracted =
    _partKeys.length > 0 &&
    _partKeys.every((k) => !!inventoryParts[k]?.extracted);

  return (
    <React.Fragment>
      <TitleBox
        title="Add Inventory"
        routes={["Scrap Yard", "Inventory"]}
        current={"Add Inventory"}
      />
      <PageContentWrapper>
        <Card
          title={<span>Car Lists</span>}
          extra={
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="primary"
                onClick={() => setAddInventoryModalVisible(true)}
              >
                Add Inventory Item
              </Button>
              <Popover
                placement="bottomRight"
                content={() => (
                  <div style={{ maxWidth: 320 }}>
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>
                      Columns
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <Button
                        size="small"
                        onClick={() => selectAllColumns(true)}
                      >
                        Select All
                      </Button>
                      <Button
                        size="small"
                        onClick={() => selectAllColumns(false)}
                      >
                        Clear
                      </Button>
                    </div>
                    <div style={{ maxHeight: 300, overflow: "auto" }}>
                      {allColumns.map((col) => {
                        const key = getColKey(col);
                        return (
                          <div key={key} style={{ marginBottom: 6 }}>
                            <Checkbox
                              checked={visibleColumns.includes(key)}
                              onChange={(e) =>
                                toggleColumn(key, e.target.checked)
                              }
                            >
                              {col.title}
                            </Checkbox>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              >
                <Button>Columns</Button>
              </Popover>
            </div>
          }
        >
          <Table
            columns={displayedColumns}
            dataSource={carIntakes}
            loading={loading}
            rowKey={(record) => record._id || record.vin}
            tableLayout="auto"
            scroll={{
              y: "calc(100vh - 510px)", // Dynamic height based on viewport
            }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            onChange={(pagination) => {
              setPagination({
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
              });
            }}
            size="small"
            bordered
            className="dark-table"
          />
          <Modal
            open={docModalVisible}
            title="Document Preview"
            footer={null}
            onCancel={() => setDocModalVisible(false)}
            width={800}
            centered
            getContainer={getPreviewContainer}
            bodyStyle={{ maxHeight: "80vh", overflow: "auto" }}
          >
            {docModalUrl ? (
              docModalIsPdf ? (
                <iframe
                  src={docModalUrl}
                  title="PDF Preview"
                  style={{ width: "100%", height: "70vh", border: "none" }}
                />
              ) : (
                <img
                  src={docModalUrl}
                  alt="Document Preview"
                  style={{ maxWidth: "100%", maxHeight: "70vh" }}
                />
              )
            ) : (
              <div>No document to preview</div>
            )}
          </Modal>
          <Modal
            open={inventoryModalVisible}
            title={
              inventoryRecord
                ? `Add To Inventory - ${
                    inventoryRecord.vin || inventoryRecord._id
                  }`
                : "Add To Inventory"
            }
            onCancel={() => setInventoryModalVisible(false)}
            onOk={submitInventory}
            okButtonProps={{
              disabled: !allExtracted,
              className: !allExtracted ? "disabled-ok-btn" : undefined,
            }}
            width={980}
            centered
            bodyStyle={{ maxHeight: "70vh", overflow: "auto" }}
          >
            {!inventoryRecord || Object.keys(inventoryParts).length === 0 ? (
              <div>No selected parts to add to inventory.</div>
            ) : (
              (() => {
                // build data array from inventoryParts map
                const data = Object.keys(inventoryParts).map((k) => ({
                  key: k,
                  name: inventoryParts[k].label || k,
                  extracted: !!inventoryParts[k].extracted,
                  cleaned: !!inventoryParts[k].cleaned,
                  placed:
                    inventoryParts[k].placed ?? inventoryParts[k].unit ?? 0,
                  unit: inventoryParts[k].unit ?? 0,
                  dimensions: inventoryParts[k].dimensions || "",
                  weight: inventoryParts[k].weight || "",
                }));

                const columns = [
                  {
                    title: "Extracted",
                    dataIndex: "extracted",
                    key: "extracted",
                    width: 110,
                    render: (_, record) => {
                      const cur = inventoryParts[record.key] || {};
                      return (
                        <Switch
                          checked={!!cur.extracted}
                          onChange={(v) =>
                            handleInventoryChange(record.key, "extracted", v)
                          }
                          size="small"
                        />
                      );
                    },
                  },
                  {
                    title: "Cleaned",
                    dataIndex: "cleaned",
                    key: "cleaned",
                    width: 110,
                    render: (_, record) => {
                      const cur = inventoryParts[record.key] || {};
                      return (
                        <Switch
                          checked={!!cur.cleaned}
                          onChange={(v) =>
                            handleInventoryChange(record.key, "cleaned", v)
                          }
                          size="small"
                        />
                      );
                    },
                  },
                  {
                    title: "Part Name",
                    dataIndex: "name",
                    key: "name",
                    width: 200,
                    render: (text) => {
                      if (text === null || text === undefined || text === "") {
                        return <span style={{ color: "white" }}>N/A</span>;
                      }
                      const s = String(text);
                      const normalized = s
                        .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // camelCase -> spaces
                        .replace(/[_-]+/g, " ") // snake_case or kebab-case -> spaces
                        .trim();
                      const proper = normalized
                        .split(/\s+/)
                        .map(
                          (w) =>
                            w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                        )
                        .join(" ");
                      return <span style={{ color: "white" }}>{proper}</span>;
                    },
                  },
                  {
                    title: "Unit",
                    dataIndex: "unit",
                    key: "unit",
                    width: 120,
                    render: (_, record) => {
                      const cur = inventoryParts[record.key] || {};
                      return (
                        <InputNumber
                          min={0}
                          value={cur.unit}
                          onChange={(v) =>
                            handleInventoryChange(record.key, "unit", v)
                          }
                          style={{ width: "100%" }}
                        />
                      );
                    },
                  },
                  {
                    title: "Quality",
                    dataIndex: "quality",
                    key: "quality",
                    width: 160,
                    render: (_, record) => {
                      const cur = inventoryParts[record.key] || {};
                      return (
                        <Select
                          value={cur.quality || undefined}
                          onChange={(v) =>
                            handleInventoryChange(record.key, "quality", v)
                          }
                          placeholder="Select Quality"
                          style={{ width: "100%" }}
                          dropdownStyle={{ backgroundColor: "#374151" }}
                        >
                          <Select.Option value="Good">Good</Select.Option>
                          <Select.Option value="Average">Average</Select.Option>
                          <Select.Option value="OK">OK</Select.Option>
                          <Select.Option value="Broken">Broken</Select.Option>
                          <Select.Option value="Scratches">
                            Scratches
                          </Select.Option>
                        </Select>
                      );
                    },
                  },
                  {
                    title: "Location",
                    dataIndex: "location",
                    key: "location",
                    width: 160,
                    render: (_, record) => {
                      const cur = inventoryParts[record.key] || {};
                      return (
                        <EditableCell
                          value={cur.placed}
                          onCommit={(v) =>
                            handleInventoryChange(record.key, "placed", v)
                          }
                          placeholder="Where placed"
                          disabled={false}
                        />
                      );
                    },
                  },
                  {
                    title: "Weight",
                    dataIndex: "weight",
                    key: "weight",
                    width: 140,
                    render: (_, record) => {
                      const cur = inventoryParts[record.key] || {};
                      return (
                        <EditableCell
                          value={cur.weight}
                          onCommit={(v) =>
                            handleInventoryChange(record.key, "weight", v)
                          }
                          placeholder={`Enter ${record.name} Weight`}
                          disabled={false}
                        />
                      );
                    },
                  },
                  {
                    title: "Dimensions",
                    dataIndex: "dimensions",
                    key: "dimensions",
                    width: 180,
                    render: (_, record) => {
                      const cur = inventoryParts[record.key] || {};
                      return (
                        <EditableCell
                          value={cur.dimensions}
                          onCommit={(v) =>
                            handleInventoryChange(record.key, "dimensions", v)
                          }
                          placeholder={`Enter ${record.name} Dimensions`}
                          disabled={false}
                        />
                      );
                    },
                  },
                  {
                    title: "Images",
                    key: "images",
                    width: 250,
                    render: (_, record) => {
                      const imageUrl = partImages[record.key];
                      const hasImage = !!imageUrl;

                      return (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {!hasImage && (
                            <CameraUpload
                              key={`camera-${record.key}`}
                              onImageUpload={(result) =>
                                handleImageUpload(record.key, result)
                              }
                              autoUpload={true}
                              showPreview={false}
                            />
                          )}
                          {hasImage && (
                            <div
                              style={{
                                position: "relative",
                                width: 60,
                                height: 60,
                                border: "1px solid #6b7280",
                                borderRadius: 4,
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={uploadAPI.getImageUrl(imageUrl)}
                                alt="Part"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  handlePreviewImage(
                                    uploadAPI.getImageUrl(imageUrl)
                                  )
                                }
                              />
                              <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                type="text"
                                onClick={() => handleRemoveImage(record.key)}
                                style={{
                                  position: "absolute",
                                  top: 2,
                                  right: 2,
                                  padding: 2,
                                  minWidth: 20,
                                  height: 20,
                                  backgroundColor: "rgba(0,0,0,0.6)",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    },
                  },
                ];

                return (
                  <div
                    style={{
                      backgroundColor: "#374151",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <Table
                      columns={columns}
                      dataSource={data}
                      pagination={false}
                      size="middle"
                      rowKey="key"
                      className="inventory-diagnosis-table"
                      style={{ border: "1px solid #6b7280" }}
                      components={{
                        header: {
                          cell: (props) => (
                            <th
                              {...props}
                              style={{
                                backgroundColor: "#374151",
                                borderColor: "#6b7280",
                              }}
                            />
                          ),
                        },
                        body: {
                          row: (props) => (
                            <tr
                              {...props}
                              style={{ backgroundColor: "#374151" }}
                            />
                          ),
                          cell: (props) => (
                            <td
                              {...props}
                              style={{
                                backgroundColor: "#374151",
                                borderColor: "#6b7280",
                              }}
                            />
                          ),
                        },
                      }}
                    />
                    <style jsx>{`
                      .inventory-diagnosis-table .ant-table-thead > tr > th {
                        background-color: #374151 !important;
                        border-color: #6b7280 !important;
                        color: white !important;
                      }
                      .inventory-diagnosis-table .ant-table-tbody > tr > td {
                        background-color: #374151 !important;
                        border-color: #6b7280 !important;
                      }
                      .inventory-diagnosis-table .ant-table {
                        background-color: #374151 !important;
                      }
                      .inventory-diagnosis-table .ant-table-container {
                        border-color: #6b7280 !important;
                      }
                    `}</style>
                  </div>
                );
              })()
            )}
          </Modal>
          <Modal
            open={imagePreviewVisible}
            title="Image Preview"
            footer={null}
            onCancel={() => setImagePreviewVisible(false)}
            width={800}
            centered
          >
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            )}
          </Modal>
          <AddInventoryModal
            visible={addInventoryModalVisible}
            onCancel={() => setAddInventoryModalVisible(false)}
            onSuccess={() => {
              // refresh
              fetchCarIntakes();
            }}
          />
          <style jsx global>{`
            /* Modal OK button disabled appearance override */
            .disabled-ok-btn {
              background-color: #6b7280 !important;
              border-color: #6b7280 !important;
              color: rgba(255, 255, 255, 0.9) !important;
              opacity: 1 !important;
              box-shadow: none !important;
            }
            .disabled-ok-btn[disabled] {
              pointer-events: none !important;
            }
          `}</style>
        </Card>
      </PageContentWrapper>
    </React.Fragment>
  );
};

export default PartInventoryAdd;

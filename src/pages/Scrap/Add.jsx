import React, { useState } from "react";
import { message, Button, Card, Modal, Upload, Typography, Alert } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { carIntakeAPI, uploadAPI } from "../../utils/api";
import TitleBox from "../../components/TitleBox";

/**
 * Scrap a Car → Add New.
 *
 * Cars are scrapped through the workflow
 *   Car Inventory for Scrap → Ready To Scrap → Move To Scrapped (extract elements)
 * so this page only keeps the Excel bulk import of historical scraped/sold/
 * towed records. The old "elements-scraped → Scrap" list was removed.
 */
const AddScrap = () => {
  // Bulk upload modal state
  const [bulkUploadModalVisible, setBulkUploadModalVisible] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState(null);

  // Bulk upload modal handlers (copied/adapted from CarIntakeList)
  const handleBulkUploadOpen = () => {
    setBulkUploadFile(null);
    setBulkUploadResult(null);
    setBulkUploadModalVisible(true);
  };

  const handleBulkUploadClose = () => {
    setBulkUploadModalVisible(false);
    setBulkUploadFile(null);
    setBulkUploadResult(null);
  };

  const handleFileChange = (file) => {
    setBulkUploadFile(file);
  };

  const handleBulkUploadSubmit = async () => {
    if (!bulkUploadFile) {
      message.error("Please select an Excel file");
      return;
    }

    setBulkUploadLoading(true);
    try {
      // Step 1: Upload the file first
      const uploadResponse = await uploadAPI.uploadImage(bulkUploadFile);
      const fileUrl =
        uploadResponse.data.imageUrl ||
        uploadResponse.data?.imageUrl ||
        uploadResponse.imageUrl;

      if (!fileUrl) throw new Error("Upload did not return a file URL");

      // Step 2: Submit bulk upload with file URL
      const bulkResponse = await carIntakeAPI.bulkUploadScraped(fileUrl);
      const result = bulkResponse.data || bulkResponse;

      setBulkUploadResult(result);
      message.success(
        `Bulk upload completed! ${result.summary.successful} successful, ${result.summary.failed} failed, ${result.summary.skipped} skipped`
      );
    } catch (error) {
      console.error("Bulk upload error:", error);
      message.error(
        `Failed to upload: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setBulkUploadLoading(false);
    }
  };

  return (
    <div>
      <TitleBox
        title="Scrap Car"
        routes={["Scrap Yard", "Scrap a Car"]}
        current={"Scrap Car"}
      />

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card
            title={<span>Scrap a Car</span>}
            extra={<Button onClick={handleBulkUploadOpen}>Bulk Upload Scraped</Button>}
          >
            <Alert
              type="info"
              showIcon
              message="How to scrap a car"
              description={
                <ol style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                  <li>
                    Admin / Manager: <Link to="/car-inventory">Car Inventory for Scrap</Link> → <strong>Ready To Scrap</strong>
                  </li>
                  <li>
                    Scraper / Admin: <Link to="/ready-to-scrap">Ready To Scrap</Link> → <strong>Move To Scrapped</strong> and
                    enter the extracted elements
                  </li>
                  <li>
                    The car then appears in <Link to="/scrap-list">Scrap Car Lists</Link> with its elements
                  </li>
                </ol>
              }
            />

            {/* Bulk Upload Modal (for scraped records) */}
            <Modal
              open={bulkUploadModalVisible}
              title="Bulk Upload Scraped Records"
              onCancel={handleBulkUploadClose}
              footer={[
                <Button key="cancel" onClick={handleBulkUploadClose}>
                  {bulkUploadResult ? "Close" : "Cancel"}
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  loading={bulkUploadLoading}
                  onClick={handleBulkUploadSubmit}
                  disabled={!bulkUploadFile || bulkUploadResult !== null}
                >
                  Upload
                </Button>,
              ]}
              width={700}
              centered
            >
              <div style={{ marginBottom: 16 }}>
                <Typography.Title level={5}>Upload Excel File</Typography.Title>
                <Typography.Text type="secondary">
                  Select an Excel file (.xlsx or .xls) containing scraped
                  records.
                  <br />
                  Sheet named <strong>GONE</strong> will be processed. The
                  importer recognizes <strong>What Happen?</strong> values:
                  <ul style={{ marginTop: 8 }}>
                    <li>
                      <strong>Crushed</strong> &rarr; saved with status{" "}
                      <em>scraped</em>
                    </li>
                    <li>
                      <strong>Sold</strong> &rarr; saved with status{" "}
                      <em>sold</em>
                    </li>
                    <li>
                      <strong>Towed</strong> &rarr; saved with status{" "}
                      <em>towed</em>
                    </li>
                  </ul>
                  If the <strong>What Happen?</strong> column is missing or
                  empty, the row will be saved with status <em>intake</em> and
                  default yard values will be applied (Yard:{" "}
                  <strong>RTX</strong>, Location: <strong>New Jersey</strong>).
                </Typography.Text>
              </div>

              <Upload
                accept=".xlsx,.xls"
                maxCount={1}
                beforeUpload={() => false}
                onChange={(info) => handleFileChange(info.file)}
                fileList={bulkUploadFile ? [bulkUploadFile] : []}
              >
                <Button icon={<UploadOutlined />} block>
                  Select Excel File
                </Button>
              </Upload>

              {bulkUploadResult && (
                <div style={{ marginTop: 24 }}>
                  <Typography.Title level={5} style={{ color: "#fff" }}>
                    Upload Results
                  </Typography.Title>
                  <div
                    style={{
                      padding: 16,
                      background: "#1f1f1f",
                      border: "1px solid #434343",
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ marginBottom: 8, color: "#e0e0e0" }}>
                      <strong>Total Records:</strong>{" "}
                      {bulkUploadResult.summary.total}
                    </div>
                    <div style={{ marginBottom: 8, color: "#52c41a" }}>
                      <strong>Successful:</strong>{" "}
                      {bulkUploadResult.summary.successful}
                    </div>
                    <div style={{ marginBottom: 8, color: "#ff4d4f" }}>
                      <strong>Failed:</strong> {bulkUploadResult.summary.failed}
                    </div>
                    <div style={{ color: "#faad14" }}>
                      <strong>Skipped:</strong>{" "}
                      {bulkUploadResult.summary.skipped}
                    </div>

                    {(bulkUploadResult.results.failed.length > 0 ||
                      bulkUploadResult.results.skipped.length > 0) && (
                      <div style={{ marginTop: 16 }}>
                        <Typography.Text strong style={{ color: "#e0e0e0" }}>
                          Details:
                        </Typography.Text>
                        <div
                          style={{
                            maxHeight: 200,
                            overflow: "auto",
                            marginTop: 8,
                            padding: 8,
                            background: "#141414",
                            borderRadius: 4,
                          }}
                        >
                          {bulkUploadResult.results.failed.map(
                            (item, index) => (
                              <div
                                key={`failed-${index}`}
                                style={{ marginBottom: 4, color: "#ff7875" }}
                              >
                                <strong>Row {item.row}:</strong> {item.reason}
                              </div>
                            )
                          )}
                          {bulkUploadResult.results.skipped.map(
                            (item, index) => (
                              <div
                                key={`skipped-${index}`}
                                style={{ marginBottom: 4, color: "#ffc53d" }}
                              >
                                <strong>Row {item.row}:</strong> {item.reason}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Modal>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddScrap;

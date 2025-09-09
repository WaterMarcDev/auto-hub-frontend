import React, { useState, useEffect } from "react";
import { message, Table, Tag, Button, Space, Card, Typography } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { CarIntakeService } from "../services/apiService";
import { useNavigate } from "react-router-dom";

const CarIntakeList = () => {
  const [loading, setLoading] = useState(false);
  const [carIntakes, setCarIntakes] = useState([]);
  const navigate = useNavigate();

  // Define table columns
  const columns = [
    {
      title: "Sr. No.",
      key: "srNo",
      fixed: "left",
      width: 70,
      render: (text, record, index) => index + 1,
    },
    {
      title: "VIN No.",
      dataIndex: "vin",
      key: "vin",
      fixed: "left",
      width: 200,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/car-intake/${record._id}`)}
        >
          {text || "N/A"}
        </Button>
      ),
    },
    {
      title: "Make",
      dataIndex: "make",
      key: "make",
      width: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      width: 80,
      render: (text) => text || "N/A",
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      width: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Trim",
      dataIndex: "trim",
      key: "trim",
      width: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      width: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Body Class",
      dataIndex: "bodyClass",
      key: "bodyClass",
      width: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Transmission",
      dataIndex: "transmission",
      key: "transmission",
      width: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Drive",
      dataIndex: "drive",
      key: "drive",
      width: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Fuel Type",
      dataIndex: "fuelType",
      key: "fuelType",
      width: 250,
      render: (text) => text || "N/A",
    },
    {
      title: "Chassis No.",
      dataIndex: "chassisNo",
      key: "chassisNo",
      width: 180,
      render: (text) => text || "N/A",
    },
    {
      title: "Engine No.",
      dataIndex: "engineNo",
      key: "engineNo",
      width: 180,
      render: (text) => text || "N/A",
    },
    {
      title: "Scrap Yard",
      dataIndex: ["scrapYardName"],
      key: "scrapYardName",
      width: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Scrap Yard Location",
      dataIndex: ["scrapYardLocation"],
      key: "scrapYardLocation",
      width: 180,
      render: (text) => text || "N/A",
    },
    {
      title: "Keys",
      dataIndex: "hasKeys",
      key: "hasKeys",
      width: 80,
      render: (hasKeys) => (
        <Tag color={hasKeys ? "blue" : "red"}>{hasKeys ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Seller Name",
      dataIndex: ["seller", "name"],
      key: "sellerName",
      width: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Mobile",
      dataIndex: ["seller", "phone"],
      key: "mobile",
      width: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Email",
      dataIndex: ["seller", "email"],
      key: "email",
      width: 250,
      render: (text) => text || "N/A",
    },
    {
      title: "Final Price",
      dataIndex: "finalPrice",
      key: "finalPrice",
      width: 100,
      render: (price) => `$${price || "0"}`,
    },
    {
      title: "Paid In",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 120,
      render: (method) => <Tag color="green">{method || "Cash"}</Tag>,
    },
    {
      title: "Inventory",
      dataIndex: "inventoryAdded",
      key: "inventoryAdded",
      width: 100,
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
      width: 150,
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Document Printed",
      dataIndex: "documentPrinted",
      key: "documentPrinted",
      width: 140,
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Receipt Printed",
      dataIndex: "receiptPrinted",
      key: "receiptPrinted",
      width: 130,
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => {
        let color = "default";
        if (status === "completed") color = "green";
        else if (status === "in-progress") color = "orange";
        else if (status === "intake") color = "blue";

        return <Tag color={color}>{status || "Intake"}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 160,
      render: (text, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            onClick={() => navigate(`/car-intake/${record._id}`)}
          >
            View
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  // Fetch car intakes data
  const fetchCarIntakes = async () => {
    setLoading(true);
    try {
      const response = await CarIntakeService.getCarIntakes({
        page: 1,
        limit: 100,
      });
      setCarIntakes(response.carIntakes);
    } catch (error) {
      message.error(`Failed to fetch car intakes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle actions
  const handleEdit = (record) => {
    navigate(`/car-intake/${record._id}/edit`);
  };

  const handleDelete = () => {
    // Simple delete without confirmation for now
    message.info("Delete functionality will be implemented");
  };

  useEffect(() => {
    fetchCarIntakes();
  }, []);

  return (
    <div>
      <style>
        {`
          .dark-table .ant-table {
            background-color: #1f2937 !important;
            color: #f9fafb;
          }
          
          .dark-table .ant-table-thead > tr > th {
            background-color: #374151 !important;
            color: #f9fafb !important;
            border-color: #4b5563 !important;
          }
          
          .dark-table .ant-table-tbody > tr > td {
            background-color: #1f2937 !important;
            color: #f9fafb !important;
            border-color: #4b5563 !important;
          }
          
          .dark-table .ant-table-tbody > tr:hover > td {
            background-color: #374151 !important;
          }
          
          .dark-table .ant-table-fixed-left,
          .dark-table .ant-table-fixed-right {
            background-color: #1f2937 !important;
          }
          
          .dark-table .ant-pagination {
            color: #f9fafb;
          }
          
          .dark-table .ant-pagination .ant-pagination-item {
            background-color: #374151;
            border-color: #4b5563;
          }
          
          .dark-table .ant-pagination .ant-pagination-item a {
            color: #f9fafb;
          }
          
          .dark-table .ant-pagination .ant-pagination-item:hover {
            border-color: #6b7280;
          }
          
          .dark-table .ant-pagination .ant-pagination-item-active {
            background-color: #1d4ed8;
            border-color: #1d4ed8;
          }
          
          .dark-table .ant-pagination .ant-pagination-prev,
          .dark-table .ant-pagination .ant-pagination-next {
            color: #f9fafb;
          }
          
          .dark-table .ant-select-selector {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
            color: #f9fafb !important;
          }
          
          .dark-table .ant-select-arrow {
            color: #f9fafb;
          }
        `}
      </style>
      {/* Page Title */}
      <div className="page-title-box">
        <div className="page-title">
          <h4>Car Intake Lists</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Scrap Yard</a>
            </li>
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Car Intake</a>
            </li>
            <li className="breadcrumb-item active">Car Intake Lists</li>
          </ol>
        </div>
      </div>

      {/* Page Content */}
      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card
            title={<span>Car Intake Lists</span>}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/car-intake")}
              >
                Add New Car
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={carIntakes}
              loading={loading}
              rowKey={(record) => record._id || record.vin}
              scroll={{
                x: 2500, // Horizontal scroll for many columns
                y: 600, // Vertical scroll height
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              size="small"
              bordered
              className="dark-table"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarIntakeList;

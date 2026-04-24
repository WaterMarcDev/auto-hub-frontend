import { useEffect, useState } from "react";
import { Card, Table, Select, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AddJunkCarRequest from "./AddJunkCarRequest";
import { Modal } from "antd";

const { Option } = Select;

const JunkCarRequests = () => {
    const [junkCars, setJunkCars] =useState([]);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);  // by shiva

    const fetchJunkCars = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_KEY}/junk-car`);
            const data = await res.json();
            setJunkCars(data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchJunkCars();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await fetch(`${import.meta.env.VITE_API_KEY}/junk-car/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });
            fetchJunkCars();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
        },
        {
            title: "Phone",
            dataIndex: "phone",
        },
        {
            title: "Vehicle",
            render: (_, record) =>
                `${record.make} ${record.model} ${record.year}`,
        },
        {
            title: "VIN / Engine",
            render: (_, record) => record.engineOrVin || "none",
        },
        {
            title: "Status",
            render: (_, record) => (
                <Select
                    placeholder="Select"
                    value={record.status}
                    onChange={(value) =>
                        updateStatus(record._id, value)
                    }
                    style={{ width: 150 }}
                >
                    <Option value="pending">Pending</Option>
                    <Option value="in progress">In Progress</Option>
                    <Option value="completed">Completed</Option>
                </Select>
            ),
        },
    ];

    return (
        <div style={{ paddingTop: "20px", paddingBottom: "90px" }}>
            <Card
                title="Junk Car Requests"
                extra={
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                            onClick={() => navigate("/")}
                            icon={<ArrowLeftOutlined />}
                        >
                            Back
                        </Button>

                        <Button
                            type="primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Add Request
                        </Button>
                    </div>
                }
            >
                <Table
                    columns={columns}
                    dataSource={junkCars}
                    rowKey="_id"
                    bordered
                    scroll={{ x: "max-content" }}
                />
            </Card>

            {/* Add Modal */}
            <Modal
                // title="Add Junk Car Request"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    fetchJunkCars();  // refresh data
                }}
                footer={null}
                width={800}
                destroyOnHidden
                styles={{ body: { padding: 20 } }}
            >
                <AddJunkCarRequest
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchJunkCars();   // refresh table
                    }}
                />
            </Modal>  // end here

        </div>
    );
};

export default JunkCarRequests;
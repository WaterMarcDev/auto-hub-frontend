import { useEffect, useState } from "react";
import { Card, Table, Tag } from "antd";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Input, Select, Row, Col, message, Popconfirm } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { DeleteOutlined } from "@ant-design/icons";
import { CarIntakeService } from "../../services/apiService";
import { Tabs } from "antd";
import axios from "axios";

const { Option } = Select;


const Requests = () => {
    const [requests, setRequests] = useState([]);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [searched, setSearched] = useState("");
    const [status, setStatus] = useState(null);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [noResults, setNoResults] = useState(false);
    const [junkCars, setJunkCars] = useState([]);

    // Filter requests based on search and status by shiva
    const handleSearch = () => {
        // if (filteredRequests.length === 0) {
        //     message.warning("Item not found")
        // }

        const searchText = search.toLowerCase();

        const filtered = requests.filter((item) => {
            return (
                item.name?.toLowerCase().includes(searchText) ||
                item.email?.toLowerCase().includes(searchText) ||
                item.phone?.toLowerCase().includes(searchText) ||
                item.make?.toLowerCase().includes(searchText) ||
                item.model?.toLowerCase().includes(searchText) ||
                item.partName?.toLowerCase().includes(searchText) ||
                item.year?.toLowerCase().includes(searchText) 
            );
        });
        setFilteredRequests(filtered);
        setSearched(true);
    };

    // Create Delete Function  by shiva
    const handleDelete = async (id) => {
        try {
            await CarIntakeService.deletePartRequest(id);

            setRequests((prev) => prev.filter((item) => item._id !== id));
            setFilteredRequests((prev) => prev.filter((item) => item._id !== id));

            message.success("Deleted successfully");
        } catch (error) {
            console.error(error);
            message.error("Delete failed");
        }
    }; // end here

    // Status filter function by shiva
    const handleStatusChange = (value) => {
        setStatus(value);

        if (!value) {
            setFilteredRequests([]);
            setSearched(false);
            return;
        }

        const filtered = requests.filter(
            (item) => item.status?.toLowerCase() === value.toLowerCase()
        );

        setFilteredRequests(filtered);
        setSearched(true);
    };  
    //end here

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${process.env.VITE_API_URL}/part-request`);
            const data = await res.json();
            setRequests(data.data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    //Fetch Junk Car API - shiva
    const fetchJunkCars = async () => {
        try {
            const res = await fetch(`${process.env.VITE_API_URL}/junk-car`);
            const data = await res.json();
            setJunkCars(data.data || []);
        } catch (error) {
            console.error("Error fetching junk cars : ", error);
        }
    }; //end here

    useEffect(() => {
        fetchRequests();
        fetchJunkCars();  // by shiva
    }, []);
    console.log(requests);

    const updateStatus = async (id, status) => {
        try {
            await fetch(`${process.env.VITE_API_URL}/part-request/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            fetchRequests();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
        },
        {
            title: "Vehicle",
            render: (_, record) =>
                `${record.make} ${record.model} ${record.year}`,
        },
        {
            title: "Part Name",
            dataIndex: "partName",
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
            title: "Status",
            render: (_, record) => (
                <Select
                    value={record.status}
                    onChange={(value) => 
                        updateStatus(record._id, value)
                    }
                    style={{ width: 150 }}
                >
                <Option value="Pending">Pending</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="Completed">Completed</Option>
                </Select>
            ),
        },
        {
            title: "Date",
            render: (_, record) =>
                new Date(record.createdAt).toLocaleDateString(),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Popconfirm
                    title="Are you sure to delete?"
                    onConfirm={() => handleDelete(record._id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                    >
                        Delete
                    </Button>
                </Popconfirm>
            )
        }
    ];

    return (
        <div 
            className="requests-page"
            style={{
                paddingTop: "20px",
                paddingBottom: "90px"
            }}>
            <Card 
                title="Part Requests"
                extra={
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/")}
                        >
                            Back
                        </Button>

                        <Button
                            type="primary"
                            onClick={() => navigate("/add-part-request")}
                        >
                            Add Part
                        </Button>
                    </div>
                }
            >

            {/* Add Search + Filter Here -> by shiva*/} 

            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>

                <Col xs={24} sm={12} md={8}>
                    <Input
                        placeholder="Search by Name, Email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={handleSearch}
                        size="large"
                    />
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            block
                            onClick={handleSearch}
                            blocksize="large"
                        >
                            Search
                        </Button>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Filter by status"
                            value={status}
                            onChange={handleStatusChange}
                            allowClear
                            size="large"
                            style={{ width: "100%" }}
                            options={[
                                { value: "pending", label: "Pending" },
                                { value: "in progress", label: "In Progress" },
                                { value: "completed", label: "Completed" }
                            ]}
                        />
                    </Col>
            </Row>

            {noResults && (
                <div style={{
                    textAlign: "center",
                    marginBottom: 10,
                    color: "#999",
                    fontWeight: 500
                }}>
                    Item not found
                </div>
            )}
        <Table
            columns={columns}
            dataSource={searched ? filteredRequests : requests}
            rowKey="_id"
            bordered
            scroll={{ x: "max-content" }}
            locale={{
                emptyText: searched ? "Item not found" : "No data"
            }}
            
        />
        </Card>
    </div>
    );

    // return (
    //     <div style={{ padding: "20px" }}>
    //         <h1>Part Requests</h1>

//             <table border="1" cellPadding="10" style={{ width: "100%" }}>
//                 <thead>
//                     <tr>
//                         <th>Name</th>
//                         <th>Vehicle</th>
//                         <th>Part</th>
//                         <th>Status</th>
//                         <th>Date</th>
//                     </tr>
//                 </thead>

//                 <tbody>
//                     {requests.map((req) => (
//                         <tr key={req._id}>
//                             <td>{req.name}</td>
//                             <td>{req.make} {req.model} {req.year}</td>
//                             <td>{req.partName}</td>

//                             <td>
//                                 <select
//                                     value={req.status}
//                                     onChange={(e) => 
//                                         updateStatus(req._id, e.target.value)
//                                     }
//                                 >
//                                     <option value="Pending">Pending</option>
//                                     <option value="In Progress">In Progress</option>
//                                     <option value="Completed">Completed</option>
//                                 </select>
//                             </td>

//                             <td>
//                                 {new Date(req.createdAt).toLocaleDateString()}
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
};

export default Requests;
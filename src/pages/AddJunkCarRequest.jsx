import { Card, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import JunkCarRequest from "../components/JunkCarRequest";

const AddJunkCarRequest = (props) => {
    // const navigate = useNavigate();  // added by shiva

    return(
        <div
            className="requests-page"
            style={{
                padding: "0px 10px",
            }}
        >
            <div style={{ padding: "0px" }}
                // title="Add Junk Car Request"
                extra={
                    <Button
                        type="primary"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => {
                            console.log("Back Clicked");

                            if (props.onSuccess) {
                                props.onSuccess();
                            }
                        }}
                    >
                        Back
                    </Button>
                }
            >
                <JunkCarRequest onSuccess={() => {}} />
            </div>
        </div>
    );
};

export default AddJunkCarRequest;
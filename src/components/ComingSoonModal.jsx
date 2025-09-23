import React from "react";
import { Modal, Button } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import "./comingSoon.css";

const ComingSoonModal = ({ open, onClose, featureName = "This feature" }) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      className="coming-soon-modal"
      width={480}
      closable={false}
    >
      <div className="cs-body">
        <div className="cs-hero">
          <div className="cs-icon">
            <SmileOutlined style={{ fontSize: 36, color: "#fff" }} />
          </div>
        </div>

        <h2 className="cs-title">Coming Soon</h2>
        <p className="cs-desc">
          {featureName} is on its way. Stay tuned — we're working on it!
        </p>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Button type="primary" onClick={onClose} size="large">
            Okay, got it
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ComingSoonModal;

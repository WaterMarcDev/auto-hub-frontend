import React from "react";
import { Modal, Descriptions, Button } from "antd";

const ViewTagModal = ({ visible, onClose, tag }) => {
    return (
        <Modal
            open={visible}
            title="View Tag"
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Close
                </Button>,
            ]}
            width={600}
        >
            {tag ? (
                <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="Barcode Number">
                        {tag.barcodeString}
                    </Descriptions.Item>

                    <Descriptions.Item label="Digits">
                        {(tag.barcodeString).length}
                    </Descriptions.Item>

                    <Descriptions.Item label="Available">
                        {tag.isUsed == "Available" ? "Yes" : "No"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Inventory ID">
                        {tag.inventoryId || '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Last Updated">
                        {tag.updatedAt}
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                "No tag selected"
            )}
        </Modal>
    );
};

export default ViewTagModal;

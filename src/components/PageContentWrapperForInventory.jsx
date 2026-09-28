import React from "react";

const PageContentWrapperForInventory = ({ children }) => {
    return (
        <div className="container-fluid">
            <div
                className="page-content-wrapper"
                style={{
                    display: "inline-block",
                    maxWidth: "fit-content",
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PageContentWrapperForInventory;

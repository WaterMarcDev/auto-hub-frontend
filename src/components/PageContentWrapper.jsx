import React from "react";

const PageContentWrapper = ({ children }) => {
  return (
    <div className="container-fluid">
      <div className="page-content-wrapper">{children}</div>
    </div>
  );
};

export default PageContentWrapper;

import React from "react";

const PageContentWrapper = ({ children, className = "", style = {} }) => {
  return (
    <div className="container-fluid" style={style}>
      <div className={`page-content-wrapper ${className}`.trim()}>{children}</div>
    </div>
  );
};

export default PageContentWrapper;

import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="authentication-bg bg-primary min-vh-100">
      <div className="home-center">
        <div className="home-desc-center">
          <div className="container">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

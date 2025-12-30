import React from "react";
import { useNavigate } from "react-router-dom";

const OurProcess = () => {
  const navigate = useNavigate();

  const lineStyle = {
    left: '19px',
    top: '40px',
    bottom: '-22px',
    width: '2px',
    borderLeft: '2px dotted #6b7280'
  };

  return (
    <div
      className="card"
      style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
    >
      <div className="card-body">
        <h4 className="header-title mb-4">Our Process</h4>
        <ul className="list-unstyled mb-0">
          <li className="mb-4 position-relative" style={{ paddingLeft: '60px' }}>
            <div className="d-flex align-items-start">
              <div 
                className="position-absolute" 
                style={{ 
                  left: '0', 
                  top: '0',
                  width: '40px',
                  height: '40px'
                }}
              >
                <img
                  src="assets/images/logo-sm1.png"
                  className="rounded-circle"
                  alt="Logo"
                  style={{ width: '40px', height: '40px' }}
                />
              </div>
              <div
                className="flex-grow-1"
                onClick={() => navigate("/car-intake")}
                style={{ cursor: "pointer" }}
              >
                <h5 className="font-size-15 mb-1">Car Intake</h5>
                <p className="text-muted font-size-12 mb-0">
                  To Sell Park the Car
                </p>
              </div>
            </div>
            <div className="position-absolute" style={lineStyle} />
          </li>
          <li className="mb-4 position-relative" style={{ paddingLeft: '60px' }}>
            <div className="d-flex align-items-start">
              <div 
                className="position-absolute" 
                style={{ 
                  left: '0', 
                  top: '0',
                  width: '40px',
                  height: '40px'
                }}
              >
                <span className="avatar-title bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <i className="ti-car font-size-16" />
                </span>
              </div>
              <div className="flex-grow-1">
                <h5 className="font-size-15 mb-1">Car Details</h5>
                <p className="text-muted font-size-12 mb-0">
                  Collect Car Details from Vin API
                </p>
              </div>
            </div>
            <div className="position-absolute" style={lineStyle} />
          </li>
          <li className="mb-4 position-relative" style={{ paddingLeft: '60px' }}>
            <div className="d-flex align-items-start">
              <div 
                className="position-absolute" 
                style={{ 
                  left: '0', 
                  top: '0',
                  width: '40px',
                  height: '40px'
                }}
              >
                <span className="avatar-title bg-soft-success text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <i className="ti-image font-size-16" />
                </span>
              </div>
              <div className="flex-grow-1">
                <h5 className="font-size-15 mb-1">Evaluation / Diagnosis</h5>
                <p className="text-muted font-size-12 mb-0">
                  Collect 12 - 14 Images from different angles
                </p>
              </div>
            </div>
            <div className="position-absolute" style={lineStyle} />
          </li>
          <li className="mb-4 position-relative" style={{ paddingLeft: '60px' }}>
            <div className="d-flex align-items-start">
              <div 
                className="position-absolute" 
                style={{ 
                  left: '0', 
                  top: '0',
                  width: '40px',
                  height: '40px'
                }}
              >
                <span className="avatar-title bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <i className="ti-user font-size-16" />
                </span>
              </div>
              <div className="flex-grow-1">
                <h5 className="font-size-15 mb-1">Seller KYC</h5>
                <p className="text-muted font-size-12 mb-0">Complete the KYC</p>
              </div>
            </div>
            <div className="position-absolute" style={lineStyle} />
          </li>
          <li className="mb-4 position-relative" style={{ paddingLeft: '60px' }}>
            <div className="d-flex align-items-start">
              <div 
                className="position-absolute" 
                style={{ 
                  left: '0', 
                  top: '0',
                  width: '40px',
                  height: '40px'
                }}
              >
                <span className="avatar-title bg-soft-success text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <i className="ti-shopping-cart-full font-size-16" />
                </span>
              </div>
              <div className="flex-grow-1">
                <h5 className="font-size-15 mb-1">Payment</h5>
                <p className="text-muted font-size-12 mb-0">
                  Suggest Price from API, Negotiate and Pay
                </p>
              </div>
            </div>
            <div className="position-absolute" style={lineStyle} />
          </li>
          <li className="mb-4 position-relative" style={{ paddingLeft: '60px' }}>
            <div className="d-flex align-items-start">
              <div 
                className="position-absolute" 
                style={{ 
                  left: '0', 
                  top: '0',
                  width: '40px',
                  height: '40px'
                }}
              >
                <span className="avatar-title bg-soft-success text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <i className="ti-list font-size-16" />
                </span>
              </div>
              <div
                className="flex-grow-1"
                onClick={() => navigate("/inventory-list")}
                style={{ cursor: "pointer" }}
              >
                <h5 className="font-size-15 mb-1">Car Parts Inventory</h5>
                <p className="text-muted font-size-12 mb-0">
                  Complete the Inventory as per Parts available
                </p>
              </div>
            </div>
            <div className="position-absolute" style={lineStyle} />
          </li>
          <li className="mb-0 position-relative" style={{ paddingLeft: '60px' }}>
            <div className="d-flex align-items-start">
              <div 
                className="position-absolute" 
                style={{ 
                  left: '0', 
                  top: '0',
                  width: '40px',
                  height: '40px'
                }}
              >
                <span className="avatar-title bg-soft-success text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <i className="ti-car font-size-16" />
                </span>
              </div>
              <div className="flex-grow-1">
                <h5 className="font-size-15 mb-1">Scrap the Car</h5>
                <p className="text-muted font-size-12 mb-0">
                  Fill the details required
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OurProcess;

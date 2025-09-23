import React from "react";
import { useNavigate } from "react-router-dom";

const OurProcess = () => {
  const navigate = useNavigate();

  return (
    <div
      className="card"
      style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
    >
      <div className="card-body">
        <h4 className="header-title mb-4">Our Process</h4>
        <ul className="list-unstyled activity-wid mb-0">
          {/* ... keep list items as in original dashboard ... */}
          <li className="activity-list activity-border">
            <div className="activity-icon avatar-sm">
              <img
                src="assets/images/logo-sm1.png"
                className="avatar-sm rounded-circle"
                alt="Logo"
              />
            </div>
            <div className="media">
              <div
                className="me-3"
                onClick={() => navigate("/car-intake")}
                style={{ cursor: "pointer" }}
              >
                <h5 className="font-size-15 mb-1">Car Intake</h5>
                <p className="text-muted font-size-12 mb-0">
                  To Sell Park the Car
                </p>
              </div>
            </div>
          </li>
          <li className="activity-list activity-border">
            <div className="activity-icon avatar-sm">
              <span className="avatar-title bg-soft-primary text-primary rounded-circle">
                <i className="ti-car font-size-16" />
              </span>
            </div>
            <div className="media">
              <div className="me-3">
                <h5 className="font-size-15 mb-1">Car Details</h5>
                <p className="text-muted font-size-12 mb-0">
                  Collect Car Details from Vin Api
                </p>
              </div>
            </div>
          </li>
          <li className="activity-list activity-border">
            <div className="activity-icon avatar-sm">
              <span className="avatar-title bg-soft-success text-success rounded-circle">
                <i className="ti-image font-size-16" />
              </span>
            </div>
            <div className="media">
              <div className="me-3">
                <h5 className="font-size-15 mb-1">Evaluation / Diagnosis</h5>
                <p className="text-muted font-size-12 mb-0">
                  Collect 12 - 14 Images from different angles
                </p>
              </div>
            </div>
          </li>
          <li className="activity-list activity-border">
            <div className="activity-icon avatar-sm">
              <span className="avatar-title bg-soft-success text-success rounded-circle">
                <i className="ti-shopping-cart-full font-size-16" />
              </span>
            </div>
            <div className="media">
              <div className="me-3">
                <h5 className="font-size-15 mb-1">Payment</h5>
                <p className="text-muted font-size-12 mb-0">
                  Suggest Price from API, Negotiate and Pay
                </p>
              </div>
            </div>
          </li>
          <li className="activity-list activity-border">
            <div className="activity-icon avatar-sm">
              <span className="avatar-title bg-soft-primary text-primary rounded-circle">
                <i className="ti-user font-size-16" />
              </span>
            </div>
            <div className="media">
              <div className="me-3">
                <h5 className="font-size-15 mb-1">Seller KYC</h5>
                <p className="text-muted font-size-12 mb-0">Complete the KYC</p>
              </div>
            </div>
          </li>
          <li className="activity-list">
            <div className="activity-icon avatar-sm">
              <span className="avatar-title bg-soft-success text-success rounded-circle">
                <i className="ti-list font-size-16" />
              </span>
            </div>
            <div
              className="media"
              onClick={() => navigate("/inventory-list")}
              style={{ cursor: "pointer" }}
            >
              <div className="me-3">
                <h5 className="font-size-15 mb-1">Car Parts Inventory</h5>
                <p className="text-muted font-size-12 mb-0">
                  Complete the Inventory as per Parts available
                </p>
              </div>
            </div>
          </li>
          <li className="activity-list">
            <div className="activity-icon avatar-sm">
              <span className="avatar-title bg-soft-success text-success rounded-circle">
                <i className="ti-car font-size-16" />
              </span>
            </div>
            <div className="media">
              <div className="me-3">
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

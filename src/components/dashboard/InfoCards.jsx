import React from "react";

export const InfoCards = () => (
  <div className="dash-info-widget mt-4 mt-lg-0 py-4 px-3 rounded">
    <div className="media dash-main-border pb-2 mt-2">
      <div className="avatar-sm mb-3 mt-2">
        <span className="avatar-title rounded-circle bg-white shadow">
          <i className="mdi mdi-car text-primary font-size-18" />
        </span>
      </div>
      <div className="media-body ps-3">
        <h4 className="font-size-20">2354</h4>
        <p className="text-muted">
          Order{" "}
          <a href="#" className="text-primary">
            car intake <i className="mdi mdi-arrow-right" />
          </a>
        </p>
      </div>
    </div>

    <div className="media mt-4 dash-main-border pb-2">
      <div className="avatar-sm mb-3 mt-2">
        <span className="avatar-title rounded-circle bg-white shadow">
          <i className="mdi mdi-credit-card-outline text-primary font-size-18" />
        </span>
      </div>
      <div className="media-body ps-3">
        <h4 className="font-size-20">1598</h4>
        <p className="text-muted">
          Car{" "}
          <a href="#" className="text-primary">
            Inventory Details <i className="mdi mdi-arrow-right" />
          </a>
        </p>
      </div>
    </div>

    <div className="media mt-4">
      <div className="avatar-sm mb-2 mt-2">
        <span className="avatar-title rounded-circle bg-white shadow">
          <i className="mdi mdi-eye-outline text-primary font-size-18" />
        </span>
      </div>
      <div className="media-body ps-3">
        <h4 className="font-size-20">1230</h4>
        <p className="text-muted mb-0">
          Car{" "}
          <a href="#" className="text-primary">
            Scrap Details <i className="mdi mdi-arrow-right" />
          </a>
        </p>
      </div>
    </div>

    <div className="progress mt-3" style={{ height: 4 }}>
      <div
        className="progress-bar bg-primary"
        role="progressbar"
        style={{ width: "70%" }}
        aria-valuenow={70}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  </div>
);

export default InfoCards;

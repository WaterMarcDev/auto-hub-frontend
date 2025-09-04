import React from "react";

const Dashboard = () => {
  return (
    <>
      {/* Page Title */}
      <div className="page-title-box">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-sm-6">
              <div className="page-title">
                <h4>Dashboard</h4>
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="javascript: void(0);">Scrap Yard</a>
                  </li>
                  <li className="breadcrumb-item active">Dashboard</li>
                </ol>
              </div>
            </div>
            <div className="col-sm-6"></div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="row">
        <div className="col-xl-8">
          <div className="card">
            <div className="card-body">
              <h4 className="header-title float-sm-start">
                Scrap Yard Summary
              </h4>
              &nbsp;<div className="clearfix"></div>
              <p className="mb-1 float-sm-start"> Year - 2025</p>
              <div className="float-sm-end">
                <ul className="nav nav-pills">
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      Day
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      Week
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      Month
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link active" href="#">
                      Year
                    </a>
                  </li>
                </ul>
              </div>
              <div className="clearfix"></div>
              <div className="row align-items-center">
                <div className="col-xl-8">
                  <div>
                    <div
                      id="stacked-column-chart"
                      className="apex-charts"
                      dir="ltr"
                    ></div>
                  </div>
                </div>
                <div className="col-xl-4">
                  <div className="dash-info-widget mt-4 mt-lg-0 py-4 px-3 rounded">
                    <div className="media dash-main-border pb-2 mt-2">
                      <div className="avatar-sm mb-3 mt-2">
                        <span className="avatar-title rounded-circle bg-white shadow">
                          <i className="mdi mdi-car text-primary font-size-18"></i>
                        </span>
                      </div>
                      <div className="media-body ps-3">
                        <h4 className="font-size-20">2354</h4>
                        <p className="text-muted">
                          Order{" "}
                          <a href="#" className="text-primary">
                            car intake <i className="mdi mdi-arrow-right"></i>
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="media mt-4 dash-main-border pb-2">
                      <div className="avatar-sm mb-3 mt-2">
                        <span className="avatar-title rounded-circle bg-white shadow">
                          <i className="mdi mdi-credit-card-outline text-primary font-size-18"></i>
                        </span>
                      </div>
                      <div className="media-body ps-3">
                        <h4 className="font-size-20">1598</h4>
                        <p className="text-muted">
                          Car{" "}
                          <a href="#" className="text-primary">
                            Inventory Details{" "}
                            <i className="mdi mdi-arrow-right"></i>
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="media mt-4">
                      <div className="avatar-sm mb-2 mt-2">
                        <span className="avatar-title rounded-circle bg-white shadow">
                          <i className="mdi mdi-eye-outline text-primary font-size-18"></i>
                        </span>
                      </div>
                      <div className="media-body ps-3">
                        <h4 className="font-size-20">1230</h4>
                        <p className="text-muted mb-0">
                          Car{" "}
                          <a href="#" className="text-primary">
                            Scrap Details{" "}
                            <i className="mdi mdi-arrow-right"></i>
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="row">
            <div className="col-xl-6 col-md-6">
              <div className="card">
                <div className="card-body">
                  <div className="text-center">
                    <p className="font-size-16">Parts Orders</p>
                    <div className="mini-stat-icon mx-auto mb-4 mt-3">
                      <span className="avatar-title rounded-circle bg-soft-primary">
                        <i className="mdi mdi-cart-outline text-primary font-size-20"></i>
                      </span>
                    </div>
                    <h5 className="font-size-22">58</h5>
                    <p className="text-muted">70% Target</p>
                    <div className="progress mt-3" style={{ height: "4px" }}>
                      <div
                        className="progress-bar progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: "70%" }}
                        aria-valuenow="70"
                        aria-valuemin="0"
                        aria-valuemax="70"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-6 col-md-6">
              <div className="card">
                <div className="card-body">
                  <div className="text-center">
                    <p className="font-size-16">Sellers</p>
                    <div className="mini-stat-icon mx-auto mb-4 mt-3">
                      <span className="avatar-title rounded-circle bg-soft-success">
                        <i className="mdi mdi-account-outline text-success font-size-20"></i>
                      </span>
                    </div>
                    <h5 className="font-size-22">136</h5>
                    <p className="text-muted">80% Target</p>
                    <div className="progress mt-3" style={{ height: "4px" }}>
                      <div
                        className="progress-bar progress-bar bg-success"
                        role="progressbar"
                        style={{ width: "80%" }}
                        aria-valuenow="80"
                        aria-valuemin="0"
                        aria-valuemax="80"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h4 className="header-title mb-4">Revenue Statistics</h4>
              <div className="media">
                <h4>$14,235 </h4>
                <div className="media-body ps-3">
                  <div className="dropdown">
                    <button
                      className="btn btn-light btn-sm dropdown-toggle"
                      type="button"
                      id="dropdownMenuButton"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Today<i className="mdi mdi-chevron-down ms-1"></i>
                    </button>
                    <div
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuButton"
                    >
                      <a className="dropdown-item" href="#">
                        Yesterday
                      </a>
                      <a className="dropdown-item" href="#">
                        Last Week
                      </a>
                      <a className="dropdown-item" href="#">
                        Last Month
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div id="statistics-chart"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="row">
        <div className="col-xl-4">
          <div className="card">
            <div className="card-body">
              <h4 className="header-title mb-4">Our Process</h4>
              <ul className="list-unstyled activity-wid mb-0">
                <li className="activity-list activity-border">
                  <div className="activity-icon avatar-sm">
                    <img
                      src="/assets/images/logo-sm1.png"
                      className="avatar-sm rounded-circle"
                      alt=""
                    />
                  </div>
                  <div className="media">
                    <div className="me-3">
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
                      <i className="ti-car font-size-16"></i>
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
                      <i className="ti-image font-size-16"></i>
                    </span>
                  </div>
                  <div className="media">
                    <div className="me-3">
                      <h5 className="font-size-15 mb-1">
                        Evaluation / Diagnosis
                      </h5>
                      <p className="text-muted font-size-12 mb-0">
                        Collect 12 - 14 Images from different angles
                      </p>
                    </div>
                  </div>
                </li>

                <li className="activity-list activity-border">
                  <div className="activity-icon avatar-sm">
                    <span className="avatar-title bg-soft-success text-success rounded-circle">
                      <i className="ti-shopping-cart-full font-size-16"></i>
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
                      <i className="ti-user font-size-16"></i>
                    </span>
                  </div>
                  <div className="media">
                    <div className="me-3">
                      <h5 className="font-size-15 mb-1">Seller KYC</h5>
                      <p className="text-muted font-size-12 mb-0">
                        Complete the KYC
                      </p>
                    </div>
                  </div>
                </li>

                <li className="activity-list">
                  <div className="activity-icon avatar-sm">
                    <span className="avatar-title bg-soft-success text-success rounded-circle">
                      <i className="ti-list font-size-16"></i>
                    </span>
                  </div>
                  <div className="media">
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
                      <i className="ti-car font-size-16"></i>
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
        </div>

        <div className="col-xl-4">
          <div className="card">
            <div className="card-body">
              <h4 className="header-title mb-4">Earning Goal</h4>
              <div className="mt-2 text-center">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mt-4 mt-sm-0">
                      <div
                        id="list-chart-1"
                        className="apex-charts"
                        dir="ltr"
                      ></div>
                      <p className="text-muted mb-2 mt-2 pt-1">From Scrap:</p>
                      <h5 className="font-size-18 mb-1">USD 13,545.65</h5>
                    </div>
                  </div>
                  <div className="col-md-6 dash-goal">
                    <div className="mt-4 mt-sm-0">
                      <div
                        id="list-chart-2"
                        className="apex-charts"
                        dir="ltr"
                      ></div>
                      <p className="text-muted mb-2 mt-2 pt-1">From Junk:</p>
                      <h5 className="font-size-18 mb-1">USD 84,265.45</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h4 className="header-title mb-4">Our Contact Details</h4>
              <p>
                <b>Address : </b>242 Monmouth Rd. Wrightstown, NJ - 08562 USA
              </p>
              <p>
                <b>Mobile : </b>+1 609 758 1919
              </p>
              <p>
                <b>Email : </b> Hello@autohub.express
              </p>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card">
            <div className="card-body">
              <h4 className="header-title mb-4">Popular Car Parts</h4>
              <div className="row align-items-center mb-5">
                <div className="col-md-4">
                  <img
                    src="/assets/images/product/Front Bumper.png"
                    className="img-fluid me-3"
                    alt=""
                  />
                </div>
                <div className="col-md-7 offset-md-1">
                  <div className="mt-4 mt-sm-0">
                    <p className="text-muted mb-2">Car</p>
                    <h5 className="text-primary">Front Bumper</h5>
                    <div className="row no-gutters mt-4">
                      <div className="col-4">
                        <div className="mt-1">
                          <h4 className="font-size-13">1200</h4>
                          <p className="text-muted mb-1 font-size-10">Sold</p>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="mt-1">
                          <h4 className="font-size-14">450</h4>
                          <p className="text-muted mb-1 font-size-10">Stock</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

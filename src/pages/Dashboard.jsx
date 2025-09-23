import React from "react";
import SummaryChart from "../components/dashboard/SummaryChart";
import InfoCards from "../components/dashboard/InfoCards";
import RevenueCard from "../components/dashboard/RevenueCard";
import OurProcess from "../components/dashboard/OurProcess";
import EarningGoal from "../components/dashboard/EarningGoal";
import PopularPartsCarousel from "../components/dashboard/PopularPartsCarousel";
import RtxRecycling from "../components/dashboard/RtxRecycling";

const Dashboard = () => {
  return (
    <div>
      {/* Page title */}
      <div className="page-title-box">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-sm-6">
              <div className="page-title">
                <h4>Dashboard</h4>
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="#">Scrap Yard</a>
                  </li>
                  <li className="breadcrumb-item active">Dashboard</li>
                </ol>
              </div>
            </div>
            <div className="col-sm-6" />
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <div className="row">
            <div className="col-xl-8">
              <div
                className="card"
                style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
              >
                <div className="card-body">
                  <h4 className="header-title float-sm-start">
                    Scrap Yard Summary
                  </h4>
                  <div className="clearfix" />
                  <p className="mb-1 float-sm-start">Year - 2025</p>
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

                  <div className="clearfix" />

                  <div className="row align-items-center">
                    <div className="col-xl-8">
                      <SummaryChart />
                    </div>
                    <div className="col-xl-4">
                      <InfoCards />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="row">
                <div className="col-xl-6 col-md-6">
                  <div
                    className="card"
                    style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
                  >
                    <div className="card-body">
                      <div className="text-center">
                        <p className="font-size-16">Parts Orders</p>
                        <div className="mini-stat-icon mx-auto mb-4 mt-3">
                          <span className="avatar-title rounded-circle bg-soft-primary">
                            <i className="mdi mdi-cart-outline text-primary font-size-20" />
                          </span>
                        </div>
                        <h5 className="font-size-22">58</h5>
                        <p className="text-muted">70% Target</p>
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
                    </div>
                  </div>
                </div>

                <div className="col-xl-6 col-md-6">
                  <div
                    className="card"
                    style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
                  >
                    <div className="card-body">
                      <div className="text-center">
                        <p className="font-size-16">Sellers</p>
                        <div className="mini-stat-icon mx-auto mb-4 mt-3">
                          <span className="avatar-title rounded-circle bg-soft-success">
                            <i className="mdi mdi-account-outline text-success font-size-20" />
                          </span>
                        </div>
                        <h5 className="font-size-22">136</h5>
                        <p className="text-muted">80% Target</p>
                        <div className="progress mt-3" style={{ height: 4 }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: "80%" }}
                            aria-valuenow={80}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="card"
                style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
              >
                <div className="card-body">
                  <h4 className="header-title mb-4">Revenue Statistics</h4>
                  <div className="d-flex align-items-center">
                    <h4 className="mb-0">$14,235</h4>
                    <div className="media-body ps-3 ms-auto">
                      <div className="dropdown">
                        <button
                          className="btn btn-light btn-sm dropdown-toggle"
                          type="button"
                          id="dropdownMenuButton"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          Today
                          <i className="mdi mdi-chevron-down ms-1" />
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
                    <RevenueCard />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="row">
            {/* Our Process */}
            <div className="col-xl-4">
              <OurProcess />
            </div>

            {/* Earning Goal */}
            <div className="col-xl-4">
              <EarningGoal />

              <PopularPartsCarousel />
            </div>
            {/* RTX Recycling */}
            <div className="col-xl-4">
              <RtxRecycling />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

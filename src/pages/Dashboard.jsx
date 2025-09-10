import React from "react";
import Chart from "react-apexcharts";

const partsSlides = [
  {
    img: "assets/images/product/Front Bumper.png",
    title: "Front Bumper",
    sold: 1200,
    stock: 450,
  },
  {
    img: "assets/images/product/Rear Bumper.png",
    title: "Rear Bumper",
    sold: 100,
    stock: 250,
  },
  {
    img: "assets/images/product/Fender.png",
    title: "Fender",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Headlights.png",
    title: "Headlights",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Hood.png",
    title: "Hood",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Doors.png",
    title: "Doors",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Side mirrors.png",
    title: "Side Mirrors",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Seats.png",
    title: "Seats",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Odometer.png",
    title: "Odometer",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Rims & tire set.png",
    title: "Rims & Tire Set",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/AC Compressor.png",
    title: "AC Compressor",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Alternator.png",
    title: "Alternator",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Air intake manifold.png",
    title: "Air Intake Manifold",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Battery.png",
    title: "Battery",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Fuse box.png",
    title: "Fuse box",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Window switches.png",
    title: "Window Switches",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Engine.png",
    title: "Engine",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Transmission.png",
    title: "Transmission",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Trunk Gate.png",
    title: "Trunk Gate",
    sold: 600,
    stock: 150,
  },
];

const rtxSlides = [
  "assets/images/AutoHub/Junk Yard 1.png",
  "assets/images/AutoHub/Junk Yard 2.png",
  "assets/images/AutoHub/Junk Yard 3.jpeg",
  "assets/images/AutoHub/Junk Yard 4.jpeg",
  "assets/images/AutoHub/Junk Yard 5.jpeg",
  "assets/images/AutoHub/Junk Yard 6.jpeg",
  "assets/images/AutoHub/Junk Yard 7.jpeg",
  "assets/images/AutoHub/Junk Yard 8.jpeg",
];

const stackChartOptions = {
  chart: {
    type: "bar",
    stacked: true,
    toolbar: { show: false },
    zoom: { enabled: true },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "20%",
      endingShape: "rounded",
    },
  },
  dataLabels: { enabled: true },
  xaxis: {
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  colors: ["#525ce5", "#edf1f5"],
  legend: { show: false },
  fill: { opacity: 1 },
};

const stackedChartSeries = [
  { name: "Earning", data: [5, 7, 7, 6, 7, 5, 7, 6, 7, 4, 6, 7] },
  { name: "Paid", data: [5, 6, 4, 5, 6, 4, 3, 5, 4, 6, 4, 3] },
];

const staticChart = {
  options: {
    chart: {
      type: "area",
      height: 80,
      sparkline: { enabled: true },
    },
    stroke: { curve: "smooth", width: 2 },
    colors: ["#525ce5"],
    tooltip: {
      fixed: { enabled: false },
      x: { show: false },
      y: {
        title: { formatter: () => "Revenue" },
      },
      marker: { show: false },
    },
  },
  series: [{ name: "Revenue", data: [24, 66, 42, 88, 62, 24, 45, 12, 36, 10] }],
};

const listChart1 = {
  options: {
    fill: { colors: ["#525ce5"] },
    chart: {
      type: "radialBar",
      width: 65,
      height: 65,
      sparkline: { enabled: true },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      radialBar: {
        hollow: { margin: 0, size: "60%" },
        track: { margin: 0 },
        dataLabels: { show: false },
      },
    },
  },
  series: [70],
};

const listChart2 = {
  options: {
    fill: { colors: ["#23c58f"] },
    chart: {
      type: "radialBar",
      width: 65,
      height: 65,
      sparkline: { enabled: true },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      radialBar: {
        hollow: { margin: 0, size: "60%" },
        track: { margin: 0 },
        dataLabels: { show: false },
      },
    },
  },
  series: [80],
};

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
                      <Chart
                        options={stackChartOptions}
                        series={stackedChartSeries}
                        type="bar"
                        height={380}
                      />
                    </div>
                    <div className="col-xl-4">
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
                                Inventory Details{" "}
                                <i className="mdi mdi-arrow-right" />
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
                                Scrap Details{" "}
                                <i className="mdi mdi-arrow-right" />
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
                    {/* <div id="stastics-chart" /> */}
                    <Chart
                      options={staticChart.options}
                      series={staticChart.series}
                      type="area"
                      height={80}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="row">
            {/* Our Process */}
            <div className="col-xl-4">
              <div
                className="card"
                style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
              >
                <div className="card-body">
                  <h4 className="header-title mb-4">Our Process</h4>
                  <ul className="list-unstyled activity-wid mb-0">
                    <li className="activity-list activity-border">
                      <div className="activity-icon avatar-sm">
                        <img
                          src="assets/images/logo-sm1.png"
                          className="avatar-sm rounded-circle"
                          alt="Logo"
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
                          <p className="text-muted font-size-12 mb-0">
                            Complete the KYC
                          </p>
                        </div>
                      </div>
                    </li>

                    <li className="activity-list">
                      <div className="activity-icon avatar-sm">
                        <span className="avatar-title bg-soft-success text-success rounded-circle">
                          <i className="ti-list font-size-16" />
                        </span>
                      </div>
                      <div className="media">
                        <div className="me-3">
                          <h5 className="font-size-15 mb-1">
                            Car Parts Inventory
                          </h5>
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
            </div>

            {/* Earning Goal */}
            <div className="col-xl-4">
              <div
                className="card"
                style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
              >
                <div className="card-body">
                  <h4 className="header-title mb-4">Earning Goal</h4>
                  <div className="mt-2 text-center">
                    <div className="row">
                      <div className="col-md-6 d-flex flex-column align-items-center">
                        <Chart
                          options={listChart1.options}
                          series={listChart1.series}
                          type="radialBar"
                          width={65}
                          height={65}
                        />
                        <p className="text-muted mb-2 mt-2 pt-1">From Scrap:</p>
                        <h5 className="font-size-18 mb-1">USD 13,545.65</h5>
                      </div>

                      <div className="col-md-6 d-flex flex-column align-items-center">
                        <Chart
                          options={listChart2.options}
                          series={listChart2.series}
                          type="radialBar"
                          width={65}
                          height={65}
                        />
                        <p className="text-muted mb-2 mt-2 pt-1">From Junk:</p>
                        <h5 className="font-size-18 mb-1">USD 84,265.45</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popular Car Parts */}
              <div
                className="card"
                style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
              >
                <div className="card-body">
                  <h4 className="header-title mb-4">Popular Car Parts</h4>
                  <div
                    id="popularPartsCarousel"
                    className="carousel slide"
                    data-bs-ride="carousel"
                  >
                    <div className="carousel-indicators">
                      {partsSlides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          data-bs-target="#popularPartsCarousel"
                          data-bs-slide-to={idx}
                          className={idx === 0 ? "active" : ""}
                          aria-current={idx === 0 ? "true" : undefined}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="carousel-inner">
                      {partsSlides.map((part, idx) => (
                        <div
                          key={part.title}
                          className={`carousel-item${
                            idx === 0 ? " active" : ""
                          }`}
                        >
                          <div className="d-flex justify-content-between mb-5">
                            <div className="col-md-4">
                              <img
                                src={part.img}
                                className="img-fluid me-3"
                                alt={part.title}
                              />
                            </div>
                            <div className="col-md-7 offset-md-1">
                              <div className="mt-4 mt-sm-0">
                                <p className="text-muted mb-2">Car</p>
                                <h5 className="text-primary">{part.title}</h5>
                                <div className="row no-gutters mt-4">
                                  <div className="col-4">
                                    <div className="mt-1">
                                      <h4 className="font-size-13">
                                        {part.sold}
                                      </h4>
                                      <p className="text-muted mb-1 font-size-10">
                                        Sold
                                      </p>
                                    </div>
                                  </div>
                                  <div className="col-4">
                                    <div className="mt-1">
                                      <h4 className="font-size-13">
                                        {part.stock}
                                      </h4>
                                      <p className="text-muted mb-1 font-size-10">
                                        Stock
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RTX Recycling */}
            <div className="col-xl-4">
              <div
                className="card"
                style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
              >
                <div className="card-body">
                  <h4 className="header-title mb-4">RTX Recycling</h4>
                  <div
                    id="rtxCarousel"
                    className="carousel slide"
                    data-bs-ride="carousel"
                  >
                    <div className="carousel-indicators">
                      {rtxSlides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          data-bs-target="#rtxCarousel"
                          data-bs-slide-to={idx}
                          className={idx === 0 ? "active" : ""}
                          aria-current={idx === 0 ? "true" : undefined}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="carousel-inner">
                      {rtxSlides.map((src, idx) => (
                        <div
                          key={src}
                          className={`carousel-item${
                            idx === 0 ? " active" : ""
                          }`}
                        >
                          <div className="row align-items-center mb-5">
                            <img
                              src={src}
                              className="img-fluid me-3"
                              alt={`Scrap Yard ${idx + 1}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="clearfix mt-2" />
                  <h4 className="header-title mb-4">Our Contact Details</h4>
                  <p>
                    <b>Address : </b>242 Monmouth Rd. Wrightstown, NJ - 08562
                    USA
                  </p>
                  <p>
                    <b>Mobile : </b>+1 609 758 1919
                  </p>
                  <p>
                    <b>Email : </b>Hello@autohub.express
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import SummaryChart from "../components/Dashboard/SummaryChart";
import InfoCards from "../components/Dashboard/InfoCards";
import RevenueCard from "../components/Dashboard/RevenueCard";
import OurProcess from "../components/Dashboard/OurProcess";
import EarningGoal from "../components/Dashboard/EarningGoal";
import PopularPartsCarousel from "../components/Dashboard/PopularPartsCarousel";
import RtxRecycling from "../components/Dashboard/RtxRecycling";
import { dashboardAPI } from "../utils/api";

const Dashboard = () => {
  const [range, setRange] = useState("Year");
  const now = new Date();

  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

  // selection states for detailed pickers
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
  );
  // week input uses YYYY-Www format
  const getIsoWeekString = (d) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const diff = target - firstThursday;
    const week = 1 + Math.round(diff / (7 * 24 * 3600 * 1000));
    return `${target.getFullYear()}-W${week.toString().padStart(2, "0")}`;
  };
  const [selectedWeek, setSelectedWeek] = useState(getIsoWeekString(now));
  const [selectedDay, setSelectedDay] = useState(
    now.toISOString().slice(0, 10)
  );

  // Helper to display month as 'YYYY Mon' instead of 'YYYY-MM'
  const getMonthDisplay = (monthStr) => {
    if (!monthStr) return monthStr;
    const parts = String(monthStr).split("-");
    if (parts.length >= 2) {
      const year = parts[0];
      const mm = parts[1];
      const monthIndex = parseInt(mm, 10) - 1;
      const monthNames = [
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
      ];
      if (!Number.isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
        return `${year} ${monthNames[monthIndex]}`;
      }
    }
    // fallback: try parsing as date
    const d = new Date(monthStr);
    if (!isNaN(d))
      return `${d.getFullYear()} ${d.toLocaleString(undefined, {
        month: "short",
      })}`;
    return monthStr;
  };

  const getRangeParams = (r) => {
    let start;
    let end;

    if (r === "Year") {
      const y = parseInt(selectedYear, 10);
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31, 23, 59, 59, 999);
      return {
        groupBy: "month",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }

    if (r === "Month") {
      // selectedMonth is YYYY-MM
      const [y, m] = selectedMonth.split("-");
      const year = parseInt(y, 10);
      const month = parseInt(m, 10) - 1;
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      return {
        groupBy: "day",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }

    if (r === "Week") {
      // selectedWeek is YYYY-Www
      const [yw, weekPart] = selectedWeek.split("-W");
      const year = parseInt(yw, 10);
      const week = parseInt(weekPart, 10);
      // ISO week start (Monday)
      const jan4 = new Date(Date.UTC(year, 0, 4));
      const dayOfWeek = jan4.getUTCDay() || 7;
      const isoWeekStart = new Date(
        Date.UTC(year, 0, 4 + (week - 1) * 7 - (dayOfWeek - 1))
      );
      start = new Date(
        isoWeekStart.getFullYear(),
        isoWeekStart.getMonth(),
        isoWeekStart.getDate()
      );
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return {
        groupBy: "day",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }

    // Day
    if (r === "Day") {
      // selectedDay is YYYY-MM-DD
      start = new Date(`${selectedDay}T00:00:00`);
      end = new Date(`${selectedDay}T23:59:59.999`);
      return {
        groupBy: "hour",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }

    // fallback - last 30 days
    const now2 = new Date();
    start = new Date(now2.getTime() - 29 * 24 * 60 * 60 * 1000);
    end = now2;
    return {
      groupBy: "day",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  const { groupBy, startDate, endDate } = getRangeParams(range);
  const [sellerCount, setSellerCount] = useState(0);
  const [partsOrders, setPartsOrders] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await dashboardAPI.getSummaryCounts();
        const payload = res.data || res;
        if (!mounted) return;
        setSellerCount(payload.sellerCount ?? 0);
        // Parts orders could come from inventory items or a separate count
        // For now, using inventoryItems as parts orders count
        setPartsOrders(payload.inventoryItems ?? 0);
      } catch (err) {
        console.error("Failed to load counts:", err);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);
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
          {/* Row 1: Scrap Yard Summary - Full Width */}
          <div className="row">
            <div className="col-12">
              <div
                className="card"
                style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
              >
                <div className="card-body">
                  <h4 className="header-title float-sm-start">
                    Scrap Yard Summary
                  </h4>
                  <div className="clearfix" />
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      {range === "Year" && (
                        <p className="mb-1">Year - {selectedYear}</p>
                      )}
                      {range === "Month" && (
                        <p className="mb-1">
                          Month - {getMonthDisplay(selectedMonth)}
                        </p>
                      )}
                      {range === "Week" && (
                        <p className="mb-1">Week - {selectedWeek}</p>
                      )}
                      {range === "Day" && (
                        <p className="mb-1">Day - {selectedDay}</p>
                      )}
                    </div>

                    <div className="d-flex align-items-center">
                      <ul className="nav nav-pills me-3">
                        {["Day", "Week", "Month", "Year"].map((label) => (
                          <li key={label} className="nav-item">
                            <a
                              href="#"
                              className={`nav-link ${
                                range === label ? "active" : ""
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                setRange(label);
                              }}
                            >
                              {label}
                            </a>
                          </li>
                        ))}
                      </ul>

                      <div>
                        {range === "Year" && (
                          <select
                            className="form-select form-select-sm"
                            style={{
                              backgroundColor: "#1F293D",
                              color: "#D6D9E6",
                              borderColor: "#374151",
                            }}
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                          >
                            {Array.from({ length: 6 }).map((_, i) => {
                              const y = now.getFullYear() - 4 + i;
                              return (
                                <option
                                  key={y}
                                  value={y}
                                  style={{
                                    backgroundColor: "#1F293D",
                                    color: "#D6D9E6",
                                  }}
                                >
                                  {y}
                                </option>
                              );
                            })}
                          </select>
                        )}

                        {range === "Month" && (
                          <input
                            type="month"
                            className="form-control form-control-sm"
                            style={{
                              backgroundColor: "#1F293D",
                              color: "#D6D9E6",
                              borderColor: "#374151",
                            }}
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                          />
                        )}

                        {range === "Week" && (
                          <input
                            type="week"
                            className="form-control form-control-sm"
                            style={{
                              backgroundColor: "#1F293D",
                              color: "#D6D9E6",
                              borderColor: "#374151",
                            }}
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(e.target.value)}
                          />
                        )}

                        {range === "Day" && (
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            style={{
                              backgroundColor: "#1F293D",
                              color: "#D6D9E6",
                              borderColor: "#374151",
                            }}
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="clearfix" />

                  <div className="row align-items-center">
                    <div className="col-xl-9">
                      <SummaryChart
                        groupBy={groupBy}
                        startDate={startDate}
                        endDate={endDate}
                      />
                    </div>
                    <div className="col-xl-3">
                      <InfoCards />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Revenue, Earning Goal, Parts Orders & Sellers */}
          <div className="row">
            <div className="col-xl-4 col-lg-6 col-md-6">
              <div
                className="card"
                style={{
                  backgroundColor: "#1F293D",
                  color: "#D6D9E6",
                  height: "240px",
                }}
              >
                <div className="card-body">
                  <RevenueCard />
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-6 col-md-6">
              <EarningGoal />
            </div>

            <div className="col-xl-4 col-lg-12 col-md-12">
              <div className="row">
                <div className="col-6">
                  <div
                    className="card"
                    style={{
                      backgroundColor: "#1F293D",
                      color: "#D6D9E6",
                      height: "240px",
                    }}
                  >
                    <div className="card-body py-3">
                      <div className="text-center">
                        <p className="font-size-15 mb-2">Parts Orders</p>
                        <div className="mini-stat-icon mx-auto mb-2">
                          <span
                            className="avatar-title rounded-circle bg-soft-primary"
                            style={{ width: "45px", height: "45px" }}
                          >
                            <i className="mdi mdi-cart-outline text-primary font-size-20" />
                          </span>
                        </div>
                        <h5 className="font-size-20 mb-2">{partsOrders}</h5>
                        <p className="text-muted font-size-12 mb-2">
                          {partsOrders > 0
                            ? `${Math.min(
                                Math.round((partsOrders / 100) * 100),
                                100
                              )}%`
                            : "0%"}{" "}
                          Progress
                        </p>
                        <div className="progress" style={{ height: 4 }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{
                              width:
                                partsOrders > 0
                                  ? `${Math.min(
                                      Math.round((partsOrders / 100) * 100),
                                      100
                                    )}%`
                                  : "0%",
                            }}
                            aria-valuenow={
                              partsOrders > 0
                                ? Math.round((partsOrders / 100) * 100)
                                : 0
                            }
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    className="card"
                    style={{
                      backgroundColor: "#1F293D",
                      color: "#D6D9E6",
                      height: "240px",
                    }}
                  >
                    <div className="card-body py-3">
                      <div className="text-center">
                        <p className="font-size-15 mb-2">Sellers</p>
                        <div className="mini-stat-icon mx-auto mb-2">
                          <span
                            className="avatar-title rounded-circle bg-soft-success"
                            style={{ width: "45px", height: "45px" }}
                          >
                            <i className="mdi mdi-account-outline text-success font-size-20" />
                          </span>
                        </div>
                        <h5 className="font-size-20 mb-2">{sellerCount}</h5>
                        <p className="text-muted font-size-12 mb-2">
                          {sellerCount > 0
                            ? `${Math.min(
                                Math.round((sellerCount / 50) * 100),
                                100
                              )}%`
                            : "0%"}{" "}
                          Progress
                        </p>
                        <div className="progress" style={{ height: 4 }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{
                              width:
                                sellerCount > 0
                                  ? `${Math.min(
                                      Math.round((sellerCount / 50) * 100),
                                      100
                                    )}%`
                                  : "0%",
                            }}
                            aria-valuenow={
                              sellerCount > 0
                                ? Math.round((sellerCount / 50) * 100)
                                : 0
                            }
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
          </div>

          {/* Row 3: Our Process, Popular Parts, RTX Recycling */}
          <div className="row">
            <div className="col-xl-4 col-lg-4">
              <OurProcess />
            </div>

            <div className="col-xl-4 col-lg-4">
              <PopularPartsCarousel />
            </div>

            <div className="col-xl-4 col-lg-4">
              <RtxRecycling />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

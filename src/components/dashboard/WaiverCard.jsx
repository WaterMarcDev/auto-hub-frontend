import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { waiverAPI } from "../../utils/api";

const WaiverCard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCount: 0,
    withPayment: 0,
    withoutPayment: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaiverStats();
  }, []);

  const fetchWaiverStats = async () => {
    try {
      const response = await waiverAPI.getStats();
      if (response.data && response.data.summary) {
        setStats(response.data.summary);
      }
    } catch (err) {
      console.error("Error fetching waiver stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWaiver = () => {
    navigate("/waivers/add");
  };

  const handleViewAll = () => {
    navigate("/waivers");
  };

  return (
    <div
      className="card"
      style={{
        backgroundColor: "#1F293D",
        color: "#D6D9E6",
        cursor: "pointer",
      }}
    >
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="header-title mb-0">Waivers</h4>
          <button
            className="btn btn-sm btn-primary"
            onClick={handleCreateWaiver}
          >
            <i className="mdi mdi-plus me-1" />
            Create
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="row text-center mb-3">
              <div className="col-4">
                <div className="py-3" onClick={handleViewAll}>
                  <div className="mini-stat-icon mx-auto mb-2">
                    <span className="avatar-title rounded-circle bg-soft-primary">
                      <i className="mdi mdi-file-document-outline text-primary font-size-20" />
                    </span>
                  </div>
                  <h5 className="font-size-18 mb-1">{stats.totalCount}</h5>
                  <p className="text-muted mb-0 font-size-12">Total</p>
                </div>
              </div>
              <div className="col-4">
                <div className="py-3" onClick={handleViewAll}>
                  <div className="mini-stat-icon mx-auto mb-2">
                    <span className="avatar-title rounded-circle bg-soft-success">
                      <i className="mdi mdi-check-circle-outline text-success font-size-20" />
                    </span>
                  </div>
                  <h5 className="font-size-18 mb-1">{stats.withPayment}</h5>
                  <p className="text-muted mb-0 font-size-12">Paid</p>
                </div>
              </div>
              <div className="col-4">
                <div className="py-3" onClick={handleViewAll}>
                  <div className="mini-stat-icon mx-auto mb-2">
                    <span className="avatar-title rounded-circle bg-soft-warning">
                      <i className="mdi mdi-clock-outline text-warning font-size-20" />
                    </span>
                  </div>
                  <h5 className="font-size-18 mb-1">{stats.withoutPayment}</h5>
                  <p className="text-muted mb-0 font-size-12">Pending</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                className="btn btn-outline-light btn-sm w-100"
                onClick={handleViewAll}
              >
                View All Waivers
                <i className="mdi mdi-arrow-right ms-1" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WaiverCard;

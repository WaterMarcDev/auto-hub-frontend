import React, { useEffect, useState } from "react";
import { dashboardAPI } from "../../utils/api";

const InfoCards = () => {
  const [counts, setCounts] = useState({
    carIntakes: 0,
    inventoryItems: 0,
    scrapRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getSummaryCounts();
        const payload = res.data || res;
        if (!mounted) return;
        setCounts({
          carIntakes: payload.carIntakes ?? 0,
          inventoryItems: payload.inventoryItems ?? 0,
          scrapRecords: payload.scrapRecords ?? 0,
        });
      } catch (err) {
        console.error("Failed to load summary counts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="dash-info-widget mt-4 mt-lg-0 py-4 px-3 rounded">
      <div className="media dash-main-border pb-2 mt-2">
        <div className="avatar-sm mb-3 mt-2">
          <span className="avatar-title rounded-circle bg-white shadow">
            <i className="mdi mdi-car text-primary font-size-18" />
          </span>
        </div>
        <div className="media-body ps-3">
          <h4 className="font-size-20">{counts.carIntakes}</h4>
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
          <h4 className="font-size-20">{counts.inventoryItems}</h4>
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
          <h4 className="font-size-20">{counts.scrapRecords}</h4>
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
          style={{ 
            width: counts.carIntakes > 0 
              ? `${Math.min(Math.round((counts.scrapRecords / counts.carIntakes) * 100), 100)}%` 
              : "0%" 
          }}
          aria-valuenow={counts.carIntakes > 0 ? Math.round((counts.scrapRecords / counts.carIntakes) * 100) : 0}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default InfoCards;

import React from "react";

const RightSidebar = () => {
  return (
    <>
      {/* Right Sidebar */}
      <div className="right-bar">
        <div data-simplebar="true" className="h-100">
          <div className="rightbar-title d-flex align-items-center px-3 py-4">
            <h5 className="m-0 me-2">Settings</h5>
            <a href="javascript:void(0);" className="right-bar-toggle ms-auto">
              <i className="mdi mdi-close noti-icon"></i>
            </a>
          </div>

          {/* Settings */}
          <hr className="mt-0" />
          <h6 className="text-center mb-0">Theme Settings</h6>

          <div className="p-4">
            <div className="mb-2">
              <img
                src="/assets/images/layouts/layout-2.jpg"
                className="img-fluid img-thumbnail"
                alt="layout-2"
              />
            </div>

            {/* Dark Mode - Fixed to ON, no toggle */}
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input theme-choice"
                type="checkbox"
                id="dark-mode-switch"
                data-bsstyle="/assets/css/bootstrap-dark.min.css"
                data-appstyle="/assets/css/app-dark.min.css"
                checked
                disabled
              />
              <label className="form-check-label" htmlFor="dark-mode-switch">
                Dark Mode (Fixed)
              </label>
            </div>

            <div className="text-muted small">
              <i className="mdi mdi-information-outline me-1"></i>
              Dark mode is permanently enabled for this application.
            </div>
          </div>
        </div>
      </div>

      {/* Right bar overlay */}
      <div className="rightbar-overlay"></div>
    </>
  );
};

export default RightSidebar;

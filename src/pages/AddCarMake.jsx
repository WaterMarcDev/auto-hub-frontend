import React from "react";

const AddCarMake = () => {
  return (
    <div className="page-title-box">
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col-sm-6">
            <div className="page-title">
              <h4>Add Car Make</h4>
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="javascript: void(0);">Master</a>
                </li>
                <li className="breadcrumb-item active">Add Car Make</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Add Car Make Form</h4>
              <p className="card-description">
                Add a new car make to the system
              </p>

              <form>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="makeName" className="form-label">
                        Make Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="makeName"
                        placeholder="Enter car make name"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="makeCode" className="form-label">
                        Make Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="makeCode"
                        placeholder="Enter make code"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        rows="3"
                        placeholder="Enter description"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">
                        Status
                      </label>
                      <select className="form-select" id="status">
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <button type="submit" className="btn btn-primary me-2">
                      Submit
                    </button>
                    <button type="reset" className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCarMake;

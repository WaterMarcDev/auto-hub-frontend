import React from "react";

const AddCarModel = () => {
  return (
    <div className="page-title-box">
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col-sm-6">
            <div className="page-title">
              <h4>Add Car Model</h4>
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="javascript: void(0);">Master</a>
                </li>
                <li className="breadcrumb-item active">Add Car Model</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Add Car Model Form</h4>
              <p className="card-description">
                Add a new car model to the system
              </p>

              <form>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="makeSelect" className="form-label">
                        Car Make
                      </label>
                      <select className="form-select" id="makeSelect">
                        <option value="">Select Car Make</option>
                        <option value="toyota">Toyota</option>
                        <option value="honda">Honda</option>
                        <option value="ford">Ford</option>
                        <option value="bmw">BMW</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="modelName" className="form-label">
                        Model Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="modelName"
                        placeholder="Enter car model name"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="modelCode" className="form-label">
                        Model Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="modelCode"
                        placeholder="Enter model code"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="year" className="form-label">
                        Year
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="year"
                        placeholder="Enter year"
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

export default AddCarModel;

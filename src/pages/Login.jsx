import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="authentication-bg"
      style={{
        backgroundImage: "url(/assets/images/title-img.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      {/* Background overlay */}
      <div
        className="bg-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(82, 92, 229, 0.8)",
          zIndex: 1,
        }}
      ></div>

      <div className="home-center" style={{ position: "relative", zIndex: 2 }}>
        <div className="home-desc-center">
          <div className="container">
            <div className="home-btn">
              <Link to="/" className="text-white router-link-active">
                <i className="fas fa-home h2"></i>
              </Link>
            </div>
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6 col-xl-5">
                <div
                  className="card"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "none",
                    borderRadius: "15px",
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div className="card-body">
                    <div className="px-2 py-3">
                      <div className="text-center">
                        <Link to="/">
                          <img
                            src="assets/images/logo-dark.png"
                            height="45"
                            alt="logo"
                          />
                        </Link>

                        <h5 className="mb-2 mt-4" style={{ color: "#556ee6" }}>
                          Welcome Back !
                        </h5>
                        <p className="mb-4" style={{ color: "#6c757d" }}>
                          Sign in to continue to Scrap Yard.
                        </p>
                      </div>
                      <form
                        className="form-horizontal mt-4 pt-2"
                        onSubmit={handleSubmit}
                      >
                        {/* Error Alert */}
                        {error && (
                          <div className="alert alert-danger" role="alert">
                            {error}
                          </div>
                        )}

                        <div className="mb-3">
                          <label
                            htmlFor="email"
                            // style={{
                            //   color: "black !important",
                            //   fontWeight: "500",
                            // }}
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            style={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #dee2e6",
                              color: "#495057",
                            }}
                          />
                        </div>

                        <div className="mb-3">
                          <label
                            htmlFor="userpassword"
                            style={{ color: "#495057", fontWeight: "500" }}
                          >
                            Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="userpassword"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            style={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #dee2e6",
                              color: "#495057",
                            }}
                          />
                        </div>
                        <div className="mb-3">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="customControlInline"
                              name="rememberMe"
                              checked={formData.rememberMe}
                              onChange={handleChange}
                              disabled={loading}
                            />
                            <label
                              className="form-label"
                              htmlFor="customControlInline"
                              style={{ color: "#495057" }}
                            >
                              Remember me
                            </label>
                          </div>
                        </div>
                        <div>
                          <button
                            className="btn btn-primary w-100 waves-effect waves-light"
                            type="submit"
                            disabled={loading}
                            style={{
                              backgroundColor: "#556ee6",
                              borderColor: "#556ee6",
                              borderRadius: "8px",
                              padding: "0.75rem 1rem",
                              fontWeight: "500",
                            }}
                          >
                            {loading ? "Logging In..." : "Log In"}
                          </button>
                        </div>
                        <div className="mt-4 text-center">
                          <Link
                            to="/auth-recoverpw"
                            style={{ color: "#6c757d", textDecoration: "none" }}
                          >
                            <i className="mdi mdi-lock me-1"></i> Forgot your
                            password?
                          </Link>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-center text-white">
                  <p>
                    Don't have an account ?
                    <Link to="/auth-register" className="fw-bold text-white">
                      {" "}
                      Register
                    </Link>
                  </p>
                  <p>
                    © {new Date().getFullYear()} © Copyright Scrap Yard, All
                    Right Reserverd. Developed by WaterMarc | For Support Email
                    at : info@watermarc.in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End Log In page */}
      </div>
    </div>
  );
};

export default Login;

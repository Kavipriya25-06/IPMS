import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../Config";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  // Password validation function
  const validatePassword = (password) => {
    const validations = [
      /.{8,}/, // min 8 chars
      /[A-Z]/, // uppercase letter
      /[a-z]/, // lowercase letter
      /\d/, // digit
      /[!@#$%^&*(),.?":{}|<>]/, // special char
    ];

    let passedRules = validations.reduce(
      (acc, regex) => (regex.test(password) ? acc + 1 : acc),
      0
    );

    if (password.length === 0) return "";

    if (passedRules <= 2) return "Low";
    else if (passedRules === 3 || passedRules === 4) return "Medium";
    else if (passedRules === 5) return "Good";

    return "";
  };

  useEffect(() => {
    setPasswordStrength(validatePassword(newPassword));
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    // Check all rules before submit
    if (passwordStrength !== "Good") {
      setError(
        "Password strength must be good. It should be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseURL}/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, token, password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessToast("Password reset successful! Redirecting to login...");
        setError("");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        showErrorToast(data.error || "Failed to reset password.");
        setSuccess("");
      }
    } catch (err) {
      console.error("Reset error:", err);
      setError("Something went wrong.");
      setSuccess("");
    }
  };

  return (
    <div className="homepage-wrapper">
      <div className="reset-container">
        <h2>Reset Password</h2>
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group-horizontal">
            <label>New Password:</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                aria-describedby="password-strength"
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setShowPassword(!showPassword);
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {newPassword && (
            <p
              id="password-strength"
              className={`password-strength ${passwordStrength.toLowerCase()}`}
            >
              Password strength: {passwordStrength}
            </p>
          )}

          <div className="button-wrapper">
            <button type="submit" className="submit-button">
              Set New Password
            </button>
          </div>
        </form>
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default ResetPassword;

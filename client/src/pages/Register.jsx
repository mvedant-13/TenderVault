import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { registerSchema } from "../utils/validationSchemas";
import { useAuth } from "../context/useAuth";
import "./AuthPages.css";

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (formData) => {
    setServerError("");
    try {
      await registerUser(formData);
      navigate("/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <div className="auth-page">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" {...register("name")} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="field-error">{errors.email.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="field-error">{errors.password.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select id="role" {...register("role")} defaultValue="">
            <option value="" disabled>
              Select role
            </option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <p className="field-error">{errors.role.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input id="companyName" {...register("companyName")} />
        </div>

        <div className="form-group">
          <label htmlFor="gstNumber">GST Number</label>
          <input id="gstNumber" {...register("gstNumber")} />
        </div>

        {serverError && <p className="server-error">{serverError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;

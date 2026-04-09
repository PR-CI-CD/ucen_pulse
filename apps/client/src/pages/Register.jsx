import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Handle input changes
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Placeholder handler for future API integration
    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        console.log("Register form submitted:", formData);

        // Future backend integration will be added here
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="auth-container max-w-md mx-auto mt-16 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

            <form onSubmit={handleSubmit} noValidate aria-describedby={error ? "form-error" : undefined}>
                {/* Full Name */}
                <div className="mb-4">
                    <label htmlFor="fullName" className="block font-medium mb-1">
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        aria-invalid={!!error}
                        aria-describedby={error ? "form-error" : undefined}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="block font-medium mb-1">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        aria-invalid={!!error}
                        aria-describedby={error ? "form-error" : undefined}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Password */}
                <div className="mb-6">
                    <label htmlFor="password" className="block font-medium mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        aria-required="true"
                        aria-invalid={!!error}
                        aria-describedby={error ? "form-error" : "password-hint"}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p id="password-hint" className="text-sm text-gray-500 mt-1">
                        Password must be at least 6 characters long.
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    aria-busy={isLoading}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:opacity-90 transition disabled:opacity-50"
                >
                    {isLoading ? "Creating Account..." : "Register"}
                </button>
            </form>

            {/* Login Link */}
            <p className="mt-4 text-center">
                Have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                    Log in here
                </Link>
            </p>

            {/* Error Message */}
            {error && (
                <p
                    id="form-error"
                    className="error-message text-red-600 text-center mt-4"
                    role="alert"
                    aria-live="assertive"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
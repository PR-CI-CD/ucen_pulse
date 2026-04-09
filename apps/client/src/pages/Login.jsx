import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        console.log("Login form submitted:", formData);

        // Future implementation will authenticate with the backend
        // Example:
        // await fetch("http://localhost:3001/api/auth/login", { ... })

        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="auth-container max-w-md mx-auto mt-16 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

            <form
                onSubmit={handleSubmit}
                noValidate
                aria-describedby={error ? "form-error" : undefined}
            >
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

                <div className="mb-6">
                    <label htmlFor="password" className="block font-medium mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        aria-invalid={!!error}
                        aria-describedby={error ? "form-error" : undefined}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    aria-busy={isLoading}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:opacity-90 transition disabled:opacity-50"
                >
                    {isLoading ? "Signing in..." : "Login"}
                </button>
            </form>

            <p className="mt-4 text-center">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                    Register here
                </Link>
            </p>

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
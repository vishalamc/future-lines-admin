import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    // ==================================================
    // LOGIN
    // ==================================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);


        try {

            const response = await fetch(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );


            const data = await response.json();


            // ------------------------------------------
            // LOGIN FAILED
            // ------------------------------------------

            if (!response.ok) {

                setError(
                    data.message ||
                    "Invalid email or password."
                );

                return;

            }


            // ------------------------------------------
            // CHECK USER
            // ------------------------------------------

            if (!data.user) {

                setError(
                    "Login successful, but user information was not returned."
                );

                return;

            }


            console.log(
                "Logged in user:",
                data.user
            );


            // ------------------------------------------
            // ADMIN LOGIN
            // ------------------------------------------

            if (data.user.role === "admin") {

                navigate("/dashboard");

                return;

            }


            // ------------------------------------------
            // STUDENT LOGIN
            // ------------------------------------------

            if (data.user.role === "student") {

                /*
                 * If you later implement the
                 * must_change_password feature,
                 * we can check it here.
                 */

                if (
                    data.user.must_change_password === true
                ) {

                    navigate("/change-password");

                    return;

                }


                navigate("/student-dashboard");

                return;

            }


            // ------------------------------------------
            // UNKNOWN ROLE
            // ------------------------------------------

            setError(
                "Your account role is not configured correctly."
            );


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            setError(
                "Unable to connect to the server."
            );


        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="login-page">


            <div className="login-container">


                {/* ==================================================
                    LEFT SIDE
                ================================================== */}

                <div className="login-left">


                    <div className="brand">


                        <div className="brand-logo">
                            FL
                        </div>


                        <div>

                            <h2>
                                Future Lines
                            </h2>

                            <p>
                                Computer Education
                            </p>

                        </div>


                    </div>


                    <div className="welcome-content">


                        <h1>
                            Sign IN
                        </h1>


                        <p>
                            Login to access your
                            Future Lines account.
                        </p>


                    </div>


                </div>


                {/* ==================================================
                    RIGHT SIDE
                ================================================== */}

                <div className="login-right">


                    <div className="login-card">


                        <h1>
                            Login
                        </h1>


                        <p className="login-subtitle">
                            Sign in to continue to your portal
                        </p>


                        {/* ERROR */}

                        {error && (

                            <div className="error-message">
                                {error}
                            </div>

                        )}


                        {/* FORM */}

                        <form onSubmit={handleLogin}>


                            {/* EMAIL */}

                            <div className="form-group">


                                <label>
                                    Email Address
                                </label>


                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    autoComplete="email"
                                    required
                                />


                            </div>


                            {/* PASSWORD */}

                            <div className="form-group">


                                <label>
                                    Password
                                </label>


                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    autoComplete="current-password"
                                    required
                                />


                            </div>


                            {/* LOGIN BUTTON */}

                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading}
                            >

                                {loading
                                    ? "Signing in..."
                                    : "Sign In"
                                }

                            </button>


                        </form>


                        <p className="login-footer">
                            Future Lines
                        </p>


                    </div>


                </div>


            </div>


        </div>

    );

}


export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ChangePassword.css";


function ChangePassword() {

    const navigate = useNavigate();


    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");


    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ==================================================
    // CHANGE PASSWORD
    // ==================================================

    const handleChangePassword = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        // ------------------------------------------------
        // Check new password
        // ------------------------------------------------

        if (newPassword.length < 6) {

            setError(
                "New password must contain at least 6 characters."
            );

            return;
        }


        // ------------------------------------------------
        // Confirm password
        // ------------------------------------------------

        if (
            newPassword !== confirmPassword
        ) {

            setError(
                "New password and confirm password do not match."
            );

            return;
        }


        setLoading(true);


        try {

            const response =
                await fetch(
                    "/api/auth/change-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "include",

                        body: JSON.stringify({

                            currentPassword,

                            newPassword

                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "CHANGE PASSWORD RESPONSE:",
                data
            );


            // ------------------------------------------------
            // Error
            // ------------------------------------------------

            if (!response.ok) {

                setError(
                    data.message ||
                    "Unable to change password."
                );

                return;
            }


            // ------------------------------------------------
            // Success
            // ------------------------------------------------

            setSuccess(
                "Password changed successfully."
            );


            // ------------------------------------------------
            // Clear fields
            // ------------------------------------------------

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");


            // ------------------------------------------------
            // Go to student dashboard
            // ------------------------------------------------

            setTimeout(() => {

                navigate(
                    "/student-dashboard",
                    {
                        replace: true
                    }
                );

            }, 1000);


        } catch (error) {

            console.error(
                "CHANGE PASSWORD ERROR:",
                error
            );


            setError(
                "Unable to connect to the server."
            );


        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // PAGE
    // ==================================================

    return (

        <div className="change-password-page">

            <div className="change-password-card">


                {/* HEADER */}

                <div className="change-password-header">

                    <div className="change-password-logo">
                        FL
                    </div>


                    <h1>
                        Change Password
                    </h1>


                    <p>
                        Please create a new password
                        for your account.
                    </p>

                </div>


                {/* ERROR */}

                {error && (

                    <div
                        className="password-error"
                        role="alert"
                    >
                        {error}
                    </div>

                )}


                {/* SUCCESS */}

                {success && (

                    <div
                        className="password-success"
                        role="status"
                    >
                        {success}
                    </div>

                )}


                {/* FORM */}

                <form
                    onSubmit={handleChangePassword}
                >


                    {/* CURRENT PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="currentPassword">
                            Current Password
                        </label>


                        <input
                            id="currentPassword"

                            type="password"

                            placeholder="Enter current password"

                            value={currentPassword}

                            onChange={(e) =>
                                setCurrentPassword(
                                    e.target.value
                                )
                            }

                            autoComplete="current-password"

                            required

                            disabled={loading}
                        />

                    </div>


                    {/* NEW PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="newPassword">
                            New Password
                        </label>


                        <input
                            id="newPassword"

                            type="password"

                            placeholder="Enter new password"

                            value={newPassword}

                            onChange={(e) =>
                                setNewPassword(
                                    e.target.value
                                )
                            }

                            autoComplete="new-password"

                            required

                            disabled={loading}
                        />

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="confirmPassword">
                            Confirm New Password
                        </label>


                        <input
                            id="confirmPassword"

                            type="password"

                            placeholder="Confirm new password"

                            value={confirmPassword}

                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }

                            autoComplete="new-password"

                            required

                            disabled={loading}
                        />

                    </div>


                    {/* BUTTON */}

                    <button
                        type="submit"

                        className="change-password-button"

                        disabled={loading}
                    >

                        {loading
                            ? "Changing Password..."
                            : "Change Password"
                        }

                    </button>


                </form>


                <div className="change-password-footer">

                    <p>
                        Future Lines
                    </p>

                </div>


            </div>

        </div>

    );

}


export default ChangePassword;

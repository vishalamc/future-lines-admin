import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";


function ProtectedRoute({ children, role }) {

    const [loading, setLoading] =
        useState(true);

    const [user, setUser] =
        useState(null);


    // ==================================================
    // CHECK AUTHENTICATION
    // ==================================================

    useEffect(() => {

        let isMounted = true;


        const checkAuthentication = async () => {

            try {

                console.log(
                    "Checking authentication..."
                );


                const response =
                    await fetch(
                        "/api/auth/me",
                        {
                            method: "GET",

                            credentials: "include",

                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                console.log(
                    "AUTH RESPONSE STATUS:",
                    response.status
                );


                // ------------------------------------------------
                // NOT AUTHENTICATED
                // ------------------------------------------------

                if (!response.ok) {

                    let errorData = null;

                    try {

                        errorData =
                            await response.json();

                    } catch {

                        errorData = null;

                    }


                    console.log(
                        "AUTHENTICATION FAILED:",
                        errorData
                    );


                    if (isMounted) {

                        setUser(null);

                    }

                    return;
                }


                // ------------------------------------------------
                // Read response
                // ------------------------------------------------

                const data =
                    await response.json();


                console.log(
                    "AUTH RESPONSE:",
                    data
                );


                // ------------------------------------------------
                // Validate user
                // ------------------------------------------------

                if (
                    !data ||
                    !data.success ||
                    !data.user
                ) {

                    console.error(
                        "Invalid authentication response:",
                        data
                    );


                    if (isMounted) {

                        setUser(null);

                    }

                    return;
                }


                console.log(
                    "Authenticated user:",
                    data.user
                );


                if (isMounted) {

                    setUser(
                        data.user
                    );

                }

            } catch (error) {

                console.error(
                    "Authentication request error:",
                    error
                );


                if (isMounted) {

                    setUser(null);

                }

            } finally {

                if (isMounted) {

                    setLoading(false);

                }

            }

        };


        checkAuthentication();


        // ------------------------------------------------
        // Cleanup
        // ------------------------------------------------

        return () => {

            isMounted = false;

        };

    }, []);


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div className="loading-screen">

                <div className="loading-content">

                    <div className="loading-spinner">
                    </div>

                    <p>
                        Checking authentication...
                    </p>

                </div>

            </div>

        );

    }


    // ==================================================
    // NOT LOGGED IN
    // ==================================================

    if (!user) {

        console.log(
            "No authenticated user. Redirecting to login."
        );


        return (

            <Navigate
                to="/login"
                replace
            />

        );

    }


    // ==================================================
    // ROLE CHECK
    // ==================================================

    if (
        role &&
        user.role !== role
    ) {

        console.log(
            "ROLE MISMATCH:",
            {
                requiredRole: role,
                actualRole: user.role
            }
        );


        // ------------------------------------------------
        // ADMIN
        // ------------------------------------------------

        if (
            user.role === "admin"
        ) {

            return (

                <Navigate
                    to="/dashboard"
                    replace
                />

            );

        }


        // ------------------------------------------------
        // STUDENT
        // ------------------------------------------------

        if (
            user.role === "student"
        ) {

            return (

                <Navigate
                    to="/student-dashboard"
                    replace
                />

            );

        }


        // ------------------------------------------------
        // UNKNOWN ROLE
        // ------------------------------------------------

        return (

            <Navigate
                to="/login"
                replace
            />

        );

    }


    // ==================================================
    // AUTHENTICATED
    // ==================================================

    console.log(
        "Protected route access granted:",
        user
    );


    return children;

}
export default ProtectedRoute;

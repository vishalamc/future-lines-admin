import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProtectedRoute({ children, role }) {

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);


    useEffect(() => {

        checkAuthentication();

    }, []);


    const checkAuthentication = async () => {

        try {

            const response = await fetch(
                "/api/auth/me",
                {
                    credentials: "include",
                }
            );


            if (!response.ok) {

                setUser(null);

                return;

            }


            const data = await response.json();


            console.log("Authenticated user:", data.user);


            setUser(data.user);


        } catch (error) {

            console.error(
                "Authentication error:",
                error
            );

            setUser(null);

        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div className="loading-screen">

                Checking authentication...

            </div>

        );

    }


    // ==================================================
    // NOT LOGGED IN
    // ==================================================

    if (!user) {

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


        // Admin trying to access student page

        if (user.role === "admin") {

            return (
                <Navigate
                    to="/dashboard"
                    replace
                />
            );

        }


        // Student trying to access admin page

        if (user.role === "student") {

            return (
                <Navigate
                    to="/student-dashboard"
                    replace
                />
            );

        }


        // Unknown role

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // ==================================================
    // AUTHENTICATED + CORRECT ROLE
    // ==================================================

    return children;

}


export default ProtectedRoute;

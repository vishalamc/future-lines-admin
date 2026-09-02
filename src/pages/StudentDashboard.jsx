import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./StudentDashboard.css";


function StudentDashboard() {

    const navigate = useNavigate();


    // ==================================================
    // STATE
    // ==================================================

    const [student, setStudent] = useState(null);

    const [attendance, setAttendance] = useState({
        totalClasses: 0,
        present: 0,
        absent: 0,
        percentage: "0.0",
    });

    const [attendanceRecords, setAttendanceRecords] = useState([]);

    const [loading, setLoading] = useState(true);

    const [attendanceLoading, setAttendanceLoading] = useState(true);

    const [error, setError] = useState("");

    const [attendanceError, setAttendanceError] = useState("");


    // ==================================================
    // LOAD DASHBOARD DATA
    // ==================================================

    useEffect(() => {

        loadStudentProfile();

        loadMyAttendance();

    }, []);


    // ==================================================
    // LOAD STUDENT PROFILE
    // ==================================================

    const loadStudentProfile = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await fetch(
                "/api/students/my-profile",
                {
                    credentials: "include",
                }
            );


            if (response.status === 401) {

                navigate("/login");

                return;

            }


            if (response.status === 403) {

                navigate("/login");

                return;

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load student profile."
                );

            }


            if (data.success) {

                setStudent(
                    data.student
                );

            } else {

                throw new Error(
                    data.message ||
                    "Unable to load student profile."
                );

            }


        } catch (error) {

            console.error(
                "Student profile error:",
                error
            );


            setError(
                error.message ||
                "Unable to load student information."
            );


        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // LOAD MY ATTENDANCE
    // ==================================================

    const loadMyAttendance = async () => {

        try {

            setAttendanceLoading(true);

            setAttendanceError("");


            const response = await fetch(
                "/api/attendance/my-attendance",
                {
                    credentials: "include",
                }
            );


            if (response.status === 401) {

                navigate("/login");

                return;

            }


            if (response.status === 403) {

                navigate("/login");

                return;

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load attendance."
                );

            }


            if (data.success) {

                setAttendance(
                    data.summary || {
                        totalClasses: 0,
                        present: 0,
                        absent: 0,
                        percentage: "0.0",
                    }
                );


                setAttendanceRecords(
                    data.records || []
                );

            } else {

                throw new Error(
                    data.message ||
                    "Unable to load attendance."
                );

            }


        } catch (error) {

            console.error(
                "Attendance loading error:",
                error
            );


            setAttendanceError(
                error.message ||
                "Unable to load attendance."
            );


        } finally {

            setAttendanceLoading(false);

        }

    };


    // ==================================================
    // LOGOUT
    // ==================================================

    const handleLogout = async () => {

        try {

            await fetch(
                "/api/auth/logout",
                {
                    method: "POST",
                    credentials: "include",
                }
            );


            navigate(
                "/login",
                {
                    replace: true,
                }
            );


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );


            navigate(
                "/login",
                {
                    replace: true,
                }
            );

        }

    };


    // ==================================================
    // INITIAL
    // ==================================================

    const getInitial = () => {

        if (!student?.name) {

            return "S";

        }


        return student.name
            .charAt(0)
            .toUpperCase();

    };


    // ==================================================
    // FORMAT DATE
    // ==================================================

    const formatDate = (dateValue) => {

        if (!dateValue) {

            return "-";

        }


        try {

            return new Date(
                dateValue
            ).toLocaleDateString(
                "en-IN"
            );

        } catch {

            return dateValue;

        }

    };


    // ==================================================
    // FORMAT TIME
    // ==================================================

    const formatTime = (timeValue) => {

        if (!timeValue) {

            return "-";

        }


        return String(
            timeValue
        ).slice(0, 5);

    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div className="student-loading">

                <div className="student-loader"></div>

                <p>
                    Loading your dashboard...
                </p>

            </div>

        );

    }


    // ==================================================
    // ERROR
    // ==================================================

    if (error) {

        return (

            <div className="student-error-page">

                <div className="student-error-box">

                    <div className="student-error-icon">
                        !
                    </div>


                    <h2>
                        Unable to Load Dashboard
                    </h2>


                    <p>
                        {error}
                    </p>


                    <button
                        onClick={loadStudentProfile}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    // ==================================================
    // RETURN
    // ==================================================

    return (

        <div className="student-dashboard">


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside className="student-sidebar">


                {/* BRAND */}

                <div className="student-sidebar-brand">

                    <div className="student-sidebar-logo">
                        FL
                    </div>


                    <div>

                        <h2>
                            Future Lines
                        </h2>

                        <span>
                            Student Portal
                        </span>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="student-nav">


                    {/* DASHBOARD */}

                    <a
                        href="#dashboard"
                        className="student-nav-link active"
                    >

                        <span className="nav-icon">
                            🏠
                        </span>

                        Dashboard

                    </a>


                    {/* PROFILE */}

                    <a
                        href="#profile"
                        className="student-nav-link"
                    >

                        <span className="nav-icon">
                            👤
                        </span>

                        My Profile

                    </a>


                    {/* WEEKLY TESTS */}

                    <a
                        href="#tests"
                        className="student-nav-link"
                    >

                        <span className="nav-icon">
                            📝
                        </span>

                        Weekly Tests

                    </a>


                    {/* ATTENDANCE */}

                    <a
                        href="#attendance"
                        className="student-nav-link"
                    >

                        <span className="nav-icon">
                            📅
                        </span>

                        Attendance

                    </a>


                    {/* CHANGE PASSWORD */}

                    <a
                        href="#password"
                        className="student-nav-link"
                    >

                        <span className="nav-icon">
                            🔐
                        </span>

                        Change Password

                    </a>


                </nav>


                {/* LOGOUT */}

                <button
                    className="student-logout"
                    onClick={handleLogout}
                >

                    <span>
                        ↪
                    </span>

                    Logout

                </button>


            </aside>


{/* ==================================================
    MOBILE LOGOUT
================================================== */}

<button
    className="student-mobile-logout"
    onClick={handleLogout}
>
    <span>↪</span>
    Logout
</button>


{/* ==================================================
    MAIN CONTENT
================================================== */}

<main className="student-main">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="student-header">


                    <div>

                        <h1>
                            Student Dashboard
                        </h1>

                        <p>

                            Welcome back,{" "}

                            <strong>
                                {student?.name}
                            </strong>

                        </p>

                    </div>


                    <div className="student-header-profile">


                        <div className="student-avatar">

                            {getInitial()}

                        </div>


                        <div>

                            <strong>
                                {student?.name}
                            </strong>

                            <span>
                                {student?.student_id}
                            </span>

                        </div>


                    </div>


                </header>


                {/* ==================================================
                    CONTENT
                ================================================== */}

                <section className="student-content">


                    {/* ==================================================
                        PROFILE HERO
                    ================================================== */}

                    <div className="student-profile-card">


                        <div className="profile-main">


                            <div className="large-student-avatar">

                                {getInitial()}

                            </div>


                            <div className="profile-main-info">

                                <h2>
                                    {student?.name}
                                </h2>


                                <p>

                                    Student ID:{" "}

                                    <strong>
                                        {student?.student_id}
                                    </strong>

                                </p>


                                <span className="course-badge">

                                    {student?.course ||
                                        "Course Not Assigned"}

                                </span>

                            </div>

                        </div>


                        <div className="profile-status">

                            <span className="status-dot"></span>

                            Active Student

                        </div>

                    </div>


                    {/* ==================================================
                        STAT CARDS
                    ================================================== */}

                    <div className="student-stat-grid">


                        {/* COURSE */}

                        <div className="student-stat-card">

                            <div className="student-stat-icon">
                                📚
                            </div>


                            <div>

                                <span>
                                    Current Course
                                </span>


                                <h3>
                                    {student?.course ||
                                        "Not Assigned"}
                                </h3>

                            </div>

                        </div>


                        {/* TESTS */}

                        <div className="student-stat-card">

                            <div className="student-stat-icon">
                                📝
                            </div>


                            <div>

                                <span>
                                    Weekly Tests
                                </span>


                                <h3>
                                    0
                                </h3>

                            </div>

                        </div>


                        {/* TEST AVERAGE */}

                        <div className="student-stat-card">

                            <div className="student-stat-icon">
                                📊
                            </div>


                            <div>

                                <span>
                                    Test Average
                                </span>


                                <h3>
                                    0%
                                </h3>

                            </div>

                        </div>


                        {/* ATTENDANCE */}

                        <div className="student-stat-card">

                            <div className="student-stat-icon">
                                📅
                            </div>


                            <div>

                                <span>
                                    Attendance
                                </span>


                                <h3>

                                    {attendanceLoading
                                        ? "..."
                                        : `${attendance.percentage}%`}

                                </h3>

                            </div>

                        </div>


                    </div>


                    {/* ==================================================
                        PROFILE
                    ================================================== */}

                    <div
                        id="profile"
                        className="student-section"
                    >


                        <div className="student-section-header">

                            <div>

                                <h2>
                                    My Profile
                                </h2>


                                <p>
                                    Your registered information
                                </p>

                            </div>

                        </div>


                        <div className="profile-grid">


                            <div className="profile-item">

                                <span>
                                    Student ID
                                </span>


                                <strong>
                                    {student?.student_id ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="profile-item">

                                <span>
                                    Full Name
                                </span>


                                <strong>
                                    {student?.name ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="profile-item">

                                <span>
                                    Email
                                </span>


                                <strong>
                                    {student?.email ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="profile-item">

                                <span>
                                    Phone
                                </span>


                                <strong>
                                    {student?.phone ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="profile-item">

                                <span>
                                    Course
                                </span>


                                <strong>
                                    {student?.course ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="profile-item">

                                <span>
                                    Gender
                                </span>


                                <strong>
                                    {student?.gender ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="profile-item">

                                <span>
                                    Date of Birth
                                </span>


                                <strong>

                                    {student?.date_of_birth
                                        ? new Date(
                                            student.date_of_birth
                                        ).toLocaleDateString(
                                            "en-IN"
                                        )
                                        : "-"}

                                </strong>

                            </div>


                            <div className="profile-item">

                                <span>
                                    Admission Date
                                </span>


                                <strong>

                                    {student?.admission_date
                                        ? new Date(
                                            student.admission_date
                                        ).toLocaleDateString(
                                            "en-IN"
                                        )
                                        : "-"}

                                </strong>

                            </div>


                            <div className="profile-item profile-full">

                                <span>
                                    Address
                                </span>


                                <strong>
                                    {student?.address ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="profile-item">

                                <span>
                                    City
                                </span>


                                <strong>
                                    {student?.city ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="profile-item">

                                <span>
                                    State
                                </span>


                                <strong>
                                    {student?.state ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="profile-item">

                                <span>
                                    PIN Code
                                </span>


                                <strong>
                                    {student?.pin_code ||
                                        "-"}
                                </strong>

                            </div>


                        </div>

                    </div>


                    {/* ==================================================
                        WEEKLY TESTS
                    ================================================== */}

                    <div
                        id="tests"
                        className="student-section"
                    >


                        <div className="student-section-header">

                            <div>

                                <h2>
                                    Weekly Tests
                                </h2>


                                <p>
                                    Your latest test performance
                                </p>

                            </div>

                        </div>


                        <div className="empty-student-data">

                            <div className="empty-data-icon">
                                📝
                            </div>


                            <h3>
                                No Tests Available
                            </h3>


                            <p>

                                Your weekly test results
                                will appear here once
                                tests are added.

                            </p>

                        </div>


                    </div>


                    {/* ==================================================
                        ATTENDANCE
                    ================================================== */}

                    <div
                        id="attendance"
                        className="student-section"
                    >


                        <div className="student-section-header">

                            <div>

                                <h2>
                                    Attendance
                                </h2>


                                <p>
                                    Your complete attendance record
                                </p>

                            </div>

                        </div>


                        {/* ATTENDANCE ERROR */}

                        {attendanceError && (

                            <div className="attendance-error-message">

                                <span>
                                    {attendanceError}
                                </span>


                                <button
                                    onClick={
                                        loadMyAttendance
                                    }
                                >
                                    Try Again
                                </button>

                            </div>

                        )}


                        {/* ATTENDANCE LOADING */}

                        {attendanceLoading ? (

                            <div className="attendance-loading-box">

                                <div className="student-loader"></div>


                                <p>
                                    Loading attendance...
                                </p>

                            </div>

                        ) : (

                            <>

                                {/* ======================================
                                    ATTENDANCE SUMMARY
                                ====================================== */}

                                <div className="attendance-placeholder">


                                    {/* CIRCLE */}

                                    <div className="attendance-circle">

                                        <span>
                                            {attendance.percentage}%
                                        </span>


                                        <small>
                                            Attendance
                                        </small>

                                    </div>


                                    {/* COUNTS */}

                                    <div className="attendance-info">


                                        <div>

                                            <span>
                                                Present
                                            </span>


                                            <strong className="attendance-present">
                                                {attendance.present}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Absent
                                            </span>


                                            <strong className="attendance-absent">
                                                {attendance.absent}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Total Classes
                                            </span>


                                            <strong>
                                                {attendance.totalClasses}
                                            </strong>

                                        </div>


                                    </div>


                                </div>


                                {/* ======================================
                                    ATTENDANCE HISTORY
                                ====================================== */}

                                <div className="attendance-history">


                                    <div className="attendance-history-header">

                                        <div>

                                            <h3>
                                                Attendance History
                                            </h3>


                                            <p>
                                                Your latest attendance records
                                            </p>

                                        </div>

                                    </div>


                                    {attendanceRecords.length === 0 ? (

                                        <div className="empty-student-data">

                                            <div className="empty-data-icon">
                                                📅
                                            </div>


                                            <h3>
                                                No Attendance Records
                                            </h3>


                                            <p>

                                                Your attendance records will
                                                appear here once attendance is
                                                marked.

                                            </p>

                                        </div>

                                    ) : (

                                        <div className="student-attendance-table-wrapper">


                                            <table className="student-attendance-table">


                                                <thead>

                                                    <tr>

                                                        <th>
                                                            #
                                                        </th>


                                                        <th>
                                                            Date
                                                        </th>


                                                        <th>
                                                            Class Time
                                                        </th>


                                                        <th>
                                                            Status
                                                        </th>

                                                    </tr>

                                                </thead>


                                                <tbody>

                                                    {attendanceRecords.map(
                                                        (
                                                            record,
                                                            index
                                                        ) => (

                                                            <tr
                                                                key={
                                                                    record.id
                                                                }
                                                            >

                                                                <td>
                                                                    {index + 1}
                                                                </td>


                                                                <td>

                                                                    {formatDate(
                                                                        record.attendance_date
                                                                    )}

                                                                </td>


                                                                <td>

                                                                    {formatTime(
                                                                        record.start_time
                                                                    )}

                                                                    {" - "}

                                                                    {formatTime(
                                                                        record.end_time
                                                                    )}

                                                                </td>


                                                                <td>

                                                                    {String(
                                                                        record.status
                                                                    ).toLowerCase() ===
                                                                    "present" ? (

                                                                        <span className="student-present-badge">
                                                                            ✓ Present
                                                                        </span>

                                                                    ) : (

                                                                        <span className="student-absent-badge">
                                                                            ✕ Absent
                                                                        </span>

                                                                    )}

                                                                </td>

                                                            </tr>

                                                        )
                                                    )}

                                                </tbody>


                                            </table>

                                        </div>

                                    )}

                                </div>

                            </>

                        )}

                    </div>


                    {/* ==================================================
                        CHANGE PASSWORD
                    ================================================== */}

                    <div
                        id="password"
                        className="student-section password-section"
                    >


                        <div className="student-section-header">

                            <div>

                                <h2>
                                    Account Security
                                </h2>


                                <p>
                                    Keep your account secure
                                </p>

                            </div>

                        </div>


                        <div className="password-card">


                            <div className="password-card-icon">
                                🔐
                            </div>


                            <div>

                                <h3>
                                    Change Password
                                </h3>


                                <p>

                                    Update your login password
                                    to keep your account secure.

                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    navigate(
                                        "/change-password"
                                    )
                                }
                            >
                                Change Password
                            </button>


                        </div>

                    </div>


                </section>


            </main>


        </div>

    );

}

export default StudentDashboard;

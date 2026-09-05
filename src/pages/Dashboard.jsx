import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

function Dashboard() {

    const navigate = useNavigate();

    // ==================================================
    // STATES
    // ==================================================

    const [user, setUser] = useState(null);

    const [totalStudents, setTotalStudents] = useState(0);

    const [loadingStudents, setLoadingStudents] =
        useState(true);

    const [loggingOut, setLoggingOut] =
        useState(false);

    // ==================================================
    // FEE STATES
    // ==================================================

    const [feeSummary, setFeeSummary] = useState({
        fee_students: 0,
        total_fee: 0,
        total_collected: 0,
        total_pending: 0,
        paid_students: 0,
        partial_students: 0,
        pending_students: 0,
    });

    const [loadingFees, setLoadingFees] =
        useState(true);


    // ==================================================
    // LOAD DATA
    // ==================================================

    useEffect(() => {

        loadUser();

        loadStudentCount();

        loadFeeSummary();

    }, []);


    // ==================================================
    // LOAD CURRENT USER
    // ==================================================

    const loadUser = async () => {

        try {

            const response = await fetch(
                "/api/auth/me",
                {
                    credentials: "include",
                }
            );


            if (!response.ok) {

                navigate("/login");

                return;

            }


            const data =
                await response.json();


            if (
                !data.user ||
                data.user.role !== "admin"
            ) {

                navigate("/login");

                return;

            }


            setUser(data.user);


        } catch (error) {

            console.error(
                "User loading error:",
                error
            );

            navigate("/login");

        }

    };


    // ==================================================
    // LOAD STUDENT COUNT
    // ==================================================

    const loadStudentCount = async () => {

        try {

            setLoadingStudents(true);


            const response = await fetch(
                "/api/students/all",
                {
                    credentials: "include",
                }
            );


            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    navigate("/login");

                    return;

                }


                throw new Error(
                    "Failed to load students"
                );

            }


            const data =
                await response.json();


            if (
                data.success &&
                Array.isArray(data.students)
            ) {

                setTotalStudents(
                    data.students.length
                );

            }


        } catch (error) {

            console.error(
                "Student count error:",
                error
            );

        } finally {

            setLoadingStudents(false);

        }

    };


    // ==================================================
    // LOAD FEE SUMMARY
    // ==================================================

    const loadFeeSummary = async () => {

        try {

            setLoadingFees(true);


            const response = await fetch(
                "/api/fees/dashboard-summary",
                {
                    credentials: "include",
                }
            );


            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    navigate("/login");

                    return;

                }


                throw new Error(
                    "Failed to load fee summary"
                );

            }


            const data =
                await response.json();


            if (
                data.success &&
                data.summary
            ) {

                setFeeSummary({

                    fee_students:
                        Number(
                            data.summary.fee_students ||
                            0
                        ),

                    total_fee:
                        Number(
                            data.summary.total_fee ||
                            0
                        ),

                    total_collected:
                        Number(
                            data.summary.total_collected ||
                            0
                        ),

                    total_pending:
                        Number(
                            data.summary.total_pending ||
                            0
                        ),

                    paid_students:
                        Number(
                            data.summary.paid_students ||
                            0
                        ),

                    partial_students:
                        Number(
                            data.summary.partial_students ||
                            0
                        ),

                    pending_students:
                        Number(
                            data.summary.pending_students ||
                            0
                        ),

                });

            }


        } catch (error) {

            console.error(
                "Fee summary error:",
                error
            );

        } finally {

            setLoadingFees(false);

        }

    };


    // ==================================================
    // LOGOUT
    // ==================================================

    const handleLogout = async () => {

        const confirmLogout =
            window.confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmLogout) {

            return;

        }


        try {

            setLoggingOut(true);


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


        } finally {

            setLoggingOut(false);

        }

    };


    // ==================================================
    // NAVIGATION
    // ==================================================

    const goToDashboard = () => {

        navigate("/dashboard");

    };


    const goToAddStudent = () => {

        navigate("/students/add");

    };


    const goToStudents = () => {

        navigate("/students");

    };


    const goToFeesManagement = () => {

        navigate("/fees");

    };


    const goToAttendance = () => {

        navigate("/attendance");

    };


    const goToAttendanceReport = () => {

        navigate("/attendance-report");

    };


    // ==================================================
    // COMING SOON
    // ==================================================

    const showComingSoon = (name) => {

        alert(
            `${name} management will be added next.`
        );

    };


    // ==================================================
    // CURRENCY FORMAT
    // ==================================================

    const currency = (value) => {

        return `₹${Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2,
            }
        )}`;

    };


    // ==================================================
    // GET ADMIN INITIAL
    // ==================================================

    const adminInitial =
        user?.name
            ?.charAt(0)
            ?.toUpperCase() || "A";


    return (

        <div className="dashboard">


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside className="sidebar">


                {/* BRAND */}

                <div className="sidebar-brand">

                    <div className="sidebar-logo">
                        FL
                    </div>


                    <div className="brand-text">

                        <h2>
                            Future Lines
                        </h2>

                        <span>
                            Management System
                        </span>

                    </div>

                </div>


                {/* NAVIGATION */}

                <div className="sidebar-menu">

                    <p className="menu-title">
                        MAIN MENU
                    </p>


                    <nav>


                        {/* DASHBOARD */}

                        <button
                            className="sidebar-link active"
                            onClick={goToDashboard}
                        >

                            <span className="nav-icon">
                                ⌂
                            </span>

                            <span>
                                Dashboard
                            </span>

                        </button>


                        {/* STUDENTS */}

                        <button
                            className="sidebar-link"
                            onClick={goToStudents}
                        >

                            <span className="nav-icon">
                                ♙
                            </span>

                            <span>
                                Students
                            </span>

                        </button>

                        {/* FEES MANAGEMENT */}

                        <button
                            className="sidebar-link"
                            onClick={goToFeesManagement}
                        >

                            <span className="nav-icon">
                                ₹
                            </span>

                            <span>
                                Fees Management
                            </span>

                        </button>


                        {/* MARK ATTENDANCE */}

                        <button
                            className="sidebar-link"
                            onClick={goToAttendance}
                        >

                            <span className="nav-icon">
                                ✓
                            </span>

                            <span>
                                Mark Attendance
                            </span>

                        </button>


                        {/* ATTENDANCE REPORT */}

                        <button
                            className="sidebar-link"
                            onClick={
                                goToAttendanceReport
                            }
                        >

                            <span className="nav-icon">
                                ▥
                            </span>

                            <span>
                                Attendance Report
                            </span>

                        </button>


                        {/* CERTIFICATES */}

                        <button
                            className="sidebar-link"
                            onClick={() =>
                                showComingSoon(
                                    "Certificate"
                                )
                            }
                        >

                            <span className="nav-icon">
                                ▤
                            </span>

                            <span>
                                Certificates
                            </span>

                        </button>


                        {/* REPORTS */}

                        <button
                            className="sidebar-link"
                            onClick={() =>
                                showComingSoon(
                                    "Report"
                                )
                            }
                        >

                            <span className="nav-icon">
                                ▥
                            </span>

                            <span>
                                Reports
                            </span>

                        </button>


                    </nav>

                </div>


                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">


                    <div className="sidebar-user">

                        <div className="sidebar-user-avatar">

                            {adminInitial}

                        </div>


                        <div className="sidebar-user-info">

                            <strong>
                                {
                                    user?.name ||
                                    "Administrator"
                                }
                            </strong>


                            <span>
                                {
                                    user?.email ||
                                    "Admin Account"
                                }
                            </span>

                        </div>

                    </div>


                    <button
                        className="logout-button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                    >

                        <span className="logout-icon">
                            ↪
                        </span>


                        <span>

                            {loggingOut
                                ? "Logging out..."
                                : "Logout"}

                        </span>

                    </button>


                </div>


            </aside>


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="dashboard-main">


                {/* HEADER */}

                <header className="dashboard-header">


                    <div className="header-left">

                        <div className="page-label">
                            ADMINISTRATION
                        </div>


                        <h1>
                            Dashboard
                        </h1>


                        <p>
                            Welcome back! Here's what's
                            happening at Future Lines today.
                        </p>

                    </div>


                    <div className="header-right">


                        <button
                            className="header-logout"
                            onClick={handleLogout}
                            disabled={loggingOut}
                        >

                            <span>
                                ↪
                            </span>

                            {loggingOut
                                ? "Logging out..."
                                : "Logout"}

                        </button>


                        <div className="admin-profile">

                            <div className="profile-avatar">

                                {adminInitial}

                            </div>


                            <div className="profile-info">

                                <strong>
                                    {
                                        user?.name ||
                                        "Admin"
                                    }
                                </strong>


                                <span>
                                    Administrator
                                </span>

                            </div>

                        </div>


                    </div>

                </header>


                {/* CONTENT */}

                <section className="dashboard-content">


                    {/* ==================================================
                        WELCOME BANNER
                    ================================================== */}

                    <div className="dashboard-banner">


                        <div className="banner-content">

                            <span className="banner-badge">
                                ✦ ADMIN PANEL
                            </span>


                            <h2>
                                Welcome to Future Lines
                            </h2>


                            <p>
                                Manage students, courses,
                                fees, attendance and
                                certificates from one place.
                            </p>

                        </div>


                        <div className="banner-decoration">
                            FL
                        </div>


                    </div>


                    {/* ==================================================
                        STATISTICS
                    ================================================== */}

                    <div className="section-heading">

                        <div>

                            <h2>
                                Overview
                            </h2>


                            <p>
                                Quick summary of your institute
                            </p>

                        </div>

                    </div>


                    <div className="stat-grid">


                        {/* STUDENTS */}

                        <div
                            className="stat-card clickable-card"
                            onClick={goToStudents}
                        >

                            <div className="stat-top">

                                <div className="stat-icon students-icon">
                                    ♙
                                </div>


                                <span className="stat-arrow">
                                    →
                                </span>

                            </div>


                            <div className="stat-info">

                                <span>
                                    Total Students
                                </span>


                                <h2>

                                    {loadingStudents
                                        ? "..."
                                        : totalStudents}

                                </h2>


                                <small>
                                    Registered students
                                </small>

                            </div>

                        </div>


                      


                        {/* TOTAL FEE */}

                        <div
                            className="stat-card clickable-card"
                            onClick={goToFeesManagement}
                        >

                            <div className="stat-top">

                                <div className="stat-icon fees-icon">
                                    ₹
                                </div>


                                <span className="stat-arrow">
                                    →
                                </span>

                            </div>


                            <div className="stat-info">

                                <span>
                                    Total Fees
                                </span>


                                <h2>

                                    {loadingFees
                                        ? "..."
                                        : currency(
                                            feeSummary.total_fee
                                        )}

                                </h2>


                                <small>
                                    Total net fee
                                </small>

                            </div>

                        </div>


                        {/* TOTAL COLLECTED */}

                        <div
                            className="stat-card clickable-card"
                            onClick={goToFeesManagement}
                        >

                            <div className="stat-top">

                                <div className="stat-icon fees-icon">
                                    ✓
                                </div>


                                <span className="stat-arrow">
                                    →
                                </span>

                            </div>


                            <div className="stat-info">

                                <span>
                                    Total Collected
                                </span>


                                <h2>

                                    {loadingFees
                                        ? "..."
                                        : currency(
                                            feeSummary.total_collected
                                        )}

                                </h2>


                                <small>
                                    Payments received
                                </small>

                            </div>

                        </div>


                        {/* TOTAL PENDING */}

                        <div
                            className="stat-card clickable-card"
                            onClick={goToFeesManagement}
                        >

                            <div className="stat-top">

                                <div className="stat-icon fees-icon">
                                    !
                                </div>


                                <span className="stat-arrow">
                                    →
                                </span>

                            </div>


                            <div className="stat-info">

                                <span>
                                    Pending Fees
                                </span>


                                <h2>

                                    {loadingFees
                                        ? "..."
                                        : currency(
                                            feeSummary.total_pending
                                        )}

                                </h2>


                                <small>
                                    Outstanding amount
                                </small>

                            </div>

                        </div>


                    </div>


                    {/* ==================================================
                        FEE STATUS SUMMARY
                    ================================================== */}

                    <div className="section-heading">

                        <div>

                            <h2>
                                Fee Status
                            </h2>


                            <p>
                                Student payment status
                            </p>

                        </div>

                    </div>


                    <div className="stat-grid">


                        {/* PAID */}

                        <div
                            className="stat-card"
                            onClick={goToFeesManagement}
                        >

                            <div className="stat-info">

                                <span>
                                    Paid Students
                                </span>


                                <h2>

                                    {loadingFees
                                        ? "..."
                                        : feeSummary.paid_students}

                                </h2>


                                <small>
                                    Fully paid
                                </small>

                            </div>

                        </div>


                        {/* PARTIAL */}

                        <div
                            className="stat-card"
                            onClick={goToFeesManagement}
                        >

                            <div className="stat-info">

                                <span>
                                    Partial Payment
                                </span>


                                <h2>

                                    {loadingFees
                                        ? "..."
                                        : feeSummary.partial_students}

                                </h2>


                                <small>
                                    Payment remaining
                                </small>

                            </div>

                        </div>


                        {/* PENDING */}

                        <div
                            className="stat-card"
                            onClick={goToFeesManagement}
                        >

                            <div className="stat-info">

                                <span>
                                    Pending Students
                                </span>


                                <h2>

                                    {loadingFees
                                        ? "..."
                                        : feeSummary.pending_students}

                                </h2>


                                <small>
                                    No payment recorded
                                </small>

                            </div>

                        </div>


                    </div>


                    {/* ==================================================
                        QUICK ACTIONS
                    ================================================== */}

                    <div className="quick-actions">


                        <div className="section-heading">

                            <div>

                                <h2>
                                    Quick Actions
                                </h2>


                                <p>
                                    Frequently used management
                                    options
                                </p>

                            </div>

                        </div>


                        <div className="action-grid">


                            {/* ADD STUDENT */}

                            <button
                                className="action-card"
                                onClick={
                                    goToAddStudent
                                }
                            >

                                <div className="action-icon student-action">
                                    +
                                </div>


                                <div className="action-content">

                                    <strong>
                                        Add Student
                                    </strong>


                                    <span>
                                        Register a new student
                                    </span>

                                </div>


                                <div className="action-arrow">
                                    →
                                </div>

                            </button>


                            {/* STUDENT LIST */}

                            <button
                                className="action-card"
                                onClick={
                                    goToStudents
                                }
                            >

                                <div className="action-icon list-action">
                                    ☷
                                </div>


                                <div className="action-content">

                                    <strong>
                                        Student List
                                    </strong>


                                    <span>
                                        View all registered students
                                    </span>

                                </div>


                                <div className="action-arrow">
                                    →
                                </div>

                            </button>


                            {/* COURSES */}

                            <button
                                className="action-card"
                                onClick={() =>
                                    showComingSoon(
                                        "Course"
                                    )
                                }
                            >

                                <div className="action-icon course-action">
                                    ▣
                                </div>


                                <div className="action-content">

                                    <strong>
                                        Manage Courses
                                    </strong>


                                    <span>
                                        Add and manage courses
                                    </span>

                                </div>


                                <div className="action-arrow">
                                    →
                                </div>

                            </button>


                            {/* FEES MANAGEMENT */}

                            <button
                                className="action-card"
                                onClick={
                                    goToFeesManagement
                                }
                            >

                                <div className="action-icon fee-action">
                                    ₹
                                </div>


                                <div className="action-content">

                                    <strong>
                                        Fee Management
                                    </strong>


                                    <span>
                                        Manage student payments
                                    </span>

                                </div>


                                <div className="action-arrow">
                                    →
                                </div>

                            </button>


                            {/* MARK ATTENDANCE */}

                            <button
                                className="action-card"
                                onClick={
                                    goToAttendance
                                }
                            >

                                <div className="action-icon attendance-action">
                                    ✓
                                </div>


                                <div className="action-content">

                                    <strong>
                                        Mark Attendance
                                    </strong>


                                    <span>
                                        Mark daily student attendance
                                    </span>

                                </div>


                                <div className="action-arrow">
                                    →
                                </div>

                            </button>


                            {/* ATTENDANCE REPORT */}

                            <button
                                className="action-card"
                                onClick={
                                    goToAttendanceReport
                                }
                            >

                                <div className="action-icon attendance-report-action">
                                    ▥
                                </div>


                                <div className="action-content">

                                    <strong>
                                        Attendance Report
                                    </strong>


                                    <span>
                                        View student attendance reports
                                    </span>

                                </div>


                                <div className="action-arrow">
                                    →
                                </div>

                            </button>


                        </div>

                    </div>


                    {/* ==================================================
                        BOTTOM INFORMATION
                    ================================================== */}

                    <div className="bottom-grid">


                        {/* SYSTEM CARD */}

                        <div className="system-card">

                            <div className="system-card-header">

                                <div className="system-icon">
                                    ✓
                                </div>


                                <div>

                                    <h3>
                                        System Status
                                    </h3>


                                    <span>
                                        Everything is running normally
                                    </span>

                                </div>

                            </div>


                            <div className="system-status">

                                <span className="status-dot"></span>


                                <strong>
                                    All Systems Operational
                                </strong>

                            </div>

                        </div>


                        {/* HELP CARD */}

                        <div className="help-card">

                            <div>

                                <span className="help-label">
                                    NEED HELP?
                                </span>


                                <h3>
                                    Future Lines Management
                                </h3>


                                <p>
                                    Use the sidebar to navigate
                                    through the management system.
                                </p>

                            </div>


                            <div className="help-logo">
                                FL
                            </div>

                        </div>


                    </div>


                </section>


            </main>


        </div>

    );

}


export default Dashboard;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

function StudentDashboard() {

    const navigate = useNavigate();

    // ==================================================
    // STATE
    // ==================================================

    const [student, setStudent] = useState(null);

    const [attendance, setAttendance] = useState([]);

    const [attendanceSummary, setAttendanceSummary] = useState({
        totalClasses: 0,
        present: 0,
        absent: 0,
        percentage: "0.0",
    });

    const [fees, setFees] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [passwordMessage, setPasswordMessage] = useState("");

    const [passwordError, setPasswordError] = useState("");

    const [changingPassword, setChangingPassword] = useState(false);


    // ==================================================
    // SAFE JSON RESPONSE
    // ==================================================

    const getJsonResponse = async (response) => {

        const contentType =
            response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {

            const text = await response.text();

            console.error(
                "Expected JSON but received:",
                text.substring(0, 300)
            );

            throw new Error(
                "Server returned an invalid response."
            );
        }

        return response.json();
    };


    // ==================================================
    // LOAD STUDENT PROFILE
    // ==================================================

    const loadProfile = async () => {

        try {

            const response = await fetch(
                "/api/students/my-profile",
                {
                    credentials: "include",
                }
            );

            const data = await getJsonResponse(response);

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load student profile."
                );
            }

            if (data.success) {

                setStudent(data.student);

            } else {

                throw new Error(
                    data.message ||
                    "Unable to load student profile."
                );
            }

        } catch (err) {

            console.error(
                "Student profile error:",
                err
            );

            setError(err.message);
        }
    };


    // ==================================================
    // LOAD ATTENDANCE
    // ==================================================

    const loadAttendance = async () => {

        try {

            const response = await fetch(
                "/api/attendance/my-attendance",
                {
                    credentials: "include",
                }
            );

            const data = await getJsonResponse(response);

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load attendance."
                );
            }

            if (data.success) {

                // IMPORTANT:
                // Backend returns "records", not "attendance"

                setAttendance(
                    Array.isArray(data.records)
                        ? data.records
                        : []
                );


                // Use backend-calculated summary

                if (data.summary) {

                    setAttendanceSummary({
                        totalClasses:
                            Number(
                                data.summary.totalClasses
                            ) || 0,

                        present:
                            Number(
                                data.summary.present
                            ) || 0,

                        absent:
                            Number(
                                data.summary.absent
                            ) || 0,

                        percentage:
                            data.summary.percentage !==
                            undefined
                                ? data.summary.percentage
                                : "0.0",
                    });
                }

            } else {

                setAttendance([]);

                setAttendanceSummary({
                    totalClasses: 0,
                    present: 0,
                    absent: 0,
                    percentage: "0.0",
                });
            }

        } catch (err) {

            console.error(
                "Student attendance error:",
                err
            );

            setAttendance([]);

            setAttendanceSummary({
                totalClasses: 0,
                present: 0,
                absent: 0,
                percentage: "0.0",
            });

        }
    };


    // ==================================================
    // LOAD FEES
    // ==================================================

    const loadFees = async () => {

        try {

            const response = await fetch(
                "/api/fees/my-fees",
                {
                    credentials: "include",
                }
            );

            const data = await getJsonResponse(response);

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load fees."
                );
            }

            if (data.success) {

                setFees(data);

            } else {

                setFees(null);
            }

        } catch (err) {

            console.error(
                "Student fees error:",
                err
            );

            setFees(null);
        }
    };


    // ==================================================
    // LOAD ALL DASHBOARD DATA
    // ==================================================

    useEffect(() => {

        const loadDashboard = async () => {

            setLoading(true);

            setError("");

            await Promise.all([
                loadProfile(),
                loadAttendance(),
                loadFees(),
            ]);

            setLoading(false);
        };

        loadDashboard();

    }, []);


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

        } catch (err) {

            console.error(
                "Logout error:",
                err
            );

        } finally {

            navigate("/login");
        }
    };


    // ==================================================
    // NAVIGATION
    // ==================================================

    const scrollToSection = (sectionId) => {

        setMobileMenuOpen(false);

        const element =
            document.getElementById(sectionId);

        if (element) {

            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };


    // ==================================================
    // CHANGE PASSWORD INPUT
    // ==================================================

    const handlePasswordChange = (e) => {

        const { name, value } = e.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setPasswordError("");

        setPasswordMessage("");
    };


    // ==================================================
    // CHANGE PASSWORD
    // ==================================================

    const handleChangePassword = async (e) => {

        e.preventDefault();

        setPasswordError("");

        setPasswordMessage("");


        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = passwordData;


        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            setPasswordError(
                "Please fill all password fields."
            );

            return;
        }


        if (newPassword.length < 6) {

            setPasswordError(
                "New password must be at least 6 characters."
            );

            return;
        }


        if (newPassword !== confirmPassword) {

            setPasswordError(
                "New password and confirm password do not match."
            );

            return;
        }


        try {

            setChangingPassword(true);

            const response = await fetch(
                "/api/auth/change-password",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                    }),
                }
            );


            const data =
                await getJsonResponse(response);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to change password."
                );
            }


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to change password."
                );
            }


            setPasswordMessage(
                "Password changed successfully."
            );


            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });


        } catch (err) {

            console.error(
                "Change password error:",
                err
            );

            setPasswordError(
                err.message
            );

        } finally {

            setChangingPassword(false);
        }
    };


    // ==================================================
    // FORMAT DATE
    // ==================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        try {

            return new Date(date).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );

        } catch {

            return date;
        }
    };


    // ==================================================
    // FORMAT CURRENCY
    // ==================================================

    const formatCurrency = (amount) => {

        const value =
            Number(amount) || 0;

        return `₹${value.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    // ==================================================
// GET FEE SUMMARY
// ==================================================

const feeSummary = fees?.summary || {};


// --------------------------------------------------
// TOTAL FEE
// --------------------------------------------------

const totalFee =
    Number(feeSummary.total_fee) || 0;


// --------------------------------------------------
// DISCOUNT
// --------------------------------------------------

const discount =
    Number(feeSummary.discount) || 0;


// --------------------------------------------------
// NET FEE
// Always calculate from Total Fee - Discount
// --------------------------------------------------

const calculatedNetFee =
    Math.max(totalFee - discount, 0);

const netFee =
    Number.isFinite(Number(feeSummary.net_fee))
        ? Number(feeSummary.net_fee)
        : calculatedNetFee;


// --------------------------------------------------
// TOTAL PAID
// --------------------------------------------------

const totalPaid =
    Number(feeSummary.total_paid) || 0;


// --------------------------------------------------
// PENDING
// IMPORTANT:
// Do NOT trust backend pending value.
// Calculate it from Net Fee - Total Paid.
// --------------------------------------------------

const pending =
    Math.max(netFee - totalPaid, 0);


// --------------------------------------------------
// PAYMENT STATUS
// --------------------------------------------------

const feeStatus =
    pending <= 0
        ? "Paid"
        : "Pending";

   
    // ==================================================
    // PAYMENT HISTORY
    // ==================================================

    const paymentHistory =
        Array.isArray(
            fees?.records
        )
            ? fees.records
            : Array.isArray(
                fees?.transactions
            )
                ? fees.transactions
                : [];


    // ==================================================
    // LOADING SCREEN
    // ==================================================

    if (loading) {

        return (

            <div className="student-dashboard-loading">

                <div className="student-loading-spinner"></div>

                <p>
                    Loading your dashboard...
                </p>

            </div>

        );
    }


    // ==================================================
    // MAIN DASHBOARD
    // ==================================================

    return (

        <div className="student-dashboard">


            {/* ==================================================
                MOBILE OVERLAY
            ================================================== */}

            {mobileMenuOpen && (

                <div
                    className="student-sidebar-overlay"
                    onClick={() =>
                        setMobileMenuOpen(false)
                    }
                ></div>

            )}


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside
                className={`student-sidebar ${
                    mobileMenuOpen
                        ? "mobile-open"
                        : ""
                }`}
            >

                <div className="student-sidebar-header">

                    <div className="student-logo">

                        <div className="student-logo-icon">
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


                    <button
                        className="student-sidebar-close"
                        onClick={() =>
                            setMobileMenuOpen(false)
                        }
                    >
                        ×
                    </button>

                </div>


                {/* NAVIGATION */}

                <nav className="student-sidebar-nav">

                    <button
                        className="student-nav-item active"
                        onClick={() =>
                            scrollToSection("dashboard")
                        }
                    >
                        <span className="student-nav-icon">
                            🏠
                        </span>

                        <span>
                            Dashboard
                        </span>
                    </button>


                    <button
                        className="student-nav-item"
                        onClick={() =>
                            scrollToSection("profile")
                        }
                    >
                        <span className="student-nav-icon">
                            👤
                        </span>

                        <span>
                            My Profile
                        </span>
                    </button>


                    <button
                        className="student-nav-item"
                        onClick={() =>
                            scrollToSection("tests")
                        }
                    >
                        <span className="student-nav-icon">
                            📝
                        </span>

                        <span>
                            Weekly Tests
                        </span>
                    </button>


                    <button
                        className="student-nav-item"
                        onClick={() =>
                            scrollToSection("attendance")
                        }
                    >
                        <span className="student-nav-icon">
                            📅
                        </span>

                        <span>
                            Attendance
                        </span>
                    </button>


                    <button
                        className="student-nav-item"
                        onClick={() =>
                            scrollToSection("fees")
                        }
                    >
                        <span className="student-nav-icon">
                            💰
                        </span>

                        <span>
                            My Fees
                        </span>
                    </button>


                    <button
                        className="student-nav-item"
                        onClick={() =>
                            scrollToSection("password")
                        }
                    >
                        <span className="student-nav-icon">
                            🔐
                        </span>

                        <span>
                            Change Password
                        </span>
                    </button>

                </nav>


                {/* LOGOUT */}

                <div className="student-sidebar-footer">

                    <button
                        className="student-logout-btn"
                        onClick={handleLogout}
                    >

                        <span>
                            🚪
                        </span>

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="student-main-content">


                {/* ==================================================
                    TOP HEADER
                ================================================== */}

                <header className="student-top-header">

                    <div className="student-header-left">

                        <button
                            className="student-mobile-menu-btn"
                            onClick={() =>
                                setMobileMenuOpen(true)
                            }
                        >
                            ☰
                        </button>


                        <div>

                            <h1>
                                Student Dashboard
                            </h1>

                            <p>
                                Welcome back! Here's your
                                learning overview.
                            </p>

                        </div>

                    </div>


                    <div className="student-header-right">

                        <div className="student-header-profile">

                            <div className="student-avatar">

                                {student?.name
                                    ? student.name
                                        .charAt(0)
                                        .toUpperCase()
                                    : "S"}

                            </div>


                            <div className="student-header-user">

                                <strong>
                                    {student?.name ||
                                        "Student"}
                                </strong>

                                <span>
                                    {student?.student_id ||
                                        "Student"}
                                </span>

                            </div>

                        </div>


                        <button
                            className="student-header-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </header>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div className="student-error-message">

                        ⚠️ {error}

                    </div>

                )}


                {/* ==================================================
                    DASHBOARD
                ================================================== */}

                <section
                    id="dashboard"
                    className="student-section"
                >

                    <div className="student-welcome-card">

                        <div>

                            <span className="student-welcome-label">
                                Welcome back
                            </span>

                            <h2>
                                {student?.name ||
                                    "Student"}
                            </h2>

                            <p>

                                {student?.course ||
                                    "Course"}

                                {student?.batch &&
                                    ` • ${student.batch} Batch`}

                            </p>

                        </div>


                        <div className="student-welcome-id">

                            <span>
                                Student ID
                            </span>

                            <strong>
                                {student?.student_id ||
                                    "-"}
                            </strong>

                        </div>

                    </div>


                    {/* STAT CARDS */}

                    <div className="student-stats-grid">


                        {/* COURSE */}

                        <div className="student-stat-card">

                            <div className="student-stat-icon">
                                🎓
                            </div>

                            <div>

                                <span className="student-stat-label">
                                    My Course
                                </span>

                                <strong className="student-stat-value">
                                    {student?.course ||
                                        "-"}
                                </strong>

                            </div>

                        </div>


                        {/* TESTS */}

                        <div className="student-stat-card">

                            <div className="student-stat-icon">
                                📝
                            </div>

                            <div>

                                <span className="student-stat-label">
                                    Weekly Tests
                                </span>

                                <strong className="student-stat-value">
                                    0
                                </strong>

                            </div>

                        </div>


                        {/* ATTENDANCE */}

                        <div className="student-stat-card">

                            <div className="student-stat-icon">
                                📅
                            </div>

                            <div>

                                <span className="student-stat-label">
                                    Attendance
                                </span>

                                <strong className="student-stat-value">
                                    {attendanceSummary.percentage}%
                                </strong>

                                <small>
                                    {
                                        attendanceSummary.present
                                    } Present /{" "}
                                    {
                                        attendanceSummary.totalClasses
                                    } Classes
                                </small>

                            </div>

                        </div>


                        {/* PENDING FEE */}

                        <div className="student-stat-card">

                            <div className="student-stat-icon">
                                💰
                            </div>

                            <div>

                                <span className="student-stat-label">
                                    Fee Pending
                                </span>

                                <strong className="student-stat-value">
                                    {formatCurrency(
                                        pending
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    PROFILE
                ================================================== */}

                <section
                    id="profile"
                    className="student-section"
                >

                    <div className="student-section-header">

                        <div>

                            <h2>
                                My Profile
                            </h2>

                            <p>
                                Your registered student
                                information
                            </p>

                        </div>

                    </div>


                    <div className="student-profile-card">

                        <div className="student-profile-avatar">

                            {student?.name
                                ? student.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "S"}

                        </div>


                        <div className="student-profile-details">

                            <div className="student-profile-field">

                                <span>
                                    Full Name
                                </span>

                                <strong>
                                    {student?.name ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-profile-field">

                                <span>
                                    Student ID
                                </span>

                                <strong>
                                    {student?.student_id ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-profile-field">

                                <span>
                                    Email
                                </span>

                                <strong>
                                    {student?.email ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-profile-field">

                                <span>
                                    Phone
                                </span>

                                <strong>
                                    {student?.phone ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-profile-field">

                                <span>
                                    Course
                                </span>

                                <strong>
                                    {student?.course ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-profile-field">

                                <span>
                                    Batch
                                </span>

                                <strong>
                                    {student?.batch ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-profile-field">

                                <span>
                                    Admission Date
                                </span>

                                <strong>
                                    {formatDate(
                                        student?.admission_date
                                    )}
                                </strong>

                            </div>


                            <div className="student-profile-field">

                                <span>
                                    Gender
                                </span>

                                <strong>
                                    {student?.gender ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="student-profile-field student-profile-full">

                                <span>
                                    Address
                                </span>

                                <strong>
                                    {student?.address ||
                                        "-"}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    WEEKLY TESTS
                ================================================== */}

                <section
                    id="tests"
                    className="student-section"
                >

                    <div className="student-section-header">

                        <div>

                            <h2>
                                Weekly Tests
                            </h2>

                            <p>
                                View your weekly test
                                performance
                            </p>

                        </div>

                    </div>


                    <div className="student-empty-card">

                        <div className="student-empty-icon">
                            📝
                        </div>

                        <h3>
                            No Test Results Yet
                        </h3>

                        <p>
                            Your weekly test marks will
                            appear here once they are
                            uploaded by the institute.
                        </p>

                    </div>

                </section>


                {/* ==================================================
                    ATTENDANCE
                ================================================== */}

                <section
                    id="attendance"
                    className="student-section"
                >

                    <div className="student-section-header">

                        <div>

                            <h2>
                                Attendance Report
                            </h2>

                            <p>
                                Track your class attendance
                                and attendance percentage
                            </p>

                        </div>

                    </div>


                    {/* ATTENDANCE SUMMARY */}

                    <div className="attendance-summary-grid">


                        <div className="attendance-summary-card">

                            <span>
                                Total Classes
                            </span>

                            <strong>
                                {
                                    attendanceSummary.totalClasses
                                }
                            </strong>

                        </div>


                        <div className="attendance-summary-card">

                            <span>
                                Present
                            </span>

                            <strong>
                                {
                                    attendanceSummary.present
                                }
                            </strong>

                        </div>


                        <div className="attendance-summary-card">

                            <span>
                                Absent
                            </span>

                            <strong>
                                {
                                    attendanceSummary.absent
                                }
                            </strong>

                        </div>


                        <div className="attendance-summary-card">

                            <span>
                                Attendance
                            </span>

                            <strong>
                                {
                                    attendanceSummary.percentage
                                }%
                            </strong>

                        </div>

                    </div>


                    {/* ATTENDANCE HISTORY */}

                    <div className="student-table-card">

                        <div className="student-table-header">

                            <div>

                                <h3>
                                    Attendance History
                                </h3>

                                <p>
                                    Your recent attendance
                                    records
                                </p>

                            </div>

                        </div>


                        <div className="student-table-wrapper">

                            <table className="student-data-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Start Time
                                        </th>

                                        <th>
                                            End Time
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {attendance.length > 0 ? (

                                        attendance.map(
                                            (item) => (

                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                >

                                                    <td>
                                                        {formatDate(
                                                            item.attendance_date
                                                        )}
                                                    </td>

                                                    <td>
                                                        {
                                                            item.start_time ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.end_time ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                String(
                                                                    item.status
                                                                ).toLowerCase() ===
                                                                "present"
                                                                    ? "attendance-present"
                                                                    : "attendance-absent"
                                                            }
                                                        >

                                                            {
                                                                item.status ||
                                                                "-"
                                                            }

                                                        </span>

                                                    </td>

                                                </tr>

                                            )
                                        )

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan="4"
                                                className="no-attendance"
                                            >
                                                No attendance
                                                records found.
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    FEES
                ================================================== */}

                <section
                    id="fees"
                    className="student-section"
                >

                    <div className="student-section-header">

                        <div>

                            <h2>
                                My Fees
                            </h2>

                            <p>
                                View your fee summary and
                                payment history
                            </p>

                        </div>

                    </div>


                    {/* FEE SUMMARY */}

                    <div className="student-fee-summary-grid">


                        <div className="student-fee-card">

                            <span>
                                Total Fee
                            </span>

                            <strong>
                                {formatCurrency(
                                    totalFee
                                )}
                            </strong>

                        </div>


                        <div className="student-fee-card">

                            <span>
                                Discount
                            </span>

                            <strong>
                                {formatCurrency(
                                    discount
                                )}
                            </strong>

                        </div>


                        <div className="student-fee-card">

                            <span>
                                Net Fee
                            </span>

                            <strong>
                                {formatCurrency(
                                    netFee
                                )}
                            </strong>

                        </div>


                        <div className="student-fee-card">

                            <span>
                                Total Paid
                            </span>

                            <strong>
                                {formatCurrency(
                                    totalPaid
                                )}
                            </strong>

                        </div>


                        <div className="student-fee-card">

                            <span>
                                Pending
                            </span>

                            <strong>
                                {formatCurrency(
                                    pending
                                )}
                            </strong>

                        </div>


                        <div className="student-fee-card">

                            <span>
                                Status
                            </span>

                            <strong
                            className={
                          feeStatus === "Paid"
                        ? "fee-paid"
            :            "fee-pending"
                        }
                    >
                        {feeStatus}
                        </strong>
                        </div>

                    </div>


                    {/* FEE DETAILS */}

                    <div className="student-table-card">

                        <div className="student-table-header">

                            <div>

                                <h3>
                                    Payment History
                                </h3>

                                <p>
                                    Your fee payment
                                    records
                                </p>

                            </div>

                        </div>


                        <div className="student-table-wrapper">

                            <table className="student-data-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Course
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Payment Mode
                                        </th>

                                        <th>
                                            Transaction No.
                                        </th>

                                        <th>
                                            Receipt No.
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {paymentHistory.length > 0 ? (

                                        paymentHistory.map(
                                            (payment) => (

                                                <tr
                                                    key={
                                                        payment.id
                                                    }
                                                >

                                                    <td>
                                                        {formatDate(
                                                            payment.payment_date
                                                        )}
                                                    </td>

                                                    <td>
                                                        {
                                                            payment.course_name ||
                                                            student?.course ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {formatCurrency(
                                                            payment.amount_paid
                                                        )}
                                                    </td>

                                                    <td>
                                                        {
                                                            payment.payment_mode ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            payment.transaction_number ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            payment.receipt_number ||
                                                            "-"
                                                        }
                                                    </td>

                                                </tr>

                                            )
                                        )

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className="no-attendance"
                                            >
                                                No payment records
                                                found.
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    CHANGE PASSWORD
                ================================================== */}

                <section
                    id="password"
                    className="student-section"
                >

                    <div className="student-section-header">

                        <div>

                            <h2>
                                Change Password
                            </h2>

                            <p>
                                Keep your student account
                                secure
                            </p>

                        </div>

                    </div>


                    <div className="student-password-card">

                        <form
                            onSubmit={
                                handleChangePassword
                            }
                        >


                            {passwordMessage && (

                                <div className="student-success-message">

                                    ✓ {passwordMessage}

                                </div>

                            )}


                            {passwordError && (

                                <div className="student-error-message">

                                    ⚠️ {passwordError}

                                </div>

                            )}


                            <div className="student-password-grid">


                                <div className="student-form-group">

                                    <label>
                                        Current Password
                                    </label>

                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={
                                            passwordData.currentPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Enter current password"
                                    />

                                </div>


                                <div className="student-form-group">

                                    <label>
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={
                                            passwordData.newPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Enter new password"
                                    />

                                </div>


                                <div className="student-form-group">

                                    <label>
                                        Confirm New Password
                                    </label>

                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={
                                            passwordData.confirmPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Confirm new password"
                                    />

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="student-change-password-btn"
                                disabled={
                                    changingPassword
                                }
                            >

                                {changingPassword
                                    ? "Changing..."
                                    : "Change Password"}

                            </button>

                        </form>

                    </div>

                </section>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <footer className="student-dashboard-footer">

                    <p>
                        © {new Date().getFullYear()} Future
                        Lines. All Rights Reserved.
                    </p>

                </footer>


            </main>

        </div>

    );
}

export default StudentDashboard;

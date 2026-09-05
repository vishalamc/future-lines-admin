import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import AddStudent from "./pages/AddStudent";
import StudentDashboard from "./pages/StudentDashboard";

import Attendance from "./pages/Attendance";
import AttendanceReport from "./pages/AttendanceReport";

import ChangePassword from "./pages/ChangePassword";

import FeesManagement from "./pages/FeesManagement";
import StudentFeeReport from "./pages/StudentFeeReport";


function App() {

    return (

        <Routes>

            {/* ==========================================
                HOME / DEFAULT
            ========================================== */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />


            {/* ==========================================
                COMMON LOGIN
            ========================================== */}

            <Route
                path="/login"
                element={<Login />}
            />


            {/* ==========================================
                ADMIN DASHBOARD
            ========================================== */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute role="admin">
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
             path="/student-fee-report"
                element={
                <ProtectedRoute role="student">
                    <StudentFeeReport />
                </ProtectedRoute>
            }
            />


            {/* ==========================================
                ADD STUDENT
            ========================================== */}

            <Route
                path="/students/add"
                element={
                    <ProtectedRoute role="admin">
                        <AddStudent />
                    </ProtectedRoute>
                }
            />


            {/* ==========================================
                ATTENDANCE
            ========================================== */}

            <Route
                path="/attendance"
                element={
                    <ProtectedRoute role="admin">
                        <Attendance />
                    </ProtectedRoute>
                }
            />


            {/* ==========================================
                ATTENDANCE REPORT
            ========================================== */}

            <Route
                path="/attendance-report"
                element={
                    <ProtectedRoute role="admin">
                        <AttendanceReport />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/fees"
                element={
                <ProtectedRoute role="admin">
                <FeesManagement />
                </ProtectedRoute>
            }
            />

            {/* ==========================================
                STUDENT DASHBOARD
            ========================================== */}

            <Route
                path="/student-dashboard"
                element={
                    <ProtectedRoute role="student">
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />


            {/* ==========================================
                CHANGE PASSWORD
                ADMIN + STUDENT
            ========================================== */}

            <Route
                path="/change-password"
                element={
                    <ProtectedRoute>
                        <ChangePassword />
                    </ProtectedRoute>
                }
            />


            {/* ==========================================
                INVALID URL
            ========================================== */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>

    );

}


export default App;

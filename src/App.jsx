import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AddStudent from "./pages/AddStudent";
import StudentDashboard from "./pages/StudentDashboard";
import Attendance from "./pages/Attendance";
import AttendanceReport from "./pages/AttendanceReport";

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

            <Route
                path="/attendance"
                element={
                    <ProtectedRoute role="admin">
                    <Attendance />
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
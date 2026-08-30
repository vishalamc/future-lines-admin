import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AttendanceReport.css";

function AttendanceReport() {
    const navigate = useNavigate();

    const today = new Date().toISOString().split("T")[0];

    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);

    const [course, setCourse] = useState("All");
    const [status, setStatus] = useState("All");
    const [search, setSearch] = useState("");

    const [records, setRecords] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // LOAD REPORT
    // ==========================================

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                from_date: fromDate,
                to_date: toDate,
            });

            if (course !== "All") {
                params.append("course", course);
            }

            if (status !== "All") {
                params.append("status", status);
            }

            const response = await fetch(
                `/api/attendance/report?${params.toString()}`,
                {
                    credentials: "include",
                }
            );

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            if (response.status === 403) {
                navigate("/dashboard");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load attendance report"
                );
            }

            setRecords(data.records || []);

        } catch (err) {
            console.error(err);

            setError(
                err.message || "Unable to load attendance report"
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // FILTER
    // ==========================================

    const filteredRecords = records.filter((record) => {

        const searchText = search.toLowerCase();

        return (
            String(record.student_id || "")
                .toLowerCase()
                .includes(searchText) ||

            String(record.name || "")
                .toLowerCase()
                .includes(searchText)
        );
    });

    // ==========================================
    // COURSES
    // ==========================================

    const courses = [
        ...new Set(
            records
                .map((record) => record.course)
                .filter(Boolean)
        ),
    ];

    // ==========================================
    // COUNTS
    // ==========================================

    const totalRecords = filteredRecords.length;

    const presentCount = filteredRecords.filter(
        (record) =>
            String(record.status).toLowerCase() === "present"
    ).length;

    const absentCount = filteredRecords.filter(
        (record) =>
            String(record.status).toLowerCase() === "absent"
    ).length;

    const attendancePercentage =
        totalRecords > 0
            ? ((presentCount / totalRecords) * 100).toFixed(1)
            : "0.0";

    // ==========================================
    // EXPORT CSV
    // ==========================================

    const exportCSV = () => {

        if (filteredRecords.length === 0) {
            alert("No attendance records to export.");
            return;
        }

        const headers = [
            "Student ID",
            "Student Name",
            "Course",
            "Date",
            "Start Time",
            "End Time",
            "Status",
        ];

        const rows = filteredRecords.map((record) => [
            record.student_id || "",
            record.name || "",
            record.course || "",
            record.attendance_date || "",
            record.start_time || "",
            record.end_time || "",
            record.status || "",
        ]);

        const csvContent = [
            headers,
            ...rows,
        ]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value).replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csvContent],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download =
            `attendance-report-${fromDate}-to-${toDate}.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    // ==========================================
    // RESET
    // ==========================================

    const resetFilters = () => {
        setFromDate(today);
        setToDate(today);
        setCourse("All");
        setStatus("All");
        setSearch("");
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="attendance-report-page">

            {/* HEADER */}

            <header className="report-header">

                <div>
                    <h1>Attendance Report</h1>

                    <p>
                        View and analyze student attendance records
                    </p>
                </div>

                <button
                    className="report-back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>

            </header>


            <main className="report-content">

                {/* FILTER CARD */}

                <section className="report-filter-card">

                    <div className="report-filter">

                        <label>
                            From Date
                        </label>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) =>
                                setFromDate(e.target.value)
                            }
                        />

                    </div>


                    <div className="report-filter">

                        <label>
                            To Date
                        </label>

                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) =>
                                setToDate(e.target.value)
                            }
                        />

                    </div>


                    <div className="report-filter">

                        <label>
                            Course
                        </label>

                        <select
                            value={course}
                            onChange={(e) =>
                                setCourse(e.target.value)
                            }
                        >

                            <option value="All">
                                All Courses
                            </option>

                            {courses.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}

                        </select>

                    </div>


                    <div className="report-filter">

                        <label>
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                        >

                            <option value="All">
                                All
                            </option>

                            <option value="present">
                                Present
                            </option>

                            <option value="absent">
                                Absent
                            </option>

                        </select>

                    </div>


                    <div className="report-filter search-filter">

                        <label>
                            Search Student
                        </label>

                        <input
                            type="text"
                            placeholder="ID or student name"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>


                    <div className="report-filter-buttons">

                        <button
                            className="generate-button"
                            onClick={loadReport}
                        >
                            🔍 Generate Report
                        </button>

                        <button
                            className="reset-button"
                            onClick={resetFilters}
                        >
                            Reset
                        </button>

                    </div>

                </section>


                {/* ERROR */}

                {error && (
                    <div className="report-error">
                        {error}
                    </div>
                )}


                {/* SUMMARY */}

                <section className="report-summary">

                    <div className="summary-box">

                        <span>
                            Total Records
                        </span>

                        <strong>
                            {totalRecords}
                        </strong>

                    </div>


                    <div className="summary-box present-summary">

                        <span>
                            Present
                        </span>

                        <strong>
                            {presentCount}
                        </strong>

                    </div>


                    <div className="summary-box absent-summary">

                        <span>
                            Absent
                        </span>

                        <strong>
                            {absentCount}
                        </strong>

                    </div>


                    <div className="summary-box percentage-summary">

                        <span>
                            Attendance %
                        </span>

                        <strong>
                            {attendancePercentage}%
                        </strong>

                    </div>

                </section>


                {/* REPORT TABLE */}

                <section className="report-card">

                    <div className="report-card-header">

                        <div>

                            <h2>
                                Attendance Records
                            </h2>

                            <p>
                                {fromDate} to {toDate}
                            </p>

                        </div>


                        <button
                            className="export-button"
                            onClick={exportCSV}
                            disabled={
                                filteredRecords.length === 0
                            }
                        >
                            📥 Export CSV
                        </button>

                    </div>


                    {loading ? (

                        <div className="report-loading">
                            Loading attendance report...
                        </div>

                    ) : filteredRecords.length === 0 ? (

                        <div className="report-empty">

                            <div className="empty-icon">
                                📊
                            </div>

                            <h3>
                                No Attendance Records
                            </h3>

                            <p>
                                No attendance records were found
                                for the selected filters.
                            </p>

                        </div>

                    ) : (

                        <div className="report-table-wrapper">

                            <table className="report-table">

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Student ID
                                        </th>

                                        <th>
                                            Student Name
                                        </th>

                                        <th>
                                            Course
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Time
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredRecords.map(
                                        (record, index) => (

                                            <tr
                                                key={
                                                    record.id ||
                                                    `${record.student_id}-${record.attendance_date}-${index}`
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            record.student_id
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        record.name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.course ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.attendance_date
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        record.start_time
                                                    }
                                                    {" - "}
                                                    {
                                                        record.end_time
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            String(
                                                                record.status
                                                            ).toLowerCase() ===
                                                            "present"
                                                                ? "status-badge present-badge"
                                                                : "status-badge absent-badge"
                                                        }
                                                    >
                                                        {
                                                            record.status
                                                        }
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default AttendanceReport;
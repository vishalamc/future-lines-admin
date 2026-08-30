import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Attendance.css";


function Attendance() {

    const navigate = useNavigate();


    const [students, setStudents] = useState([]);

    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [startTime, setStartTime] = useState("08:00");

    const [endTime, setEndTime] = useState("10:00");

    const [course, setCourse] = useState("All");

    const [batch, setBatch] = useState("All");

    const [attendance, setAttendance] = useState({});

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");


    // ==================================================
    // LOAD STUDENTS
    // ==================================================

    useEffect(() => {

        loadStudents();

    }, []);


    const loadStudents = async () => {

        try {

            setLoading(true);

            const response = await fetch(
                "/api/attendance/students",
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


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load students"
                );

            }


            setStudents(
                data.students || []
            );


            // Default all students to present

            const defaultAttendance = {};

            (data.students || []).forEach(
                student => {

                    defaultAttendance[
                        student.id
                    ] = "present";

                }
            );


            setAttendance(
                defaultAttendance
            );


        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Unable to load students"
            );


        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // FILTER STUDENTS
    // ==================================================

    const filteredStudents =
        students.filter(student => {

            const courseMatch =
                course === "All" ||
                student.course === course;

            const batchMatch =
                batch === "All" ||
                student.batch === batch;

            return (
                courseMatch &&
                batchMatch
            );

        });


    // ==================================================
    // MARK ALL PRESENT
    // ==================================================

    const markAllPresent = () => {

        const updated = {
            ...attendance,
        };


        filteredStudents.forEach(
            student => {

                updated[
                    student.id
                ] = "present";

            }
        );


        setAttendance(updated);

    };


    // ==================================================
    // MARK ALL ABSENT
    // ==================================================

    const markAllAbsent = () => {

        const updated = {
            ...attendance,
        };


        filteredStudents.forEach(
            student => {

                updated[
                    student.id
                ] = "absent";

            }
        );


        setAttendance(updated);

    };


    // ==================================================
    // CHANGE STATUS
    // ==================================================

    const changeAttendance = (
        studentId,
        status
    ) => {

        setAttendance(
            previous => ({
                ...previous,
                [studentId]: status,
            })
        );

    };


    // ==================================================
    // SAVE ATTENDANCE
    // ==================================================

    const saveAttendance = async () => {

        setMessage("");

        setError("");

        setSaving(true);


        try {

            const attendanceData =
                filteredStudents.map(
                    student => ({

                        student_id:
                            student.id,

                        status:
                            attendance[
                                student.id
                            ] || "absent",

                    })
                );


            const response = await fetch(
                "/api/attendance/save",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    credentials: "include",

                    body: JSON.stringify({

                        attendance_date: date,

                        start_time: startTime,

                        end_time: endTime,

                        attendance:
                            attendanceData,

                    }),
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to save attendance"
                );

            }


            setMessage(
                "Attendance saved successfully."
            );


        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Unable to save attendance."
            );


        } finally {

            setSaving(false);

        }

    };


    // ==================================================
    // UNIQUE COURSES
    // ==================================================

    const courses = [
        ...new Set(
            students
                .map(
                    student =>
                        student.course
                )
                .filter(Boolean)
        ),
    ];


    // ==================================================
    // UNIQUE BATCHES
    // ==================================================

    const batches = [
        ...new Set(
            students
                .map(
                    student =>
                        student.batch
                )
                .filter(Boolean)
        ),
    ];


    // ==================================================
    // COUNTS
    // ==================================================

    const presentCount =
        filteredStudents.filter(
            student =>
                attendance[
                    student.id
                ] === "present"
        ).length;


    const absentCount =
        filteredStudents.filter(
            student =>
                attendance[
                    student.id
                ] === "absent"
        ).length;


    return (

        <div className="attendance-page">


            {/* ==========================================
                HEADER
            ========================================== */}

            <header className="attendance-header">


                <div>

                    <h1>
                        Mark Attendance
                    </h1>

                    <p>
                        Manage daily student attendance
                    </p>

                </div>


                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    ← Dashboard
                </button>


            </header>


            <main className="attendance-content">


                {/* ==========================================
                    FILTER CARD
                ========================================== */}

                <div className="attendance-control-card">


                    <div className="control-group">

                        <label>
                            Attendance Date
                        </label>

                        <input
                            type="date"
                            value={date}
                            onChange={e =>
                                setDate(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="control-group">

                        <label>
                            Start Time
                        </label>

                        <input
                            type="time"
                            value={startTime}
                            onChange={e =>
                                setStartTime(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="control-group">

                        <label>
                            End Time
                        </label>

                        <input
                            type="time"
                            value={endTime}
                            onChange={e =>
                                setEndTime(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="control-group">

                        <label>
                            Course
                        </label>

                        <select
                            value={course}
                            onChange={e =>
                                setCourse(
                                    e.target.value
                                )
                            }
                        >

                            <option value="All">
                                All Courses
                            </option>

                            {courses.map(
                                item => (

                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    <div className="control-group">

                        <label>
                            Batch
                        </label>

                        <select
                            value={batch}
                            onChange={e =>
                                setBatch(
                                    e.target.value
                                )
                            }
                        >

                            <option value="All">
                                All Batches
                            </option>

                            {batches.map(
                                item => (

                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                </div>


                {/* ==========================================
                    MESSAGES
                ========================================== */}

                {message && (

                    <div className="success-message">
                        ✓ {message}
                    </div>

                )}


                {error && (

                    <div className="attendance-error">
                        {error}
                    </div>

                )}


                {/* ==========================================
                    SUMMARY
                ========================================== */}

                <div className="attendance-summary">


                    <div>
                        <span>
                            Total Students
                        </span>

                        <strong>
                            {filteredStudents.length}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Present
                        </span>

                        <strong className="present-number">
                            {presentCount}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Absent
                        </span>

                        <strong className="absent-number">
                            {absentCount}
                        </strong>
                    </div>


                </div>


                {/* ==========================================
                    ATTENDANCE TABLE
                ========================================== */}

                <div className="attendance-card">


                    <div className="attendance-card-header">


                        <div>

                            <h2>
                                Student Attendance
                            </h2>

                            <p>
                                {date} &nbsp; | &nbsp;
                                {startTime} - {endTime}
                            </p>

                        </div>


                        <div className="quick-actions">

                            <button
                                onClick={
                                    markAllPresent
                                }
                            >
                                Mark All Present
                            </button>


                            <button
                                onClick={
                                    markAllAbsent
                                }
                            >
                                Mark All Absent
                            </button>

                        </div>


                    </div>


                    {loading ? (

                        <div className="attendance-loading">
                            Loading students...
                        </div>

                    ) : filteredStudents.length === 0 ? (

                        <div className="no-students">

                            <div>
                                👨‍🎓
                            </div>

                            <h3>
                                No Students Found
                            </h3>

                            <p>
                                No students match
                                the selected filters.
                            </p>

                        </div>

                    ) : (

                        <div className="attendance-table-wrapper">

                            <table className="attendance-table">

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
                                            Batch
                                        </th>

                                        <th>
                                            Attendance
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredStudents.map(
                                        (
                                            student,
                                            index
                                        ) => (

                                            <tr
                                                key={
                                                    student.id
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            student.student_id
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        student.name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        student.course ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        student.batch ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>

                                                    <div className="attendance-buttons">

                                                        <button
                                                            className={
                                                                attendance[
                                                                    student.id
                                                                ] ===
                                                                "present"
                                                                    ? "present active"
                                                                    : "present"
                                                            }

                                                            onClick={() =>
                                                                changeAttendance(
                                                                    student.id,
                                                                    "present"
                                                                )
                                                            }
                                                        >
                                                            ✓ Present
                                                        </button>


                                                        <button
                                                            className={
                                                                attendance[
                                                                    student.id
                                                                ] ===
                                                                "absent"
                                                                    ? "absent active"
                                                                    : "absent"
                                                            }

                                                            onClick={() =>
                                                                changeAttendance(
                                                                    student.id,
                                                                    "absent"
                                                                )
                                                            }
                                                        >
                                                            ✕ Absent
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}


                    {/* SAVE */}

                    {filteredStudents.length > 0 && (

                        <div className="save-attendance">

                            <button
                                onClick={
                                    saveAttendance
                                }
                                disabled={saving}
                            >

                                {saving
                                    ? "Saving..."
                                    : "Save Attendance"
                                }

                            </button>

                        </div>

                    )}

                </div>


            </main>

        </div>

    );

}


export default Attendance;
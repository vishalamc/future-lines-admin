import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FeesManagement.css";

function FeesManagement() {
    const navigate = useNavigate();

    // =====================================================
    // STATES
    // =====================================================

    const [students, setStudents] = useState([]);
    const [fees, setFees] = useState([]);

    const [selectedStudent, setSelectedStudent] =
        useState(null);

    const [selectedFee, setSelectedFee] =
        useState(null);

    const [transactions, setTransactions] =
        useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        student_id: "",
        course_name: "",
        total_fee: "",
        discount: "",
        amount_paid: "",
        payment_date:
            new Date().toISOString().split("T")[0],
        payment_mode: "",
        transaction_number: "",
        remarks: "",
    });

    // =====================================================
    // LOAD INITIAL DATA
    // =====================================================

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError("");

            const [studentsResponse, feesResponse] =
                await Promise.all([
                    fetch("/api/students/all", {
                        credentials: "include",
                    }),

                    fetch("/api/fees", {
                        credentials: "include",
                    }),
                ]);

            // -------------------------------------------------
            // STUDENTS RESPONSE
            // -------------------------------------------------

            const studentsContentType =
                studentsResponse.headers.get(
                    "content-type"
                ) || "";

            const studentsText =
                await studentsResponse.text();

            let studentsData;

            if (
                studentsContentType.includes(
                    "application/json"
                )
            ) {
                studentsData =
                    JSON.parse(studentsText);
            } else {
                throw new Error(
                    "Student API returned an invalid response. Please check your backend or Vite proxy."
                );
            }

            // -------------------------------------------------
            // FEES RESPONSE
            // -------------------------------------------------

            const feesContentType =
                feesResponse.headers.get(
                    "content-type"
                ) || "";

            const feesText =
                await feesResponse.text();

            let feesData;

            if (
                feesContentType.includes(
                    "application/json"
                )
            ) {
                feesData =
                    JSON.parse(feesText);
            } else {
                throw new Error(
                    "Fee API returned an invalid response. Please check your backend or Vite proxy."
                );
            }

            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (
                !studentsResponse.ok ||
                !studentsData.success
            ) {
                throw new Error(
                    studentsData.message ||
                        "Unable to load students."
                );
            }

            if (
                !feesResponse.ok ||
                !feesData.success
            ) {
                throw new Error(
                    feesData.message ||
                        "Unable to load fee records."
                );
            }

            setStudents(
                studentsData.students || []
            );

            setFees(
                feesData.fees || []
            );
        } catch (err) {
            console.error(
                "Load fees page error:",
                err
            );

            setError(
                err.message ||
                    "Failed to load fee management data."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD FEE SUMMARY
    // =====================================================

    const loadFeeDetails = async (
        studentCode
    ) => {
        if (!studentCode) {
            setSelectedFee(null);
            setTransactions([]);
            return;
        }

        try {
            const response = await fetch(
                `/api/fees/student/${encodeURIComponent(
                    studentCode
                )}`,
                {
                    credentials: "include",
                }
            );

            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";

            const text =
                await response.text();

            if (
                !contentType.includes(
                    "application/json"
                )
            ) {
                throw new Error(
                    "Fee details API returned an invalid response."
                );
            }

            const data =
                JSON.parse(text);

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                        "Unable to load student fee details."
                );
            }

            setSelectedFee(
                data.summary || null
            );

            setTransactions(
                data.transactions || []
            );

            // -------------------------------------------------
            // LOAD CURRENT FEE STRUCTURE INTO FORM
            // -------------------------------------------------

            if (data.summary) {
                setForm((previous) => ({
                    ...previous,

                    total_fee:
                        data.summary.total_fee ??
                        "",

                    discount:
                        data.summary.discount ??
                        "",
                }));
            }
        } catch (err) {
            console.error(
                "Load fee details error:",
                err
            );

            setSelectedFee(null);
            setTransactions([]);

            setError(
                err.message ||
                    "Unable to load student fee details."
            );
        }
    };

    // =====================================================
    // STUDENT CHANGE
    // =====================================================

    const handleStudentChange = async (
        e
    ) => {
        const studentCode =
            e.target.value;

        setError("");
        setSuccess("");

        if (!studentCode) {
            setSelectedStudent(null);
            setSelectedFee(null);
            setTransactions([]);

            setForm({
                student_id: "",
                course_name: "",
                total_fee: "",
                discount: "",
                amount_paid: "",
                payment_date:
                    new Date()
                        .toISOString()
                        .split("T")[0],
                payment_mode: "",
                transaction_number: "",
                remarks: "",
            });

            return;
        }

        const student =
            students.find(
                (item) =>
                    String(
                        item.student_id ||
                            item.student_code
                    ) ===
                    String(studentCode)
            );

        setSelectedStudent(
            student || null
        );

        setForm((previous) => ({
            ...previous,

            student_id:
                studentCode,

            course_name:
                student?.course ||
                student?.student_course ||
                "",
        }));

        await loadFeeDetails(
            studentCode
        );
    };

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =====================================================
    // CALCULATIONS
    // =====================================================

    const totalFee = Number(
        form.total_fee || 0
    );

    const discount = Number(
        form.discount || 0
    );

    const amountPaid = Number(
        form.amount_paid || 0
    );

    const netFee = Math.max(
        totalFee - discount,
        0
    );

    const previousPaid = Number(
        selectedFee?.total_paid || 0
    );

    const currentPending = Math.max(
        netFee - previousPaid,
        0
    );

    const pendingAfterPayment =
        Math.max(
            currentPending -
                amountPaid,
            0
        );

    // =====================================================
    // CURRENCY FORMAT
    // =====================================================

    const currency = (value) =>
        `₹${Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;

    // =====================================================
    // SAVE PAYMENT
    // =====================================================

    const handleSubmit = async (
        e
    ) => {
        e.preventDefault();

        // Clear previous messages
        setError("");
        setSuccess("");

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!form.student_id) {
            setError(
                "Please select a student."
            );
            return;
        }

        if (!form.course_name) {
            setError(
                "Course name is required."
            );
            return;
        }

        if (
            form.total_fee === "" ||
            totalFee < 0
        ) {
            setError(
                "Please enter a valid total fee."
            );
            return;
        }

        if (discount < 0) {
            setError(
                "Discount cannot be negative."
            );
            return;
        }

        if (
            discount > totalFee
        ) {
            setError(
                "Discount cannot be greater than total fee."
            );
            return;
        }

        if (amountPaid < 0) {
            setError(
                "Payment amount cannot be negative."
            );
            return;
        }

        if (
            amountPaid >
            currentPending
        ) {
            setError(
                `Payment cannot exceed pending amount of ${currency(
                    currentPending
                )}.`
            );
            return;
        }

        if (
            amountPaid > 0 &&
            !form.payment_date
        ) {
            setError(
                "Payment date is required."
            );
            return;
        }

        if (
            amountPaid > 0 &&
            !form.payment_mode
        ) {
            setError(
                "Please select payment mode."
            );
            return;
        }

        try {
            setSaving(true);

            // -------------------------------------------------
            // API REQUEST
            // -------------------------------------------------

            const response =
                await fetch(
                    "/api/fees",
                    {
                        method: "POST",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify(
                            {
                                student_id:
                                    form.student_id,

                                course_name:
                                    form.course_name,

                                total_fee:
                                    totalFee,

                                discount:
                                    discount,

                                amount_paid:
                                    amountPaid,

                                payment_date:
                                    form.payment_date ||
                                    null,

                                payment_mode:
                                    form.payment_mode ||
                                    null,

                                transaction_number:
                                    form.transaction_number.trim() ||
                                    null,

                                remarks:
                                    form.remarks.trim() ||
                                    null,
                            }
                        ),
                    }
                );

            // -------------------------------------------------
            // READ RESPONSE
            // -------------------------------------------------

            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";

            const text =
                await response.text();

            if (
                !contentType.includes(
                    "application/json"
                )
            ) {
                console.error(
                    "Invalid API response:",
                    text.substring(
                        0,
                        500
                    )
                );

                throw new Error(
                    "Server returned an invalid response. Please check the backend/API connection."
                );
            }

            let data;

            try {
                data =
                    JSON.parse(text);
            } catch (parseError) {
                console.error(
                    "JSON parse error:",
                    text
                );

                throw new Error(
                    "Server returned invalid JSON."
                );
            }

            // -------------------------------------------------
            // API ERROR
            // -------------------------------------------------

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                        "Failed to save fee payment."
                );
            }

            // =================================================
            // SUCCESS
            // =================================================

            const successMessage =
                amountPaid > 0
                    ? "✓ Payment done successfully."
                    : "✓ Fee structure saved successfully.";

            // IMPORTANT:
            // Set success AFTER successful API response
            setSuccess(
                successMessage
            );

            // Clear error
            setError("");

            // -------------------------------------------------
            // CLEAR PAYMENT FIELDS
            // -------------------------------------------------

            setForm(
                (previous) => ({
                    ...previous,

                    amount_paid:
                        "",

                    payment_mode:
                        "",

                    transaction_number:
                        "",

                    remarks:
                        "",
                })
            );

            // -------------------------------------------------
            // REFRESH FEE LIST
            // -------------------------------------------------

            const feesResponse =
                await fetch(
                    "/api/fees",
                    {
                        credentials:
                            "include",
                    }
                );

            if (
                feesResponse.ok
            ) {
                const feesData =
                    await feesResponse.json();

                if (
                    feesData.success
                ) {
                    setFees(
                        feesData.fees ||
                            []
                    );
                }
            }

            // -------------------------------------------------
            // REFRESH SELECTED STUDENT
            // -------------------------------------------------

            if (
                form.student_id
            ) {
                await loadFeeDetails(
                    form.student_id
                );
            }

            // -------------------------------------------------
            // KEEP SUCCESS MESSAGE
            // -------------------------------------------------

            setSuccess(
                successMessage
            );

        } catch (err) {
            console.error(
                "Save fee error:",
                err
            );

            setSuccess("");

            setError(
                err.message ||
                    "Failed to save fee payment."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // DELETE TRANSACTION
    // =====================================================

    const handleDelete =
        async (id) => {
            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this fee transaction?"
                );

            if (!confirmed) {
                return;
            }

            try {
                setError("");
                setSuccess("");

                const response =
                    await fetch(
                        `/api/fees/${id}`,
                        {
                            method:
                                "DELETE",

                            credentials:
                                "include",
                        }
                    );

                const contentType =
                    response.headers.get(
                        "content-type"
                    ) || "";

                const text =
                    await response.text();

                if (
                    !contentType.includes(
                        "application/json"
                    )
                ) {
                    throw new Error(
                        "Server returned an invalid response."
                    );
                }

                const data =
                    JSON.parse(text);

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.message ||
                            "Unable to delete transaction."
                    );
                }

                setSuccess(
                    "✓ Fee transaction deleted successfully."
                );

                // Refresh fee records
                const feesResponse =
                    await fetch(
                        "/api/fees",
                        {
                            credentials:
                                "include",
                        }
                    );

                if (
                    feesResponse.ok
                ) {
                    const feesData =
                        await feesResponse.json();

                    if (
                        feesData.success
                    ) {
                        setFees(
                            feesData.fees ||
                                []
                        );
                    }
                }

                // Refresh student details
                if (
                    form.student_id
                ) {
                    await loadFeeDetails(
                        form.student_id
                    );
                }
            } catch (err) {
                console.error(
                    "Delete transaction error:",
                    err
                );

                setError(
                    err.message ||
                        "Failed to delete transaction."
                );

                setSuccess("");
            }
        };

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout =
        async () => {
            try {
                await fetch(
                    "/api/auth/logout",
                    {
                        method:
                            "POST",

                        credentials:
                            "include",
                    }
                );
            } catch (error) {
                console.error(
                    "Logout error:",
                    error
                );
            } finally {
                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );
            }
        };

    // =====================================================
    // VIEW STUDENT FROM TABLE
    // =====================================================

    const handleViewStudent =
        async (
            studentCode
        ) => {
            const student =
                students.find(
                    (item) =>
                        String(
                            item.student_id ||
                                item.student_code
                        ) ===
                        String(
                            studentCode
                        )
                );

            if (student) {
                setSelectedStudent(
                    student
                );
            }

            setForm(
                (previous) => ({
                    ...previous,

                    student_id:
                        studentCode,

                    course_name:
                        student?.course ||
                        student?.student_course ||
                        previous.course_name,
                })
            );

            await loadFeeDetails(
                studentCode
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        };

    // =====================================================
    // LOADING SCREEN
    // =====================================================

    if (loading) {
        return (
            <div className="fees-page">

                <div className="fees-loading">

                    <div className="fees-spinner"></div>

                    <p>
                        Loading fee
                        management...
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="fees-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="fees-header">

                <div className="fees-header-left">

                    <button
                        type="button"
                        className="back-dashboard-btn"
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        <span className="back-icon">
                            ←
                        </span>

                        <span>
                            Back to Dashboard
                        </span>
                    </button>

                    <div className="fees-title-area">

                        <h1>
                            Fees Management
                        </h1>

                        <p>
                            Manage student
                            fees, payments
                            and receipts
                        </p>

                    </div>

                </div>

                <button
                    type="button"
                    className="logout-btn"
                    onClick={
                        handleLogout
                    }
                >
                    <span>
                        ↪
                    </span>

                    <span>
                        Logout
                    </span>
                </button>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="fees-container">

                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {success && (
                    <div className="fees-alert success">

                        <span className="alert-icon">
                            ✓
                        </span>

                        <span className="alert-message">
                            {success}
                        </span>

                        <button
                            type="button"
                            className="alert-close"
                            onClick={() =>
                                setSuccess(
                                    ""
                                )
                            }
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {error && (
                    <div className="fees-alert error">

                        <span className="alert-icon">
                            !
                        </span>

                        <span className="alert-message">
                            {error}
                        </span>

                        <button
                            type="button"
                            className="alert-close"
                            onClick={() =>
                                setError(
                                    ""
                                )
                            }
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="fees-stat-grid">

                    <div className="fee-stat-card">

                        <div className="stat-icon">
                            👨‍🎓
                        </div>

                        <div>

                            <span>
                                Total Students
                            </span>

                            <strong>
                                {
                                    students.length
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="fee-stat-card">

                        <div className="stat-icon">
                            📋
                        </div>

                        <div>

                            <span>
                                Fee Records
                            </span>

                            <strong>
                                {
                                    fees.length
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="fee-stat-card">

                        <div className="stat-icon">
                            ₹
                        </div>

                        <div>

                            <span>
                                Total Collected
                            </span>

                            <strong>
                                {currency(
                                    fees.reduce(
                                        (
                                            total,
                                            item
                                        ) =>
                                            total +
                                            Number(
                                                item.total_paid ||
                                                    0
                                            ),
                                        0
                                    )
                                )}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ADD PAYMENT
                ================================================= */}

                <section className="fee-form-card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Add Fee / Payment
                            </h2>

                            <p>
                                Select a
                                student and
                                record their
                                fee payment.
                            </p>

                        </div>

                    </div>


                    <form
                        className="fee-form"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* STUDENT */}

                        <div className="form-group full-width">

                            <label>
                                Select Student
                                <span>
                                    *
                                </span>
                            </label>

                            <select
                                name="student_id"
                                value={
                                    form.student_id
                                }
                                onChange={
                                    handleStudentChange
                                }
                            >

                                <option value="">
                                    -- Select Student --
                                </option>

                                {students.map(
                                    (
                                        student
                                    ) => {

                                        const studentCode =
                                            student.student_id ||
                                            student.student_code;

                                        return (
                                            <option
                                                key={
                                                    student.id ||
                                                    student.user_id ||
                                                    studentCode
                                                }
                                                value={
                                                    studentCode
                                                }
                                            >
                                                {
                                                    studentCode
                                                }{" "}
                                                -{" "}
                                                {
                                                    student.name
                                                }{" "}
                                                -{" "}
                                                {student.course ||
                                                    student.student_course ||
                                                    ""}
                                            </option>
                                        );
                                    }
                                )}

                            </select>

                        </div>


                        {/* STUDENT INFORMATION */}

                        {selectedStudent && (
                            <div className="student-info-box">

                                <div>

                                    <span>
                                        Student
                                    </span>

                                    <strong>
                                        {
                                            selectedStudent.name
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Student ID
                                    </span>

                                    <strong>
                                        {selectedStudent.student_id ||
                                            selectedStudent.student_code}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Course
                                    </span>

                                    <strong>
                                        {selectedStudent.course ||
                                            selectedStudent.student_course ||
                                            "-"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Batch
                                    </span>

                                    <strong>
                                        {
                                            selectedStudent.batch ||
                                            "-"
                                        }
                                    </strong>

                                </div>

                            </div>
                        )}


                        {/* COURSE */}

                        <div className="form-group">

                            <label>
                                Course
                                <span>
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                name="course_name"
                                value={
                                    form.course_name
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Course name"
                            />

                        </div>


                        {/* TOTAL FEE */}

                        <div className="form-group">

                            <label>
                                Total Fee
                                <span>
                                    *
                                </span>
                            </label>

                            <input
                                type="number"
                                name="total_fee"
                                value={
                                    form.total_fee
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                                step="0.01"
                                placeholder="₹ 0.00"
                            />

                        </div>


                        {/* DISCOUNT */}

                        <div className="form-group">

                            <label>
                                Discount
                            </label>

                            <input
                                type="number"
                                name="discount"
                                value={
                                    form.discount
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                                step="0.01"
                                placeholder="₹ 0.00"
                            />

                        </div>


                        {/* AMOUNT PAID */}

                        <div className="form-group">

                            <label>
                                Amount Paid
                            </label>

                            <input
                                type="number"
                                name="amount_paid"
                                value={
                                    form.amount_paid
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                                step="0.01"
                                placeholder="₹ 0.00"
                            />

                        </div>


                        {/* PAYMENT DATE */}

                        <div className="form-group">

                            <label>
                                Payment Date
                            </label>

                            <input
                                type="date"
                                name="payment_date"
                                value={
                                    form.payment_date
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>


                        {/* PAYMENT MODE */}

                        <div className="form-group">

                            <label>
                                Payment Mode
                            </label>

                            <select
                                name="payment_mode"
                                value={
                                    form.payment_mode
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="">
                                    -- Select Mode --
                                </option>

                                <option value="Cash">
                                    Cash
                                </option>

                                <option value="UPI">
                                    UPI
                                </option>

                                <option value="Bank Transfer">
                                    Bank Transfer
                                </option>

                                <option value="Cheque">
                                    Cheque
                                </option>

                                <option value="Online">
                                    Online
                                </option>

                            </select>

                        </div>


                        {/* TRANSACTION NUMBER */}

                        <div className="form-group">

                            <label>
                                Transaction Number
                            </label>

                            <input
                                type="text"
                                name="transaction_number"
                                value={
                                    form.transaction_number
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="UPI / UTR / Cheque No."
                            />

                            <small className="field-help">
                                Optional for
                                cash payments.
                            </small>

                        </div>


                        {/* REMARKS */}

                        <div className="form-group full-width">

                            <label>
                                Remarks
                            </label>

                            <textarea
                                name="remarks"
                                value={
                                    form.remarks
                                }
                                onChange={
                                    handleChange
                                }
                                rows="3"
                                placeholder="Optional remarks..."
                            />

                        </div>


                        {/* =================================================
                            PAYMENT SUMMARY
                        ================================================= */}

                        <div className="payment-summary">

                            <div>

                                <span>
                                    Net Fee
                                </span>

                                <strong>
                                    {currency(
                                        netFee
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Previously Paid
                                </span>

                                <strong>
                                    {currency(
                                        previousPaid
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Current Pending
                                </span>

                                <strong>
                                    {currency(
                                        currentPending
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    After Payment
                                </span>

                                <strong>
                                    {currency(
                                        pendingAfterPayment
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* SAVE */}

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="save-fee-btn"
                                disabled={
                                    saving
                                }
                            >

                                {saving ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        ✓ Save Payment
                                    </>
                                )}

                            </button>

                        </div>

                    </form>

                </section>


                {/* =================================================
                    FEE RECORDS
                ================================================= */}

                <section className="fee-records-card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Fee Records
                            </h2>

                            <p>
                                Student fee
                                summary and
                                payment status.
                            </p>

                        </div>

                    </div>


                    <div className="table-wrapper">

                        <table className="fees-table">

                            <thead>

                                <tr>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Course
                                    </th>

                                    <th>
                                        Net Fee
                                    </th>

                                    <th>
                                        Paid
                                    </th>

                                    <th>
                                        Pending
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {fees.length ===
                                0 ? (
                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="empty-table"
                                        >
                                            No fee
                                            records
                                            found.
                                        </td>

                                    </tr>
                                ) : (
                                    fees.map(
                                        (
                                            fee
                                        ) => (
                                            <tr
                                                key={
                                                    fee.user_id
                                                }
                                            >

                                                <td>

                                                    <div className="student-cell">

                                                        <strong>
                                                            {
                                                                fee.name
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                fee.student_code
                                                            }
                                                        </small>

                                                    </div>

                                                </td>


                                                <td>
                                                    {
                                                        fee.course_name
                                                    }
                                                </td>


                                                <td>
                                                    {currency(
                                                        fee.net_fee
                                                    )}
                                                </td>


                                                <td className="paid-text">
                                                    {currency(
                                                        fee.total_paid
                                                    )}
                                                </td>


                                                <td className="pending-text">
                                                    {currency(
                                                        fee.pending_amount
                                                    )}
                                                </td>


                                                <td>

                                                    <span
                                                        className={`status-badge ${String(
                                                            fee.payment_status ||
                                                                ""
                                                        ).toLowerCase()}`}
                                                    >
                                                        {
                                                            fee.payment_status
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        className="view-btn"
                                                        onClick={() =>
                                                            handleViewStudent(
                                                                fee.student_code
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                </td>

                                            </tr>
                                        )
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* =================================================
                    PAYMENT HISTORY
                ================================================= */}

                {selectedStudent &&
                    transactions.length >
                        0 && (
                        <section className="fee-records-card">

                            <div className="section-heading">

                                <div>

                                    <h2>
                                        Payment History
                                    </h2>

                                    <p>
                                        {
                                            selectedStudent.name
                                        }{" "}
                                        —{" "}
                                        {selectedStudent.student_id ||
                                            selectedStudent.student_code}
                                    </p>

                                </div>

                            </div>


                            <div className="table-wrapper">

                                <table className="fees-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Amount
                                            </th>

                                            <th>
                                                Mode
                                            </th>

                                            <th>
                                                Transaction No.
                                            </th>

                                            <th>
                                                Receipt No.
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {transactions.map(
                                            (
                                                transaction
                                            ) => (
                                                <tr
                                                    key={
                                                        transaction.id
                                                    }
                                                >

                                                    <td>
                                                        {transaction.payment_date
                                                            ? new Date(
                                                                  transaction.payment_date
                                                              ).toLocaleDateString(
                                                                  "en-IN"
                                                              )
                                                            : "-"}
                                                    </td>


                                                    <td className="paid-text">
                                                        {currency(
                                                            transaction.amount_paid
                                                        )}
                                                    </td>


                                                    <td>
                                                        {transaction.payment_mode ||
                                                            "-"}
                                                    </td>


                                                    <td>
                                                        {transaction.transaction_number ||
                                                            "-"}
                                                    </td>


                                                    <td>
                                                        {transaction.receipt_number ||
                                                            "-"}
                                                    </td>


                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    transaction.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </section>
                    )}

            </main>

        </div>
    );
}

export default FeesManagement;
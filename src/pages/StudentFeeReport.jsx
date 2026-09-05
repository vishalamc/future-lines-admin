import React, {
    useEffect,
    useState,
} from "react";

import "./StudentFeeReport.css";

function StudentFeeReport() {

    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // ==================================================
    // LOAD STUDENT FEES
    // ==================================================

    useEffect(() => {

        const loadFees = async () => {

            try {

                setLoading(true);

                const response =
                    await fetch(
                        "/api/fees/my-fees",
                        {
                            credentials:
                                "include",
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Unable to load fee report."
                    );
                }

                setData(result);

            } catch (err) {

                console.error(
                    "Student fee report error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load fee report."
                );

            } finally {

                setLoading(false);
            }
        };

        loadFees();

    }, []);

    // ==================================================
    // FORMAT MONEY
    // ==================================================

    const formatMoney = (
        amount
    ) =>
        `₹${Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;

    // ==================================================
    // FORMAT DATE
    // ==================================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "-";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (
            <div className="student-fee-page">

                <div className="student-fee-loading">

                    <div className="student-fee-loader">
                        ₹
                    </div>

                    <h3>
                        Loading fee report...
                    </h3>

                    <p>
                        Please wait while we
                        retrieve your fee details.
                    </p>

                </div>

            </div>
        );
    }

    // ==================================================
    // ERROR
    // ==================================================

    if (error) {

        return (
            <div className="student-fee-page">

                <div className="student-fee-error">

                    <div>
                        !
                    </div>

                    <h3>
                        Unable to load fee report
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    const student =
        data?.student;

    const summary =
        data?.summary;

    const transactions =
        data?.transactions || [];

    const hasFees =
        transactions.length > 0;

    return (
        <div className="student-fee-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="student-fee-header">

                <div>

                    <span className="student-fee-eyebrow">
                        STUDENT PORTAL
                    </span>

                    <h1>
                        Fee Report
                    </h1>

                    <p>
                        View your fee payment,
                        paid amount and
                        pending balance.
                    </p>

                </div>

                <div className="student-fee-header-icon">
                    ₹
                </div>

            </div>


            {/* =========================================
                STUDENT PROFILE
            ========================================= */}

            {student && (

                <div className="student-fee-profile">

                    <div className="student-fee-avatar">

                        {student.name
                            ?.charAt(0)
                            .toUpperCase()}

                    </div>

                    <div className="student-fee-profile-main">

                        <h2>
                            {student.name}
                        </h2>

                        <span>
                            Student ID:{" "}
                            <strong>
                                {
                                    student.student_id
                                }
                            </strong>
                        </span>

                    </div>

                    <div className="student-fee-profile-details">

                        <div>
                            <span>
                                Course
                            </span>

                            <strong>
                                {
                                    student.course ||
                                    "-"
                                }
                            </strong>
                        </div>

                        <div>
                            <span>
                                Batch
                            </span>

                            <strong>
                                {
                                    student.batch ||
                                    "-"
                                }
                            </strong>
                        </div>

                    </div>

                </div>
            )}


            {!hasFees ? (

                /* =====================================
                   NO FEES
                ===================================== */

                <div className="student-no-fees">

                    <div className="no-fee-icon">
                        ₹
                    </div>

                    <h2>
                        No Fee Record Available
                    </h2>

                    <p>
                        Your fee information has
                        not been added by the
                        administration yet.
                    </p>

                </div>

            ) : (

                <>

                    {/* =================================
                        SUMMARY
                    ================================= */}

                    <div className="student-fee-summary">

                        <div className="student-fee-card">

                            <span>
                                Net Course Fee
                            </span>

                            <strong>
                                {formatMoney(
                                    summary?.net_fee
                                )}
                            </strong>

                        </div>


                        <div className="student-fee-card paid">

                            <span>
                                Total Paid
                            </span>

                            <strong>
                                {formatMoney(
                                    summary?.total_paid
                                )}
                            </strong>

                        </div>


                        <div className="student-fee-card pending">

                            <span>
                                Pending Amount
                            </span>

                            <strong>
                                {formatMoney(
                                    summary?.pending_amount
                                )}
                            </strong>

                        </div>


                        <div className="student-fee-card status-card">

                            <span>
                                Payment Status
                            </span>

                            <strong>

                                <span
                                    className={`student-payment-status status-${String(
                                        summary?.payment_status ||
                                        ""
                                    ).toLowerCase()}`}
                                >
                                    {
                                        summary?.payment_status ||
                                        "Pending"
                                    }
                                </span>

                            </strong>

                        </div>

                    </div>


                    {/* =================================
                        FEE BREAKDOWN
                    ================================= */}

                    <section className="student-fee-section">

                        <div className="student-fee-section-header">

                            <div>

                                <h2>
                                    Fee Summary
                                </h2>

                                <p>
                                    Current course
                                    fee calculation.
                                </p>

                            </div>

                        </div>


                        <div className="fee-breakdown">

                            <div>

                                <span>
                                    Total Fee
                                </span>

                                <strong>
                                    {formatMoney(
                                        summary?.total_fee
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Discount
                                </span>

                                <strong className="discount">
                                    -
                                    {formatMoney(
                                        summary?.discount
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Net Fee
                                </span>

                                <strong>
                                    {formatMoney(
                                        summary?.net_fee
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Paid
                                </span>

                                <strong className="paid-text">
                                    {formatMoney(
                                        summary?.total_paid
                                    )}
                                </strong>

                            </div>

                            <div className="fee-breakdown-final">

                                <span>
                                    Amount Pending
                                </span>

                                <strong className="pending-text">
                                    {formatMoney(
                                        summary?.pending_amount
                                    )}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================
                        PAYMENT HISTORY
                    ================================= */}

                    <section className="student-fee-section">

                        <div className="student-fee-section-header">

                            <div>

                                <h2>
                                    Payment History
                                </h2>

                                <p>
                                    Your recorded fee
                                    installments.
                                </p>

                            </div>

                            <span className="payment-count">
                                {transactions.length}
                                {" "}
                                Payment
                                {transactions.length !== 1
                                    ? "s"
                                    : ""}
                            </span>

                        </div>


                        <div className="student-fee-table-wrapper">

                            <table className="student-fee-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Receipt
                                        </th>

                                        <th>
                                            Course
                                        </th>

                                        <th>
                                            Payment Mode
                                        </th>

                                        <th>
                                            Transaction
                                        </th>

                                        <th>
                                            Amount Paid
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
                                                    {formatDate(
                                                        transaction.payment_date
                                                    )}
                                                </td>

                                                <td>

                                                    <span className="receipt-number">
                                                        {
                                                            transaction.receipt_number ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>

                                                <td>
                                                    {
                                                        transaction.course_name ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        transaction.payment_mode ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        transaction.transaction_number ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="student-paid-amount">
                                                    {formatMoney(
                                                        transaction.amount_paid
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>


                    {/* =================================
                        INFORMATION
                    ================================= */}

                    <div className="student-fee-note">

                        <span>
                            ℹ
                        </span>

                        <p>
                            This fee report is
                            read-only. If you
                            find any discrepancy
                            in your fee details,
                            please contact the
                            Future Lines
                            administration.
                        </p>

                    </div>

                </>
            )}

        </div>
    );
}

export default StudentFeeReport;
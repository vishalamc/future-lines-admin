import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AddStudent.css";

function AddStudent() {

    const navigate = useNavigate();


    const [formData, setFormData] = useState({

        name: "",

        email: "",

        phone: "",

        course: "",

        admissionDate: "",

        dateOfBirth: "",

        gender: "",

        address: "",

        city: "",

        state: "",

        pinCode: "",

    });


    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState(null);


    // =================================================
    // HANDLE INPUT
    // =================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(
            (previous) => ({

                ...previous,

                [name]: value,

            })
        );

    };


    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        setError("");

        setSuccess(null);

        setLoading(true);


        try {

            const response = await fetch(
                "/api/students/add",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                    },

                    credentials: "include",

                    body:
                        JSON.stringify(formData),

                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                setError(
                    data.message ||
                    "Failed to create student."
                );

                return;

            }


            setSuccess(data);


            // Clear form

            setFormData({

                name: "",

                email: "",

                phone: "",

                course: "",

                admissionDate: "",

                dateOfBirth: "",

                gender: "",

                address: "",

                city: "",

                state: "",

                pinCode: "",

            });


        } catch (error) {

            console.error(error);

            setError(
                "Unable to connect to server."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="add-student-page">


            {/* HEADER */}

            <div className="add-student-header">

                <div>

                    <h1>
                        Add New Student
                    </h1>

                    <p>
                        Create a new student account
                    </p>

                </div>


                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    ← Back to Dashboard
                </button>

            </div>


            {/* SUCCESS */}

            {success && (

                <div className="student-success">

                    <div className="success-icon">
                        ✓
                    </div>


                    <div className="success-content">

                        <h2>
                            Student Created Successfully
                        </h2>

                        <p>
                            The student account has been
                            created successfully.
                        </p>


                        <div className="credentials-box">

                            <div>

                                <span>
                                    Student ID
                                </span>

                                <strong>
                                    {
                                        success.student.studentId
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Student Email
                                </span>

                                <strong>
                                    {
                                        success.student.email
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Default Password
                                </span>

                                <strong>
                                    {
                                        success.defaultPassword
                                    }
                                </strong>

                            </div>

                        </div>


                        <div className="password-warning">

                            ⚠️ The student should change
                            this default password after
                            the first login.

                        </div>

                    </div>

                </div>

            )}


            {/* ERROR */}

            {error && (

                <div className="student-error">

                    {error}

                </div>

            )}


            {/* FORM */}

            <form
                className="student-form"
                onSubmit={handleSubmit}
            >


                {/* BASIC INFORMATION */}

                <div className="form-section">

                    <div className="section-title">

                        <h2>
                            Student Information
                        </h2>

                        <p>
                            Basic student details
                        </p>

                    </div>


                    <div className="form-grid">


                        <div className="form-field">

                            <label>
                                Student Name *
                            </label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter student name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Email *
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Phone
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                placeholder="Enter phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Course *
                            </label>

                            <select
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Course
                                </option>

                                <option value="DCA">
                                    DCA
                                </option>

                                <option value="ADCA">
                                    ADCA
                                </option>

                                <option value="PGDCA">
                                    PGDCA
                                </option>
                                 <option value="BASICS">
                                    BASICS IN COMPUTER
                                </option>

                                <option value="Tally">
                                    Tally
                                </option>

                                <option value="C Programming">
                                    C Programming
                                </option>

                                <option value="C++ Programming">
                                    C++ Programming
                                </option>

                                <option value="Java">
                                    Java
                                </option>

                                <option value="Python">
                                    Python
                                </option>

                            </select>

                        </div>


                        <div className="form-field">

                            <label>
                                Admission Date
                            </label>

                            <input
                                type="date"
                                name="admissionDate"
                                value={
                                    formData.admissionDate
                                }
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                name="dateOfBirth"
                                value={
                                    formData.dateOfBirth
                                }
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Gender
                            </label>

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Gender
                                </option>

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
                                    Female
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>

                    </div>

                </div>


                {/* ADDRESS */}

                <div className="form-section">

                    <div className="section-title">

                        <h2>
                            Address Information
                        </h2>

                        <p>
                            Student contact address
                        </p>

                    </div>


                    <div className="form-grid">


                        <div className="form-field full-width">

                            <label>
                                Address
                            </label>

                            <textarea
                                name="address"
                                placeholder="Enter complete address"
                                value={
                                    formData.address
                                }
                                onChange={handleChange}
                                rows="3"
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                City
                            </label>

                            <input
                                type="text"
                                name="city"
                                placeholder="Enter city"
                                value={formData.city}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                State
                            </label>

                            <input
                                type="text"
                                name="state"
                                placeholder="Enter state"
                                value={formData.state}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                PIN Code
                            </label>

                            <input
                                type="text"
                                name="pinCode"
                                placeholder="Enter PIN code"
                                value={formData.pinCode}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>


                {/* LOGIN INFORMATION */}

                <div className="form-section login-information">

                    <div className="section-title">

                        <h2>
                            Login Information
                        </h2>

                        <p>
                            Login credentials are generated
                            automatically.
                        </p>

                    </div>


                    <div className="default-login-box">

                        <div className="login-info-item">

                            <span>
                                Student ID
                            </span>

                            <strong>
                                Automatically Generated
                            </strong>

                        </div>


                        <div className="login-info-item">

                            <span>
                                Default Password
                            </span>

                            <strong>
                                Student@123
                            </strong>

                        </div>


                        <div className="login-info-item">

                            <span>
                                User Role
                            </span>

                            <strong>
                                student
                            </strong>

                        </div>

                    </div>

                </div>


                {/* BUTTONS */}

                <div className="form-actions">

                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="create-student-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating Student..."
                            : "Create Student"}

                    </button>

                </div>

            </form>

        </div>

    );

}

export default AddStudent;
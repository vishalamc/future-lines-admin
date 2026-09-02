export function requireAuth(req, res, next) {

    if (!req.session || !req.session.user) {

        return res.status(401).json({
            success: false,
            message: "Authentication required.",
        });

    }

    next();
}


// =====================================================
// ADMIN ONLY
// =====================================================

export function requireAdmin(req, res, next) {

    if (!req.session || !req.session.user) {

        return res.status(401).json({
            success: false,
            message: "Authentication required.",
        });

    }

    if (req.session.user.role !== "admin") {

        return res.status(403).json({
            success: false,
            message: "Admin access required.",
        });

    }

    next();
}


// =====================================================
// STUDENT ONLY
// =====================================================

export function requireStudent(req, res, next) {

    if (!req.session || !req.session.user) {

        return res.status(401).json({
            success: false,
            message: "Authentication required.",
        });

    }

    if (req.session.user.role !== "student") {

        return res.status(403).json({
            success: false,
            message: "Student access required.",
        });

    }

    next();
}

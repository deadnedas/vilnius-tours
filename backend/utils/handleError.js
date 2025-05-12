const handleError = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    res.status(statusCode).json({
        status: statusCode === 500 ? "error" : "fail",
        message,
        stack: err.stack,
    });
};

module.exports = handleError;
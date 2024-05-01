
const error = (res, status, message, code, data) => {
    const response = {
        code: code ?? 500,
        status: status,
        msg:  message ?? "error-message",
        data: data ?? null
    };
    return res.status(code).json(response);
}

const success = (res, status, message, code, data) => {
    const response = {
        code: code ?? 200,
        status: status,
        msg:  message ?? "success-message",
        data: data ?? null
    };
    return res.status(statusCode).json(response);
}

module.exports = {
    error,
    success
};
  
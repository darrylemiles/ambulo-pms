const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
    };

    const errorHandler = (err, req, res, next) => {
    
    if (res.headersSent) {
        return next(err);
    }
    const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(status).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
    };

export { notFound, errorHandler };
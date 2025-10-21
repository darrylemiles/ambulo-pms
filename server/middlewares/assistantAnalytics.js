import conn from "../config/db.js";

const poolPromise = conn();

export const assistantAnalytics = async (req, res, next) => {
  const start = Date.now();
  const done = async () => {
    try {
      const pool = await poolPromise;
      const duration = Date.now() - start;
      const userId = (req.user && req.user.user_id) || null;
      const role = (req.user && req.user.role) || null;
      await pool.query(
        `INSERT INTO assistant_logs (user_id, path, method, status, duration_ms, user_role, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [userId, req.originalUrl || req.url, req.method, res.statusCode, duration, role]
      );
    } catch (e) {
      console.warn('assistant analytics log failed:', e.message);
    }
  };
  res.on('finish', done);
  next();
};

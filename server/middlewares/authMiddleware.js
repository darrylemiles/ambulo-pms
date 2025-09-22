import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.redirect('/login.html');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.redirect('/tenantDashboard.html');
    }
    req.user = decoded;
    next();
  } catch {
    return res.redirect('/login.html');
  }
};


export { 
    protect
};
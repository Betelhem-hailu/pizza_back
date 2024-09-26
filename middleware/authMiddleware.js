const authenticate = (req, res, next) => {
    // Assuming you have a way to verify JWT or session
    const token = req.headers.authorization.split(" ")[1];
    // Decode the token to get user info (for example, using jwt.verify)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  };
  
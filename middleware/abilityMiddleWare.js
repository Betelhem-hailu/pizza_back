const { defineAbilitiesFor } = require("../abilities/defineAbilities");

const checkPermissions = (action, subject) => {
  return async (req, res, next) => {
    try {
      const ability = await defineAbilitiesFor(req.user);
      if (ability.can(action, subject)) {
        return next();
      } else {
        return res.status(403).json({ error: 'Access Denied' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
};

module.exports = checkPermissions;

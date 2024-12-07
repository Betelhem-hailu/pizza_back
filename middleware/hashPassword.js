// const bcrypt = require("bcryptjs");
import bcrypt from 'bcryptjs';

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

module.exports = hashPassword;
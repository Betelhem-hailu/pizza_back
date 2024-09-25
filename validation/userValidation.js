const { z } = require('zod');

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number is required").max(15, "Phone number cannot exceed 15 characters"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  restaurantId: z.string().optional(),  // Optional since customers may not have a restaurant ID
});

module.exports = {
  userSchema,
};

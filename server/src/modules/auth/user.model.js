const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never return password in queries by default
    },
    currency: {
      type: String,
      default: "BDT",
    },
    categories: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

/*
 * Hash password before saving.
 *
 * WHY a pre-save hook instead of hashing in the controller?
 * - The model owns its own data integrity
 * - No matter WHERE you save a user (controller, seed script, admin panel),
 *   the password always gets hashed
 * - Single responsibility: the controller doesn't need to know about bcrypt
 *
 * The isModified check prevents re-hashing an already-hashed password
 * when you update other fields like name or email.
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/*
 * Instance method to compare passwords.
 * Attached to the schema so any user document can call user.comparePassword().
 * This keeps bcrypt knowledge inside the model, not scattered across services.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/*
 * Control what gets sent when a user document is serialized to JSON.
 * This is a safety net — even if someone forgets select: false,
 * the password and __v never leak to the client.
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

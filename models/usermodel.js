import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const Schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    // select: false,
  },
  loggedInCount: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
});
Schema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 10);
});

Schema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

Schema.methods.getJwtToken = function () {
  return jwt.sign({ _id: this._id, email: this.email }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
};

Schema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

const User = new mongoose.model("user", Schema);

export default User;

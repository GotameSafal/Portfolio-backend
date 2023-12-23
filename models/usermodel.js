import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
const Schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validator: validator.isEmail,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
});
Schema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 10);
});
Schema.methods.comparePassword = async function (getPassword) {
  return await bcrypt.compare(getPassword, this.password);
};
Schema.methods.getjwtToken = async function () {
    return jwt.sign(
      { id: this._id, email: this.email},
      process.env.SECRET_KEY,
      {
        expiresIn: process.env.EXPIRE_DATE,
      }
    );
  };
const User = new mongoose.model("user", Schema);

export default User;

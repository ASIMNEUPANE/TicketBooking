const bcrypt = require("bcrypt");
const authModel = require("../auth/auth.model");
const userModel = require("../users/user.model");

const { generateOTP, verifyOTP } = require("../../utils/otp");
const { generateJWT } = require("../../utils/jwt");
const { mailer } = require("../../services/mailer");

// ---Register for new user---

const register = async (payload) => {
  let { password, roles, ...rest } = payload;
  rest.password = await bcrypt.hash(password, +process.env.SALT_ROUND);
  const user = await userModel.create(rest);
  const token = generateOTP();
  await authModel.create({ email: user?.email, token });
  const mail = await mailer(user?.email, token);
  return mail;
};

// ---Verify email && Token--

const verifyEmail = async (email, token) => {
  // email exists check
  const auth = await authModel.findOne({ email });
  if (!auth) throw new Error("user not found");

  // token expire check
  const isValidToken = await verifyOTP(token);
  if (!isValidToken) throw new Error("Token expired");

  // token match with email
  const emailValid = auth?.token === +token;
  if (!emailValid) throw new Error("Token mismatch");

  // userModel isEmailVerified True
  await userModel.findOneAndUpdate(
    { email },
    { isEmailVerified: true, isActive: true },

    { new: true }
  );
  // remove that email from authModel
  //   await authModel.deleteOne({ email });
  //   return updateUser;
};

// ---Regenerate Token

const regenerateToken = async (email) => {
  const auth = await authModel.findOne({ email });
  if (!auth) throw new Error("User not found");

  const newToken = generateOTP();
  await authModel.findOneAndUpdate(
    { email },
    { token: newToken },
    { new: true }
  );
  await mailer(email, newToken);
  return true;
};

// ---Login---

const login = async (email, password) => {
  const user = await userModel
    .findOne({ email, isArchive: false })
    .select("+password");
  if (!user) throw new Error("User doesnot exit");
  if (!user.isEmailVerified)
    throw new Error("Email not verify.Verify email to get started..");
  if (!user?.isActive)
    throw new Error("User is not active. Please contact admin");
  const isValidPw = await bcrypt.compare(password, user?.password);
  if (!isValidPw) throw new Error("User or password invalid");
  // return JWT token

  const payload = {
    id: user?._id,
    email: user?.email,
    roles: user?.roles || [],
  };
  const token = generateJWT(payload);
  return {
    user: { name: user.name, role: user.roles, email: user.email },
    token,
  };
};

const generateFPToken = async (email) => {
  const user = await userModel.findOne({
    email,
    isActive: true,
    isArchive: false,
  });
  if (!user) throw new Error("user not found");
  const token = generateOTP();
  await authModel.create({ email, token });
  await mailer(email, token);
  return true;
};

const forgetPassword = async (email, token, password) => {
  const user = await authModel.findOne({
    email,
  });
  if (!user) throw new Error("user doesnot exit");
  const isValidToken = await verifyOTP(token);
  if (isValidToken) throw new Error("Token expire");
  await userModel.findOneAndUpdate(
    { email },
    { password: await bcrypt.hash(password, +process.env.SALT_ROUND) },

    { new: true }
  );
  await authModel.deleteOne({ email });
};

module.exports = {
  login,
  register,
  verifyEmail,
  forgetPassword,
  regenerateToken,
  generateFPToken,
};

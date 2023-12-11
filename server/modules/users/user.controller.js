const Model = require("./user.model");
const bcrypt = require("bcrypt");

const create = async (payload) => {
  const {password,roles ,...rest}= payload;
  rest.password = await bcrypt.hash(password,+process.env.SALT_ROUND)
  rest.roles=[roles]
  rest.isEmailVerified = true
  rest.isActive = true
  return await Model.create(rest);
};

const list = async (size, page, search) => {
  /*
  Basic pagination Implementation
  return Model.find().skip().limit();
   */
  const pageNum = parseInt(page) || 1;
  const limit = parseInt(size) || 3;
  const { name, role } = search;
  const query = {};
  if (name) {
    query.name = new RegExp(name, "gi");
  }
  if (role) {
    query.roles = [role];
  }
  const response = await Model.aggregate([
    {
      $match: query,
    },
    {
      $sort: {
        created_at: -1,
      },
    },
    {
      $facet: {
        metadata: [
          {
            $count: "total",
          },
        ],
        data: [
          {
            $skip: (pageNum - 1) * limit,
          },
          {
            $limit: limit,
          },
        ],
      },
    },
    {
      $addFields: {
        total: {
          $arrayElemAt: ["$metadata.total", 0],
        },
      },
    },
    {
      $project: {
        data: 1,
        total: 1,
      },
    },
    {
      $project: {
        "data.password": 0,
      },
    },
  ]).allowDiskUse(true);
  const newData = response[0];
  let { data, total } = newData;
  total = total || 0;
  return { data, total, limit, pageNum };
};

const getById = async (id) => {
  return await Model.findOne({ _id: id });
};

const updateById = async (id, payload) => {
  return await Model.findOneAndUpdate({ _id: id }, payload, { new: true });
};

const changePassword = async (id, oldPassword, newPassword) => {
  // check if user exits
  const user = await Model.findOne({ _id: id }).select("+password");
  if (!user) throw new Error("User not found");
  // check if old pass hash match to existing
  const isValid = await bcrypt.compare(oldPassword, user?.password);
  if (!isValid) throw new Error("oldpassword is incorrect");

  // create new password hash
  const newPass = await bcrypt.hash(newPassword, +process.env.SALT_ROUND);

  // update the userpassword
  return await Model.findOneAndUpdate(
    { _id: user?._id },
    { password: newPass },
    { new: true }
  );
};

const resetPassword = async (id, payload) => {
  const user = await Model.findOne({ _id: id });
  if (!user) throw new Error("User not found");
  const newPass = await bcrypt.hash(payload.password, +process.env.SALT_ROUND);
  return await Model.findOneAndUpdate(
    { _id: user?._id },
    { ...payload,password: newPass },
    { new: true }
  );
};

const block = async (id, payload) => {
  const user = await Model.find({ _id: id });
  if (!user) throw new Error("User not found");
  return await Model.findOneAndUpdate({ _id:id}, payload, {new: true})
};

const archive = async (id,payload)=>{
  const user = await Model.find({ _id: id });
  if (!user) throw new Error("User not found");
  return await Model.findOneAndUpdate({ _id:id}, payload, {new: true})
};


module.exports = {
  archive,
  block,
  changePassword,
  create,
  getById,
  list,
  resetPassword,
  updateById,
};

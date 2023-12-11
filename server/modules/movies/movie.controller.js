const model = require("./movie.model");

const create = async (payload) => {
  await model.create(payload);
};

module.exports= {create}
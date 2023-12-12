const model = require("./movie.model");

const create = async (payload) => {
 return await model.create(payload);
};

module.exports= {create}
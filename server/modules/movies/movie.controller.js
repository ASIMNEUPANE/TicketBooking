const model = require("./movie.model");

const create = async (payload) => {
  return await model.create(payload);
};

const list = async (limit, page, search) => {
  const pageNum = parseInt(page) || 1;
  const size = parseInt(limit) || 5;
  const { name, isArchive } = search;
  const query = {};
  if (name) {
    query.name = new RegExp(name, "gi");
  }
  const response = await model
    .aggregate([
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
              $skip: (pageNum - 1) * size,
            },
            {
              $limit: size,
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
    ])
    .allowDiskUse(true);
  const newData = response[0];
  let { data, total } = newData;
  total = total || 0;
  return { data, total, limit: size, page: pageNum };
};

const getById = async (id) => {
  const result = await model
    .aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category_name",
        },
      },
      {
        $unwind: {
          path: "$category_name",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          category_name: "$category_name.name",
        },
      },
    ])
    .allowDiskUse(true);
  if (result.length === 0) return {};
  return result[0];
};

const updateById = async (id, payload) => {
  return await model.findOneAndUpdate({ _id: id }, payload, { new: true });
};

const deleteById = async (id, payload) => {
  return await model.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
};

module.exports = { create, list, getById, updateById, deleteById };

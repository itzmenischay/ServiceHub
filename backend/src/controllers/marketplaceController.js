import ProviderProfile from "../models/ProviderProfile.js";

// Get Providers
export const getProviders = async (req, res, next) => {
  try {
    const {
      search,
      location,
      category,
      minRating,
      page = 1,
      limit = 10,
      sort = "rating",
    } = req.query;

    const query = {
      isAvailable: true,
    };

    if (search) {
      query.profession = {
        $regex: search,
        $options: "i",
      };
    }

    if (location) {
      query.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (category) {
      query.category = category;
    }

    if (minRating) {
      query.averageRating = {
        $gte: Number(minRating),
      };
    }

    let sortOption = {};

    switch (sort) {
      case "priceLow":
        sortOption.hourlyRate = 1;
        break;

      case "priceHigh":
        sortOption.hourlyRate = -1;
        break;

      case "experience":
        sortOption.experience = -1;
        break;

      default:
        sortOption.averageRating = -1;
    }

    const providers = await ProviderProfile.find(query)
      .populate("user", "name")
      .populate("category", "name")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ProviderProfile.countDocuments(query);

    res.status(200).json({
      success: true,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      totalProviders: total,
      data: providers,
    });
  } catch (error) {
    next(error);
  }
};

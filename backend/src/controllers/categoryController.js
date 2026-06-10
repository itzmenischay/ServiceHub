import ServiceCategory from "../models/ServiceCategory.js";
import AppError from "../utils/AppError.js";

// Create Category
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;

    const existingCategory = await ServiceCategory.findOne({
      name,
    });

    if (existingCategory) {
      return next(new AppError("Category already exists", 409));
    }

    const category = await ServiceCategory.create({
      name,
      description,
      icon,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Get all Categories
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await ServiceCategory.find({
      isActive: true,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// Get Category by ID
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);

    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Update Category
export const updateCategory = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);

    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    Object.assign(category, req.body);

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Category (Soft Delete)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);

    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    category.isActive = false;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


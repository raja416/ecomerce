const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { tree, featured } = req.query;
    
    let categories;
    if (tree === 'true') {
      // For tree structure, get all categories with parent relationships
      categories = await Category.findAll({
        include: [
          {
            model: Category,
            as: 'children',
            attributes: ['id', 'name', 'slug', 'description']
          },
          {
            model: Category,
            as: 'parent',
            attributes: ['id', 'name', 'slug']
          }
        ],
        order: [['name', 'ASC']]
      });
    } else if (featured === 'true') {
      // For featured categories, get categories marked as featured
      categories = await Category.findAll({
        where: { isFeatured: true },
        order: [['name', 'ASC']]
      });
    } else {
      // For root categories, get categories without parents
      categories = await Category.findAll({
        where: { parentId: null },
        include: [
          {
            model: Category,
            as: 'children',
            attributes: ['id', 'name', 'slug', 'description']
          }
        ],
        order: [['name', 'ASC']]
      });
    }

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'description']
        },
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'description']
        },
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Valid parent category ID is required'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { name, description, parent, isFeatured, sortOrder } = req.body;

    // Check if parent category exists
    if (parent) {
      const parentCategory = await Category.findByPk(parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Parent category not found'
          }
        });
      }
    }

    // Create category
    const category = await Category.create({
      name,
      description,
      parent,
      isFeatured,
      sortOrder,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: {
        category
      },
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Valid parent category ID is required'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { name, description, parent, isFeatured, sortOrder } = req.body;

    let category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found'
        }
      });
    }

    // Check if parent category exists
    if (parent) {
      const parentCategory = await Category.findByPk(parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Parent category not found'
          }
        });
      }

      // Prevent circular reference
      if (parent === req.params.id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Category cannot be its own parent'
          }
        });
      }
    }

    // Update category
    await category.update({
      name,
      description,
      parent,
      isFeatured,
      sortOrder
    });
    
    await category.reload({
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'description']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        category
      },
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found'
        }
      });
    }

    // Check if category has children
    const childrenCount = await Category.count({
      where: { parentId: req.params.id }
    });
    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete category with subcategories'
        }
      });
    }

    // Soft delete - set isActive to false
    await category.update({ isActive: false });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

module.exports = router;








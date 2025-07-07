import express from 'express';
import { updateProfileController, getUserProfileController, updateUserRoleController } from "../controllers/userController.js";
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { body, validationResult } from 'express-validator';

const router = express.Router();

const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// All user routes require authentication
router.use(authenticateToken);

router.get('/profile', getUserProfileController);
router.put('/profile', 
  validateProfileUpdate,
  handleValidationErrors,
  updateProfileController
);
router.put("/:id/role", authorizeRoles(["admin"]), updateUserRoleController);

export default router;
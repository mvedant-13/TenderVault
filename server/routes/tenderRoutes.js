import express from "express";
import {
  createTender,
  getTenders,
  getTenderById,
  updateTender,
  deleteTender,
  regenerateTenderSummary,
} from "../controllers/tenderController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { createUploader } from "../middleware/uploadMiddleware.js";

const router = express.Router();
const upload = createUploader("tenders");

router
  .route("/")
  .post(
    protect,
    authorizeRoles("admin"),
    upload.array("documents", 5),
    createTender,
  )
  .get(protect, getTenders);

router
  .route("/:id")
  .get(protect, getTenderById)
  .put(
    protect,
    authorizeRoles("admin"),
    upload.array("documents", 5),
    updateTender,
  )
  .delete(protect, authorizeRoles("admin"), deleteTender);

router
  .route("/:id/summarize")
  .put(protect, authorizeRoles("admin"), regenerateTenderSummary);

export default router;

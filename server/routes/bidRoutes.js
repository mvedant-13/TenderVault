import express from "express";
import {
  createBid,
  getBids,
  getBidById,
  updateBid,
  deleteBid,
  updateBidStatus,
  scoreBidsForTender,
} from "../controllers/bidController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { createUploader } from "../middleware/uploadMiddleware.js";

const upload = createUploader("bids");
const router = express.Router();

router
  .route("/")
  .post(
    protect,
    authorizeRoles("vendor"),
    upload.array("documents", 5),
    createBid,
  )
  .get(protect, getBids);

router
  .route("/:id")
  .get(protect, getBidById)
  .put(
    protect,
    authorizeRoles("vendor"),
    upload.array("documents", 5),
    updateBid,
  )
  .delete(protect, authorizeRoles("vendor"), deleteBid);

router
  .route("/:id/status")
  .put(protect, authorizeRoles("admin"), updateBidStatus);

router
  .route("/tender/:tenderId/score")
  .put(protect, authorizeRoles("admin"), scoreBidsForTender);

export default router;

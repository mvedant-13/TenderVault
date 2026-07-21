import mongoose from "mongoose";
import path from "path";

import Bid from "../models/Bid.js";
import Tender from "../models/Tender.js";
import { cleanupUploadedFiles } from "../utils/cleanupUploadedFiles.js";
import { handleControllerError } from "../utils/handleControllerError.js";

// POST /api/bids
export const createBid = async (req, res) => {
  try {
    const { tender: tenderId, quotedPrice } = req.body;

    if (!tenderId || !quotedPrice) {
      cleanupUploadedFiles(req.files);
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(tenderId)) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ message: "Invalid tender ID" });
    }

    const tender = await Tender.findById(tenderId);

    if (!tender) {
      cleanupUploadedFiles(req.files);
      return res.status(404).json({ message: "Tender not found" });
    }

    if (tender.status !== "open") {
      cleanupUploadedFiles(req.files);
      return res
        .status(400)
        .json({ message: "This tender is no longer open for bids" });
    }

    if (new Date(tender.deadline) <= new Date()) {
      cleanupUploadedFiles(req.files);
      return res
        .status(400)
        .json({ message: "This tender's deadline has already passed" });
    }

    const existingBid = await Bid.findOne({
      tender: tenderId,
      vendor: req.user._id,
    });

    if (existingBid) {
      cleanupUploadedFiles(req.files);
      return res
        .status(409)
        .json({ message: "You have already submitted a bid for this tender" });
    }

    const documents = (req.files || []).map((file) => ({
      fileName: file.originalname,
      filePath: path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
    }));

    const bid = await Bid.create({
      tender: tenderId,
      vendor: req.user._id,
      quotedPrice,
      documents,
    });

    res.status(201).json(bid);
  } catch (error) {
    cleanupUploadedFiles(req.files);
    handleControllerError(error, res, "Create bid");
  }
};

// GET /api/bids
export const getBids = async (req, res) => {
  try {
    if (req.user.role === "vendor") {
      const filter = { vendor: req.user._id };
      if (req.query.status) filter.status = req.query.status;

      const bids = await Bid.find(filter)
        .populate("tender", "title status deadline")
        .sort({ createdAt: -1 });

      return res.status(200).json(bids);
    }

    const { tender: tenderId, status } = req.query;

    if (!tenderId) {
      return res
        .status(400)
        .json({ message: "Please specify a tender to view its bids" });
    }

    if (!mongoose.Types.ObjectId.isValid(tenderId)) {
      return res.status(400).json({ message: "Invalid tender ID" });
    }

    const tender = await Tender.findById(tenderId);

    if (!tender) {
      return res.status(404).json({ message: "Tender not found" });
    }

    if (tender.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view bids for this tender" });
    }

    const filter = { tender: tenderId };
    if (status) filter.status = status;

    const bids = await Bid.find(filter)
      .populate("vendor", "name companyName gstNumber")
      .sort({ createdAt: -1 });

    res.status(200).json(bids);
  } catch (error) {
    handleControllerError(error, res, "Get bids");
  }
};

// GET /api/bids/:id
export const getBidById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid bid ID" });
    }

    const bid = await Bid.findById(req.params.id)
      .populate("tender", "title status deadline createdBy")
      .populate("vendor", "name companyName gstNumber");

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    const isOwningVendor =
      bid.vendor._id.toString() === req.user._id.toString();
    const isOwningAdmin =
      bid.tender.createdBy.toString() === req.user._id.toString();

    if (!isOwningVendor && !isOwningAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this bid" });
    }

    res.status(200).json(bid);
  } catch (error) {
    handleControllerError(error, res, "Get bid");
  }
};

// PUT /api/bids/:id/status
export const updateBidStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid bid ID" });
    }

    const { status } = req.body;
    const allowedStatuses = ["shortlisted", "rejected", "awarded"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const bid = await Bid.findById(req.params.id).populate("tender");

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    if (bid.tender.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this bid" });
    }

    bid.status = status;
    await bid.save();

    res.status(200).json(bid);
  } catch (error) {
    handleControllerError(error, res, "Update bid status");
  }
};

// PUT /api/bids/:id
export const updateBid = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ message: "Invalid bid ID" });
    }

    const bid = await Bid.findById(req.params.id).populate("tender");

    if (!bid) {
      cleanupUploadedFiles(req.files);
      return res.status(404).json({ message: "Bid not found" });
    }

    if (bid.vendor.toString() !== req.user._id.toString()) {
      cleanupUploadedFiles(req.files);
      return res
        .status(403)
        .json({ message: "Not authorized to update this bid" });
    }

    if (bid.status !== "submitted") {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({
        message: "This bid can no longer be edited",
      });
    }

    if (new Date(bid.tender.deadline) <= new Date()) {
      cleanupUploadedFiles(req.files);
      return res
        .status(400)
        .json({ message: "This tender's deadline has already passed" });
    }

    if (req.body.quotedPrice !== undefined) {
      bid.quotedPrice = req.body.quotedPrice;
    }

    if (req.body.documentsToDelete) {
      const idsToDelete = Array.isArray(req.body.documentsToDelete)
        ? req.body.documentsToDelete
        : JSON.parse(req.body.documentsToDelete);

      const docsBeingRemoved = bid.documents.filter((doc) =>
        idsToDelete.includes(doc._id.toString()),
      );

      cleanupUploadedFiles(docsBeingRemoved);

      bid.documents = bid.documents.filter(
        (doc) => !idsToDelete.includes(doc._id.toString()),
      );
    }

    if (req.files && req.files.length > 0) {
      const newDocs = req.files.map((file) => ({
        fileName: file.originalname,
        filePath: path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
      }));
      bid.documents.push(...newDocs);
    }

    await bid.save();
    res.status(200).json(bid);
  } catch (error) {
    cleanupUploadedFiles(req.files);
    handleControllerError(error, res, "Update bid");
  }
};

// DELETE /api/bids/:id
export const deleteBid = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid bid ID" });
    }

    const bid = await Bid.findById(req.params.id).populate("tender");

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    if (bid.vendor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this bid" });
    }

    if (bid.status !== "submitted") {
      return res.status(400).json({
        message: "This bid can no longer be withdrawn",
      });
    }

    if (new Date(bid.tender.deadline) <= new Date()) {
      return res
        .status(400)
        .json({ message: "This tender's deadline has already passed" });
    }

    cleanupUploadedFiles(bid.documents);

    await bid.deleteOne();
    res.status(200).json({ message: "Bid deleted successfully" });
  } catch (error) {
    handleControllerError(error, res, "Delete bid");
  }
};

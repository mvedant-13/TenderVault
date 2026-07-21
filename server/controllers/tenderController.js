import mongoose from "mongoose";
import path from "path";

import Tender from "../models/Tender.js";
import { cleanupUploadedFiles } from "../utils/cleanupUploadedFiles.js";
import { handleControllerError } from "../utils/handleControllerError.js";

// POST /api/tenders
export const createTender = async (req, res) => {
  try {
    const { title, description, department, category, budget, deadline } =
      req.body;

    if (
      !title ||
      !description ||
      !department ||
      !category ||
      !budget ||
      !deadline
    ) {
      cleanupUploadedFiles(req.files);
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    if (new Date(deadline) <= new Date()) {
      cleanupUploadedFiles(req.files);
      return res
        .status(400)
        .json({ message: "Deadline must be a future date" });
    }

    const documents = (req.files || []).map((file) => ({
      fileName: file.originalname,
      filePath: path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
    }));

    const tender = await Tender.create({
      title,
      description,
      department,
      category,
      budget,
      deadline,
      documents,
      createdBy: req.user._id,
    });

    res.status(201).json(tender);
  } catch (error) {
    cleanupUploadedFiles(req.files);
    handleControllerError(error, res, "Create tender");
  }
};

// GET /api/tenders
export const getTenders = async (req, res) => {
  try {
    const { status, category, createdBy } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (createdBy) filter.createdBy = createdBy;

    const tenders = await Tender.find(filter)
      .populate("createdBy", "name companyName")
      .sort({ createdAt: -1 });

    res.status(200).json(tenders);
  } catch (error) {
    handleControllerError(error, res, "Get tenders");
  }
};

// GET /api/tenders/:id
export const getTenderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid tender ID" });
    }

    const tender = await Tender.findById(req.params.id).populate(
      "createdBy",
      "name companyName",
    );

    if (!tender) {
      return res.status(404).json({ message: "Tender not found" });
    }

    res.status(200).json(tender);
  } catch (error) {
    handleControllerError(error, res, "Get tender");
  }
};

// PUT /api/tenders/:id
export const updateTender = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ message: "Invalid tender ID" });
    }

    const tender = await Tender.findById(req.params.id);

    if (!tender) {
      cleanupUploadedFiles(req.files);
      return res.status(404).json({ message: "Tender not found" });
    }

    if (tender.createdBy.toString() !== req.user._id.toString()) {
      cleanupUploadedFiles(req.files);
      return res
        .status(403)
        .json({ message: "Not authorized to update this tender" });
    }

    if (req.body.deadline && new Date(req.body.deadline) <= new Date()) {
      cleanupUploadedFiles(req.files);
      return res
        .status(400)
        .json({ message: "Deadline must be a future date" });
    }

    const updatableFields = [
      "title",
      "description",
      "department",
      "category",
      "budget",
      "deadline",
      "status",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        tender[field] = req.body[field];
      }
    });

    if (req.body.documentsToDelete) {
      const idsToDelete = Array.isArray(req.body.documentsToDelete)
        ? req.body.documentsToDelete
        : JSON.parse(req.body.documentsToDelete);

      const docsBeingRemoved = tender.documents.filter((doc) =>
        idsToDelete.includes(doc._id.toString()),
      );

      cleanupUploadedFiles(docsBeingRemoved);

      tender.documents = tender.documents.filter(
        (doc) => !idsToDelete.includes(doc._id.toString()),
      );
    }

    if (req.files && req.files.length > 0) {
      const newDocs = req.files.map((file) => ({
        fileName: file.originalname,
        filePath: path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
      }));
      tender.documents.push(...newDocs);
    }

    await tender.save();
    res.status(200).json(tender);
  } catch (error) {
    cleanupUploadedFiles(req.files);
    handleControllerError(error, res, "Update tender");
  }
};

// DELETE /api/tenders/:id
export const deleteTender = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid tender ID" });
    }

    const tender = await Tender.findById(req.params.id);

    if (!tender) {
      return res.status(404).json({ message: "Tender not found" });
    }

    if (tender.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this tender" });
    }

    cleanupUploadedFiles(tender.documents);

    await tender.deleteOne();
    res.status(200).json({ message: "Tender deleted successfully" });
  } catch (error) {
    handleControllerError(error, res, "Delete tender");
  }
};

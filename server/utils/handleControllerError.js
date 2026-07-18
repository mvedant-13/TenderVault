export const handleControllerError = (error, res, label = "Controller") => {
  console.error(`${label} error:`, error.message);

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({ message: "Invalid data provided" });
  }

  if (error.code === 11000) {
    return res
      .status(409)
      .json({ message: "Duplicate value — already exists" });
  }

  res.status(500).json({ message: "Server error" });
};

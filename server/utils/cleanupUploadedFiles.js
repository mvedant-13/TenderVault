import fs from "fs";

export const cleanupUploadedFiles = (files) => {
  if (!files || files.length === 0) return;

  files.forEach((file) => {
    const targetPath = file.path || file.filePath;
    if (!targetPath) return;

    fs.unlink(targetPath, (err) => {
      if (err) console.error("Cleanup error:", err.message);
    });
  });
};

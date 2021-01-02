import { Router } from "express";

import { handleUploadFile } from "../Utils/Uploads";

const UploadController = Router();

UploadController.post("/api/upload/:type", async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new Error("No files were uploaded");
    }

    const filenames = await handleUploadFile(
      req.files.file,
      req.params.type as string
    );

    res.json({
      success: true,
      filenames
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default UploadController;


const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 2,
  },
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ message: "HALIÉ AI Try-On Backend is running!" });
});

function findImage(value) {
  if (typeof value === "string") {
    return value.startsWith("data:image/") || value.startsWith("http")
      ? value
      : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  if (typeof value.image === "string") {
    return value.image;
  }

  if (value.image && typeof value.image === "object" && value.image.url) {
    return value.image.url;
  }

  return value.url || null;
}

app.post(
  "/api/tryon",
  upload.fields([
    { name: "person", maxCount: 1 },
    { name: "garment", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const person = req.files?.person?.[0];
      const garment = req.files?.garment?.[0];

      if (!person || !garment) {
        return res.status(400).json({
          error: "Please upload both your photo and an outfit image.",
        });
      }

      if (
        !person.mimetype.startsWith("image/") ||
        !garment.mimetype.startsWith("image/")
      ) {
        return res.status(400).json({
          error: "Both uploads must be image files.",
        });
      }

      const allowedCategories = ["upper", "lower", "dress"];
      const category = allowedCategories.includes(req.body?.category)
        ? req.body.category
        : "upper";

      const garmentIsWorn = req.body?.garmentIsWorn !== "false";

      const { Client, handle_file } = await import("@gradio/client");
      const ai = await Client.connect("monk7/vtryon-a");

      const prediction = await ai.predict("/tryon", [
        handle_file(person.buffer),
        handle_file(garment.buffer),
        category,
        garmentIsWorn,
        "",
        30,
        2.5,
        42,
      ]);

      console.log("AI reply:", JSON.stringify(prediction.data, null, 2));

      const details = prediction.data?.find(
        (item) =>
          item &&
          typeof item === "object" &&
          ("ok" in item || "message" in item)
      );

      if (details?.ok === false) {
        throw new Error(details.message || "The AI could not make the image.");
      }

      const image =
        findImage(details) ||
        prediction.data?.map(findImage).find(Boolean);

      if (!image) {
        throw new Error(
          details?.message || "The AI did not return a usable picture."
        );
      }

      res.json({ result: [image] });
    } catch (error) {
      console.error("AI Try-On error:", error);

      res.status(500).json({
        error: error.message || "Please try again.",
      });
    }
  }
);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      error:
        error.code === "LIMIT_FILE_SIZE"
          ? "Each image must be 8 MB or smaller."
          : error.message,
    });
  }

  console.error("Server error:", error);

  res.status(500).json({
    error: error.message || "An unexpected error occurred.",
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`HALIÉ backend running on http://localhost:${PORT}`);
});

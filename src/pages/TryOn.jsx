
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import OutfitSelector from "../components/OutfitSelector";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function dataURLToFile(dataURL, filename = "person.jpg") {
  const [header, base64] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }

  return new File([array], filename, { type: mime });
}

function getTryOnCategory(outfit) {
  const categories = Array.isArray(outfit?.categories)
    ? outfit.categories
    : [outfit?.category];

  const outfitText = [outfit?.name, ...categories]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/pants|trouser|jeans|skirt|lower/.test(outfitText)) {
    return "lower";
  }

  if (
    /gown|dress|lehenga|saree|sari|anarkali|salwar|traditional|festive/.test(
      outfitText
    )
  ) {
    return "dress";
  }

  return "upper";
}

function TryOn() {
  const location = useLocation();

  const [selectedImage, setSelectedImage] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(
    location.state?.outfit || null
  );
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (resultImage?.startsWith("blob:")) {
        URL.revokeObjectURL(resultImage);
      }
    };
  }, [resultImage]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file.");
      return;
    }

    setPhotoFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setResultImage(null);
    setErrorMessage("");
  };

  const openCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMessage("Camera access is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);
      setErrorMessage("");
    } catch (error) {
      console.error("Camera error:", error);
      setErrorMessage(
        error.name === "NotAllowedError"
          ? "Please allow camera access in your browser."
          : "Unable to open the camera. Please try again."
      );
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;

    if (!video?.videoWidth) {
      setErrorMessage("Please wait for the camera to load.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);

    const dataURL = canvas.toDataURL("image/jpeg", 0.9);
    const file = dataURLToFile(dataURL);

    setPhotoFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setResultImage(null);
    setErrorMessage("");
    closeCamera();
  };

  const handleGenerate = async () => {
    if (!photoFile || !selectedImage) {
      setErrorMessage("Please upload your photo or take a photo first.");
      return;
    }

    if (!selectedOutfit?.image) {
      setErrorMessage("Please select an outfit first.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setResultImage(null);

    try {
      const outfitResponse = await fetch(
        selectedOutfit.tryOnImage || selectedOutfit.image
      );

      if (!outfitResponse.ok) {
        throw new Error("Could not load the selected outfit image.");
      }

      const outfitBlob = await outfitResponse.blob();
      const outfitFile = new File([outfitBlob], "outfit.jpg", {
        type: outfitBlob.type || "image/jpeg",
      });

      const formData = new FormData();
      formData.append("person", photoFile);
      formData.append("garment", outfitFile);
      formData.append("category", getTryOnCategory(selectedOutfit));

      formData.append(
        "garmentIsWorn",
        String(selectedOutfit.garmentIsWorn ?? true)
      );

      formData.append(
        "description",
        selectedOutfit.description ||
          selectedOutfit.name ||
          "Women's outfit"
      );

      const response = await fetch(`${API_URL}/api/tryon`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI Try-On request failed.");
      }

      const output = data.result?.[0];
      const imageURL =
        typeof output === "string"
          ? output
          : output?.url || output?.image?.url;

      if (!imageURL) {
        console.error("Unexpected AI response:", data);
        throw new Error(
          "The AI did not return a usable result image. Please check the backend terminal."
        );
      }

      setResultImage(imageURL);
    } catch (error) {
      console.error("Try-On error:", error);
      setErrorMessage(
        error.message || "Unable to generate the try-on. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="tryon-page">
      <h1>AI Virtual Try-On</h1>
      <p>
        Upload your photo, choose a HALIÉ outfit, and let AI generate your
        virtual try-on.
      </p>

      <div className="tryon-container">
        <div className="upload-section">
          <h2>📷 Your Photo</h2>

          <div className="upload-buttons">
            <label htmlFor="fileUpload" className="upload-label">
              📁 Choose Image
            </label>

            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />

            {!cameraOpen && (
              <button
                type="button"
                className="camera-btn"
                onClick={openCamera}
              >
                📷 Open Camera
              </button>
            )}
          </div>

          {cameraOpen && (
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="camera-video"
              />

              <div className="camera-controls">
                <button
                  type="button"
                  className="capture-btn"
                  onClick={takePhoto}
                >
                  📸 Take Photo
                </button>

                <button
                  type="button"
                  className="close-camera-btn"
                  onClick={closeCamera}
                >
                  ✖ Close Camera
                </button>
              </div>
            </div>
          )}

          {selectedImage && !cameraOpen && (
            <div className="photo-preview">
              <img
                src={selectedImage}
                alt="Your selected photo"
                className="preview-image"
              />

              <button
                type="button"
                className="retake-btn"
                onClick={() => {
                  setSelectedImage(null);
                  setPhotoFile(null);
                  setResultImage(null);
                  openCamera();
                }}
              >
                🔄 Retake Photo
              </button>
            </div>
          )}
        </div>

        <div className="outfit-section">
          <OutfitSelector
            selected={selectedOutfit}
            setSelected={setSelectedOutfit}
          />
        </div>

        <div className="result-section">
          <h2>🤖 AI Result</h2>

          <div className="result-box">
            {loading ? (
              <p>Generating your try-on… Please wait. ✨</p>
            ) : resultImage ? (
              <>
                <img
                  src={resultImage}
                  alt="AI-generated virtual try-on"
                  className="result-outfit"
                />
                <h3>Your HALIÉ Try-On</h3>
              </>
            ) : (
              <p>
                Your generated image will appear here after AI processing.
              </p>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <p role="alert" className="tryon-error">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        className="generate-btn"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating AI..." : "Generate AI Try-On"}
      </button>
    </section>
  );
}

export default TryOn;

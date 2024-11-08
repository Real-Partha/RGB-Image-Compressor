from fastapi import FastAPI, Form, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import io
from Compression.utils import compress_image, decompress_image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/compress")
async def compress_image_endpoint(
    file: UploadFile = File(...), quality_factor: int = Form(10)
):
    try:
        # Read image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))

        # Convert RGBA to RGB if necessary
        if image.mode == "RGBA":
            image = image.convert("RGB")

        # Convert to numpy array
        image_array = np.array(image)

        # Compress image
        compressed = compress_image(image_array, quality_factor)

        # Decompress for preview
        decompressed = decompress_image(compressed)

        # Convert back to image and save as JPEG
        output_image = Image.fromarray(decompressed)
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format="JPEG", quality=85, optimize=True)
        img_byte_arr = img_byte_arr.getvalue()

        return {
            "compressed_size": len(img_byte_arr),
            "original_size": len(image_data),
            "compression_ratio": len(image_data) / len(img_byte_arr),
            "compressed_image": {"data": list(img_byte_arr)},
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

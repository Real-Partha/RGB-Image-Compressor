from fastapi import FastAPI, Form, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from PIL import Image
import numpy as np
import io
import json
from Compression.utils import compress_image, decompress_image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def process_image_generator(image_data, quality_factor):
    try:
        image = Image.open(io.BytesIO(image_data))
        yield json.dumps({"status": "started", "progress": 0}) + "\n"

        if image.mode == "RGBA":
            image = image.convert("RGB")
        yield json.dumps({"status": "converting", "progress": 20}) + "\n"

        image_array = np.array(image)
        yield json.dumps({"status": "processing", "progress": 40}) + "\n"

        compressed = compress_image(image_array, quality_factor)
        yield json.dumps({"status": "compressing", "progress": 60}) + "\n"

        decompressed = decompress_image(compressed)
        yield json.dumps({"status": "finalizing", "progress": 80}) + "\n"

        output_image = Image.fromarray(decompressed)
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format="JPEG", quality=85, optimize=True)
        img_byte_arr = img_byte_arr.getvalue()

        final_response = {
            "status": "completed",
            "progress": 100,
            "compressed_size": len(img_byte_arr),
            "original_size": len(image_data),
            "compression_ratio": len(image_data) / len(img_byte_arr),
            "compressed_image": {"data": list(img_byte_arr)},
            "image_analysis": {
                "dimensions": f"{image.width}x{image.height}",
                "color_mode": image.mode,
                "format": image.format,
                "bits_per_pixel": 8 if image.mode in ['L', 'P'] else 24 if image.mode == 'RGB' else 32,
            },
        }
        yield json.dumps(final_response) + "\n"

    except Exception as e:
        yield json.dumps({"status": "error", "message": str(e)}) + "\n"


@app.post("/compress")
async def compress_image_endpoint(
    file: UploadFile = File(...), quality_factor: int = Form(10)
):
    image_data = await file.read()
    return StreamingResponse(
        process_image_generator(image_data, quality_factor),
        media_type="text/event-stream",
    )

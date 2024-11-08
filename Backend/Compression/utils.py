import numpy as np
from PIL import Image
from .dct import dct2d, idct2d
import cv2


def create_quantization_table(quality_factor):
    """Create quantization table based on quality factor"""
    base_table = np.array(
        [
            [16, 11, 10, 16, 24, 40, 51, 61],
            [12, 12, 14, 19, 26, 58, 60, 55],
            [14, 13, 16, 24, 40, 57, 69, 56],
            [14, 17, 22, 29, 51, 87, 80, 62],
            [18, 22, 37, 56, 68, 109, 103, 77],
            [24, 35, 55, 64, 81, 104, 113, 92],
            [49, 64, 78, 87, 103, 121, 120, 101],
            [72, 92, 95, 98, 112, 100, 103, 99],
        ]
    )

    if quality_factor < 50:
        scale = 5000 / quality_factor
    else:
        scale = 200 - 2 * quality_factor

    qtable = np.floor((base_table * scale + 50) / 100)
    qtable[qtable < 1] = 1
    return qtable


def process_channel(channel, qtable):
    """Process a single channel with OpenCV DCT"""
    h, w = channel.shape
    # Ensure dimensions are multiples of 8
    pad_h = (8 - h % 8) if h % 8 != 0 else 0
    pad_w = (8 - w % 8) if w % 8 != 0 else 0

    if pad_h > 0 or pad_w > 0:
        channel = np.pad(channel, ((0, pad_h), (0, pad_w)), mode="constant")

    processed = np.zeros_like(channel, dtype=np.float32)

    for i in range(0, channel.shape[0], 8):
        for j in range(0, channel.shape[1], 8):
            block = channel[i : i + 8, j : j + 8]
            dct_block = dct2d(block)
            quantized = np.round(dct_block / qtable) * qtable
            processed[i : i + 8, j : j + 8] = quantized

    return processed[:h, :w]


def compress_image(image_array, quality_factor=10):
    """Compress image using DCT"""
    # Convert to YCrCb color space
    image_ycrcb = cv2.cvtColor(image_array, cv2.COLOR_RGB2YCrCb)
    height, width = image_array.shape[:2]

    # Create quantization tables
    qtable = create_quantization_table(quality_factor)

    # Process each channel
    processed_y = process_channel(image_ycrcb[:, :, 0], qtable)
    processed_cr = process_channel(
        image_ycrcb[:, :, 1], qtable * 2
    )  # More aggressive for chroma
    processed_cb = process_channel(
        image_ycrcb[:, :, 2], qtable * 2
    )  # More aggressive for chroma

    # Stack channels back together
    compressed = np.stack([processed_y, processed_cr, processed_cb], axis=2)

    return compressed


def decompress_image(compressed_array):
    """Decompress image using IDCT"""
    height, width = compressed_array.shape[:2]
    decompressed = np.zeros_like(compressed_array, dtype=float)

    # Process each channel
    for channel in range(3):
        h, w = compressed_array[:, :, channel].shape
        pad_h = (8 - h % 8) if h % 8 != 0 else 0
        pad_w = (8 - w % 8) if w % 8 != 0 else 0

        channel_data = compressed_array[:, :, channel]
        if pad_h > 0 or pad_w > 0:
            channel_data = np.pad(channel_data, ((0, pad_h), (0, pad_w)), mode="edge")

        processed = np.zeros_like(channel_data)

        for i in range(0, channel_data.shape[0], 8):
            for j in range(0, channel_data.shape[1], 8):
                block = channel_data[i : i + 8, j : j + 8]
                processed[i : i + 8, j : j + 8] = idct2d(block)

        decompressed[:, :, channel] = processed[:height, :width]

    # Convert back to RGB
    decompressed = np.clip(decompressed, 0, 255).astype(np.uint8)
    return cv2.cvtColor(decompressed, cv2.COLOR_YCrCb2RGB)

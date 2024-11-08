import cv2
import numpy as np

def dct2d(block):
    """Apply 2D Discrete Cosine Transform using OpenCV"""
    return cv2.dct(block.astype(np.float32))

def idct2d(dct_block):
    """Apply 2D Inverse Discrete Cosine Transform using OpenCV"""
    return cv2.idct(dct_block).astype(np.float32)

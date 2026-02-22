import cv2
import numpy as np
import matplotlib
matplotlib.use('Agg') # Essential for backend server usage
import matplotlib.pyplot as plt

def calculate_metrics(original_path, stego_path):
    # Load images
    img1 = cv2.imread(original_path)
    img2 = cv2.imread(stego_path)
    
    # 1. Calculate MSE (Mean Squared Error)
    # Convert to float to prevent overflow/wrapping during subtraction
    diff = img1.astype(np.float64) - img2.astype(np.float64)
    mse = np.mean(diff ** 2)
    
    # 2. Calculate PSNR (Peak Signal-to-Noise Ratio)
    if mse == 0:
        psnr = 100 # Perfect match
    else:
        PIXEL_MAX = 255.0
        psnr = 20 * np.log10(PIXEL_MAX / np.sqrt(mse))
        
    return round(psnr, 2), "{:.6f}".format(mse) # Return formatted string for MSE

def generate_histogram(original_path, stego_path, output_path):
    # Load as Grayscale for stats
    img1 = cv2.imread(original_path, 0)
    img2 = cv2.imread(stego_path, 0)
    
    # Create a figure with 2 subplots (Top and Bottom)
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))
    plt.subplots_adjust(hspace=0.4) # Add space between graphs

    # --- GRAPH 1: Global Pixel Distribution (Quality Check) ---
    ax1.set_title("1. Global Pixel Distribution (Quality Proof)")
    ax1.set_xlabel("Pixel Value (0-255)")
    ax1.set_ylabel("Frequency")
    
    # Plot Original in Blue (Transparent)
    ax1.hist(img1.ravel(), 256, [0, 256], color='blue', alpha=0.5, label='Original')
    # Plot Stego in Red (Transparent)
    ax1.hist(img2.ravel(), 256, [0, 256], color='red', alpha=0.5, label='Stego')
    ax1.legend()
    ax1.grid(True, alpha=0.2)

    # --- GRAPH 2: Residual Noise (The Secret Data) ---
    # This calculates (Stego - Original) to find exactly which pixels changed
    diff_pixels = img2.astype(np.int16) - img1.astype(np.int16)
    non_zero_diff = diff_pixels[diff_pixels != 0] # Ignore the millions of '0's
    
    ax2.set_title(f"2. Secret Data Noise Profile ({len(non_zero_diff)} Modified Pixels)")
    ax2.set_xlabel("Modification Magnitude (-1 to +1)")
    ax2.set_ylabel("Count of Changed Pixels")
    
    if len(non_zero_diff) > 0:
        # Plot only the changes
        ax2.hist(diff_pixels.ravel(), bins=range(-5, 6), color='purple', rwidth=0.8)
        ax2.set_xlim(-5, 5) # Zoom in on the center
        ax2.set_yscale('log') # Log scale to make small data visible
    else:
        ax2.text(0.5, 0.5, "No Data Hidden (Perfect Match)", 
                 horizontalalignment='center', verticalalignment='center', transform=ax2.transAxes)

    ax2.grid(True, alpha=0.2)
    
    # Save the combined report
    plt.savefig(output_path, dpi=100)
    plt.close()
    
    return output_path
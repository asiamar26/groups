const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIN_IMAGE_DIMENSIONS = { width: 200, height: 200 };
const MAX_IMAGE_DIMENSIONS = { width: 4096, height: 4096 };

/**
 * Validates file size
 * @param file The file to validate
 * @returns An object containing validation result and error message if any
 */
export function validateFileSize(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }
  return { isValid: true };
}

/**
 * Validates file type
 * @param file The file to validate
 * @returns An object containing validation result and error message if any
 */
export function validateFileType(file: File): { isValid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`
    };
  }
  return { isValid: true };
}

/**
 * Validates image dimensions
 * @param file The image file to validate
 * @returns A promise that resolves to an object containing validation result and error message if any
 */
export function validateImageDimensions(file: File): Promise<{ isValid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      if (img.width < MIN_IMAGE_DIMENSIONS.width || img.height < MIN_IMAGE_DIMENSIONS.height) {
        resolve({
          isValid: false,
          error: `Image dimensions must be at least ${MIN_IMAGE_DIMENSIONS.width}x${MIN_IMAGE_DIMENSIONS.height} pixels`
        });
        return;
      }

      if (img.width > MAX_IMAGE_DIMENSIONS.width || img.height > MAX_IMAGE_DIMENSIONS.height) {
        resolve({
          isValid: false,
          error: `Image dimensions must not exceed ${MAX_IMAGE_DIMENSIONS.width}x${MAX_IMAGE_DIMENSIONS.height} pixels`
        });
        return;
      }

      resolve({ isValid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: 'Failed to load image for dimension validation'
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Validates an image file for all criteria
 * @param file The image file to validate
 * @returns A promise that resolves to an object containing validation result and error message if any
 */
export async function validateImage(file: File): Promise<{ isValid: boolean; error?: string }> {
  // Check file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  // Check file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Check dimensions
  const dimensionValidation = await validateImageDimensions(file);
  if (!dimensionValidation.isValid) {
    return dimensionValidation;
  }

  return { isValid: true };
} 
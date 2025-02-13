export type FilterType = 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast' | 'saturate' | 'warm' | 'cool';

export interface Filter {
  name: string;
  value: FilterType;
  style: string;
}

export const FILTERS: Filter[] = [
  {
    name: 'Normal',
    value: 'none',
    style: 'none'
  },
  {
    name: 'B&W',
    value: 'grayscale',
    style: 'grayscale(100%)'
  },
  {
    name: 'Sepia',
    value: 'sepia',
    style: 'sepia(80%)'
  },
  {
    name: 'Blur',
    value: 'blur',
    style: 'blur(2px)'
  },
  {
    name: 'Bright',
    value: 'brightness',
    style: 'brightness(130%)'
  },
  {
    name: 'High Contrast',
    value: 'contrast',
    style: 'contrast(150%)'
  },
  {
    name: 'Vivid',
    value: 'saturate',
    style: 'saturate(200%)'
  },
  {
    name: 'Warm',
    value: 'warm',
    style: 'sepia(40%) saturate(150%) hue-rotate(-30deg)'
  },
  {
    name: 'Cool',
    value: 'cool',
    style: 'saturate(120%) hue-rotate(30deg)'
  }
];

export function applyFilterToCanvas(
  canvas: HTMLCanvasElement,
  filter: FilterType
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Apply the filter
      const selectedFilter = FILTERS.find(f => f.value === filter);
      if (selectedFilter) {
        ctx.filter = selectedFilter.style;
      }

      // Draw the filtered image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        throw new Error('Could not get temporary canvas context');
      }

      // Copy the original canvas to the temp canvas
      tempCtx.filter = ctx.filter;
      tempCtx.drawImage(canvas, 0, 0);

      // Convert to blob
      tempCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    } catch (error) {
      reject(error);
    }
  });
} 
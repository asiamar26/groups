'use client'

import React, { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Wand2, Edit } from 'lucide-react'
import { FilterType, FILTERS, applyFilterToCanvas } from '@/utils/imageFilters'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropModalProps {
  imageUrl: string
  onClose: () => void
  onCropComplete: (croppedImage: Blob, imageState?: ImageState) => void
  initialState?: ImageState
}

export interface ImageState {
  crop: Crop | undefined
  scale: number
  rotation: number
  filter: FilterType
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropModal({ 
  imageUrl, 
  onClose, 
  onCropComplete,
  initialState 
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop | undefined>(initialState?.crop)
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(initialState?.scale || 1)
  const [rotation, setRotation] = useState(initialState?.rotation || 0)
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(initialState?.filter || 'none')
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.1, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.1, 0.5))
  }, [])

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360)
  }, [])

  const handleReset = useCallback(() => {
    setScale(1)
    setRotation(0)
    setSelectedFilter('none')
    if (imgRef.current) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, 1))
    }
  }, [])

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    const newCrop = centerAspectCrop(width, height, 1)
    setCrop(newCrop)
    // Set initial completed crop
    setCompletedCrop({
      x: Number((newCrop.x * width) / 100),
      y: Number((newCrop.y * height) / 100),
      width: Number((newCrop.width * width) / 100),
      height: Number((newCrop.height * height) / 100),
      unit: 'px'
    })
  }

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: PixelCrop,
    scale: number,
    rotation: number,
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
      throw new Error('No 2d context')
    }

    // Calculate dimensions
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // We want a minimum 300px width/height, scale up if smaller
    const TARGET_SIZE = 300
    const cropWidth = crop.width * scaleX * scale
    const cropHeight = crop.height * scaleY * scale
    const scaleFactor = Math.max(TARGET_SIZE / cropWidth, TARGET_SIZE / cropHeight, 1)

    // Set final dimensions
    const finalWidth = Math.round(cropWidth * scaleFactor)
    const finalHeight = Math.round(cropHeight * scaleFactor)

    canvas.width = finalWidth
    canvas.height = finalHeight

    try {
      // Enable smooth scaling
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Move to center, rotate, and scale
      ctx.setTransform(
        scaleFactor, // Horizontal scaling
        0, // Horizontal skewing
        0, // Vertical skewing
        scaleFactor, // Vertical scaling
        finalWidth / 2, // Horizontal move
        finalHeight / 2, // Vertical move
      )

      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(scale, scale)

      // Draw the image
      ctx.translate(
        -(crop.x * scaleX + crop.width * scaleX / 2),
        -(crop.y * scaleY + crop.height * scaleY / 2)
      )
      
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
      )

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'))
              return
            }
            resolve(blob)
          },
          'image/jpeg',
          0.95
        )
      })
    } catch (error) {
      console.error('Error in image processing:', error)
      throw error
    }
  }

  const handleSave = async () => {
    try {
      if (!imgRef.current || !completedCrop) {
        console.error('Missing image reference or crop data');
        return;
      }

      setIsLoading(true);
      const croppedImage = await getCroppedImg(
        imgRef.current,
        completedCrop,
        scale,
        rotation
      );
      
      // Save the current state for future editing
      const imageState: ImageState = {
        crop,
        scale,
        rotation,
        filter: selectedFilter
      };
      
      onCropComplete(croppedImage, imageState);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Crop Profile Picture</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-[500px]"
              >
                <img
                  ref={imgRef}
                  alt="Profile"
                  src={imageUrl}
                  crossOrigin="anonymous"
                  onLoad={onImageLoad}
                  className="max-w-full"
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease',
                    filter: FILTERS.find(f => f.value === selectedFilter)?.style || 'none'
                  }}
                />
              </ReactCrop>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                title="Zoom Out"
              >
                <ZoomOut className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                title="Zoom In"
              >
                <ZoomIn className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={handleRotate}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                title="Rotate"
              >
                <RotateCcw className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg text-gray-600 ${showFilters ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Filters"
              >
                <Wand2 className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Reset
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mb-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedFilter(filter.value)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors
                        ${selectedFilter === filter.value 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                disabled={isLoading || !completedCrop?.width || !completedCrop?.height}
              >
                <Check className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
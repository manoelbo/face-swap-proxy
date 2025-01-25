'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'

interface ImageUploadProps {
  onUpload: (file: File | null) => void
}

export default function ImageUpload({ onUpload }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onUpload(file)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border border-dashed rounded p-8 text-center cursor-pointer transition-all
          ${isDragActive
            ? 'border-gray-500 bg-gray-500/10'
            : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
          }`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="space-y-4">
            <Image
              src={preview}
              alt="Preview"
              width={200}
              height={200}
              className="max-w-full h-auto rounded-lg"
            />
            <p className="text-gray-500 text-sm font-mono">click or drag to replace</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">
                drop image here
              </p>
              <p className="text-gray-600 text-xs">
                supports: jpg, png / max: 10mb
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
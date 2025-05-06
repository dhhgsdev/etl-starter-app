'use client'

import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { useState } from 'react'

export default function FileUpload({
  onDataParsed,
  disabled = false,
}: {
  onDataParsed: (data: any[]) => void
  disabled?: boolean
}) {
  const [fileName, setFileName] = useState<string | null>(null)

  const onDrop = (acceptedFiles: File[]) => {
    if (disabled) return

    const file = acceptedFiles[0]
    setFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onDataParsed(results.data as any[])
      },
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
  })

  return (
    <div className="w-full">
      <div {...getRootProps()} className="focus:outline-none">
        <input {...getInputProps()} disabled={disabled} />

        {/* Visual dropzone (no dashed outer border) */}
        <div
          className={`w-full p-4 rounded-md text-center transition ${
            disabled
              ? 'bg-[#0f0f0f] text-gray-500 cursor-not-allowed opacity-60'
              : 'bg-[#0f0f0f] hover:bg-[#1a1a1a] text-white cursor-pointer'
          }`}
        >
          {disabled ? (
            <p>Please select a supplier first.</p>
          ) : fileName ? (
            <div className="space-y-1">
              <p className="font-medium">
                📄 <span className="font-semibold">{fileName}</span> loaded
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setFileName(null)
                  onDataParsed([])
                }}
                className="mt-2 text-sm text-white hover:no-underline bg-[#0f0f0f]"
              >
                ⛔ Clear File
              </button>
            </div>
          ) : isDragActive ? (
            <p className="text-blue-500">Drop the file here...</p>
          ) : (
            <p>Drag and drop a CSV file here, or click to select one</p>
          )}
        </div>
      </div>
    </div>
  )
}

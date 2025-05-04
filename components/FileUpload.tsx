'use client'

import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { useState } from 'react'

export default function FileUpload({ onDataParsed }: { onDataParsed: (data: any[]) => void }) {
  const [fileName, setFileName] = useState<string | null>(null)

  const onDrop = (acceptedFiles: File[]) => {
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div
      {...getRootProps()}
      className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
    >
      <input {...getInputProps()} />
      {fileName ? (
        <div className="space-y-1">
          <p className="text-gray-800 font-medium">
            📄 <span className="font-semibold">{fileName}</span> loaded
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setFileName(null)
              onDataParsed([])
            }}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            ⛔ Clear File
          </button>
        </div>
      ) : isDragActive ? (
        <p className="text-blue-600">Drop the file here...</p>
      ) : (
        <p className="text-gray-600">Drag and drop a CSV file here, or click to select one</p>
      )}
    </div>
  )
}

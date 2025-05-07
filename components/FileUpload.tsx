'use client'

import { useRef } from 'react'

interface FileUploadProps {
  onDataParsed: (data: any[]) => void
  disabled?: boolean
}

export default function FileUpload({ onDataParsed, disabled }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const rows = text.split('\n').filter(Boolean)
    const headers = rows[0].split(',').map((h) => h.trim())
    const data = rows.slice(1).map((row) => {
      const values = row.split(',')
      const entry: Record<string, string> = {}
      headers.forEach((key, i) => {
        entry[key] = values[i]?.trim() ?? ''
      })
      return entry
    })

    onDataParsed(data)
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded cursor-pointer transition-colors bg-surfaceAlt border-gray-600 hover:bg-surfaceHover ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <p className="text-sm text-gray-400 text-center">
        {disabled ? 'Select a supplier first' : 'Click to upload CSV'}
      </p>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import FileUpload from '@/components/FileUpload'

export default function UploadPage() {
  const [parsedData, setParsedData] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
const [selectedSupplier, setSelectedSupplier] = useState('')

useEffect(() => {
  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from('etl_suppliers')
      .select('*')

    if (error) {
      console.error('Error fetching suppliers:', error)
    } else {
      setSuppliers(data)
    }
  }

  fetchSuppliers()
}, [])

  return (
    <div>
      <header className="bg-black text-white px-6 py-4">
        <h1 className="text-2xl font-bold">ETL Starter</h1>
      </header>

      <main className="p-6 space-y-6">

        {/* Supplier Section */}
        <div className="border border-gray-300 rounded-md shadow-sm">
  <h2 className="text-lg font-semibold text-white bg-gray-800 px-4 py-2 rounded-t-md">
    Select Supplier
  </h2>
  <div className="p-4 bg-white">
    <select
      value={selectedSupplier}
      onChange={(e) => setSelectedSupplier(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
    >
      <option value="">-- Choose Supplier --</option>
      {suppliers.map((s) => (
        <option key={s.id} value={s.id}>
          {s.supplier_name}
        </option>
      ))}
    </select>
  </div>
</div>

        {/* Upload Section */}
        <div className="border border-gray-300 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold text-white bg-gray-800 px-4 py-2 rounded-t-md">
            Upload a CSV File
          </h2>
          <div className="p-4 bg-white">
            <FileUpload onDataParsed={setParsedData} />
          </div>
        </div>

        {/* Table Preview */}
        {parsedData.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-gray-300 shadow-sm">
            <table className="min-w-full text-sm table-auto border-collapse border border-gray-200">
              <thead className="bg-gray-800 text-white">
                <tr>
                  {Object.keys(parsedData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-2 text-left font-semibold border-b border-r border-gray-200 last:border-r-0"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.values(row).map((val, j) => (
                      <td
                        key={j}
                        className="px-4 py-2 border-b border-r border-gray-200 last:border-r-0"
                      >
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-gray-100 px-4 py-2 text-sm rounded-b-md">
              Showing first 10 rows
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

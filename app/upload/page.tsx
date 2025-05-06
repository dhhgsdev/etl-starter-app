'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import FileUpload from '@/components/FileUpload'

export default function UploadPage() {
  const [parsedData, setParsedData] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [etlMap, setEtlMap] = useState<any | null>(null)

  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data, error } = await supabase.from('etl_suppliers').select('*')
      if (error) console.error('Error fetching suppliers:', error)
      else setSuppliers(data)
    }
    fetchSuppliers()
  }, [])

  useEffect(() => {
    const fetchETLMap = async () => {
      if (!selectedSupplier) return setEtlMap(null)
      const { data, error } = await supabase
        .from('etl_supplier_maps')
        .select('*')
        .eq('supplier_id', selectedSupplier)
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching ETL map:', error)
        setEtlMap(null)
      } else {
        setEtlMap(data)
      }
    }
    fetchETLMap()
  }, [selectedSupplier])

  return (
    <div className="space-y-6">
      {/* Supplier Selector in 1/4 width on desktop */}
      <div className="w-full md:w-1/4 border border-[#2f2f2f] bg-[#161616] rounded-md p-4">
        <h2 className="text-sm font-semibold text-white mb-2">Select Supplier</h2>
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="w-full p-2 bg-[#0f0f0f] text-white border border-[#2f2f2f] rounded-md text-sm"
        >
          <option value="">-- Choose Supplier --</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.supplier_name}
            </option>
          ))}
        </select>
      </div>

      {/* ETL Map + Upload side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="border border-[#2f2f2f] bg-[#161616] rounded-md p-4 h-full">
          <h2 className="text-sm font-semibold text-white mb-2">Loaded ETL Map</h2>
          <pre className="text-sm text-gray-300 bg-[#0f0f0f] p-3 rounded overflow-x-auto">
            {JSON.stringify(etlMap?.source_to_target, null, 2)}
          </pre>
        </div>

        <div className="border border-[#2f2f2f] bg-[#161616] rounded-md p-4 h-full">
          <h2 className="text-sm font-semibold text-white mb-2">Upload a CSV File</h2>
          <div className="bg-[#0f0f0f] rounded border-2 border-dashed border-gray-600 p-6">
            <FileUpload onDataParsed={setParsedData} disabled={!selectedSupplier} />
          </div>
        </div>
      </div>

      {/* CSV Data Table Preview */}
      {parsedData.length > 0 && (
        <div className="rounded-md border border-[#2f2f2f] bg-[#0f0f0f] overflow-hidden">
          <div className="bg-[#161616] px-4 py-3 border-b border-[#2f2f2f]">
            <h2 className="text-sm font-semibold text-white">File Preview</h2>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm text-left text-gray-200">
              <thead className="bg-[#1b1b1b] text-gray-400 uppercase text-xs border-b border-[#2f2f2f] sticky top-0 z-10">
                <tr>
                  {Object.keys(parsedData[0]).map((key) => (
                    <th key={key} className="px-4 py-3 font-medium whitespace-nowrap">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-[#1c1c1c] border-b border-[#2f2f2f] transition">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-4 py-3 whitespace-nowrap text-gray-100">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-[#161616] px-4 py-2 text-xs text-gray-400 border-t border-[#2f2f2f]">
            Showing first 10 rows
          </div>
        </div>
      )}
    </div>
  )
}

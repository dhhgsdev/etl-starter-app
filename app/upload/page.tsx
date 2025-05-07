'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import FileUpload from '@/components/FileUpload'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export default function UploadPage() {
  const [parsedData, setParsedData] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [etlMap, setEtlMap] = useState<any | null>(null)
  const [tab, setTab] = useState('preview')

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
    <div className="flex min-h-screen bg-background text-white px-6 py-6 gap-6">
      {/* Sidebar */}
      <aside className="w-1/4 border-gray-700 bg-background px-6 py-6">
        <div className="flex flex-col space-y-6">
          {/* Select Supplier */}
          <div className="bg-surface border border-gray-700 rounded-md p-4">
            <label className="block text-sm mb-2">Select Supplier</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full rounded bg-surfaceAlt text-white border border-gray-700 p-2 text-sm"
            >
              <option value="">Choose...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.supplier_name}
                </option>
              ))}
            </select>
          </div>

          {/* Loaded ETL Map - moved up */}
          <div className="bg-surface border border-gray-700 rounded-md p-4">
            <label className="block text-sm mb-2">Loaded ETL Map</label>
            <pre className="text-xs text-gray-300 bg-surfaceAlt p-3 rounded overflow-x-auto border border-gray-700">
              {etlMap?.source_to_target
                ? JSON.stringify(etlMap.source_to_target, null, 2)
                : 'No ETL map loaded.'}
            </pre>
          </div>

          {/* Upload CSV - only show if ETL map exists */}
          {etlMap && (
            <div className="bg-surface border border-gray-700 rounded-md p-4">
              <label className="block text-sm mb-2">Upload CSV</label>
              <div className="w-full p-4 border-2 border-none border-gray-700 text-center text-gray-400">
                <FileUpload onDataParsed={setParsedData} disabled={!selectedSupplier} />
              </div>
            </div>
          )}

        </div>
      </aside>


      {/* Main Content */}
      <main className="flex-1 pl-6 flex flex-col px-6 py-6 gap-6">
        <Tabs defaultValue="preview" value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 border border-gray-700 rounded-md">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="mapping">Mapping</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="preview">
            {parsedData.length > 0 ? (
              <div className="bg-surface border border-gray-700 rounded-md p-4 max-h-[60vh] overflow-auto">
                <table className="min-w-full text-sm text-left text-gray-200">
                  <thead className="bg-surfaceAlt text-gray-400 text-xs uppercase">
                    <tr>
                      {Object.keys(parsedData[0]).map((key) => (
                        <th key={key} className="px-4 py-2 whitespace-nowrap">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-surfaceHover">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-2 whitespace-nowrap">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-xs text-gray-400 mt-2">Showing first 10 rows</div>
              </div>
            ) : (
              <div className="text-gray-400 p-4 bg-surface border border-gray-700 rounded-md">
                No preview available.
              </div>
            )}
          </TabsContent>

          <TabsContent value="mapping">
            <div className="bg-surface border border-gray-700 rounded-md p-4 max-h-[60vh] overflow-auto">
              <p className="text-gray-400">Field mapping interface...</p>
            </div>
          </TabsContent>

          <TabsContent value="validation">
            <div className="bg-surface border border-gray-700 rounded-md p-4 max-h-[60vh] overflow-auto">
              <p className="text-gray-400">Validation results...</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button variant="secondary">Validate</Button>
          <Button variant="default">Submit</Button>
        </div>
      </main>
    </div>
  )
}

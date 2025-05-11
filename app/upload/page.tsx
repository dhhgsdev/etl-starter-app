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
  const [validationResults, setValidationResults] = useState<any[]>([])
  const [hasViewedValidation, setHasViewedValidation] = useState(false)


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
      if (!selectedSupplier) {
        setEtlMap(null)
        setParsedData([])
        setValidationResults([])
        setHasViewedValidation(false)
        return
      }

      const { data, error } = await supabase
        .from('etl_supplier_maps')
        .select('*')
        .eq('supplier_id', selectedSupplier)
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching ETL map:', error)
        setEtlMap(null)
        setParsedData([])
        setValidationResults([])
        setHasViewedValidation(false)
      } else {
        setEtlMap(data)
        setParsedData([])
        setValidationResults([])
        setHasViewedValidation(false)
      }
    }

    fetchETLMap()
  }, [selectedSupplier])

  // Automatically re-validate if parsedData exists and etlMap changes
  useEffect(() => {
    if (parsedData.length > 0 && etlMap) {
      const results = runValidation(parsedData, etlMap)
      setValidationResults(results)
    }
  }, [etlMap])

  function runValidation(fileData: any[], map: any) {
    const expectedColumnCount = Object.keys(map.source_to_target).length
    const results: any[] = []

    if (!fileData || fileData.length === 0) {
      results.push({
        type: 'No Data',
        expected_column_count: expectedColumnCount,
        actual_column_count: 0,
        message: 'No data uploaded to validate.'
      })
      return results
    }

    const actualColumnCount = Object.keys(fileData[0]).length
    if (actualColumnCount !== expectedColumnCount) {
      results.push({
        type: 'Column Count Mismatch',
        expected_column_count: expectedColumnCount,
        actual_column_count: actualColumnCount,
        message: `Uploaded file has ${actualColumnCount} columns but ${expectedColumnCount} were expected based on the ETL map.`
      })
    }

    return results
  }

  function exportValidationToCSV() {
    if (!selectedSupplier) return;

    const supplier = suppliers.find(s => s.id === selectedSupplier);
    const supplierName = supplier?.supplier_name?.replace(/\s+/g, '_') || 'unknown_supplier';
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB').replace(/\//g, ''); // ddmmyyyy

    const filename = `${supplierName}_validation_results_${formattedDate}.csv`;

    const csvContent = [
      ['Type', 'Expected Columns', 'Actual Columns', 'Message'],
      ...validationResults.map((r) => [
        r.type,
        r.expected_column_count,
        r.actual_column_count,
        `"${r.message}"`
      ])
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-white px-6 py-6 gap-6">
      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 border-gray-700 bg-background">
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

          {/* Loaded ETL Map */}
          {etlMap && (
            <div className="bg-surface border border-gray-700 rounded-md p-4">
              <label className="block text-sm mb-2">Loaded ETL Map</label>
              <pre className="text-xs text-gray-300 bg-surfaceAlt p-3 rounded overflow-x-auto border border-gray-700">
                {JSON.stringify(etlMap.source_to_target, null, 2)}
              </pre>
            </div>
          )}

          {/* Upload CSV */}
          {etlMap && (
            <div className="bg-surface border border-gray-700 rounded-md p-4">
              <label className="block text-sm mb-2">Upload CSV</label>
              <div className="w-full p-4 border-none border-gray-700 rounded text-center text-gray-400">
                <FileUpload
                  onDataParsed={(data) => {
                    setParsedData(data)
                    if (etlMap) {
                      const results = runValidation(data, etlMap)
                      setValidationResults(results)
                    }
                  }}
                  disabled={!selectedSupplier}
                />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 overflow-x-auto">
        <Tabs defaultValue="preview" value={tab} onValueChange={(value) => {
          setTab(value)
          if (value === 'validation') setHasViewedValidation(true)
        }}>
          <TabsList className="mb-4 border border-gray-700 rounded-md flex sm:inline-flex w-full sm:w-auto">
            <TabsTrigger value="preview" className="flex-1 sm:flex-none text-center">
              Preview
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex-1 sm:flex-none text-center">
              Mapping
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex-1 sm:flex-none text-center relative">
              Validation
              {validationResults.length > 0 && (
                <span className="ml-2 w-5 h-5 flex items-center justify-center text-xs font-semibold rounded bg-red-700 text-white">
                  {validationResults.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Preview Tab */}
          <TabsContent value="preview">
            {parsedData.length > 0 ? (
              <div className="bg-surface border border-gray-700 rounded-md p-4 max-h-[60vh] overflow-auto">
                <div className="min-w-full">
                  <table className="w-full text-sm text-left text-gray-200">
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
                </div>
                <div className="text-xs text-gray-400 mt-2">Showing first 10 rows</div>
              </div>
            ) : (
              <div className="text-gray-400 p-4 bg-surface border border-gray-700 rounded-md">
                No preview available.
              </div>
            )}
          </TabsContent>

          {/* Mapping Placeholder */}
          <TabsContent value="mapping">
            <div className="bg-surface border border-gray-700 rounded-md p-4 max-h-[60vh] overflow-auto">
              <p className="text-gray-400">Field mapping interface...</p>
            </div>
          </TabsContent>

          {/* Validation Tab */}
          <TabsContent value="validation">
            {parsedData.length > 0 ? (
              <div className="bg-surface border border-gray-700 rounded-md p-4 max-h-[60vh] overflow-auto">
                {validationResults.length > 0 ? (
                  <div>
                    <table className="min-w-full text-sm text-left text-gray-200">
                      <thead className="bg-surfaceAlt text-gray-400 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-2">Type</th>
                          <th className="px-4 py-2">Expected</th>
                          <th className="px-4 py-2">Actual</th>
                          <th className="px-4 py-2">Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationResults.map((r, idx) => (
                          <tr key={idx} className="hover:bg-surfaceHover">
                            <td className="px-4 py-2 whitespace-nowrap">{r.type}</td>
                            <td className="px-4 py-2">{r.expected_column_count}</td>
                            <td className="px-4 py-2">{r.actual_column_count}</td>
                            <td className="px-4 py-2">{r.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 flex justify-between">
                      <Button variant="secondary" onClick={exportValidationToCSV}>
                        Export to CSV
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => {
                          if (etlMap && parsedData.length > 0) {
                            const results = runValidation(parsedData, etlMap)
                            setValidationResults(results)
                          }
                        }}
                      >
                        Re-validate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No validation results yet.</p>
                )}
              </div>
            ) : (
              <div className="text-gray-400 p-4 bg-surface border border-gray-700 rounded-md">
                No data available for validation.
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
          <Button variant="outline">Cancel</Button>
          <Button variant="secondary" className="w-full sm:w-auto">
            Validate
          </Button>
          <Button variant="default" className="w-full sm:w-auto">
            Submit
          </Button>
        </div>
      </main>
    </div>
  )
}

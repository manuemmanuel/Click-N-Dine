import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Table {
  id: number;
  name: string;
  capacity: number;
  is_occupied: boolean;
}

interface TableSelectorProps {
  onTablesSelected: (tableIds: number[]) => void;
  maxTables: number;
}

export default function TableSelector({ onTablesSelected, maxTables }: TableSelectorProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update selected tables when maxTables changes
  useEffect(() => {
    if (selectedTables.length > maxTables) {
      setSelectedTables(selectedTables.slice(0, maxTables));
    }
  }, [maxTables]);

  useEffect(() => {
    async function fetchTables() {
      try {
        const { data, error } = await supabase
          .from('tables')
          .select('*')
          .order('id');

        if (error) throw error;
        setTables(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTables();
  }, []);

  const handleTableSelect = (tableId: number) => {
    if (selectedTables.includes(tableId)) {
      setSelectedTables(selectedTables.filter(id => id !== tableId));
    } else if (selectedTables.length < maxTables) {
      setSelectedTables([...selectedTables, tableId]);
    }
  };

  useEffect(() => {
    onTablesSelected(selectedTables);
  }, [selectedTables, onTablesSelected]);

  if (loading) return <div className="text-slate-900">Loading tables...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="text-slate-900 mb-4">
        Selected {selectedTables.length} of {maxTables} tables
      </div>
      <div className="grid grid-cols-3 gap-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleTableSelect(table.id)}
            disabled={table.is_occupied || (!selectedTables.includes(table.id) && selectedTables.length >= maxTables)}
            className={`
              p-4 rounded-xl transition-all
              ${table.is_occupied 
                ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
                : selectedTables.includes(table.id)
                  ? 'bg-red-600 text-white'
                  : 'bg-white border-2 border-red-600 text-red-600 hover:bg-red-50'
              }
            `}
          >
            <div className="text-lg font-medium">{table.name}</div>
            <div className="text-sm">
              {table.is_occupied ? 'Occupied' : `Capacity: ${table.capacity}`}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 
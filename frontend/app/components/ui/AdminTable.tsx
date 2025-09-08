'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Eye, MoreHorizontal, Search, Filter, Plus } from 'lucide-react';

interface AdminTableProps {
  title: string;
  subtitle?: string;
  columns: TableColumn[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  className?: string;
  filters?: FilterOption[];
  onFilterChange?: (filters: Record<string, any>) => void;
}

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'checkbox';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
  className?: string;
}

const AdminTable = ({
  title,
  subtitle,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  onView,
  searchPlaceholder = 'البحث...',
  onSearch,
  isLoading = false,
  className = '',
  filters = [],
  onFilterChange
}: AdminTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setFilterValues({});
    onFilterChange?.({});
  };

  const filteredData = data.filter(item => {
    // Search filter
    if (searchQuery) {
      const searchMatch = columns.some(column => {
        const value = item[column.key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchQuery.toLowerCase());
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchQuery);
        }
        return false;
      });
      if (!searchMatch) return false;
    }

    // Custom filters
    for (const [key, value] of Object.entries(filterValues)) {
      if (value && value !== '') {
        const itemValue = item[key];
        if (itemValue !== value) {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-500 to-black px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-white/80 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          
          {onAdd && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAdd}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
            >
              <Plus size={20} />
              إضافة جديد
            </motion.button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex gap-4 items-center">
          {onSearch && (
            <div className="flex-1 relative">
              <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a075ad] focus:border-transparent transition-all duration-200"
              />
            </div>
          )}
          
          {filters.length > 0 && (
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-xl transition-all duration-200 flex items-center gap-2 ${
                showFilters 
                  ? 'border-[#a075ad] bg-[#a075ad] text-white' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter size={20} />
              تصفية
              {Object.keys(filterValues).filter(key => filterValues[key]).length > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {Object.keys(filterValues).filter(key => filterValues[key]).length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && filters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {filter.label}
                  </label>
                  {filter.type === 'select' ? (
                    <select
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a075ad] focus:border-transparent"
                    >
                      <option value="">الكل</option>
                      {filter.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : filter.type === 'date' ? (
                    <input
                      type="date"
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a075ad] focus:border-transparent"
                    />
                  ) : (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filterValues[filter.key] || false}
                        onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                        className="w-4 h-4 text-[#a075ad] border-gray-300 rounded focus:ring-[#a075ad] focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{filter.placeholder}</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                مسح الفلاتر
              </button>
            </div>
          </motion.div>
        )}
        </div>
      

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-right text-sm font-semibold text-gray-700 ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 w-32">
                  الإجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-2 border-[#a075ad] border-t-transparent rounded-full"
                    />
                    <span className="mr-3 text-gray-500">جاري التحميل...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                  لا توجد بيانات
                </td>
              </tr>
            ) : (
              filteredData.map((item, rowIndex) => (
                <motion.tr
                  key={item._id || rowIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className={`px-6 py-4 text-sm text-gray-900 ${column.className || ''}`}>
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                  
                  {(onEdit || onDelete || onView) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {onView && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onView(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="عرض"
                          >
                            <Eye size={16} />
                          </motion.button>
                        )}
                        
                        {onEdit && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onEdit(item)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="تعديل"
                          >
                            <Edit3 size={16} />
                          </motion.button>
                        )}
                        
                        {onDelete && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>إجمالي النتائج: {filteredData.length}</span>
          <span>صفحة 1 من 1</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminTable;

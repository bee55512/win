import React, { useState } from 'react';
import { Search, Filter, Package, Edit, Plus, X, Save } from 'lucide-react';
import { materialsData } from '../data/materials';

interface Material {
  ref: string;
  designation: string;
  prixUMoyen: number;
}

const MaterialsDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [materials, setMaterials] = useState<Material[]>(materialsData);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Material>({
    ref: '',
    designation: '',
    prixUMoyen: 0
  });
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Material>({
    ref: '',
    designation: '',
    prixUMoyen: 0
  });

  const categories = [
    { value: 'all', label: 'جميع المواد' },
    { value: 'profiles', label: 'البروفايل' },
    { value: 'hardware', label: 'الملحقات' },
    { value: 'glass', label: 'الزجاج' },
    { value: 'joints', label: 'المواد اللاصقة' }
  ];

  const getCategoryForRef = (ref: string) => {
    if (ref.startsWith('40') || ref.startsWith('22') || ref.startsWith('60')) return 'profiles';
    if (ref.includes('joint') || ref.includes('plat')) return 'joints';
    if (ref.includes('glass') || ref.includes('زجاج')) return 'glass';
    return 'hardware';
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.ref.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || getCategoryForRef(material.ref) === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddMaterial = () => {
    if (!newMaterial.ref || !newMaterial.designation || newMaterial.prixUMoyen <= 0) {
      alert('يرجى ملء جميع الحقول بشكل صحيح');
      return;
    }

    // التحقق من عدم وجود مرجع مكرر
    if (materials.some(m => m.ref === newMaterial.ref)) {
      alert('هذا المرجع موجود بالفعل');
      return;
    }

    setMaterials([...materials, { ...newMaterial }]);
    setNewMaterial({ ref: '', designation: '', prixUMoyen: 0 });
    setShowAddForm(false);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material.ref);
    setEditForm({ ...material });
  };

  const handleSaveEdit = () => {
    if (!editForm.designation || editForm.prixUMoyen <= 0) {
      alert('يرجى ملء جميع الحقول بشكل صحيح');
      return;
    }

    setMaterials(materials.map(m => 
      m.ref === editingMaterial ? { ...editForm } : m
    ));
    setEditingMaterial(null);
    setEditForm({ ref: '', designation: '', prixUMoyen: 0 });
  };

  const handleCancelEdit = () => {
    setEditingMaterial(null);
    setEditForm({ ref: '', designation: '', prixUMoyen: 0 });
  };

  const handleDeleteMaterial = (ref: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      setMaterials(materials.filter(m => m.ref !== ref));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">قاعدة بيانات المواد</h2>
        <p className="text-lg text-gray-600">إدارة أسعار وبيانات المواد المستخدمة في تصنيع النوافذ</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ابحث عن المواد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="md:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة مادة
          </button>
        </div>
      </div>

      {/* Add Material Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">إضافة مادة جديدة</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المرجع
              </label>
              <input
                type="text"
                value={newMaterial.ref}
                onChange={(e) => setNewMaterial({...newMaterial, ref: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="مثال: 001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المادة
              </label>
              <input
                type="text"
                value={newMaterial.designation}
                onChange={(e) => setNewMaterial({...newMaterial, designation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="مثال: 40100 blanc eurosist"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                السعر الوسطي (د.ت)
              </label>
              <input
                type="number"
                step="0.01"
                value={newMaterial.prixUMoyen}
                onChange={(e) => setNewMaterial({...newMaterial, prixUMoyen: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleAddMaterial}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="h-4 w-4 ml-2" />
              حفظ
            </button>
          </div>
        </div>
      )}

      {/* Materials Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المرجع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اسم المادة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السعر الوسطي (د.ت)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الفئة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.map((material, index) => (
                <tr key={material.ref} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 ml-2" />
                      <span className="text-sm font-medium text-gray-900">{material.ref}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingMaterial === material.ref ? (
                      <input
                        type="text"
                        value={editForm.designation}
                        onChange={(e) => setEditForm({...editForm, designation: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{material.designation}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingMaterial === material.ref ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.prixUMoyen}
                        onChange={(e) => setEditForm({...editForm, prixUMoyen: parseFloat(e.target.value) || 0})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-green-600">
                        {material.prixUMoyen.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getCategoryForRef(material.ref) === 'profiles' 
                        ? 'bg-blue-100 text-blue-800'
                        : getCategoryForRef(material.ref) === 'hardware'
                        ? 'bg-green-100 text-green-800'
                        : getCategoryForRef(material.ref) === 'joints'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {categories.find(c => c.value === getCategoryForRef(material.ref))?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingMaterial === material.ref ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditMaterial(material)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMaterial(material.ref)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد مواد تطابق البحث</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{materials.length}</div>
          <div className="text-sm text-gray-600">إجمالي المواد</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">
            {materials.filter(m => getCategoryForRef(m.ref) === 'profiles').length}
          </div>
          <div className="text-sm text-gray-600">البروفايل</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {materials.filter(m => getCategoryForRef(m.ref) === 'hardware').length}
          </div>
          <div className="text-sm text-gray-600">الملحقات</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {(materials.reduce((sum, m) => sum + m.prixUMoyen, 0) / materials.length).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">متوسط السعر</div>
        </div>
      </div>
    </div>
  );
};

export default MaterialsDatabase;
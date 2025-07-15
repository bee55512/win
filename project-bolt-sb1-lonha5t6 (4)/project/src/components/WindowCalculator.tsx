import React, { useState, useEffect } from 'react';
import { Calculator, Package, Eye, Download, RotateCcw, Plus, X, Copy, List, ShoppingCart } from 'lucide-react';
import { materialsData } from '../data/materials';
import { calculateWindowCost, type WindowSpecs, type CostBreakdown } from '../utils/calculations';
import CostBreakdown from './CostBreakdown';
import MaterialOptimization from './MaterialOptimization';
import CombinedMaterialsCalculator from './CombinedMaterialsCalculator';

interface WindowProject {
  id: string;
  name: string;
  specs: WindowSpecs;
  breakdown?: CostBreakdown;
}

const WindowCalculator: React.FC = () => {
  const [windows, setWindows] = useState<WindowProject[]>([
    {
      id: '1',
      name: 'نافذة 1',
      specs: {
        length: 100,
        width: 100,
        color: 'blanc',
        frameType: 'eurosist',
        sashType: '6007',
        sashSubType: 'inoforme',
        glassType: 'simple'
      }
    }
  ]);

  const [activeWindowId, setActiveWindowId] = useState('1');
  const [viewMode, setViewMode] = useState<'single' | 'multiple' | 'combined'>('single');
  const [isCalculating, setIsCalculating] = useState(false);
  const [profitMargin, setProfitMargin] = useState(30); // نسبة الربح بالنسبة المئوية

  // الألوان المتاحة
  const colorOptions = [
    { value: 'blanc', label: 'أبيض' },
    { value: 'fbois', label: 'خشبي' },
    { value: 'gris', label: 'رمادي' }
  ];

  // خيارات القفص (40100 فقط) حسب اللون
  const getFrameOptions = (color: string) => {
    const allFrameOptions = [
      { value: 'eurosist', label: 'Eurosist', colors: ['blanc', 'fbois'] },
      { value: 'inoforme', label: 'Inoforme', colors: ['blanc'] },
      { value: 'eco_loranzo', label: 'Eco Loranzo', colors: ['blanc'] },
      { value: 'pral', label: 'Pral', colors: ['fbois'] },
      { value: 'inter', label: 'Inter', colors: ['fbois'] },
      { value: 'losanzo', label: 'Losanzo', colors: ['gris'] }
    ];
    
    return allFrameOptions.filter(option => option.colors.includes(color));
  };

  // خيارات الفردة حسب اللون
  const getSashOptions = (color: string) => {
    const allSashOptions = [
      { 
        value: '6007', 
        label: '6007', 
        types: [
          { value: 'inoforme', label: 'Inoforme', colors: ['blanc'] },
          { value: 'gris', label: 'Gris', colors: ['gris'] }
        ]
      },
      { 
        value: '40404', 
        label: '40404', 
        types: [
          { value: 'eurosist', label: 'Eurosist', colors: ['blanc'] },
          { value: 'inter', label: 'Inter', colors: ['blanc'] },
          { value: 'pral', label: 'Pral', colors: ['fbois'] },
          { value: 'technoline', label: 'Technoline', colors: ['fbois'] },
          { value: 'eurosist', label: 'Eurosist', colors: ['fbois'] }
        ]
      }
    ];

    return allSashOptions.map(sashOption => ({
      ...sashOption,
      types: sashOption.types.filter(type => type.colors.includes(color))
    })).filter(sashOption => sashOption.types.length > 0);
  };

  const activeWindow = windows.find(w => w.id === activeWindowId);

  const addWindow = () => {
    const newId = Date.now().toString();
    const newWindow: WindowProject = {
      id: newId,
      name: `نافذة ${windows.length + 1}`,
      specs: {
        length: 100,
        width: 100,
        color: 'blanc',
        frameType: 'eurosist',
        sashType: '6007',
        sashSubType: 'inoforme',
        glassType: 'simple'
      }
    };
    setWindows([...windows, newWindow]);
    setActiveWindowId(newId);
  };

  const removeWindow = (id: string) => {
    if (windows.length === 1) return;
    const newWindows = windows.filter(w => w.id !== id);
    setWindows(newWindows);
    if (activeWindowId === id) {
      setActiveWindowId(newWindows[0].id);
    }
  };

  const duplicateWindow = (id: string) => {
    const windowToDuplicate = windows.find(w => w.id === id);
    if (!windowToDuplicate) return;
    
    const newId = Date.now().toString();
    const newWindow: WindowProject = {
      id: newId,
      name: `${windowToDuplicate.name} (نسخة)`,
      specs: { ...windowToDuplicate.specs }
    };
    setWindows([...windows, newWindow]);
    setActiveWindowId(newId);
  };

  const updateWindowSpecs = (specs: Partial<WindowSpecs>) => {
    setWindows(windows.map(w => 
      w.id === activeWindowId 
        ? { ...w, specs: { ...w.specs, ...specs } }
        : w
    ));
  };

  const updateWindowName = (id: string, name: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, name } : w
    ));
  };

  const calculateAllWindows = async () => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedWindows = windows.map(window => ({
      ...window,
      breakdown: calculateWindowCost(window.specs, profitMargin / 100)
    }));
    
    setWindows(updatedWindows);
    setViewMode('combined');
    setIsCalculating(false);
  };

  const calculateSingleWindow = async () => {
    if (!activeWindow) return;
    
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const breakdown = calculateWindowCost(activeWindow.specs, profitMargin / 100);
    setWindows(windows.map(w => 
      w.id === activeWindowId 
        ? { ...w, breakdown }
        : w
    ));
    setViewMode('single');
    setIsCalculating(false);
  };

  const handleReset = () => {
    setWindows([{
      id: '1',
      name: 'نافذة 1',
      specs: {
        length: 100,
        width: 100,
        color: 'blanc',
        frameType: 'eurosist',
        sashType: '6007',
        sashSubType: 'inoforme',
        glassType: 'simple'
      }
    }]);
    setActiveWindowId('1');
    setViewMode('single');
  };

  const handleExport = () => {
    const data = {
      windows: windows.map(w => ({
        name: w.name,
        specs: w.specs,
        breakdown: w.breakdown
      })),
      totalCost: windows.reduce((sum, w) => sum + (w.breakdown?.totalCost || 0), 0),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `windows-project-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // تحديث الخيارات عند تغيير اللون
  const handleColorChange = (newColor: string) => {
    const frameOptions = getFrameOptions(newColor);
    const sashOptions = getSashOptions(newColor);
    
    const firstFrameOption = frameOptions[0];
    const firstSashOption = sashOptions[0];
    const firstSashSubType = firstSashOption?.types[0];

    updateWindowSpecs({
      color: newColor,
      frameType: firstFrameOption?.value || 'eurosist',
      sashType: firstSashOption?.value || '6007',
      sashSubType: firstSashSubType?.value || 'inoforme'
    });
  };

  // تحديث نوع الفردة عند تغيير النوع الرئيسي
  const handleSashTypeChange = (newSashType: string) => {
    if (!activeWindow) return;
    const sashOptions = getSashOptions(activeWindow.specs.color);
    const sashOption = sashOptions.find(opt => opt.value === newSashType);
    const firstType = sashOption?.types[0];
    
    updateWindowSpecs({
      sashType: newSashType,
      sashSubType: firstType?.value || 'inoforme'
    });
  };

  const totalCost = windows.reduce((sum, w) => sum + (w.breakdown?.totalCost || 0), 0);
  const calculatedWindows = windows.filter(w => w.breakdown).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">حاسبة تكلفة النوافذ المتعددة</h2>
        <p className="text-lg text-gray-600">احسب التكلفة الدقيقة لتصنيع عدة نوافذ مع تحسين استخدام المواد</p>
      </div>

      {/* View Mode Selector */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow-lg p-1 flex">
          <button
            onClick={() => setViewMode('single')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'single'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="h-4 w-4 inline ml-2" />
            نافذة واحدة
          </button>
          <button
            onClick={() => setViewMode('multiple')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'multiple'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="h-4 w-4 inline ml-2" />
            نوافذ متعددة
          </button>
          <button
            onClick={() => setViewMode('combined')}
            disabled={calculatedWindows === 0}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              viewMode === 'combined'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="h-4 w-4 inline ml-2" />
            قائمة السلع
          </button>
        </div>
      </div>

      {/* Project Summary */}
      {windows.length > 1 && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">مشروع النوافذ</h3>
              <p className="text-green-100">
                {windows.length} نافذة - {calculatedWindows} محسوبة - ربح {profitMargin}%
              </p>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold">
                {totalCost.toFixed(2)} د.ت
              </div>
              <div className="text-green-100">التكلفة الإجمالية</div>
            </div>
          </div>
        </div>
      )}

      {/* Combined Materials View */}
      {viewMode === 'combined' ? (
        <CombinedMaterialsCalculator windows={windows} profitMargin={profitMargin} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Windows List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <List className="h-5 w-5 ml-2 text-blue-600" />
                  قائمة النوافذ
                </h3>
                <button
                  onClick={addWindow}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {windows.map((window) => (
                  <div
                    key={window.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      activeWindowId === window.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveWindowId(window.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={window.name}
                          onChange={(e) => updateWindowName(window.id, e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-sm font-medium focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <p className="text-xs text-gray-600">
                          {window.specs.length}×{window.specs.width} سم
                        </p>
                        {window.breakdown && (
                          <p className="text-xs font-semibold text-green-600">
                            {window.breakdown.totalCost.toFixed(2)} د.ت
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1 space-x-reverse">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateWindow(window.id);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        {windows.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeWindow(window.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profit Margin Control */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <DollarSign className="h-4 w-4 ml-2" />
                  نسبة الربح
                </h4>
                
                <div className="flex items-center space-x-3 space-x-reverse">
                  <label className="text-sm font-medium text-gray-700">
                    نسبة الربح:
                  </label>
                  <input
                    type="number"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
                
                <p className="text-xs text-green-700 mt-2">
                  💡 يتم تطبيق هذه النسبة على جميع المواد والملحقات
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={calculateAllWindows}
                  disabled={isCalculating}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                >
                  {isCalculating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 ml-2" />
                  )}
                  {isCalculating ? 'جاري الحساب...' : 'احسب السلع المجمعة'}
                </button>
                
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={handleExport}
                    disabled={calculatedWindows === 0}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                  >
                    <Download className="h-4 w-4 ml-1" />
                    تصدير
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center text-sm"
                  >
                    <RotateCcw className="h-4 w-4 ml-1" />
                    إعادة تعيين
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="lg:col-span-1">
            {activeWindow && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Calculator className="h-5 w-5 ml-2 text-blue-600" />
                  {activeWindow.name}
                </h3>

                <div className="space-y-6">
                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الطول (سم)
                      </label>
                      <input
                        type="number"
                        value={activeWindow.specs.length}
                        onChange={(e) => updateWindowSpecs({ length: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="50"
                        max="300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        العرض (سم)
                      </label>
                      <input
                        type="number"
                        value={activeWindow.specs.width}
                        onChange={(e) => updateWindowSpecs({ width: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="50"
                        max="300"
                      />
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Package className="h-4 w-4 ml-2" />
                      اللون الموحد
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اختر اللون
                      </label>
                      <select
                        value={activeWindow.specs.color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        {colorOptions.map(color => (
                          <option key={color.value} value={color.value}>
                            {color.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Frame Section */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">القفص (40100)</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع القفص
                      </label>
                      <select
                        value={activeWindow.specs.frameType}
                        onChange={(e) => updateWindowSpecs({ frameType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {getFrameOptions(activeWindow.specs.color).map(option => (
                          <option key={option.value} value={option.value}>
                            40100 {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sash Section */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">الفردة</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نوع الفردة الرئيسي
                        </label>
                        <select
                          value={activeWindow.specs.sashType}
                          onChange={(e) => handleSashTypeChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {getSashOptions(activeWindow.specs.color).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نوع الفردة التفصيلي
                        </label>
                        <select
                          value={activeWindow.specs.sashSubType}
                          onChange={(e) => updateWindowSpecs({ sashSubType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {getSashOptions(activeWindow.specs.color)
                            .find(opt => opt.value === activeWindow.specs.sashType)?.types
                            .map(type => (
                              <option key={type.value} value={type.value}>
                                {activeWindow.specs.sashType} {type.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Glass Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الزجاج
                    </label>
                    <select
                      value={activeWindow.specs.glassType}
                      onChange={(e) => updateWindowSpecs({ glassType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="simple">زجاج عادي 4مم</option>
                      <option value="double">زجاج مزدوج</option>
                      <option value="tempered">زجاج مقوى</option>
                    </select>
                  </div>

                  {/* Single Window Calculate Button */}
                  <button
                    onClick={calculateSingleWindow}
                    disabled={isCalculating}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isCalculating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                    ) : (
                      <Calculator className="h-5 w-5 ml-2" />
                    )}
                    {isCalculating ? 'جاري الحساب...' : 'احسب هذه النافذة'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {viewMode === 'multiple' && calculatedWindows > 0 ? (
              <div className="space-y-6">
                {/* Multiple Windows Results */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">نتائج جميع النوافذ</h3>
                  
                  <div className="space-y-4">
                    {windows.filter(w => w.breakdown).map((window) => (
                      <div key={window.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{window.name}</h4>
                          <span className="font-bold text-blue-600">
                            {window.breakdown!.totalCost.toFixed(2)} د.ت
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>الأبعاد: {window.specs.length}×{window.specs.width} سم</p>
                          <p>
                            المواصفات: قفص 40100 {window.specs.frameType} + فردتان {window.specs.sashType} - {colorOptions.find(c => c.value === window.specs.color)?.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-semibold text-gray-900">المجموع الكلي:</span>
                      <span className="font-bold text-2xl text-green-600">
                        {totalCost.toFixed(2)} د.ت
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeWindow?.breakdown && viewMode === 'single' ? (
              <div className="space-y-6">
                {/* Single Window Result */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {activeWindow.breakdown.totalCost.toFixed(2)} د.ت
                      </h3>
                      <p className="text-blue-100">{activeWindow.name}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-blue-100">
                        {activeWindow.specs.length}×{activeWindow.specs.width} سم
                      </p>
                      <p className="text-sm text-blue-100">
                        قفص 40100 + فردتان {activeWindow.specs.sashType}
                      </p>
                    </div>
                  </div>
                </div>

                <CostBreakdown breakdown={activeWindow.breakdown} specs={activeWindow.specs} />
                <CostBreakdown breakdown={activeWindow.breakdown} specs={activeWindow.specs} profitMargin={profitMargin} />
                <MaterialOptimization specs={activeWindow.specs} breakdown={activeWindow.breakdown} />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {windows.length > 1 ? 'احسب النوافذ' : 'أدخل مواصفات النافذة'}
                </h3>
                <p className="text-gray-600">
                  {windows.length > 1 
                    ? 'اضغط على "احسب السلع المجمعة" لحساب قائمة السلع الموحدة أو "احسب هذه النافذة" لحساب النافذة المحددة'
                    : 'قم بإدخال أبعاد النافذة والمواصفات المطلوبة ثم اضغط على "احسب التكلفة"'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WindowCalculator;
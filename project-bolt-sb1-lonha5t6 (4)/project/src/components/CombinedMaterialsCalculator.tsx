import React from 'react';
import { Package, Calculator, TrendingUp, Scissors, AlertCircle } from 'lucide-react';
import { type WindowSpecs, type CostBreakdown } from '../utils/calculations';
import CuttingOptimization from './CuttingOptimization';

interface WindowProject {
  id: string;
  name: string;
  specs: WindowSpecs;
  breakdown?: CostBreakdown;
}

interface CombinedMaterial {
  name: string;
  totalQuantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  category: string;
  usedInWindows: string[];
  specifications?: string;
}

interface Props {
  windows: WindowProject[];
  profitMargin?: number;
}

const CombinedMaterialsCalculator: React.FC<Props> = ({ windows, profitMargin = 30 }) => {
  const calculatedWindows = windows.filter(w => w.breakdown);
  const [showCuttingPlan, setShowCuttingPlan] = React.useState(false);
  
  if (calculatedWindows.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد نوافذ محسوبة</h3>
        <p className="text-gray-600">قم بحساب النوافذ أولاً لعرض قائمة السلع المجمعة</p>
      </div>
    );
  }

  // تجميع المواد من جميع النوافذ
  const combineMaterials = (): CombinedMaterial[] => {
    const materialMap = new Map<string, CombinedMaterial>();

    calculatedWindows.forEach(window => {
      if (!window.breakdown) return;

      const allItems = [
        ...window.breakdown.frame.map(item => ({ ...item, category: 'frame' })),
        ...window.breakdown.sashes.map(item => ({ ...item, category: 'sashes' })),
        ...window.breakdown.separator.map(item => ({ ...item, category: 'separator' })),
        ...window.breakdown.glass.map(item => ({ ...item, category: 'glass' })),
        ...window.breakdown.hardware.map(item => ({ ...item, category: 'hardware' }))
      ];

      allItems.forEach(item => {
        const key = item.name;
        
        if (materialMap.has(key)) {
          const existing = materialMap.get(key)!;
          // استخراج الكمية المستهلكة والكمية الفعلية للشراء
          const currentConsumedQuantity = parseFloat(item.quantity.split(' ')[0]) || 0;
          const existingConsumedQuantity = existing.totalQuantity;
          
          // تجميع الكمية المستهلكة
          existing.totalQuantity = existingConsumedQuantity + currentConsumedQuantity;
          
          // حساب البارات الفعلية المطلوبة للشراء بناءً على الكمية المجمعة
          if (existing.unit.includes('بارة')) {
            const totalBarsNeeded = Math.ceil(existing.totalQuantity);
            existing.totalCost = totalBarsNeeded * existing.unitPrice;
          } else {
            existing.totalCost += item.totalCost;
          }
          
          existing.usedInWindows.push(window.name);
        } else {
          const consumedQuantity = parseFloat(item.quantity.split(' ')[0]) || 0;
          const unit = item.quantity.split(' ').slice(1).join(' ') || 'قطعة';
          
          // حساب التكلفة الصحيحة للبارات
          let totalCost = item.totalCost;
          if (unit.includes('بارة')) {
            const barsNeeded = Math.ceil(consumedQuantity);
            totalCost = barsNeeded * item.unitPrice;
          }
          
          materialMap.set(key, {
            name: item.name,
            totalQuantity: consumedQuantity,
            unit: unit,
            unitPrice: item.unitPrice,
            totalCost: totalCost,
            category: item.category,
            usedInWindows: [window.name],
            specifications: item.specifications
          });
        }
      });
    });

    return Array.from(materialMap.values()).sort((a, b) => b.totalCost - a.totalCost);
  };

  const combinedMaterials = combineMaterials();
  const totalProjectCost = combinedMaterials.reduce((sum, material) => sum + material.totalCost, 0);

  // تجميع المواد حسب الفئة
  const materialsByCategory = {
    frame: combinedMaterials.filter(m => m.category === 'frame'),
    sashes: combinedMaterials.filter(m => m.category === 'sashes'),
    separator: combinedMaterials.filter(m => m.category === 'separator'),
    glass: combinedMaterials.filter(m => m.category === 'glass'),
    hardware: combinedMaterials.filter(m => m.category === 'hardware')
  };

  const categories = [
    { key: 'frame', title: 'القفص (Dormant)', icon: Package, color: 'blue' },
    { key: 'sashes', title: 'الفردتان (Ouvrants)', icon: Package, color: 'green' },
    { key: 'separator', title: 'الفاصل (40112)', icon: Package, color: 'indigo' },
    { key: 'glass', title: 'الزجاج', icon: Package, color: 'purple' },
    { key: 'hardware', title: 'الملحقات', icon: Package, color: 'orange' }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  // حساب تحسين المواد للمشروع كاملاً
  const calculateProjectOptimization = () => {
    const BAR_LENGTH = 650; // cm
    
    // تجميع أطوال البروفايل
    const frameProfiles = combinedMaterials.filter(m => 
      m.name.includes('40100') && m.unit.includes('بارة')
    );
    const sashProfiles = combinedMaterials.filter(m => 
      (m.name.includes('6007') || m.name.includes('40404')) && m.unit.includes('بارة')
    );
    const separatorProfiles = combinedMaterials.filter(m => 
      m.name.includes('40112') && m.unit.includes('بارة')
    );

    const totalFrameBars = frameProfiles.reduce((sum, p) => sum + p.totalQuantity, 0);
    const totalSashBars = sashProfiles.reduce((sum, p) => sum + p.totalQuantity, 0);
    const totalSeparatorBars = separatorProfiles.reduce((sum, p) => sum + p.totalQuantity, 0);

    const frameWaste = (totalFrameBars * BAR_LENGTH) - (totalFrameBars * BAR_LENGTH * 0.85); // تقدير 85% كفاءة
    const sashWaste = (totalSashBars * BAR_LENGTH) - (totalSashBars * BAR_LENGTH * 0.85);
    const separatorWaste = (totalSeparatorBars * BAR_LENGTH) - (totalSeparatorBars * BAR_LENGTH * 0.85);

    return {
      totalBars: totalFrameBars + totalSashBars + totalSeparatorBars,
      frameEfficiency: 85, // تقدير
      sashEfficiency: 85,
      separatorEfficiency: 85,
      totalWaste: frameWaste + sashWaste + separatorWaste
    };
  };

  const optimization = calculateProjectOptimization();

  return (
    <div className="space-y-8">
      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow-lg p-1 flex">
          <button
            onClick={() => setShowCuttingPlan(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !showCuttingPlan
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="h-4 w-4 inline ml-2" />
            قائمة السلع
          </button>
          <button
            onClick={() => setShowCuttingPlan(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showCuttingPlan
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Scissors className="h-4 w-4 inline ml-2" />
            خطة القص
          </button>
        </div>
      </div>

      {showCuttingPlan ? (
        <CuttingOptimization windows={windows} />
      ) : (
        <>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">قائمة السلع المجمعة</h2>
            <p className="text-purple-100">
              {calculatedWindows.length} نافذة - {combinedMaterials.length} صنف مختلف - ربح {profitMargin}%
            </p>
          </div>
          <div className="text-left">
            <div className="text-3xl font-bold">
              {totalProjectCost.toFixed(2)} د.ت
            </div>
            <div className="text-purple-100">التكلفة الإجمالية</div>
          </div>
        </div>
      </div>

      {/* Project Optimization Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 ml-2 text-green-600" />
          ملخص تحسين المشروع
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{optimization.totalBars}</div>
            <div className="text-sm text-gray-600">إجمالي البارات</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{optimization.frameEfficiency}%</div>
            <div className="text-sm text-gray-600">كفاءة متوسطة</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{optimization.totalWaste.toFixed(0)}</div>
            <div className="text-sm text-gray-600">الهدر المتوقع (سم)</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{combinedMaterials.length}</div>
            <div className="text-sm text-gray-600">أصناف مختلفة</div>
          </div>
        </div>
      </div>

      {/* Materials by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map(category => {
          const materials = materialsByCategory[category.key as keyof typeof materialsByCategory];
          const categoryTotal = materials.reduce((sum, m) => sum + m.totalCost, 0);
          const Icon = category.icon;

          if (materials.length === 0) return null;

          return (
            <div key={category.key} className="bg-white rounded-xl shadow-lg p-6">
              <div className={`p-4 rounded-lg border-2 mb-4 ${getColorClasses(category.color)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 ml-2" />
                    <h4 className="font-semibold">{category.title}</h4>
                  </div>
                  <span className="font-bold">{categoryTotal.toFixed(2)} د.ت</span>
                </div>
              </div>

              <div className="space-y-3">
                {materials.map((material, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{material.name}</h5>
                        <p className="text-sm text-gray-600">
                          {material.unit.includes('بارة') 
                            ? `${material.totalQuantity.toFixed(1)} ${material.unit} مستهلكة - ${Math.ceil(material.totalQuantity)} بارة للشراء × ${material.unitPrice.toFixed(2)} د.ت`
                            : `${material.totalQuantity} ${material.unit} × ${material.unitPrice.toFixed(2)} د.ت`
                          }
                        </p>
                        {material.specifications && (
                          <p className="text-xs text-gray-500 mt-1">{material.specifications}</p>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {material.totalCost.toFixed(2)} د.ت
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-xs text-blue-600">
                        مستخدم في: {material.usedInWindows.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Materials List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Calculator className="h-5 w-5 ml-2 text-blue-600" />
          قائمة السلع الكاملة مرتبة حسب التكلفة
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المادة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الكمية الإجمالية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  سعر الوحدة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التكلفة الإجمالية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوافذ المستخدمة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {combinedMaterials.map((material, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{material.name}</div>
                    {material.specifications && (
                      <div className="text-xs text-gray-500">{material.specifications}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {material.unit.includes('بارة') 
                        ? `${material.totalQuantity.toFixed(1)} مستهلكة (${Math.ceil(material.totalQuantity)} للشراء)`
                        : `${material.totalQuantity} ${material.unit}`
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {material.unitPrice.toFixed(2)} د.ت
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">
                      {material.totalCost.toFixed(2)} د.ت
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-blue-600">
                      {material.usedInWindows.join(', ')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t-2 border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              إجمالي {combinedMaterials.length} صنف مختلف لـ {calculatedWindows.length} نافذة
            </div>
            <div className="text-xl font-bold text-green-600">
              المجموع: {totalProjectCost.toFixed(2)} د.ت
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-yellow-600 ml-3 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">توصيات للتوفير</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• اطلب البروفايل بالكميات المحسوبة لتقليل الهدر</li>
              <li>• فكر في توحيد الألوان والأنواع لتقليل التنوع</li>
              <li>• احتفظ بالبواقي الكبيرة لاستخدامها في مشاريع أخرى</li>
              <li>• اطلب عروض أسعار للكميات الكبيرة</li>
            </ul>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default CombinedMaterialsCalculator;
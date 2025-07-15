import React from 'react';
import { Package, Wrench, Eye, DollarSign, Minus } from 'lucide-react';
import { type CostBreakdown as CostBreakdownType, type WindowSpecs } from '../utils/calculations';

interface Props {
  breakdown: CostBreakdownType;
  specs: WindowSpecs;
  profitMargin?: number;
}

const CostBreakdown: React.FC<Props> = ({ breakdown, specs, profitMargin = 30 }) => {
  const categories = [
    {
      title: 'القفص (Dormant)',
      icon: Package,
      items: breakdown.frame,
      color: 'blue'
    },
    {
      title: 'الفردتان (Ouvrants)',
      icon: Wrench,
      items: breakdown.sashes,
      color: 'green'
    },
    {
      title: 'الفاصل (40112)',
      icon: Minus,
      items: breakdown.separator,
      color: 'indigo'
    },
    {
      title: 'الزجاج',
      icon: Eye,
      items: breakdown.glass,
      color: 'purple'
    },
    {
      title: 'الملحقات',
      icon: DollarSign,
      items: breakdown.hardware,
      color: 'orange'
    }
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">تفصيل التكلفة</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          const totalCost = category.items.reduce((sum, item) => sum + item.totalCost, 0);
          
          return (
            <div key={category.title} className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${getColorClasses(category.color)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 ml-2" />
                    <h4 className="font-semibold">{category.title}</h4>
                  </div>
                  <span className="font-bold">{totalCost.toFixed(2)} د.ت</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {category.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × {item.unitPrice.toFixed(2)} د.ت
                        </p>
                        {item.specifications && (
                          <p className="text-xs text-gray-500 mt-1">{item.specifications}</p>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {item.totalCost.toFixed(2)} د.ت
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 pt-6 border-t-2 border-gray-200">
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">نسبة الربح المطبقة:</span>
            <span className="font-semibold text-green-800">{profitMargin}%</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-lg">
          <span className="font-semibold text-gray-900">المجموع الكلي:</span>
          <span className="font-bold text-2xl text-blue-600">
            {breakdown.totalCost.toFixed(2)} د.ت
          </span>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div className="text-center">
            <p className="font-semibold">المساحة</p>
            <p>{((specs.length * specs.width) / 10000).toFixed(2)} م²</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">التكلفة للمتر</p>
            <p>{(breakdown.totalCost / ((specs.length * specs.width) / 10000)).toFixed(2)} د.ت</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">عدد الفردات</p>
            <p>2</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">نوع النافذة</p>
            <p>{specs.frameColor} {specs.frameType}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;
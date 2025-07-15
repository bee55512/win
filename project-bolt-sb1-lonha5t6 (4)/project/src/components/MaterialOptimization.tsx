import React from 'react';
import { Scissors, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { type CostBreakdownType, type WindowSpecs } from '../utils/calculations';

interface Props {
  specs: WindowSpecs;
  breakdown: CostBreakdownType;
}

const MaterialOptimization: React.FC<Props> = ({ specs, breakdown }) => {
  // Calculate material usage and waste
  const calculateOptimization = () => {
    const barLength = 650; // cm
    
    // Frame calculations
    const framePerimeter = 2 * (specs.length + specs.width);
    const frameBarsNeeded = Math.ceil(framePerimeter / barLength);
    const frameWaste = (frameBarsNeeded * barLength) - framePerimeter;
    
    // Sash calculations
    const sashLength = specs.length - 4;
    const sashWidth = (specs.width - 4.7) / 2;
    const sashPerimeter = 2 * (sashLength + sashWidth);
    const totalSashLength = sashPerimeter * 2; // Two sashes
    const sashBarsNeeded = Math.ceil(totalSashLength / barLength);
    const sashWaste = (sashBarsNeeded * barLength) - totalSashLength;
    
    return {
      frame: {
        needed: framePerimeter,
        bars: frameBarsNeeded,
        waste: frameWaste,
        efficiency: ((framePerimeter / (frameBarsNeeded * barLength)) * 100)
      },
      sash: {
        needed: totalSashLength,
        bars: sashBarsNeeded,
        waste: sashWaste,
        efficiency: ((totalSashLength / (sashBarsNeeded * barLength)) * 100)
      }
    };
  };

  const optimization = calculateOptimization();

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBg = (efficiency: number) => {
    if (efficiency >= 90) return 'bg-green-100 border-green-300';
    if (efficiency >= 75) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Scissors className="h-5 w-5 ml-2 text-blue-600" />
        تحسين استخدام المواد
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frame Optimization */}
        <div className={`p-4 rounded-lg border-2 ${getEfficiencyBg(optimization.frame.efficiency)}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">مواد القفص (40100)</h4>
            <span className={`font-bold ${getEfficiencyColor(optimization.frame.efficiency)}`}>
              {optimization.frame.efficiency.toFixed(1)}%
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>الطول المطلوب:</span>
              <span className="font-medium">{optimization.frame.needed} سم</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>عدد البارات:</span>
              <span className="font-medium">{optimization.frame.bars}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>الهدر:</span>
              <span className="font-medium">{optimization.frame.waste} سم</span>
            </div>
          </div>

          {optimization.frame.waste > 200 && (
            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-700">
                💡 يمكن استخدام الهدر ({optimization.frame.waste} سم) لنافذة صغيرة
              </p>
            </div>
          )}
        </div>

        {/* Sash Optimization */}
        <div className={`p-4 rounded-lg border-2 ${getEfficiencyBg(optimization.sash.efficiency)}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">مواد الفردات (6007)</h4>
            <span className={`font-bold ${getEfficiencyColor(optimization.sash.efficiency)}`}>
              {optimization.sash.efficiency.toFixed(1)}%
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>الطول المطلوب:</span>
              <span className="font-medium">{optimization.sash.needed.toFixed(1)} سم</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>عدد البارات:</span>
              <span className="font-medium">{optimization.sash.bars}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>الهدر:</span>
              <span className="font-medium">{optimization.sash.waste.toFixed(1)} سم</span>
            </div>
          </div>

          {optimization.sash.waste > 300 && (
            <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
              <p className="text-xs text-green-700">
                💡 يمكن استخدام الهدر لفردة إضافية
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Optimization Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 ml-2" />
          نصائح للتحسين
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">للتوفير:</span> صنع عدة نوافذ معاً لتقليل الهدر
            </p>
            <p className="text-gray-700">
              <span className="font-medium">الكفاءة المثلى:</span> عند الوصول لـ 90% أو أكثر
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">إعادة الاستخدام:</span> حفظ البواقي للإصلاحات
            </p>
            <p className="text-gray-700">
              <span className="font-medium">التخطيط:</span> حساب عدة نوافذ قبل القص
            </p>
          </div>
        </div>
      </div>

      {/* Waste Alert */}
      {(optimization.frame.efficiency < 75 || optimization.sash.efficiency < 75) && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 ml-2" />
            <p className="text-orange-800 font-medium">
              تنبيه: كفاءة استخدام المواد منخفضة. فكر في تعديل الأبعاد أو صنع نوافذ إضافية.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialOptimization;
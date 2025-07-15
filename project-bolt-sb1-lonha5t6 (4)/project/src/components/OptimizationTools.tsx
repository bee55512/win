import React, { useState } from 'react';
import { Scissors, Calculator, TrendingUp, Package } from 'lucide-react';

interface WindowSpec {
  id: string;
  length: number;
  width: number;
  quantity: number;
}

const OptimizationTools: React.FC = () => {
  const [windows, setWindows] = useState<WindowSpec[]>([
    { id: '1', length: 100, width: 100, quantity: 1 },
    { id: '2', length: 120, width: 110, quantity: 1 }
  ]);

  const [optimization, setOptimization] = useState<any>(null);

  const addWindow = () => {
    const newId = Date.now().toString();
    setWindows([...windows, { id: newId, length: 100, width: 100, quantity: 1 }]);
  };

  const removeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const updateWindow = (id: string, field: keyof WindowSpec, value: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const calculateOptimization = () => {
    const barLength = 650; // cm
    let totalFrameLength = 0;
    let totalSashLength = 0;

    windows.forEach(window => {
      const framePerimeter = 2 * (window.length + window.width);
      const sashLength = window.length - 4;
      const sashWidth = (window.width - 4.7) / 2;
      const sashPerimeter = 2 * (sashLength + sashWidth) * 2; // Two sashes

      totalFrameLength += framePerimeter * window.quantity;
      totalSashLength += sashPerimeter * window.quantity;
    });

    const frameBarsNeeded = Math.ceil(totalFrameLength / barLength);
    const sashBarsNeeded = Math.ceil(totalSashLength / barLength);
    
    const frameWaste = (frameBarsNeeded * barLength) - totalFrameLength;
    const sashWaste = (sashBarsNeeded * barLength) - totalSashLength;

    const result = {
      frame: {
        totalLength: totalFrameLength,
        barsNeeded: frameBarsNeeded,
        waste: frameWaste,
        efficiency: (totalFrameLength / (frameBarsNeeded * barLength)) * 100
      },
      sash: {
        totalLength: totalSashLength,
        barsNeeded: sashBarsNeeded,
        waste: sashWaste,
        efficiency: (totalSashLength / (sashBarsNeeded * barLength)) * 100
      }
    };

    setOptimization(result);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">أدوات تحسين القص</h2>
        <p className="text-lg text-gray-600">احسب الكمية المثلى للمواد وقلل الهدر عند تصنيع عدة نوافذ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 ml-2 text-blue-600" />
                قائمة النوافذ
              </h3>
              <button
                onClick={addWindow}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                إضافة نافذة
              </button>
            </div>

            <div className="space-y-4">
              {windows.map((window, index) => (
                <div key={window.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">نافذة {index + 1}</span>
                    {windows.length > 1 && (
                      <button
                        onClick={() => removeWindow(window.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">الطول (سم)</label>
                      <input
                        type="number"
                        value={window.length}
                        onChange={(e) => updateWindow(window.id, 'length', Number(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">العرض (سم)</label>
                      <input
                        type="number"
                        value={window.width}
                        onChange={(e) => updateWindow(window.id, 'width', Number(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">الكمية</label>
                      <input
                        type="number"
                        value={window.quantity}
                        onChange={(e) => updateWindow(window.id, 'quantity', Number(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={calculateOptimization}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <Calculator className="h-5 w-5 ml-2" />
              احسب التحسين
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {optimization ? (
            <>
              {/* Frame Results */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Scissors className="h-5 w-5 ml-2 text-blue-600" />
                  نتائج القوافص (40100)
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {optimization.frame.barsNeeded}
                    </div>
                    <div className="text-sm text-gray-600">عدد البارات</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {optimization.frame.efficiency.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">الكفاءة</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>الطول المطلوب:</span>
                    <span className="font-medium">{optimization.frame.totalLength} سم</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الطول المتوفر:</span>
                    <span className="font-medium">{optimization.frame.barsNeeded * 650} سم</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الهدر:</span>
                    <span className="font-medium text-red-600">{optimization.frame.waste} سم</span>
                  </div>
                </div>
              </div>

              {/* Sash Results */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Scissors className="h-5 w-5 ml-2 text-green-600" />
                  نتائج الفردات (6007)
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {optimization.sash.barsNeeded}
                    </div>
                    <div className="text-sm text-gray-600">عدد البارات</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {optimization.sash.efficiency.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">الكفاءة</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>الطول المطلوب:</span>
                    <span className="font-medium">{optimization.sash.totalLength.toFixed(1)} سم</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الطول المتوفر:</span>
                    <span className="font-medium">{optimization.sash.barsNeeded * 650} سم</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الهدر:</span>
                    <span className="font-medium text-red-600">{optimization.sash.waste.toFixed(1)} سم</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 ml-2" />
                  ملخص التحسين
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {optimization.frame.barsNeeded + optimization.sash.barsNeeded}
                    </div>
                    <div className="text-blue-100">إجمالي البارات</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {((optimization.frame.efficiency + optimization.sash.efficiency) / 2).toFixed(1)}%
                    </div>
                    <div className="text-blue-100">متوسط الكفاءة</div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white bg-opacity-20 rounded">
                  <p className="text-sm">
                    💡 {optimization.frame.waste > 500 || optimization.sash.waste > 500 
                      ? 'يمكن استخدام الهدر الكبير لصنع نوافذ إضافية صغيرة'
                      : 'كفاءة جيدة في استخدام المواد'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Scissors className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">احسب التحسين</h3>
              <p className="text-gray-600">
                أدخل قائمة النوافذ المطلوبة واضغط "احسب التحسين" لمعرفة الكمية المثلى للمواد
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizationTools;
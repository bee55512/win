import React from 'react';
import { Scissors, Ruler, AlertTriangle, CheckCircle, Package } from 'lucide-react';

interface WindowProject {
  id: string;
  name: string;
  specs: {
    length: number;
    width: number;
    color: string;
    frameType: string;
    sashType: string;
    sashSubType: string;
    glassType: string;
  };
  breakdown?: any;
}

interface CuttingPlan {
  barNumber: number;
  cuts: {
    windowName: string;
    piece: string;
    length: number;
    position: string;
  }[];
  totalUsed: number;
  waste: number;
  efficiency: number;
}

interface Props {
  windows: WindowProject[];
}

const CuttingOptimization: React.FC<Props> = ({ windows }) => {
  const BAR_LENGTH = 650; // cm
  const SAW_THICKNESS = 0.5; // cm

  const calculatedWindows = windows.filter(w => w.breakdown);
  
  if (calculatedWindows.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Scissors className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد نوافذ محسوبة</h3>
        <p className="text-gray-600">قم بحساب النوافذ أولاً لعرض خطة القص</p>
      </div>
    );
  }

  // جمع جميع القطع المطلوبة للقفص
  const collectFramePieces = () => {
    const pieces: { windowName: string; piece: string; length: number }[] = [];
    
    calculatedWindows.forEach(window => {
      const { length, width } = window.specs;
      
      // قطع القفص الأربعة
      pieces.push(
        { windowName: window.name, piece: 'قفص علوي', length },
        { windowName: window.name, piece: 'قفص سفلي', length },
        { windowName: window.name, piece: 'قفص يمين', length: width },
        { windowName: window.name, piece: 'قفص يسار', length: width }
      );
    });
    
    return pieces.sort((a, b) => b.length - a.length); // ترتيب تنازلي حسب الطول
  };

  // جمع جميع القطع المطلوبة للفردات
  const collectSashPieces = () => {
    const pieces: { windowName: string; piece: string; length: number }[] = [];
    
    calculatedWindows.forEach(window => {
      const { length, width } = window.specs;
      const sashLength = length - 4;
      const sashWidth = (width - 4.7) / 2;
      
      // قطع الفردة الأولى
      pieces.push(
        { windowName: window.name, piece: 'فردة 1 علوي', length: sashLength },
        { windowName: window.name, piece: 'فردة 1 سفلي', length: sashLength },
        { windowName: window.name, piece: 'فردة 1 يمين', length: sashWidth },
        { windowName: window.name, piece: 'فردة 1 يسار', length: sashWidth }
      );
      
      // قطع الفردة الثانية
      pieces.push(
        { windowName: window.name, piece: 'فردة 2 علوي', length: sashLength },
        { windowName: window.name, piece: 'فردة 2 سفلي', length: sashLength },
        { windowName: window.name, piece: 'فردة 2 يمين', length: sashWidth },
        { windowName: window.name, piece: 'فردة 2 يسار', length: sashWidth }
      );
    });
    
    return pieces.sort((a, b) => b.length - a.length);
  };

  // خوارزمية القص الذكي
  const optimizeCutting = (pieces: { windowName: string; piece: string; length: number }[]) => {
    const cuttingPlans: CuttingPlan[] = [];
    const remainingPieces = [...pieces];
    let barNumber = 1;

    while (remainingPieces.length > 0) {
      const currentBar: CuttingPlan = {
        barNumber,
        cuts: [],
        totalUsed: 0,
        waste: 0,
        efficiency: 0
      };

      let availableLength = BAR_LENGTH;
      let position = 0;

      // محاولة ملء البارة بأكبر عدد من القطع
      for (let i = 0; i < remainingPieces.length; i++) {
        const piece = remainingPieces[i];
        const requiredLength = piece.length + (currentBar.cuts.length > 0 ? SAW_THICKNESS : 0);

        if (requiredLength <= availableLength) {
          // إضافة القطعة
          if (currentBar.cuts.length > 0) {
            position += SAW_THICKNESS; // إضافة سمك المنشار
          }
          
          currentBar.cuts.push({
            windowName: piece.windowName,
            piece: piece.piece,
            length: piece.length,
            position: `${position} - ${position + piece.length} سم`
          });

          position += piece.length;
          availableLength -= requiredLength;
          currentBar.totalUsed += requiredLength;
          
          // إزالة القطعة من القائمة
          remainingPieces.splice(i, 1);
          i--; // تعديل المؤشر بعد الحذف
        }
      }

      currentBar.waste = BAR_LENGTH - currentBar.totalUsed;
      currentBar.efficiency = (currentBar.totalUsed / BAR_LENGTH) * 100;
      
      cuttingPlans.push(currentBar);
      barNumber++;
    }

    return cuttingPlans;
  };

  const framePieces = collectFramePieces();
  const sashPieces = collectSashPieces();
  
  const frameCuttingPlan = optimizeCutting(framePieces);
  const sashCuttingPlan = optimizeCutting(sashPieces);

  const totalFrameWaste = frameCuttingPlan.reduce((sum, plan) => sum + plan.waste, 0);
  const totalSashWaste = sashCuttingPlan.reduce((sum, plan) => sum + plan.waste, 0);
  const averageFrameEfficiency = frameCuttingPlan.reduce((sum, plan) => sum + plan.efficiency, 0) / frameCuttingPlan.length;
  const averageSashEfficiency = sashCuttingPlan.reduce((sum, plan) => sum + plan.efficiency, 0) / sashCuttingPlan.length;

  const renderCuttingPlan = (plans: CuttingPlan[], title: string, color: string) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className={`text-xl font-semibold mb-6 flex items-center text-${color}-600`}>
        <Scissors className="h-5 w-5 ml-2" />
        {title}
      </h3>

      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.barNumber} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">
                بارة رقم {plan.barNumber}
              </h4>
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className={`text-sm font-medium ${
                  plan.efficiency >= 90 ? 'text-green-600' : 
                  plan.efficiency >= 75 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  كفاءة {plan.efficiency.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-600">
                  هدر: {plan.waste.toFixed(1)} سم
                </span>
              </div>
            </div>

            {/* مخطط البارة البصري */}
            <div className="mb-3">
              <div className="relative h-8 bg-gray-100 rounded border">
                {plan.cuts.map((cut, index) => {
                  const startPos = parseFloat(cut.position.split(' - ')[0]);
                  const endPos = parseFloat(cut.position.split(' - ')[1]);
                  const width = ((endPos - startPos) / BAR_LENGTH) * 100;
                  const left = (startPos / BAR_LENGTH) * 100;
                  
                  return (
                    <div
                      key={index}
                      className={`absolute h-full rounded text-xs text-white flex items-center justify-center font-medium ${
                        index % 2 === 0 ? `bg-${color}-500` : `bg-${color}-400`
                      }`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${cut.piece} - ${cut.length} سم`}
                    >
                      {cut.length}
                    </div>
                  );
                })}
                
                {/* منطقة الهدر */}
                {plan.waste > 0 && (
                  <div
                    className="absolute h-full bg-red-200 rounded-l flex items-center justify-center text-xs text-red-700 font-medium"
                    style={{ 
                      right: '0%', 
                      width: `${(plan.waste / BAR_LENGTH) * 100}%` 
                    }}
                  >
                    هدر
                  </div>
                )}
              </div>
              
              {/* مقياس البارة */}
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>325</span>
                <span>650 سم</span>
              </div>
            </div>

            {/* تفاصيل القطع */}
            <div className="space-y-2">
              {plan.cuts.map((cut, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{cut.piece}</span>
                    <span className="text-gray-600 mr-2">({cut.windowName})</span>
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <span className="text-gray-600">{cut.length} سم</span>
                    <span className="text-xs text-gray-500">{cut.position}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">خطة القص الذكية</h2>
            <p className="text-indigo-100">
              قص مُحسَّن لـ {calculatedWindows.length} نافذة مع احتساب سمك المنشار (0.5 سم)
            </p>
          </div>
          <div className="text-left">
            <div className="text-3xl font-bold">
              {frameCuttingPlan.length + sashCuttingPlan.length}
            </div>
            <div className="text-indigo-100">إجمالي البارات</div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{frameCuttingPlan.length}</div>
          <div className="text-sm text-gray-600">بارات القفص</div>
          <div className="text-xs text-gray-500 mt-1">
            كفاءة {averageFrameEfficiency.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{sashCuttingPlan.length}</div>
          <div className="text-sm text-gray-600">بارات الفردات</div>
          <div className="text-xs text-gray-500 mt-1">
            كفاءة {averageSashEfficiency.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {(totalFrameWaste + totalSashWaste).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">إجمالي الهدر (سم)</div>
          <div className="text-xs text-gray-500 mt-1">
            {((totalFrameWaste + totalSashWaste) / ((frameCuttingPlan.length + sashCuttingPlan.length) * BAR_LENGTH) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {framePieces.length + sashPieces.length}
          </div>
          <div className="text-sm text-gray-600">إجمالي القطع</div>
          <div className="text-xs text-gray-500 mt-1">
            {framePieces.length} قفص + {sashPieces.length} فردة
          </div>
        </div>
      </div>

      {/* Cutting Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderCuttingPlan(frameCuttingPlan, 'خطة قص القفص (40100)', 'blue')}
        {renderCuttingPlan(sashCuttingPlan, 'خطة قص الفردات', 'green')}
      </div>

      {/* Tips and Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-yellow-600 ml-3 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">نصائح للقص الأمثل</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• تأكد من ضبط المنشار على 0.5 سم لكل قصة</li>
              <li>• ابدأ بالقطع الطويلة أولاً لتقليل الهدر</li>
              <li>• احتفظ بالبواقي الكبيرة (أكثر من 30 سم) للاستخدام المستقبلي</li>
              <li>• تحقق من القياسات مرتين قبل القص</li>
              <li>• استخدم علامات واضحة لتمييز كل قطعة</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Efficiency Alert */}
      {(averageFrameEfficiency < 80 || averageSashEfficiency < 80) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 ml-2" />
            <p className="text-red-800 font-medium">
              تنبيه: كفاءة القص منخفضة. فكر في إعادة ترتيب النوافذ أو إضافة نوافذ أخرى لتحسين الاستفادة من المواد.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuttingOptimization;
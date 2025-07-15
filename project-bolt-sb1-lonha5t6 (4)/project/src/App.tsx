import React, { useState } from 'react';
import { Calculator, Package, Wrench, DollarSign, FileText, Settings } from 'lucide-react';
import WindowCalculator from './components/WindowCalculator';
import MaterialsDatabase from './components/MaterialsDatabase';
import OptimizationTools from './components/OptimizationTools';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');

  const tabs = [
    { id: 'calculator', label: 'حاسبة النوافذ', icon: Calculator },
    { id: 'materials', label: 'قاعدة المواد', icon: Package },
    { id: 'optimization', label: 'تحسين القص', icon: Wrench },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'calculator':
        return <WindowCalculator />;
      case 'materials':
        return <MaterialsDatabase />;
      case 'optimization':
        return <OptimizationTools />;
      default:
        return <WindowCalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">نظام حساب تكلفة النوافذ</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">دقة في الحسابات</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 space-x-reverse">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 ml-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">نظام حساب النوافذ</h3>
              <p className="text-gray-300">نظام متقدم لحساب تكلفة تصنيع النوافذ مع تحسين استخدام المواد</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">المميزات</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• حساب دقيق للتكاليف</li>
                <li>• تحسين قص المواد</li>
                <li>• قاعدة بيانات شاملة</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">الدعم</h3>
              <p className="text-gray-300">تم تطوير النظام لتلبية احتياجات صناعة النوافذ المتخصصة</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
import { materialsData } from '../data/materials';

export interface WindowSpecs {
  length: number;
  width: number;
  color: string;
  frameType: string;
  sashType: string;
  sashSubType: string;
  glassType: string;
}

export interface CostItem {
  name: string;
  quantity: string;
  unitPrice: number;
  totalCost: number;
  specifications?: string;
}

export interface CostBreakdown {
  frame: CostItem[];
  sashes: CostItem[];
  glass: CostItem[];
  hardware: CostItem[];
  separator: CostItem[];
  totalCost: number;
}

const BAR_LENGTH = 650; // cm
const GLASS_PRICE_PER_M2 = 31.25; // TND per m²
const DEFAULT_PROFIT_MARGIN = 0.30; // 30% profit margin

const findMaterial = (ref: string, fallbackPrice?: number): number => {
  const material = materialsData.find(m => m.ref === ref);
  return material ? material.prixUMoyen : (fallbackPrice || 0);
};

const getFrameMaterialRef = (frameType: string, color: string): string => {
  const frameOptions = {
    'blanc_eurosist': '3',
    'blanc_inoforme': '7',
    'blanc_eco_loranzo': '216',
    'fbois_eurosist': '3',
    'fbois_pral': '9',
    'fbois_inter': '97',
    'gris_losanzo': '208'
  };
  
  const key = `${color}_${frameType}`;
  return frameOptions[key as keyof typeof frameOptions] || '3';
};

const getSashMaterialRef = (sashType: string, sashSubType: string, color: string): string => {
  const sashOptions = {
    '6007_inoforme_blanc': '12',
    '6007_inoforme_blanc_alt': '112',
    '6007_gris_gris': '313',
    '40404_eurosist_blanc': '94',
    '40404_inter_blanc': '4',
    '40404_pral_fbois': '11',
    '40404_technoline_fbois': '156',
    '40404_eurosist_fbois': '400'
  };
  
  const key = `${sashType}_${sashSubType}_${color}`;
  return sashOptions[key as keyof typeof sashOptions] || '12';
};

const calculateExactBarUsage = (totalLength: number, barLength: number = BAR_LENGTH) => {
  const exactBarsNeeded = totalLength / barLength;
  const actualBarsNeeded = Math.ceil(exactBarsNeeded);
  const efficiency = 100;
  const waste = 0;
  
  return { barsNeeded: exactBarsNeeded, actualBarsNeeded, efficiency, waste };
};

const get40112MaterialRef = (color: string): string => {
  const options40112 = {
    'blanc': '289',
    'fbois': '96',
    'gris': '289',
    'economique': '1250'
  };
  
  return options40112[color as keyof typeof options40112] || '289';
};

const applyProfitMargin = (cost: number, profitMargin: number = DEFAULT_PROFIT_MARGIN): number => {
  return cost * (1 + profitMargin);
};

const getHardwareColor = (windowColor: string): 'blanc' | 'noir' => {
  return (windowColor === 'fbois' || windowColor === 'gris') ? 'noir' : 'blanc';
};

const getHardwareRefs = (color: 'blanc' | 'noir') => {
  if (color === 'noir') {
    return {
      paumelle: '36',
      cremone: '63',
      poigne: '55'
    };
  } else {
    return {
      paumelle: '35',
      cremone: '62',
      poigne: '54'
    };
  }
};

export const calculateWindowCost = (specs: WindowSpecs, profitMargin: number = DEFAULT_PROFIT_MARGIN): CostBreakdown => {
  const { length, width, color, frameType, sashType, sashSubType } = specs;

  const hardwareColor = getHardwareColor(color);
  const hardwareRefs = getHardwareRefs(hardwareColor);

  const framePerimeter = 2 * (length + width);
  const frameOptimization = calculateExactBarUsage(framePerimeter);
  const frameMaterialRef = getFrameMaterialRef(frameType, color);
  const frameUnitPrice = findMaterial(frameMaterialRef, 74);

  const sashLength = length - 4;
  const sashWidth = (width - 4.7) / 2;
  const sashPerimeter = 2 * (sashLength + sashWidth);
  const totalSashLength = sashPerimeter * 2;
  const sashOptimization = calculateExactBarUsage(totalSashLength);
  const sashMaterialRef = getSashMaterialRef(sashType, sashSubType, color);
  const sashUnitPrice = findMaterial(sashMaterialRef, 57.67);

  const glassLengthPerSash = sashLength - 1;
  const glassWidthPerSash = sashWidth - 1;
  const glassAreaPerSash = (glassLengthPerSash * glassWidthPerSash) / 10000;
  const totalGlassArea = glassAreaPerSash * 2;

  const separatorLength = sashLength;
  const separatorOptimization = calculateExactBarUsage(separatorLength);
  const separator40112Ref = get40112MaterialRef(color);
  const separator40112Price = findMaterial(separator40112Ref, 49.3);

  const equerrePrice = findMaterial('43', 1.2);
  const equerrePMPrice = findMaterial('239', 4.5) / 100;
  const equerreGMPrice = findMaterial('91', 5.5) / 100;
  const paumellePrice = findMaterial(hardwareRefs.paumelle, 3.33);
  const jointBattementPrice = findMaterial('90', 16) / 50;
  const jointPlatPrice = findMaterial('89', 22.63) / 50;
  const cremonePrice = findMaterial(hardwareRefs.cremone, 9.63);
  const kitCremonePrice = findMaterial('31', 2.7);
  const kitVerrouxPrice = findMaterial('32', 2.76);
  const tringPrice = findMaterial('61', 1.7);

  const jointBattementLength = (framePerimeter + totalSashLength) / 100;
  const jointPlatLength = (totalSashLength * 2) / 100;

  const colorName = color === 'blanc' ? 'أبيض' : color === 'fbois' ? 'خشبي' : 'رمادي';
  const hardwareColorName = hardwareColor === 'blanc' ? 'أبيض' : 'أسود';

  const breakdown: CostBreakdown = {
    frame: [
      {
        name: `40100 ${colorName} ${frameType}`,
        quantity: `${frameOptimization.barsNeeded.toFixed(1)} بارة (${framePerimeter} سم)`,
        unitPrice: frameUnitPrice,
        totalCost: applyProfitMargin(frameOptimization.actualBarsNeeded * frameUnitPrice, profitMargin),
        specifications: `الاستهلاك: ${framePerimeter} سم - السعر: ${frameOptimization.actualBarsNeeded} بارة × ${frameUnitPrice} د.ت`
      },
      {
        name: 'زوايا القفص (équerre en tole)',
        quantity: '4 قطع',
        unitPrice: equerrePrice,
        totalCost: applyProfitMargin(4 * equerrePrice, profitMargin)
      },
      {
        name: 'زوايا المحاذاة PM',
        quantity: '4 قطع',
        unitPrice: equerrePMPrice,
        totalCost: applyProfitMargin(4 * equerrePMPrice, profitMargin)
      }
    ],
    sashes: [
      {
        name: `${sashType} ${sashSubType} ${colorName} (فردتان)`,
        quantity: `${sashOptimization.barsNeeded.toFixed(1)} بارة (${totalSashLength.toFixed(1)} سم)`,
        unitPrice: sashUnitPrice,
        totalCost: applyProfitMargin(sashOptimization.actualBarsNeeded * sashUnitPrice, profitMargin),
        specifications: `الاستهلاك: ${totalSashLength.toFixed(1)} سم - السعر: ${sashOptimization.actualBarsNeeded} بارة × ${sashUnitPrice} د.ت`
      },
      {
        name: 'زوايا الفردات (équerre en tole)',
        quantity: '8 قطع',
        unitPrice: equerrePrice,
        totalCost: applyProfitMargin(8 * equerrePrice, profitMargin)
      },
      {
        name: 'زوايا المحاذاة GM',
        quantity: '8 قطع',
        unitPrice: equerreGMPrice,
        totalCost: applyProfitMargin(8 * equerreGMPrice, profitMargin)
      }
    ],
    separator: [
      {
        name: `40112 فاصل بين الفردتين ${colorName}`,
        quantity: `${separatorOptimization.barsNeeded.toFixed(1)} بارة (${separatorLength} سم)`,
        unitPrice: separator40112Price,
        totalCost: applyProfitMargin(separatorOptimization.actualBarsNeeded * separator40112Price, profitMargin),
        specifications: `الاستهلاك: ${separatorLength} سم - السعر: ${separatorOptimization.actualBarsNeeded} بارة × ${separator40112Price} د.ت`
      }
    ],
    glass: [
      {
        name: 'زجاج 4مم',
        quantity: `${totalGlassArea.toFixed(2)} م²`,
        unitPrice: GLASS_PRICE_PER_M2,
        totalCost: applyProfitMargin(totalGlassArea * GLASS_PRICE_PER_M2, profitMargin),
        specifications: `فردتان ${glassLengthPerSash.toFixed(1)}×${glassWidthPerSash.toFixed(1)} سم`
      },
      {
        name: 'مشط تثبيت الزجاج (joint plat)',
        quantity: `${jointPlatLength.toFixed(1)} م`,
        unitPrice: jointPlatPrice,
        totalCost: applyProfitMargin(jointPlatLength * jointPlatPrice, profitMargin),
        specifications: 'للجهتين'
      }
    ],
    hardware: [
      {
        name: `مفصلات (paumelle king ${hardwareColorName})`,
        quantity: '4 قطع',
        unitPrice: paumellePrice,
        totalCost: applyProfitMargin(4 * paumellePrice, profitMargin),
        specifications: `لون ${hardwareColorName} للنوافذ ${colorName === 'أبيض' ? 'البيضاء' : colorName === 'خشبي' ? 'الخشبية' : 'الرمادية'}`
      },
      {
        name: 'مشط الحواف (joint battement)',
        quantity: `${jointBattementLength.toFixed(1)} م`,
        unitPrice: jointBattementPrice,
        totalCost: applyProfitMargin(jointBattementLength * jointBattementPrice, profitMargin)
      },
      {
        name: `كريمون (cremone KNG ${hardwareColorName})`,
        quantity: '1',
        unitPrice: cremonePrice,
        totalCost: applyProfitMargin(cremonePrice, profitMargin),
        specifications: `لون ${hardwareColorName} للنوافذ ${colorName === 'أبيض' ? 'البيضاء' : colorName === 'خشبي' ? 'الخشبية' : 'الرمادية'}`
      },
      {
        name: 'كيت كريمون',
        quantity: '1',
        unitPrice: kitCremonePrice,
        totalCost: applyProfitMargin(kitCremonePrice, profitMargin)
      },
      {
        name: 'كيت القفل',
        quantity: '1',
        unitPrice: kitVerrouxPrice,
        totalCost: applyProfitMargin(kitVerrouxPrice, profitMargin)
      },
      {
        name: 'قضيب (tringle)',
        quantity: `${(length / 100).toFixed(2)} م`,
        unitPrice: tringPrice,
        totalCost: applyProfitMargin((length / 100) * tringPrice, profitMargin)
      }
    ],
    totalCost: 0
  };

  const allItems = [
    ...breakdown.frame, 
    ...breakdown.sashes, 
    ...breakdown.separator,
    ...breakdown.glass, 
    ...breakdown.hardware
  ];
  breakdown.totalCost = allItems.reduce((sum, item) => sum + item.totalCost, 0);

  return breakdown;
};
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  TextInput,
  Button,
  Chip,
  Surface,
  Text,
  Divider,
  List,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculateWindowCost, type WindowSpecs, type CostBreakdown } from '../utils/calculations';

interface WindowProject {
  id: string;
  name: string;
  specs: WindowSpecs;
  breakdown?: CostBreakdown;
}

const WindowCalculatorScreen: React.FC = () => {
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
  const [isCalculating, setIsCalculating] = useState(false);
  const [profitMargin, setProfitMargin] = useState(30);

  const colorOptions = [
    { value: 'blanc', label: 'أبيض' },
    { value: 'fbois', label: 'خشبي' },
    { value: 'gris', label: 'رمادي' }
  ];

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

  const calculateSingleWindow = async () => {
    if (!activeWindow) return;
    
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const breakdown = calculateWindowCost(activeWindow.specs, profitMargin / 100);
      setWindows(windows.map(w => 
        w.id === activeWindowId 
          ? { ...w, breakdown }
          : w
      ));
      Alert.alert('تم الحساب', `تكلفة ${activeWindow.name}: ${breakdown.totalCost.toFixed(2)} د.ت`);
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحساب');
    }
    
    setIsCalculating(false);
  };

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Project Summary */}
        {windows.length > 1 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title style={styles.summaryTitle}>مشروع النوافذ</Title>
              <Paragraph>
                {windows.length} نافذة - {calculatedWindows} محسوبة - ربح {profitMargin}%
              </Paragraph>
              <Text style={styles.totalCost}>
                {totalCost.toFixed(2)} د.ت
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Windows List */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title>قائمة النوافذ</Title>
              <Button mode="contained" onPress={addWindow} compact>
                إضافة
              </Button>
            </View>
            
            {windows.map((window) => (
              <Surface
                key={window.id}
                style={[
                  styles.windowItem,
                  activeWindowId === window.id && styles.activeWindowItem
                ]}
              >
                <View style={styles.windowItemContent}>
                  <View style={styles.windowInfo}>
                    <TextInput
                      value={window.name}
                      onChangeText={(text) => updateWindowName(window.id, text)}
                      style={styles.windowNameInput}
                      dense
                    />
                    <Text style={styles.windowDimensions}>
                      {window.specs.length}×{window.specs.width} سم
                    </Text>
                    {window.breakdown && (
                      <Text style={styles.windowCost}>
                        {window.breakdown.totalCost.toFixed(2)} د.ت
                      </Text>
                    )}
                  </View>
                  <View style={styles.windowActions}>
                    <Button
                      mode={activeWindowId === window.id ? "contained" : "outlined"}
                      onPress={() => setActiveWindowId(window.id)}
                      compact
                    >
                      تحديد
                    </Button>
                    {windows.length > 1 && (
                      <Button
                        mode="text"
                        onPress={() => removeWindow(window.id)}
                        compact
                        textColor="#ef4444"
                      >
                        حذف
                      </Button>
                    )}
                  </View>
                </View>
              </Surface>
            ))}
          </Card.Content>
        </Card>

        {/* Input Form */}
        {activeWindow && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{activeWindow.name}</Title>
              
              {/* Dimensions */}
              <View style={styles.dimensionsRow}>
                <TextInput
                  label="الطول (سم)"
                  value={activeWindow.specs.length.toString()}
                  onChangeText={(text) => updateWindowSpecs({ length: Number(text) || 0 })}
                  keyboardType="numeric"
                  style={styles.dimensionInput}
                />
                <TextInput
                  label="العرض (سم)"
                  value={activeWindow.specs.width.toString()}
                  onChangeText={(text) => updateWindowSpecs({ width: Number(text) || 0 })}
                  keyboardType="numeric"
                  style={styles.dimensionInput}
                />
              </View>

              {/* Color Selection */}
              <Surface style={styles.colorSection}>
                <Text style={styles.sectionTitle}>اللون الموحد</Text>
                <View style={styles.chipContainer}>
                  {colorOptions.map(color => (
                    <Chip
                      key={color.value}
                      selected={activeWindow.specs.color === color.value}
                      onPress={() => handleColorChange(color.value)}
                      style={styles.chip}
                    >
                      {color.label}
                    </Chip>
                  ))}
                </View>
              </Surface>

              {/* Frame Section */}
              <Divider style={styles.divider} />
              <Text style={styles.sectionTitle}>القفص (40100)</Text>
              <View style={styles.chipContainer}>
                {getFrameOptions(activeWindow.specs.color).map(option => (
                  <Chip
                    key={option.value}
                    selected={activeWindow.specs.frameType === option.value}
                    onPress={() => updateWindowSpecs({ frameType: option.value })}
                    style={styles.chip}
                  >
                    40100 {option.label}
                  </Chip>
                ))}
              </View>

              {/* Sash Section */}
              <Divider style={styles.divider} />
              <Text style={styles.sectionTitle}>الفردة</Text>
              <View style={styles.chipContainer}>
                {getSashOptions(activeWindow.specs.color).map(option => (
                  <Chip
                    key={option.value}
                    selected={activeWindow.specs.sashType === option.value}
                    onPress={() => handleSashTypeChange(option.value)}
                    style={styles.chip}
                  >
                    {option.label}
                  </Chip>
                ))}
              </View>

              {/* Sash Sub Type */}
              <View style={styles.chipContainer}>
                {getSashOptions(activeWindow.specs.color)
                  .find(opt => opt.value === activeWindow.specs.sashType)?.types
                  .map(type => (
                    <Chip
                      key={type.value}
                      selected={activeWindow.specs.sashSubType === type.value}
                      onPress={() => updateWindowSpecs({ sashSubType: type.value })}
                      style={styles.chip}
                    >
                      {activeWindow.specs.sashType} {type.label}
                    </Chip>
                  ))}
              </View>

              {/* Profit Margin */}
              <Surface style={styles.profitSection}>
                <Text style={styles.sectionTitle}>نسبة الربح</Text>
                <TextInput
                  label="نسبة الربح (%)"
                  value={profitMargin.toString()}
                  onChangeText={(text) => setProfitMargin(Number(text) || 0)}
                  keyboardType="numeric"
                  style={styles.profitInput}
                />
              </Surface>

              {/* Calculate Button */}
              <Button
                mode="contained"
                onPress={calculateSingleWindow}
                disabled={isCalculating}
                style={styles.calculateButton}
                contentStyle={styles.calculateButtonContent}
              >
                {isCalculating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  'احسب هذه النافذة'
                )}
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Results */}
        {activeWindow?.breakdown && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.resultTitle}>
                {activeWindow.breakdown.totalCost.toFixed(2)} د.ت
              </Title>
              <Paragraph>{activeWindow.name}</Paragraph>
              
              <Divider style={styles.divider} />
              
              {/* Cost Breakdown */}
              <List.Section>
                <List.Subheader>تفصيل التكلفة</List.Subheader>
                
                <List.Accordion title="القفص (Dormant)" id="frame">
                  {activeWindow.breakdown.frame.map((item, index) => (
                    <List.Item
                      key={index}
                      title={item.name}
                      description={`${item.quantity} × ${item.unitPrice.toFixed(2)} د.ت`}
                      right={() => <Text>{item.totalCost.toFixed(2)} د.ت</Text>}
                    />
                  ))}
                </List.Accordion>

                <List.Accordion title="الفردتان (Ouvrants)" id="sashes">
                  {activeWindow.breakdown.sashes.map((item, index) => (
                    <List.Item
                      key={index}
                      title={item.name}
                      description={`${item.quantity} × ${item.unitPrice.toFixed(2)} د.ت`}
                      right={() => <Text>{item.totalCost.toFixed(2)} د.ت</Text>}
                    />
                  ))}
                </List.Accordion>

                <List.Accordion title="الفاصل (40112)" id="separator">
                  {activeWindow.breakdown.separator.map((item, index) => (
                    <List.Item
                      key={index}
                      title={item.name}
                      description={`${item.quantity} × ${item.unitPrice.toFixed(2)} د.ت`}
                      right={() => <Text>{item.totalCost.toFixed(2)} د.ت</Text>}
                    />
                  ))}
                </List.Accordion>

                <List.Accordion title="الزجاج" id="glass">
                  {activeWindow.breakdown.glass.map((item, index) => (
                    <List.Item
                      key={index}
                      title={item.name}
                      description={`${item.quantity} × ${item.unitPrice.toFixed(2)} د.ت`}
                      right={() => <Text>{item.totalCost.toFixed(2)} د.ت</Text>}
                    />
                  ))}
                </List.Accordion>

                <List.Accordion title="الملحقات" id="hardware">
                  {activeWindow.breakdown.hardware.map((item, index) => (
                    <List.Item
                      key={index}
                      title={item.name}
                      description={`${item.quantity} × ${item.unitPrice.toFixed(2)} د.ت`}
                      right={() => <Text>{item.totalCost.toFixed(2)} د.ت</Text>}
                    />
                  ))}
                </List.Accordion>
              </List.Section>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#2563eb',
  },
  summaryTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalCost: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  windowItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  activeWindowItem: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 2,
  },
  windowItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windowInfo: {
    flex: 1,
  },
  windowNameInput: {
    backgroundColor: 'transparent',
    fontSize: 16,
    fontWeight: 'bold',
  },
  windowDimensions: {
    fontSize: 12,
    color: '#6b7280',
  },
  windowCost: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: 'bold',
  },
  windowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  dimensionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dimensionInput: {
    flex: 1,
  },
  colorSection: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#eff6ff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  profitSection: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f0fdf4',
  },
  profitInput: {
    backgroundColor: 'white',
  },
  calculateButton: {
    marginTop: 16,
  },
  calculateButtonContent: {
    paddingVertical: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
  },
});

export default WindowCalculatorScreen;
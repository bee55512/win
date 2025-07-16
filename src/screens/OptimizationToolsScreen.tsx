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
  Surface,
  Text,
  Divider,
  FAB,
  Portal,
  Modal,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WindowSpec {
  id: string;
  length: number;
  width: number;
  quantity: number;
}

interface OptimizationResult {
  frame: {
    totalLength: number;
    barsNeeded: number;
    waste: number;
    efficiency: number;
  };
  sash: {
    totalLength: number;
    barsNeeded: number;
    waste: number;
    efficiency: number;
  };
}

const OptimizationToolsScreen: React.FC = () => {
  const [windows, setWindows] = useState<WindowSpec[]>([
    { id: '1', length: 100, width: 100, quantity: 1 },
    { id: '2', length: 120, width: 110, quantity: 1 }
  ]);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWindow, setNewWindow] = useState<Omit<WindowSpec, 'id'>>({
    length: 100,
    width: 100,
    quantity: 1
  });

  const addWindow = () => {
    if (newWindow.length <= 0 || newWindow.width <= 0 || newWindow.quantity <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال قيم صحيحة');
      return;
    }

    const newId = Date.now().toString();
    setWindows([...windows, { ...newWindow, id: newId }]);
    setNewWindow({ length: 100, width: 100, quantity: 1 });
    setShowAddModal(false);
  };

  const removeWindow = (id: string) => {
    if (windows.length === 1) {
      Alert.alert('تنبيه', 'يجب أن تحتوي القائمة على نافذة واحدة على الأقل');
      return;
    }
    setWindows(windows.filter(w => w.id !== id));
  };

  const updateWindow = (id: string, field: keyof WindowSpec, value: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const calculateOptimization = async () => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

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

    const result: OptimizationResult = {
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
    setIsCalculating(false);
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return '#10b981';
    if (efficiency >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const totalWindows = windows.reduce((sum, w) => sum + w.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerTitle}>أدوات تحسين القص</Title>
            <Paragraph style={styles.headerSubtitle}>
              احسب الكمية المثلى للمواد وقلل الهدر عند تصنيع عدة نوافذ
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Windows List */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title>قائمة النوافذ ({totalWindows})</Title>
              <Button mode="contained" onPress={() => setShowAddModal(true)} compact>
                إضافة
              </Button>
            </View>

            {windows.map((window, index) => (
              <Surface key={window.id} style={styles.windowItem}>
                <View style={styles.windowHeader}>
                  <Text style={styles.windowTitle}>نافذة {index + 1}</Text>
                  {windows.length > 1 && (
                    <Button
                      mode="text"
                      onPress={() => removeWindow(window.id)}
                      textColor="#ef4444"
                      compact
                    >
                      حذف
                    </Button>
                  )}
                </View>
                
                <View style={styles.windowInputs}>
                  <TextInput
                    label="الطول (سم)"
                    value={window.length.toString()}
                    onChangeText={(text) => updateWindow(window.id, 'length', Number(text) || 0)}
                    keyboardType="numeric"
                    style={styles.windowInput}
                    dense
                  />
                  <TextInput
                    label="العرض (سم)"
                    value={window.width.toString()}
                    onChangeText={(text) => updateWindow(window.id, 'width', Number(text) || 0)}
                    keyboardType="numeric"
                    style={styles.windowInput}
                    dense
                  />
                  <TextInput
                    label="الكمية"
                    value={window.quantity.toString()}
                    onChangeText={(text) => updateWindow(window.id, 'quantity', Number(text) || 1)}
                    keyboardType="numeric"
                    style={styles.windowInput}
                    dense
                  />
                </View>
              </Surface>
            ))}

            <Button
              mode="contained"
              onPress={calculateOptimization}
              disabled={isCalculating}
              style={styles.calculateButton}
              contentStyle={styles.calculateButtonContent}
            >
              {isCalculating ? (
                <ActivityIndicator color="white" />
              ) : (
                'احسب التحسين'
              )}
            </Button>
          </Card.Content>
        </Card>

        {/* Results */}
        {optimization ? (
          <>
            {/* Summary */}
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Title style={styles.summaryTitle}>ملخص التحسين</Title>
                
                <View style={styles.summaryStats}>
                  <Surface style={styles.summaryStatCard}>
                    <Text style={styles.summaryStatNumber}>
                      {optimization.frame.barsNeeded + optimization.sash.barsNeeded}
                    </Text>
                    <Text style={styles.summaryStatLabel}>إجمالي البارات</Text>
                  </Surface>
                  <Surface style={styles.summaryStatCard}>
                    <Text style={styles.summaryStatNumber}>
                      {((optimization.frame.efficiency + optimization.sash.efficiency) / 2).toFixed(1)}%
                    </Text>
                    <Text style={styles.summaryStatLabel}>متوسط الكفاءة</Text>
                  </Surface>
                </View>
              </Card.Content>
            </Card>

            {/* Frame Results */}
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.resultTitle}>نتائج القوافص (40100)</Title>
                
                <View style={styles.resultStats}>
                  <Surface style={styles.resultStatCard}>
                    <Text style={styles.resultStatNumber}>
                      {optimization.frame.barsNeeded}
                    </Text>
                    <Text style={styles.resultStatLabel}>عدد البارات</Text>
                  </Surface>
                  <Surface style={[styles.resultStatCard, styles.efficiencyCard]}>
                    <Text style={[
                      styles.resultStatNumber,
                      { color: getEfficiencyColor(optimization.frame.efficiency) }
                    ]}>
                      {optimization.frame.efficiency.toFixed(1)}%
                    </Text>
                    <Text style={styles.resultStatLabel}>الكفاءة</Text>
                  </Surface>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.resultDetails}>
                  <View style={styles.resultDetailRow}>
                    <Text style={styles.resultDetailLabel}>الطول المطلوب:</Text>
                    <Text style={styles.resultDetailValue}>
                      {optimization.frame.totalLength} سم
                    </Text>
                  </View>
                  <View style={styles.resultDetailRow}>
                    <Text style={styles.resultDetailLabel}>الطول المتوفر:</Text>
                    <Text style={styles.resultDetailValue}>
                      {optimization.frame.barsNeeded * 650} سم
                    </Text>
                  </View>
                  <View style={styles.resultDetailRow}>
                    <Text style={styles.resultDetailLabel}>الهدر:</Text>
                    <Text style={[styles.resultDetailValue, styles.wasteValue]}>
                      {optimization.frame.waste} سم
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Sash Results */}
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.resultTitle}>نتائج الفردات (6007)</Title>
                
                <View style={styles.resultStats}>
                  <Surface style={styles.resultStatCard}>
                    <Text style={styles.resultStatNumber}>
                      {optimization.sash.barsNeeded}
                    </Text>
                    <Text style={styles.resultStatLabel}>عدد البارات</Text>
                  </Surface>
                  <Surface style={[styles.resultStatCard, styles.efficiencyCard]}>
                    <Text style={[
                      styles.resultStatNumber,
                      { color: getEfficiencyColor(optimization.sash.efficiency) }
                    ]}>
                      {optimization.sash.efficiency.toFixed(1)}%
                    </Text>
                    <Text style={styles.resultStatLabel}>الكفاءة</Text>
                  </Surface>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.resultDetails}>
                  <View style={styles.resultDetailRow}>
                    <Text style={styles.resultDetailLabel}>الطول المطلوب:</Text>
                    <Text style={styles.resultDetailValue}>
                      {optimization.sash.totalLength.toFixed(1)} سم
                    </Text>
                  </View>
                  <View style={styles.resultDetailRow}>
                    <Text style={styles.resultDetailLabel}>الطول المتوفر:</Text>
                    <Text style={styles.resultDetailValue}>
                      {optimization.sash.barsNeeded * 650} سم
                    </Text>
                  </View>
                  <View style={styles.resultDetailRow}>
                    <Text style={styles.resultDetailLabel}>الهدر:</Text>
                    <Text style={[styles.resultDetailValue, styles.wasteValue]}>
                      {optimization.sash.waste.toFixed(1)} سم
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Tips */}
            <Card style={styles.tipsCard}>
              <Card.Content>
                <Title style={styles.tipsTitle}>نصائح للتحسين</Title>
                <View style={styles.tipsList}>
                  <Text style={styles.tipItem}>
                    💡 {optimization.frame.waste > 500 || optimization.sash.waste > 500 
                      ? 'يمكن استخدام الهدر الكبير لصنع نوافذ إضافية صغيرة'
                      : 'كفاءة جيدة في استخدام المواد'}
                  </Text>
                  <Text style={styles.tipItem}>
                    🔧 ابدأ بالقطع الطويلة أولاً لتقليل الهدر
                  </Text>
                  <Text style={styles.tipItem}>
                    📏 احتفظ بالبواقي الكبيرة (أكثر من 30 سم) للاستخدام المستقبلي
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>احسب التحسين</Text>
              <Text style={styles.emptyText}>
                أدخل قائمة النوافذ المطلوبة واضغط "احسب التحسين" لمعرفة الكمية المثلى للمواد
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Add Window FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        label="إضافة نافذة"
      />

      {/* Add Window Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Card>
            <Card.Content>
              <Title>إضافة نافذة جديدة</Title>
              
              <TextInput
                label="الطول (سم)"
                value={newWindow.length.toString()}
                onChangeText={(text) => setNewWindow({...newWindow, length: Number(text) || 0})}
                keyboardType="numeric"
                style={styles.modalInput}
              />
              
              <TextInput
                label="العرض (سم)"
                value={newWindow.width.toString()}
                onChangeText={(text) => setNewWindow({...newWindow, width: Number(text) || 0})}
                keyboardType="numeric"
                style={styles.modalInput}
              />
              
              <TextInput
                label="الكمية"
                value={newWindow.quantity.toString()}
                onChangeText={(text) => setNewWindow({...newWindow, quantity: Number(text) || 1})}
                keyboardType="numeric"
                style={styles.modalInput}
              />
              
              <Divider style={styles.modalDivider} />
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalButton}
                >
                  إلغاء
                </Button>
                <Button
                  mode="contained"
                  onPress={addWindow}
                  style={styles.modalButton}
                >
                  إضافة
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
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
  headerCard: {
    marginBottom: 16,
    backgroundColor: '#2563eb',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#bfdbfe',
    fontSize: 14,
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
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  windowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  windowInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  windowInput: {
    flex: 1,
  },
  calculateButton: {
    marginTop: 16,
  },
  calculateButtonContent: {
    paddingVertical: 8,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#10b981',
  },
  summaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  resultStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  resultStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#eff6ff',
  },
  efficiencyCard: {
    backgroundColor: '#f0fdf4',
  },
  resultStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  resultStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  resultDetails: {
    gap: 8,
  },
  resultDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  resultDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  wasteValue: {
    color: '#ef4444',
  },
  tipsCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  tipsTitle: {
    color: '#92400e',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  emptyCard: {
    marginBottom: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    margin: 20,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalDivider: {
    marginVertical: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    minWidth: 80,
  },
});

export default OptimizationToolsScreen;
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
  List,
  Chip,
  FAB,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { materialsData, type Material } from '../data/materials';

const MaterialsDatabaseScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [materials, setMaterials] = useState<Material[]>(materialsData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Material>({
    ref: '',
    designation: '',
    prixUMoyen: 0
  });

  const categories = [
    { value: 'all', label: 'جميع المواد' },
    { value: 'profiles', label: 'البروفايل' },
    { value: 'hardware', label: 'الملحقات' },
    { value: 'glass', label: 'الزجاج' },
    { value: 'joints', label: 'المواد اللاصقة' }
  ];

  const getCategoryForRef = (ref: string) => {
    if (ref.startsWith('40') || ref.startsWith('22') || ref.startsWith('60')) return 'profiles';
    if (ref.includes('joint') || ref.includes('plat')) return 'joints';
    if (ref.includes('glass') || ref.includes('زجاج')) return 'glass';
    return 'hardware';
  };

  const getCategoryColor = (category: string) => {
    const colorMap = {
      profiles: '#3b82f6',
      hardware: '#10b981',
      joints: '#f59e0b',
      glass: '#8b5cf6'
    };
    return colorMap[category as keyof typeof colorMap] || '#6b7280';
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.ref.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || getCategoryForRef(material.ref) === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddMaterial = () => {
    if (!newMaterial.ref || !newMaterial.designation || newMaterial.prixUMoyen <= 0) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول بشكل صحيح');
      return;
    }

    if (materials.some(m => m.ref === newMaterial.ref)) {
      Alert.alert('خطأ', 'هذا المرجع موجود بالفعل');
      return;
    }

    setMaterials([...materials, { ...newMaterial }]);
    setNewMaterial({ ref: '', designation: '', prixUMoyen: 0 });
    setShowAddModal(false);
    Alert.alert('نجح', 'تم إضافة المادة بنجاح');
  };

  const handleDeleteMaterial = (ref: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه المادة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => {
            setMaterials(materials.filter(m => m.ref !== ref));
            Alert.alert('تم', 'تم حذف المادة');
          }
        }
      ]
    );
  };

  const totalMaterials = materials.length;
  const profilesCount = materials.filter(m => getCategoryForRef(m.ref) === 'profiles').length;
  const hardwareCount = materials.filter(m => getCategoryForRef(m.ref) === 'hardware').length;
  const averagePrice = materials.reduce((sum, m) => sum + m.prixUMoyen, 0) / materials.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Search and Filter */}
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="ابحث عن المواد..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchInput}
              left={<TextInput.Icon icon="magnify" />}
            />
            
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>الفئة:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {categories.map(category => (
                    <Chip
                      key={category.value}
                      selected={filterCategory === category.value}
                      onPress={() => setFilterCategory(category.value)}
                      style={styles.filterChip}
                    >
                      {category.label}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{totalMaterials}</Text>
            <Text style={styles.statLabel}>إجمالي المواد</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{profilesCount}</Text>
            <Text style={styles.statLabel}>البروفايل</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{hardwareCount}</Text>
            <Text style={styles.statLabel}>الملحقات</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{averagePrice.toFixed(2)}</Text>
            <Text style={styles.statLabel}>متوسط السعر</Text>
          </Surface>
        </View>

        {/* Materials List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>قائمة المواد ({filteredMaterials.length})</Title>
            
            {filteredMaterials.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>لا توجد مواد تطابق البحث</Text>
              </View>
            ) : (
              <List.Section>
                {filteredMaterials.map((material, index) => {
                  const category = getCategoryForRef(material.ref);
                  const categoryColor = getCategoryColor(category);
                  const categoryLabel = categories.find(c => c.value === category)?.label;
                  
                  return (
                    <List.Item
                      key={material.ref}
                      title={material.designation}
                      description={`المرجع: ${material.ref}`}
                      left={() => (
                        <View style={styles.materialLeft}>
                          <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
                          <View>
                            <Text style={styles.materialRef}>{material.ref}</Text>
                            <Text style={[styles.categoryLabel, { color: categoryColor }]}>
                              {categoryLabel}
                            </Text>
                          </View>
                        </View>
                      )}
                      right={() => (
                        <View style={styles.materialRight}>
                          <Text style={styles.materialPrice}>
                            {material.prixUMoyen.toFixed(2)} د.ت
                          </Text>
                          <Button
                            mode="text"
                            onPress={() => handleDeleteMaterial(material.ref)}
                            textColor="#ef4444"
                            compact
                          >
                            حذف
                          </Button>
                        </View>
                      )}
                      style={[
                        styles.materialItem,
                        index % 2 === 0 ? styles.evenItem : styles.oddItem
                      ]}
                    />
                  );
                })}
              </List.Section>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add Material FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        label="إضافة مادة"
      />

      {/* Add Material Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Card>
            <Card.Content>
              <Title>إضافة مادة جديدة</Title>
              
              <TextInput
                label="المرجع"
                value={newMaterial.ref}
                onChangeText={(text) => setNewMaterial({...newMaterial, ref: text})}
                style={styles.modalInput}
              />
              
              <TextInput
                label="اسم المادة"
                value={newMaterial.designation}
                onChangeText={(text) => setNewMaterial({...newMaterial, designation: text})}
                style={styles.modalInput}
                multiline
              />
              
              <TextInput
                label="السعر الوسطي (د.ت)"
                value={newMaterial.prixUMoyen.toString()}
                onChangeText={(text) => setNewMaterial({...newMaterial, prixUMoyen: parseFloat(text) || 0})}
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
                  onPress={handleAddMaterial}
                  style={styles.modalButton}
                >
                  حفظ
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
  card: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  materialItem: {
    paddingVertical: 8,
  },
  evenItem: {
    backgroundColor: '#ffffff',
  },
  oddItem: {
    backgroundColor: '#f9fafb',
  },
  materialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  materialRef: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  materialRight: {
    alignItems: 'flex-end',
  },
  materialPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
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

export default MaterialsDatabaseScreen;
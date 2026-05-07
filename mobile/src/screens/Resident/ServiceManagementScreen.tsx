import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { 
  Briefcase, 
  Plus, 
  Clock, 
  Trash2, 
  X, 
  User, 
  CheckCircle2,
  Coffee,
  BookOpen,
  Trash
} from 'lucide-react-native';
import { visitorApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SERVICE_TYPES = [
  { id: 'maid', label: 'Maid', icon: User, color: '#E8F5E9', iconColor: '#2E7D32' },
  { id: 'milk', label: 'Milk', icon: Coffee, color: '#E3F2FD', iconColor: '#1976D2' },
  { id: 'news', label: 'Newspaper', icon: BookOpen, color: '#FFF3E0', iconColor: '#E65100' },
  { id: 'garbage', label: 'Waste Collection', icon: Trash, color: '#F3E5F5', iconColor: '#7B1FA2' },
];

export default function ServiceManagementScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState({ name: '', type: 'Maid', phone: '', time: '08:00 AM' });

  const fetchServices = async () => {
    try {
      const res = await visitorApi.getRecurring();
      setServices(res.data.data);
    } catch (e) {
      console.error('Fetch services failed', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchServices();
  }, []);

  const addService = async () => {
    if (!newService.name || !newService.phone || !newService.time) {
      Alert.alert('Error', 'Please fill all details including phone number');
      return;
    }

    setSaving(true);
    try {
      await visitorApi.createRecurring({
        name: newService.name,
        phone: newService.phone,
        serviceType: newService.type,
        startTime: newService.time,
        endTime: '10:00 AM', // Default or add another field
        days: 'DAILY'
      });
      setModalVisible(false);
      setNewService({ name: '', type: 'Maid', phone: '', time: '08:00 AM' });
      fetchServices();
      Alert.alert('Success', 'Daily service pass created. Guard can now see this in their list.');
    } catch (e) {
      Alert.alert('Error', 'Failed to create service pass');
    } finally {
      setSaving(false);
    }
  };

  const removeService = (id: string) => {
    Alert.alert('Remove Service', 'Are you sure you want to remove this service?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        setServices(services.filter(s => s.id !== id));
      }}
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + 20 }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Daily Services</Text>
        <Text style={[styles.subtitle, { color: colors.text + '80' }]}>Manage your recurring visitors</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text + '40' }]}>YOUR DAILY HELP</Text>
        
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : services.length > 0 ? (
          services.map((item) => (
            <View key={item.id} style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.serviceInfo}>
                <View style={[styles.typeIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Briefcase size={20} color={colors.primary} />
                </View>
                <View style={styles.textDetails}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.serviceSub, { color: colors.text + '60' }]}>{item.serviceType} • {item.startTime} • {item.days}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeService(item.id)}>
                <Trash2 size={20} color={isDark ? '#EF5350' : '#FFCDD2'} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', color: colors.text + '40', marginTop: 20 }}>No daily services added yet</Text>
        )}

        <TouchableOpacity 
          style={[styles.addCard, { borderColor: colors.primary + '30' }]} 
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color={colors.primary} />
          <Text style={[styles.addText, { color: colors.primary }]}>Add New Recurring Service</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Service Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Service</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeBtn, { backgroundColor: colors.border }]}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.text + '60' }]}>Service Type</Text>
            <View style={styles.typeGrid}>
              {SERVICE_TYPES.map((t) => (
                <TouchableOpacity 
                  key={t.id}
                  style={[
                    styles.typeOption, 
                    { backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5' },
                    newService.type === t.label && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setNewService({ ...newService, type: t.label })}
                >
                  <t.icon size={22} color={newService.type === t.label ? '#fff' : (isDark ? colors.text + '80' : t.iconColor)} />
                  <Text style={[
                    styles.typeOptionText, 
                    { color: isDark ? colors.text : '#333' },
                    newService.type === t.label && { color: '#fff' }
                  ]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text + '60' }]}>Name of Helper</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5', color: colors.text }]}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor={isDark ? '#555' : '#999'}
              value={newService.name}
              onChangeText={(v) => setNewService({ ...newService, name: v })}
            />

            <Text style={[styles.label, { color: colors.text + '60' }]}>Phone Number</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5', color: colors.text }]}
              placeholder="Required for Guard verification"
              placeholderTextColor={isDark ? '#555' : '#999'}
              keyboardType="phone-pad"
              value={newService.phone}
              onChangeText={(v) => setNewService({ ...newService, phone: v })}
            />

            <Text style={[styles.label, { color: colors.text + '60' }]}>Arrival Time</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5', color: colors.text }]}
              placeholder="e.g. 07:00 AM"
              placeholderTextColor={isDark ? '#555' : '#999'}
              value={newService.time}
              onChangeText={(v) => setNewService({ ...newService, time: v })}
            />

            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.7 }]} 
              onPress={addService}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.submitBtnText}>CREATE SERVICE PASS</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '500', marginTop: 4 },
  content: { padding: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },
  serviceCard: { borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderWidth: 1, elevation: 2 },
  serviceInfo: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  textDetails: { marginLeft: 16 },
  serviceName: { fontSize: 17, fontWeight: 'bold' },
  serviceSub: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  addCard: { borderStyle: 'dashed', borderWidth: 2, borderRadius: 24, padding: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12, marginTop: 12 },
  addText: { fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, paddingBottom: 50, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '900' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, marginTop: 18 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeOption: { width: '48%', borderRadius: 18, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'transparent' },
  typeOptionText: { fontSize: 12, fontWeight: 'bold' },
  input: { height: 60, borderRadius: 18, paddingHorizontal: 20, fontSize: 16, fontWeight: '600', marginTop: 4 },
  submitBtn: { height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginTop: 32, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});

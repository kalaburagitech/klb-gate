import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Alert
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

const SERVICE_TYPES = [
  { id: 'maid', label: 'Maid', icon: User, color: '#E8F5E9', iconColor: '#2E7D32' },
  { id: 'milk', label: 'Milk', icon: Coffee, color: '#E3F2FD', iconColor: '#1976D2' },
  { id: 'news', label: 'Newspaper', icon: BookOpen, color: '#FFF3E0', iconColor: '#E65100' },
  { id: 'garbage', label: 'Waste Collection', icon: Trash, color: '#F3E5F5', iconColor: '#7B1FA2' },
];

export default function ServiceManagementScreen() {
  const [services, setServices] = useState([
    { id: '1', name: 'Shanti Bai', type: 'Maid', time: '08:00 AM', days: 'Daily' },
    { id: '2', name: 'Amul Delivery', type: 'Milk', time: '06:30 AM', days: 'Daily' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newService, setNewService] = useState({ name: '', type: 'Maid', time: '' });

  const addService = () => {
    if (!newService.name || !newService.time) {
      Alert.alert('Error', 'Please fill all details');
      return;
    }
    setServices([...services, { ...newService, id: Math.random().toString(), days: 'Daily' }]);
    setModalVisible(false);
    setNewService({ name: '', type: 'Maid', time: '' });
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Services</Text>
        <Text style={styles.subtitle}>Manage your recurring visitors</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>YOUR DAILY HELP</Text>
        
        {services.map((item) => (
          <View key={item.id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <View style={styles.typeIcon}>
                <Briefcase size={20} color="#2E7D32" />
              </View>
              <View style={styles.textDetails}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceSub}>{item.type} • {item.time} • {item.days}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => removeService(item.id)}>
              <Trash2 size={20} color="#FFCDD2" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.addCard} 
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color="#2E7D32" />
          <Text style={styles.addText}>Add New Recurring Service</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Service Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Service</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Service Type</Text>
            <View style={styles.typeGrid}>
              {SERVICE_TYPES.map((t) => (
                <TouchableOpacity 
                  key={t.id}
                  style={[styles.typeOption, newService.type === t.label && styles.typeOptionActive]}
                  onPress={() => setNewService({ ...newService, type: t.label })}
                >
                  <t.icon size={24} color={newService.type === t.label ? '#fff' : t.iconColor} />
                  <Text style={[styles.typeOptionText, newService.type === t.label && styles.typeOptionTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Name of Helper</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. Ramesh Kumar"
              value={newService.name}
              onChangeText={(v) => setNewService({ ...newService, name: v })}
            />

            <Text style={styles.label}>Arrival Time</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. 07:00 AM"
              value={newService.time}
              onChangeText={(v) => setNewService({ ...newService, time: v })}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={addService}>
              <Text style={styles.submitBtnText}>CREATE SERVICE PASS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B5E20' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  content: { padding: 24 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#999', letterSpacing: 2, marginBottom: 20 },
  serviceCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  serviceInfo: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  textDetails: { marginLeft: 16 },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  serviceSub: { fontSize: 12, color: '#666', marginTop: 2 },
  addCard: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#C8E6C9', borderRadius: 24, padding: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12, marginTop: 12 },
  addText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 12, marginTop: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeOption: { width: '48%', backgroundColor: '#F5F5F5', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  typeOptionActive: { backgroundColor: '#2E7D32' },
  typeOptionText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  typeOptionTextActive: { color: '#fff' },
  input: { backgroundColor: '#F5F5F5', height: 60, borderRadius: 16, paddingHorizontal: 20, fontSize: 16, fontWeight: '600' },
  submitBtn: { backgroundColor: '#2E7D32', height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginTop: 40, shadowColor: '#2E7D32', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});

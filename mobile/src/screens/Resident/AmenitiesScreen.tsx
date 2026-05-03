import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Modal
} from 'react-native';
import { 
  Calendar, 
  Clock, 
  Info, 
  CheckCircle2, 
  X, 
  Waves, 
  Dumbbell, 
  Users, 
  Utensils, 
  Building 
} from 'lucide-react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AMENITY_ICONS: any = {
  'Pool': Waves,
  'Gym': Dumbbell,
  'Meeting Room': Users,
  'Kitchen': Utensils,
  'Function Hall': Building,
};

export default function AmenitiesScreen() {
  const { user } = useAuth();
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmenity, setSelectedAmenity] = useState<any>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingData, setBookingData] = useState({ date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '11:00' });

  const fetchAmenities = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:4000/api/amenities');
      setAmenities(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleBook = async () => {
    try {
      await axios.post('http://127.0.0.1:4000/api/amenities/book', {
        amenityId: selectedAmenity.id,
        ...bookingData
      });
      Alert.alert('Success', 'Booking confirmed!');
      setBookingModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to book');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#2E7D32" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clubhouse & Amenities</Text>
        <Text style={styles.subtitle}>Book facilities for your leisure</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {amenities.map((item) => {
          const Icon = AMENITY_ICONS[item.name] || Info;
          return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={() => {
                setSelectedAmenity(item);
                setBookingModalVisible(true);
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Icon size={24} color="#2E7D32" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardDesc}>{item.description || 'Premium facility for residents'}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Clock size={12} color="#999" />
                    <Text style={styles.metaText}>{item.openTime} - {item.closeTime}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Users size={12} color="#999" />
                    <Text style={styles.metaText}>Cap: {item.capacity}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.bookBadge}>
                <Text style={styles.bookText}>BOOK</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={bookingModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Reserve {selectedAmenity?.name}</Text>
                <Text style={styles.modalSub}>Select your preferred time slot</Text>
              </View>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>DATE</Text>
              <View style={styles.inputGroup}>
                <Calendar size={20} color="#2E7D32" />
                <Text style={styles.inputText}>{bookingData.date}</Text>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>START TIME</Text>
                  <TouchableOpacity style={styles.inputGroup}>
                    <Clock size={20} color="#2E7D32" />
                    <Text style={styles.inputText}>{bookingData.startTime}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>END TIME</Text>
                  <TouchableOpacity style={styles.inputGroup}>
                    <Clock size={20} color="#2E7D32" />
                    <Text style={styles.inputText}>{bookingData.endTime}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleBook}>
                <CheckCircle2 size={24} color="#fff" />
                <Text style={styles.submitBtnText}>CONFIRM BOOKING</Text>
              </TouchableOpacity>
            </View>
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
  content: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  iconContainer: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 16 },
  cardName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  cardDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  bookBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  bookText: { color: '#2E7D32', fontSize: 10, fontWeight: '900' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  modalSub: { fontSize: 12, color: '#666', marginTop: 2 },
  form: { gap: 20 },
  label: { fontSize: 10, fontWeight: '900', color: '#999', letterSpacing: 1 },
  inputGroup: { height: 60, backgroundColor: '#F5F5F5', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12 },
  inputText: { fontSize: 16, fontWeight: '600', color: '#333' },
  row: { flexDirection: 'row', gap: 16 },
  submitBtn: { backgroundColor: '#2E7D32', height: 64, borderRadius: 32, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20, shadowColor: '#2E7D32', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});

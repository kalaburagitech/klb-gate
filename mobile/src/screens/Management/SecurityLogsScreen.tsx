import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal
} from 'react-native';
import { 
  Activity, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock, 
  MapPin,
  ChevronRight,
  Camera,
  X as CloseIcon
} from 'lucide-react-native';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function SecurityLogsScreen() {
  const { colors, isDark } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await api.get('entries/all');
      setLogs(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#2E7D32';
      case 'PENDING_APPROVAL': return '#E65100';
      case 'DENIED': return '#D32F2F';
      case 'CHECKED_IN': return '#1976D2';
      case 'CHECKED_OUT': return '#455A64';
      default: return '#666';
    }
  };

  const renderLog = ({ item }: { item: any }) => (
    <View style={[styles.logCard, { backgroundColor: colors.card }]}>
      <View style={styles.logHeader}>
        <View style={styles.visitorInfo}>
          <TouchableOpacity onPress={() => item.photoUrl && setSelectedPhoto(item.photoUrl)}>
            <Image source={{ uri: item.photoUrl }} style={[styles.visitorImg, { backgroundColor: isDark ? colors.background : '#f0f0f0' }]} />
            <View style={[styles.photoIconBadge, { backgroundColor: colors.primary }]}>
              <Camera size={10} color="#fff" />
            </View>
          </TouchableOpacity>
          <View>
            <Text style={[styles.visitorName, { color: colors.text }]}>{item.visitor.name}</Text>
            <Text style={[styles.visitorType, { color: isDark ? colors.text + '40' : '#999' }]}>{item.type}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + (isDark ? '33' : '15') }]}>
          <Text style={[styles.statusText, { color: isDark ? '#fff' : getStatusColor(item.status) }]}>
            {item.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={[styles.logDetails, { borderTopColor: colors.border }]}>
        <View style={styles.detailItem}>
          <Clock size={14} color={isDark ? colors.text + '30' : "#999"} />
          <Text style={[styles.detailText, { color: colors.text + '60' }]}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <View style={styles.detailItem}>
          <MapPin size={14} color={isDark ? colors.text + '30' : "#999"} />
          <Text style={[styles.detailText, { color: colors.text + '60' }]}>
            {item.unitNumber ? `Unit ${item.unitNumber}` : 'General Entry'}
          </Text>
        </View>
        {item.tenant && (
          <View style={styles.detailItem}>
            <ShieldCheck size={14} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.primary, fontWeight: 'bold' }]}>
              {item.tenant.name}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Security Logs</Text>
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: isDark ? colors.background : '#F1F8E9' }]}>
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList 
          data={logs}
          renderItem={renderLog}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchLogs} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Activity size={48} color={isDark ? colors.text + '20' : "#ccc"} />
              <Text style={[styles.emptyText, { color: colors.text + '40' }]}>No security logs found</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!selectedPhoto} transparent animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedPhoto(null)}>
            <CloseIcon size={28} color="#fff" />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 24, 
    paddingTop: 60, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  title: { fontSize: 24, fontWeight: '900' },
  filterBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },
  logCard: { 
    borderRadius: 24, 
    padding: 16, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1
  },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  visitorInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  visitorImg: { width: 44, height: 44, borderRadius: 12 },
  visitorName: { fontSize: 16, fontWeight: 'bold' },
  visitorType: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  logDetails: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, gap: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 12 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '500' },
  photoIconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '80%',
    borderRadius: 20,
  }
});

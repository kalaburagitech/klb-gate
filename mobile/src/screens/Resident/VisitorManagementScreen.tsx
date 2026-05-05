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
  Alert
} from 'react-native';
import { ShieldCheck, ShieldX, Clock, History, Calendar, CheckCircle2, XCircle, User } from 'lucide-react-native';
import { visitorApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PhotoModal } from '../../components/UI';

export default function VisitorManagementScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'HISTORY'>('PENDING');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState<string | null>(null);

  // Photo Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | undefined>(undefined);
  const [selectedVisitorName, setSelectedVisitorName] = useState('');

  const fetchEntries = async () => {
    try {
      const res = await visitorApi.getMyUnitEntries();
      const all = res.data.data;
      
      if (activeTab === 'PENDING') {
        setEntries(all.filter((e: any) => e.status === 'PENDING_APPROVAL'));
      } else if (activeTab === 'APPROVED') {
        setEntries(all.filter((e: any) => e.status === 'APPROVED' || e.status === 'CHECKED_IN'));
      } else {
        setEntries(all.filter((e: any) => e.status === 'REJECTED' || e.status === 'CHECKED_OUT'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [activeTab]);

  const handleDecision = async (entryId: string, status: 'APPROVED' | 'REJECTED') => {
    setDecisionLoading(entryId);
    try {
      await visitorApi.approve({ entryId, status });
      Alert.alert('Status Updated', `Visitor ${status.toLowerCase()}`);
      fetchEntries();
    } catch (error) {
      Alert.alert('Error', 'Action failed');
    } finally {
      setDecisionLoading(null);
    }
  };

  const renderVisitorItem = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardMain}>
        <TouchableOpacity onPress={() => {
          setSelectedPhoto(item.photoUrl);
          setSelectedVisitorName(item.visitor?.name || 'Visitor');
          setModalVisible(true);
        }}>
          <Image source={{ uri: item.photoUrl || undefined }} style={styles.visitorImg} />
        </TouchableOpacity>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>{item.visitor?.name || 'Visitor'}</Text>
            <View style={[styles.typeBadge, { backgroundColor: item.type === 'DAILY_SERVICE' ? (isDark ? '#E6510033' : '#FFF3E0') : (isDark ? '#2E7D3233' : '#E8F5E9') }]}>
              <Text style={[styles.typeText, { color: item.type === 'DAILY_SERVICE' ? (isDark ? '#FFB74D' : '#E65100') : (isDark ? '#A5D6A7' : '#2E7D32') }]}>{item.type || 'GUEST'}</Text>
            </View>
          </View>
          <View style={styles.timeRow}>
            <Clock size={14} color={colors.text + '60'} />
            <Text style={[styles.timeText, { color: colors.text + '60' }]}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
          {item.purpose && <Text style={[styles.purposeText, { color: colors.text + '80' }]}>“{item.purpose}”</Text>}
        </View>
      </View>

      {item.status === 'PENDING_APPROVAL' && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.btn, styles.rejectBtn]} 
            onPress={() => handleDecision(item.id, 'REJECTED')}
            disabled={decisionLoading === item.id}
          >
            {decisionLoading === item.id ? (
              <ActivityIndicator color="#dc2626" size="small" />
            ) : (
              <>
                <XCircle size={20} color="#dc2626" />
                <Text style={styles.rejectText}>Reject</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btn, styles.approveBtn]} 
            onPress={() => handleDecision(item.id, 'APPROVED')}
            disabled={decisionLoading === item.id}
          >
            {decisionLoading === item.id ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <CheckCircle2 size={20} color="#fff" />
                <Text style={styles.approveText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {(item.status === 'APPROVED' || item.status === 'CHECKED_IN') && (
        <View style={[styles.statusFooter, { borderTopColor: colors.border }]}>
          <ShieldCheck size={16} color={colors.primary} />
          <Text style={[styles.statusLabel, { color: colors.text + '60' }]}>Authorized by you • {item.status}</Text>
        </View>
      )}

      {item.status === 'REJECTED' && (
        <View style={[styles.statusFooter, { borderTopColor: colors.border }]}>
          <ShieldX size={16} color="#dc2626" />
          <Text style={[styles.statusLabel, { color: '#dc2626' }]}>Entry Denied by you</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Visitor Management</Text>
        <Text style={[styles.subtitle, { color: colors.text + '60' }]}>Control who enters your home</Text>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        {[
          { key: 'PENDING', label: 'Waiting', icon: Clock },
          { key: 'APPROVED', label: 'Expected', icon: ShieldCheck },
          { key: 'HISTORY', label: 'History', icon: History },
        ].map((tab) => (
          <TouchableOpacity 
            key={tab.key}
            style={[styles.tab, activeTab === tab.key ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? colors.background : '#F1F5F9' }]}
            onPress={() => {
              setLoading(true);
              setActiveTab(tab.key as any);
            }}
          >
            <tab.icon size={18} color={activeTab === tab.key ? '#fff' : (isDark ? colors.text + '40' : '#94A3B8')} />
            <Text style={[styles.tabText, activeTab === tab.key ? { color: '#fff' } : { color: isDark ? colors.text + '40' : '#94A3B8' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#2E7D32" /></View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderVisitorItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchEntries} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <User size={64} color={isDark ? colors.text + '20' : "#E2E8F0"} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Visitors Found</Text>
              <Text style={[styles.emptySub, { color: colors.text + '40' }]}>Your list for {activeTab.toLowerCase()} is empty</Text>
            </View>
          }
        />
      )}

      <PhotoModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        photoUrl={selectedPhoto} 
        title={selectedVisitorName} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 4 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  tab: { flex: 1, height: 44, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  tabText: { fontSize: 12, fontWeight: 'bold' },
  list: { padding: 20 },
  card: { borderRadius: 24, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1 },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  visitorImg: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#f0f0f0' },
  info: { flex: 1, marginLeft: 16 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 18, fontWeight: 'bold' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 9, fontWeight: '900' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  timeText: { fontSize: 11 },
  purposeText: { fontSize: 13, marginTop: 8, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 16 },
  btn: { flex: 1, height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  rejectBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  approveBtn: { backgroundColor: '#2E7D32' },
  rejectText: { color: '#DC2626', fontWeight: 'bold', fontSize: 14 },
  approveText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  statusFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  statusLabel: { fontSize: 11, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySub: { fontSize: 14, marginTop: 4 }
});

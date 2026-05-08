import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  Modal
} from 'react-native';
import { 
  Clock, 
  Check, 
  X, 
  User, 
  Home, 
  Phone, 
  ArrowRight, 
  Clipboard, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  History,
  Camera as CameraIcon
} from 'lucide-react-native';
import { visitorApi, getMediaUrl } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function PendingApprovalsScreen({ navigation, route }: any) {
  const { colors, isDark } = useTheme();
  const [entries, setEntries] = useState([]);
  const isFetching = React.useRef(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'PENDING' | 'APPROVED' | 'PRE_APPROVED' | 'HISTORY'>(route.params?.filter || 'PENDING');

  useEffect(() => {
    if (route.params?.filter) {
      setActiveFilter(route.params.filter);
    }
  }, [route.params?.filter]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedCards);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedCards(newSet);
  };

  const fetchEntries = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await visitorApi.getAll();
      let all = res.data.data;
      
      if (activeFilter === 'PENDING') {
        // Show everything that is not yet completed (Pending, Approved, or In Site)
        all = all.filter((e: any) => ['PENDING_APPROVAL', 'APPROVED', 'CHECKED_IN'].includes(e.status));
        
        // Custom sort for Active items
        all.sort((a: any, b: any) => {
          const priority: any = { 'APPROVED': 1, 'PENDING_APPROVAL': 2, 'CHECKED_IN': 3 };
          const pA = priority[a.status] || 99;
          const pB = priority[b.status] || 99;
          if (pA !== pB) return pA - pB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      } else if (activeFilter === 'APPROVED') {
        all = all.filter((e: any) => e.status === 'APPROVED' || e.status === 'CHECKED_IN');
      } else if (activeFilter === 'PRE_APPROVED') {
        all = all.filter((e: any) => e.status === 'PRE_APPROVED' || (e.status === 'CHECKED_IN' && e.isPreApproved));
      } else if (activeFilter === 'HISTORY') {
        all = all.filter((e: any) => ['CHECKED_OUT', 'REJECTED'].includes(e.status));
      }
      
      setEntries(all);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setRefreshing(false);
      isFetching.current = false;
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
      const interval = setInterval(fetchEntries, 30000); // 30 seconds refresh
      return () => clearInterval(interval);
    }, [activeFilter])
  );

  const handleAction = async (entryId: string, action: 'checkin' | 'checkout') => {
    try {
      if (action === 'checkin') {
        await visitorApi.checkIn(entryId);
        Alert.alert('Success', 'Access Granted - Gate Open');
      } else {
        await visitorApi.checkOut(entryId);
        Alert.alert('Success', 'Visitor Exit Recorded');
      }
      fetchEntries();
    } catch (error) {
      Alert.alert('Error', `Failed to ${action}`);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED': return { label: 'APPROVED', color: '#2E7D32', icon: ShieldCheck };
      case 'CHECKED_IN': return { label: 'IN SITE', color: '#1976D2', icon: LogIn };
      case 'CHECKED_OUT': return { label: 'LEFT SITE', color: '#64748B', icon: LogOut };
      case 'REJECTED': return { label: 'DENIED', color: '#D32F2F', icon: ShieldAlert };
      case 'PENDING_APPROVAL': return { label: 'PENDING', color: '#E65100', icon: Clock };
      case 'PRE_APPROVED': return { label: 'EXPECTED', color: '#2E7D32', icon: ShieldCheck };
      default: return { label: status, color: '#666', icon: User };
    }
  };

  const handlePreApprovedCheckIn = async (preApprovedId: string) => {
    try {
      await visitorApi.approvePreApprovedVisit(preApprovedId);
      Alert.alert('Success', 'Pre-approved Guest Checked-in');
      fetchEntries();
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>Gate Activity</Text>
        <Text style={[styles.subtitle, { color: colors.text + '60' }]}>Unified pending & recent logs</Text>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        {[
          { key: 'PENDING', label: 'Activity', icon: Clock },
          { key: 'PRE_APPROVED', label: 'Pre-App', icon: Clipboard },
          { key: 'HISTORY', label: 'History', icon: History },
        ].map((tab) => (
          <TouchableOpacity 
            key={tab.key}
            style={[
              styles.tab, 
              activeFilter === tab.key ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? colors.background : '#F1F5F9' }
            ]}
            onPress={() => setActiveFilter(tab.key as any)}
          >
            <tab.icon size={16} color={activeFilter === tab.key ? '#fff' : (isDark ? colors.text + '40' : '#94A3B8')} />
            <Text style={[styles.tabText, activeFilter === tab.key ? { color: '#fff' } : { color: isDark ? colors.text + '40' : '#94A3B8' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => {
          const config = getStatusConfig(item.status);
          const StatusIcon = config.icon;
          
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                {(!item.media || item.media.length === 0) && (
                  <Image source={{ uri: getMediaUrl(item.photoUrl) }} style={styles.avatar} />
                )}
                <View style={[styles.headerInfo, (!item.media || item.media.length === 0) ? { marginLeft: 16 } : { marginLeft: 0 }]}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.visitorName, { color: colors.text }]}>{item.visitor.name}</Text>
                    {item.status === 'CHECKED_IN' && (
                      <View style={[styles.statusBadge, { backgroundColor: '#4CAF5020' }]}>
                        <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
                        <Text style={[styles.statusBadgeText, { color: '#4CAF50' }]}>IN SITE</Text>
                      </View>
                    )}
                    {item.status === 'APPROVED' && (
                      <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.statusBadgeText, { color: colors.primary }]}>EXPECTED</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.phoneRow}>
                    <Phone size={10} color={colors.primary} />
                    <Text style={[styles.phoneText, { color: colors.primary }]}>{item.visitor.phone}</Text>
                  </View>
                </View>
                <View style={[styles.typeIndicator, { backgroundColor: config.color + '15' }]}>
                  <StatusIcon size={14} color={config.color} />
                </View>
              </View>
              
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Home size={14} color={colors.text + '40'} />
                  <Text style={[styles.detailText, { color: colors.text + '60' }]}>Unit {item.unitNumber}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Clock size={14} color={colors.text + '40'} />
                  <Text style={[styles.detailText, { color: colors.text + '60' }]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>

              {item.media && item.media.length > 0 && (
                <View style={styles.captureSection}>
                  <TouchableOpacity 
                    style={[
                      styles.captureHeader, 
                      { backgroundColor: isDark ? '#fff05' : '#f8fafc', borderColor: colors.border }
                    ]} 
                    onPress={() => toggleExpand(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.captureTitle, { color: colors.text + '60' }]}>SECURITY CAPTURE</Text>
                    {expandedCards.has(item.id) ? (
                      <ChevronUp size={16} color={colors.primary} />
                    ) : (
                      <ChevronDown size={16} color={colors.text + '40'} />
                    )}
                  </TouchableOpacity>
                  
                  {expandedCards.has(item.id) && (
                    <View style={styles.captureGrid}>
                      {item.media.map((m: any, idx: number) => (
                        <TouchableOpacity 
                          key={idx} 
                          activeOpacity={0.9}
                          onPress={() => setSelectedImage(m.fileUrl)}
                          style={[
                            styles.captureCard, 
                            { backgroundColor: isDark ? '#fff05' : '#f8f8f8' },
                            item.media.length === 1 && styles.fullCaptureCard
                          ]}
                        >
                          <Image source={{ uri: getMediaUrl(m.fileUrl) }} style={styles.captureImage} resizeMode="cover" />
                          <View style={[styles.captureLabel, { backgroundColor: idx === 0 ? colors.primary + 'CC' : '#475569CC' }]}>
                            <Text style={styles.captureLabelText}>{idx === 0 ? 'FACE' : 'ID / VEHICLE'}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {item.status === 'APPROVED' && (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]} 
                  onPress={() => handleAction(item.id, 'checkin')}
                >
                  <LogIn size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>LET IN (GATE OPEN)</Text>
                </TouchableOpacity>
              )}

              {item.status === 'CHECKED_IN' && (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#1E293B' }]} 
                  onPress={() => handleAction(item.id, 'checkout')}
                >
                  <LogOut size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>LET OUT (EXIT)</Text>
                </TouchableOpacity>
              )}

              {item.status === 'PRE_APPROVED' && (
                <View style={{ gap: 10, marginTop: 16 }}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#2E7D32', marginTop: 0 }]} 
                    onPress={() => handlePreApprovedCheckIn(item.id)}
                  >
                    <Check size={20} color="#fff" />
                    <Text style={styles.actionBtnText}>QUICK CHECK-IN (NO PHOTO)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1, marginTop: 0 }]} 
                    onPress={() => navigation.navigate('AddVisitor', { preApprovedData: item })}
                  >
                    <CameraIcon size={20} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>CAPTURE PHOTO & LET IN</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === 'PENDING_APPROVAL' && (
                <View style={[styles.pendingNotice, { backgroundColor: isDark ? '#E6510022' : '#FFF3E0' }]}>
                  <ActivityIndicator size="small" color="#E65100" />
                  <Text style={styles.pendingText}>Awaiting Resident Decision...</Text>
                </View>
              )}
            </View>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEntries(); }} />
        }
        ListEmptyComponent={
          loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 100 }} /> :
          <View style={styles.emptyState}>
            <ShieldCheck size={64} color={isDark ? colors.text + '20' : '#ccc'} />
            <Text style={[styles.emptyText, { color: colors.text + '40' }]}>No activity matching filter</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]} 
        onPress={() => (navigation as any).navigate('AddVisitor')}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>

      {/* Image Preview Modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedImage(null)}>
            <X size={32} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: getMediaUrl(selectedImage) }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  
  tabContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8, marginBottom: 20 },
  tab: { flex: 1, height: 40, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabText: { fontSize: 10, fontWeight: 'bold' },

  listContent: { paddingHorizontal: 20, paddingBottom: 150 },
  card: { 
    borderRadius: 28, 
    borderBottomLeftRadius: 4,
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 15 
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#f0f0f0' },
  headerInfo: { flex: 1, marginLeft: 16 },
  visitorName: { fontSize: 17, fontWeight: '900' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  typeIndicator: { 
    width: 32, 
    height: 32, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  phoneText: { fontSize: 11, fontWeight: '800' },
  statusText: { fontSize: 9, fontWeight: '900' },
  detailsGrid: { flexDirection: 'row', gap: 16, marginTop: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, fontWeight: '800' },
  
  captureSection: { marginTop: 20 },
  captureHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 12, 
    paddingVertical: 12, 
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed'
  },
  captureTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  captureGrid: { flexDirection: 'row', gap: 12 },
  captureCard: { 
    flex: 1, 
    height: 120, 
    borderRadius: 20, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  fullCaptureCard: { height: 180 },
  captureImage: { width: '100%', height: '100%' },
  captureLabel: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    paddingVertical: 6, 
    alignItems: 'center' 
  },
  captureLabelText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  actionBtn: { height: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  pendingNotice: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16 },
  pendingText: { fontSize: 12, fontWeight: 'bold', color: '#E65100' },
  emptyState: { alignItems: 'center', marginTop: 150 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: 'bold' },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 24, 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOpacity: 0.3, 
    shadowRadius: 10, 
    elevation: 8 
  },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
  fullImage: { width: '90%', height: '80%' }
});

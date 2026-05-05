import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ShieldCheck, 
  User, 
  UserPlus, 
  Clock, 
  ChevronRight, 
  Bell,
  Truck
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { visitorApi } from '../../services/api';
import { Card, Button, PhotoModal } from '../../components/UI';

export default function ResidentHomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Photo Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | undefined>(undefined);
  const [selectedVisitorName, setSelectedVisitorName] = useState('');

  const fetchData = async () => {
    try {
      const res = await visitorApi.getMyUnitEntries();
      const all = res.data.data;
      
      const pending = all.filter((e: any) => e.status === 'PENDING_APPROVAL');
      setPendingCount(pending.length);
      
      const today = all.filter((e: any) => {
        const date = new Date(e.createdAt);
        const now = new Date();
        return date.toDateString() === now.toDateString();
      }).slice(0, 3);
      
      setTodayVisitors(today);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const mutedColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcome, { color: mutedColor }]}>Welcome back,</Text>
          <Text style={[styles.name, { color: colors.text }]}>{user?.firstName || 'Resident'}</Text>
        </View>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Bell size={22} color={colors.primary} />
          {pendingCount > 0 && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Pending Approval Alert */}
        {pendingCount > 0 && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Visitors')}>
            <Card style={styles.alertCard}>
              <View style={styles.alertLeft}>
                <View style={styles.alertIconWrapper}>
                  <Clock size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.alertTitle}>{pendingCount} Pending Requests</Text>
                  <Text style={styles.alertSub}>Visitors are waiting for approval</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#fff" opacity={0.6} />
            </Card>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: mutedColor }]}>FAST ACCESS</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('AddPreApproved')}>
            <Card style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : '#E8F5E9' }]}>
                <UserPlus size={28} color={isDark ? '#81C784' : '#2E7D32'} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Pre-Approve</Text>
              <Text style={[styles.actionSub, { color: mutedColor }]}>Invite Guest</Text>
            </Card>
          </TouchableOpacity>
          <View style={{ width: 16 }} />
          <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('Services')}>
            <Card style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(255, 183, 77, 0.15)' : '#FFF3E0' }]}>
                <Truck size={28} color={isDark ? '#FFB74D' : '#E65100'} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Services</Text>
              <Text style={[styles.actionSub, { color: mutedColor }]}>Daily Help</Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Today's Activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: mutedColor, marginBottom: 0 }]}>RECENT ACTIVITY</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Visitors')}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>History</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : todayVisitors.length > 0 ? (
          todayVisitors.map((item: any) => (
            <Card key={item.id} style={styles.visitorCard}>
              <View style={styles.visitorMain}>
                <TouchableOpacity onPress={() => {
                  setSelectedPhoto(item.photoUrl);
                  setSelectedVisitorName(item.visitor?.name || 'Visitor');
                  setModalVisible(true);
                }}>
                  <Image source={{ uri: item.photoUrl || undefined }} style={styles.visitorImg} />
                </TouchableOpacity>
                <View style={styles.visitorInfo}>
                  <Text style={[styles.visitorName, { color: colors.text }]}>{item.visitor?.name || 'Visitor'}</Text>
                  <Text style={[styles.visitorType, { color: mutedColor }]}>{item.type?.replace('_', ' ') || 'GUEST'}</Text>
                </View>
              </View>
              <View style={[
                styles.statusTag, 
                { backgroundColor: item.status === 'APPROVED' ? (isDark ? 'rgba(76, 175, 80, 0.1)' : '#E8F5E9') : (isDark ? 'rgba(255, 183, 77, 0.1)' : '#FFF3E0') }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: item.status === 'APPROVED' ? (isDark ? '#81C784' : '#2E7D32') : (isDark ? '#FFB74D' : '#E65100') }
                ]}>
                  {item.status?.split('_')[0] || 'PENDING'}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.empty}>
            <User size={48} color={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
            <Text style={[styles.emptyText, { color: mutedColor }]}>No activity recorded today</Text>
          </View>
        )}

        {/* Community Banner */}
        <Card style={styles.banner}>
          <ShieldCheck size={60} color="rgba(255,255,255,0.1)" style={styles.bannerIcon} />
          <Text style={styles.bannerTitle}>KLB Security</Text>
          <Text style={styles.bannerSub}>Smart gate management for your peace of mind.</Text>
        </Card>
      </ScrollView>

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
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 20 
  },
  welcome: { fontSize: 15, fontWeight: '600' },
  name: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  iconBtn: { 
    width: 52, 
    height: 52, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1.5 
  },
  badge: { 
    position: 'absolute', 
    top: 15, 
    right: 15, 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#FF5252',
    borderWidth: 2,
    borderColor: '#fff'
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  alertCard: { 
    backgroundColor: '#2E7D32', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 28,
    borderWidth: 0,
    elevation: 10,
    shadowOpacity: 0.4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 10 },
  },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  alertIconWrapper: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  alertTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  alertSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 16 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 36, 
    marginBottom: 16 
  },
  viewAll: { fontSize: 14, fontWeight: '800' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionCard: { flex: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 12, marginBottom: 0 },
  actionIcon: { 
    width: 64, 
    height: 64, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  actionText: { fontSize: 15, fontWeight: '800' },
  actionSub: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  visitorCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 12, 
    paddingRight: 16,
    marginBottom: 14 
  },
  visitorMain: { flexDirection: 'row', alignItems: 'center' },
  visitorImg: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#f0f0f0' },
  visitorInfo: { marginLeft: 16 },
  visitorName: { fontSize: 17, fontWeight: 'bold' },
  visitorType: { fontSize: 12, marginTop: 4, fontWeight: '700', textTransform: 'uppercase' },
  statusTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  empty: { alignItems: 'center', padding: 50 },
  emptyText: { marginTop: 16, fontSize: 15, fontWeight: '600' },
  banner: { 
    backgroundColor: '#1B5E20', 
    padding: 28, 
    marginTop: 36, 
    borderWidth: 0,
    elevation: 0
  },
  bannerIcon: { position: 'absolute', top: -15, right: -15 },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  bannerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 22, fontWeight: '500' }
});

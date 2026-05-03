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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ShieldCheck, 
  User, 
  UserPlus, 
  Clock, 
  ChevronRight, 
  Bell,
  PlusCircle,
  Truck
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { visitorApi } from '../../services/api';

export default function ResidentHomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await visitorApi.getMyUnitEntries();
      const all = res.data.data;
      
      const pending = all.filter((e: any) => e.status === 'PENDING_APPROVAL');
      setPendingCount(pending.length);
      
      // Filter for today
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
    const interval = setInterval(fetchData, 10000); // Auto refresh every 10s for notifications
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
        <View>
          <Text style={styles.welcome}>Welcome Home,</Text>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Bell size={24} color="#1B5E20" />
          {pendingCount > 0 && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
      >
        {/* Pending Approval Alert */}
        {pendingCount > 0 && (
          <TouchableOpacity 
            style={styles.alertCard} 
            onPress={() => navigation.navigate('Visitors')}
          >
            <View style={styles.alertLeft}>
              <View style={styles.alertIcon}>
                <Clock size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.alertTitle}>{pendingCount} Pending Approvals</Text>
                <Text style={styles.alertSub}>Visitors waiting at the gate</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#fff" opacity={0.7} />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AddPreApproved')}>
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <UserPlus size={24} color="#2E7D32" />
            </View>
            <Text style={styles.actionText}>Add Guest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { marginLeft: 16 }]} onPress={() => navigation.navigate('Services')}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Truck size={24} color="#E65100" />
            </View>
            <Text style={styles.actionText}>Add Service</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY'S VISITORS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Visitors')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#2E7D32" style={{ marginTop: 20 }} />
        ) : todayVisitors.length > 0 ? (
          todayVisitors.map((item: any) => (
            <View key={item.id} style={[styles.visitorCard, { backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Image source={{ uri: item.photoUrl }} style={styles.visitorImg} />
              <View style={styles.visitorInfo}>
                <Text style={[styles.visitorName, { color: colors.text }]}>{item.visitor.name}</Text>
                <Text style={styles.visitorType}>{item.type}</Text>
              </View>
              <View style={[
                styles.statusTag, 
                { backgroundColor: item.status === 'APPROVED' ? (isDark ? '#1B5E20' : '#E8F5E9') : (isDark ? '#E6510033' : '#FFF3E0') }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: item.status === 'APPROVED' ? (isDark ? '#A5D6A7' : '#2E7D32') : (isDark ? '#FFB74D' : '#E65100') }
                ]}>
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <User size={40} color="#ccc" />
            <Text style={styles.emptyText}>No visitors recorded today</Text>
          </View>
        )}

        {/* Community Banner */}
        <View style={styles.banner}>
          <ShieldCheck size={40} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
          <Text style={styles.bannerTitle}>Community Verified</Text>
          <Text style={styles.bannerSub}>Your safety is our priority. All visitors are screened at the gate.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 20 },
  welcome: { fontSize: 14, color: '#999', fontWeight: '500' },
  name: { fontSize: 24, fontWeight: 'bold' },
  notifBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 12, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF5252', borderWidth: 2, borderColor: '#fff' },
  scrollContent: { padding: 20 },
  alertCard: { backgroundColor: '#2E7D32', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, shadowColor: '#2E7D32', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  alertIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  alertTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  alertSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#999', letterSpacing: 2, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 16 },
  viewAll: { fontSize: 12, fontWeight: 'bold', color: '#2E7D32' },
  actionRow: { flexDirection: 'row' },
  actionCard: { flex: 1, borderRadius: 24, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  actionIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionText: { fontSize: 14, fontWeight: 'bold' },
  visitorCard: { backgroundColor: '#fff', borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  visitorImg: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#f0f0f0' },
  visitorInfo: { flex: 1, marginLeft: 16 },
  visitorName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  visitorType: { fontSize: 11, color: '#999', marginTop: 2, fontWeight: 'bold' },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#ccc', marginTop: 12, fontSize: 14 },
  banner: { backgroundColor: '#1B5E20', borderRadius: 32, padding: 32, marginTop: 40, overflow: 'hidden' },
  bannerIcon: { position: 'absolute', top: -10, right: -10 },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  bannerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 20 }
});

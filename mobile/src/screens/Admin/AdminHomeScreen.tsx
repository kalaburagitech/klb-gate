import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { 
  Shield, 
  Users, 
  Building2, 
  MapPin, 
  Activity,
  ArrowUpRight,
  UserCheck,
  TrendingUp,
  Home,
  UserPlus
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function AdminHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [expected, setExpected] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const fetchData = async () => {
    try {
      const statsRes = await api.get('admin/stats');
      setStats(statsRes.data.data);

      if (['GUARD', 'OFFICER', 'TENANT_ADMIN'].includes(user?.role)) {
        const entryRes = await api.get('entries/all');
        setEntries(entryRes.data.data.slice(0, 3));
        
        const expectedRes = await api.get('visitors/pre-approved');
        setExpected(expectedRes.data.data.slice(0, 3));
      }
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLetIn = async (entryId: string) => {
    try {
      await api.post(`entries/${entryId}/checkin`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLetOut = async (entryId: string) => {
    try {
      await api.post('entries/checkout', { entryId });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderStatCard = (label: string, value: number, icon: any, color: string) => (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, { size: 24, color: color })}
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value || 0}</Text>
      <Text style={[styles.statLabel, { color: colors.text + '60' }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.text + '60' }]}>
            {user?.tenant?.name || user?.organization?.name || 'Command Center'}
          </Text>
          <Text style={[styles.adminName, { color: colors.primary }]} numberOfLines={1}>{user?.firstName} {user?.lastName}</Text>
          <View style={[styles.roleBadge, { backgroundColor: isDark ? colors.primary + '15' : '#E8F5E9' }]}>
            <Shield size={10} color={isDark ? colors.primary : "#2E7D32"} />
            <Text style={[styles.roleText, { color: isDark ? colors.primary : "#2E7D32" }]}>{user?.role.replace('_', ' ')}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStats} tintColor={colors.primary} color={colors.primary} />}
      >
        <Text style={[styles.sectionTitle, { color: colors.text + '40' }]}>PLATFORM OVERVIEW</Text>
        
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              {user?.role === 'SUPER_ADMIN' && (
                <>
                  {renderStatCard('Organizations', stats?.totalOrganizations, Building2, '#1E88E5')}
                  {renderStatCard('Service Regions', stats?.totalRegions, MapPin, '#8E24AA')}
                  {renderStatCard('Total Societies', stats?.totalSocieties, Home, '#2E7D32')}
                  {renderStatCard('Total Residents', stats?.totalResidents, Users, '#F4511E')}
                </>
              )}

              {user?.role === 'ORG_ADMIN' && (
                <>
                  {renderStatCard('My Regions', stats?.totalRegions, MapPin, '#8E24AA')}
                  {renderStatCard('My Societies', stats?.totalSocieties, Home, '#2E7D32')}
                  {renderStatCard('Total Residents', stats?.totalResidents, Users, '#F4511E')}
                </>
              )}

              {user?.role === 'TENANT_ADMIN' && (
                <>
                  {renderStatCard('Society Users', stats?.totalUsers, UserCheck, '#2E7D32')}
                  {renderStatCard('Total Units', stats?.totalUnits, Home, '#1E88E5')}
                  {renderStatCard('Visitor Entries', stats?.totalVisitorEntries, Activity, '#F4511E')}
                </>
              )}
            </View>

            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <View style={styles.analyticsIconBox}>
                  <TrendingUp size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.analyticsTitle}>System Activity</Text>
                  <Text style={styles.analyticsSub}>Real-time monitoring active</Text>
                </View>
              </View>
              <View style={styles.pulseContainer}>
                <View style={styles.pulseBar} />
                <View style={[styles.pulseBar, { height: 40, opacity: 0.7 }]} />
                <View style={[styles.pulseBar, { height: 60, opacity: 0.9 }]} />
                <View style={[styles.pulseBar, { height: 30, opacity: 0.5 }]} />
                <View style={[styles.pulseBar, { height: 50, opacity: 0.8 }]} />
                <View style={[styles.pulseBar, { height: 20, opacity: 0.4 }]} />
              </View>
              <TouchableOpacity style={styles.viewDetailedBtn}>
                <Text style={styles.viewDetailedText}>View Detailed Reports</Text>
                <ArrowUpRight size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {['GUARD', 'OFFICER', 'TENANT_ADMIN'].includes(user?.role) && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 32, color: colors.text + '40' }]}>EXPECTED GUESTS</Text>
                {expected.length > 0 ? (
                  expected.map((item) => (
                    <View key={item.id} style={[styles.entryCard, { backgroundColor: colors.card }]}>
                      <View style={styles.entryLeft}>
                        <View style={styles.entryInfo}>
                          <Text style={[styles.entryName, { color: colors.primary }]}>{item.visitorName}</Text>
                          <Text style={[styles.entrySub, { color: colors.text + '60' }]}>
                            Code: {item.code} • Expected today
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: isDark ? colors.text + '10' : '#f0f0f0' }]}>
                        <Text style={[styles.statusBadgeText, { color: colors.text + '40' }]}>EXPECTED</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { color: colors.text + '30' }]}>No expected guests today</Text>
                )}

                <Text style={[styles.sectionTitle, { marginTop: 32, color: colors.text + '40' }]}>GATE ACTIVITY</Text>
                {entries.length > 0 ? (
                  entries.map((item) => (
                    <View key={item.id} style={[styles.entryCard, { backgroundColor: colors.card }]}>
                      <View style={styles.entryLeft}>
                        <View style={styles.entryInfo}>
                          <Text style={[styles.entryName, { color: colors.primary }]}>{item.visitor?.name}</Text>
                          <Text style={[styles.entrySub, { color: colors.text + '60' }]}>
                            Unit {item.unitNumber} • {item.status.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.entryActions}>
                        {item.status === 'APPROVED' && (
                          <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]} 
                            onPress={() => handleLetIn(item.id)}
                          >
                            <Text style={styles.actionBtnText}>LET IN</Text>
                          </TouchableOpacity>
                        )}
                        {item.status === 'CHECKED_IN' && (
                          <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: '#F4511E' }]} 
                            onPress={() => handleLetOut(item.id)}
                          >
                            <Text style={styles.actionBtnText}>LET OUT</Text>
                          </TouchableOpacity>
                        )}
                        {item.status === 'CHECKED_OUT' && (
                          <View style={[styles.statusBadge, { backgroundColor: isDark ? colors.text + '10' : '#f0f0f0' }]}>
                            <Text style={[styles.statusBadgeText, { color: colors.text + '40' }]}>OUT</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { color: colors.text + '30' }]}>No recent activity at the gate</Text>
                )}
              </>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 32, color: colors.text + '40' }]}>QUICK MANAGEMENT</Text>
            <TouchableOpacity style={[styles.manageCard, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('Users', { screen: 'AddUser' })}>
              <View style={styles.manageLeft}>
                <View style={[styles.manageIcon, { backgroundColor: isDark ? colors.primary + '20' : '#E8F5E9' }]}>
                  <UserPlus size={24} color={isDark ? colors.primary : "#2E7D32"} />
                </View>
                <View>
                  <Text style={[styles.manageTitle, { color: colors.text }]}>Onboard Personnel</Text>
                  <Text style={[styles.manageSub, { color: colors.text + '60' }]}>Register new residents or staff</Text>
                </View>
              </View>
              <ArrowUpRight size={20} color={colors.text + '30'} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.manageCard, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('Users')}>
              <View style={styles.manageLeft}>
                <View style={[styles.manageIcon, { backgroundColor: isDark ? '#1E88E520' : '#E1F5FE' }]}>
                  <Users size={24} color={isDark ? "#42A5F5" : "#0288D1"} />
                </View>
                <View>
                  <Text style={[styles.manageTitle, { color: colors.text }]}>User Management</Text>
                  <Text style={[styles.manageSub, { color: colors.text + '60' }]}>Audit and manage system access</Text>
                </View>
              </View>
              <ArrowUpRight size={20} color={colors.text + '30'} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.manageCard, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('Security')}>
              <View style={styles.manageLeft}>
                <View style={[styles.manageIcon, { backgroundColor: isDark ? '#8E24AA20' : '#F3E5F5' }]}>
                  <Activity size={24} color={isDark ? "#BA68C8" : "#7B1FA2"} />
                </View>
                <View>
                  <Text style={[styles.manageTitle, { color: colors.text }]}>Security Logs</Text>
                  <Text style={[styles.manageSub, { color: colors.text + '60' }]}>Track gate activity and incidents</Text>
                </View>
              </View>
              <ArrowUpRight size={20} color={colors.text + '30'} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24, 
    paddingTop: 60, 
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5
  },
  greeting: { fontSize: 13, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' },
  adminName: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  roleBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8, 
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 6
  },
  roleText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  profileBtn: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden' },
  avatar: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  scrollContent: { padding: 20, paddingTop: 30 },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statCard: { 
    width: (width - 56) / 2, 
    borderRadius: 28, 
    padding: 20, 
    shadowColor: '#000', 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 2 
  },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  analyticsCard: { 
    backgroundColor: '#1B5E20', 
    borderRadius: 32, 
    padding: 24, 
    marginTop: 24,
    shadowColor: '#1B5E20',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8
  },
  analyticsHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  analyticsIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  analyticsTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  analyticsSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  pulseContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80, marginVertical: 20, paddingHorizontal: 10 },
  pulseBar: { width: 8, height: 50, backgroundColor: '#fff', borderRadius: 4, opacity: 0.6 },
  viewDetailedBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    paddingVertical: 12, 
    borderRadius: 16,
    gap: 8
  },
  viewDetailedText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  manageCard: { 
    borderRadius: 24, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1
  },
  manageLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  manageIcon: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  manageTitle: { fontSize: 16, fontWeight: 'bold' },
  manageSub: { fontSize: 12, marginTop: 2 },
  entryCard: { 
    borderRadius: 24, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1
  },
  entryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  entryInfo: { },
  entryName: { fontSize: 16, fontWeight: 'bold' },
  entrySub: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  entryActions: { },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginVertical: 20, fontSize: 13 }
});

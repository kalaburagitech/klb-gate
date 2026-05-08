import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { Plus, ClipboardList, Shield, User, ArrowRight, Clock, Settings, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/Card';
import { visitorApi, getMediaUrl } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [recentEntries, setRecentEntries] = React.useState([]);
  const isFetching = React.useRef(false);
  const [loading, setLoading] = React.useState(true);

  const fetchRecentActivity = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await visitorApi.getAll();
      setRecentEntries(res.data.data.slice(0, 3));
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRecentActivity();
      const interval = setInterval(fetchRecentActivity, 30000); // 30s refresh
      return () => clearInterval(interval);
    }, [])
  );

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
        <Icon size={22} color={color} />
      </View>
      <View>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.text + '60' }]}>{title}</Text>
      </View>
    </View>
  );

  const ActionCard = ({ title, sub, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity 
      style={[
        styles.actionCard, 
        { backgroundColor: colors.card, borderColor: colors.border }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.actionIconCircle, { backgroundColor: color }]}>
        <Icon size={26} color="#fff" />
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.actionSub, { color: colors.text + '50' }]} numberOfLines={1}>{sub}</Text>
      </View>
      <View style={[styles.arrowCircle, { backgroundColor: isDark ? '#fff1' : '#00000005' }]}>
        <ArrowRight size={14} color={colors.text + '40'} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Dynamic Background Element */}
      <View style={[styles.bgBlob, { backgroundColor: colors.primary + '08', top: -100, right: -100 }]} />
      <View style={[styles.bgBlob, { backgroundColor: '#FF980005', bottom: -100, left: -100, width: 300, height: 300 }]} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: insets.top + 20 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text + '50' }]}>GATE TERMINAL</Text>
            <Text style={[styles.name, { color: colors.text }]}>Security Guard</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusIndicator, { backgroundColor: '#4CAF5020', borderColor: '#4CAF5040' }]}>
              <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.statusText, { color: '#4CAF50' }]}>SECURE</Text>
            </View>
            <TouchableOpacity 
              style={[styles.profileBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Profile')}
            >
              <User size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard title="Today Entries" value={recentEntries.length > 0 ? "24" : "0"} icon={User} color={colors.primary} />
          <StatCard title="Active Now" value="08" icon={Shield} color="#FF9800" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={[styles.statusPill, { backgroundColor: '#4CAF5015' }]}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={[styles.statusPillText, { color: '#4CAF50' }]}>Live</Text>
          </View>
        </View>
        
        <View style={styles.actionGrid}>
          <ActionCard 
            title="Pre-approved" 
            sub="Scan Invite" 
            icon={ClipboardList} 
            color="#2E7D32" 
            onPress={() => navigation.navigate('Activity', { filter: 'PRE_APPROVED' })} 
          />
          <ActionCard 
            title="Activity Feed" 
            sub="Check Pending" 
            icon={Clock} 
            color="#F57C00" 
            onPress={() => navigation.navigate('Activity', { filter: 'PENDING' })} 
          />
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.mainAction, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddVisitor')}
          >
            <View style={styles.actionIconRound}>
              <User size={32} color="#fff" />
            </View>
            <View>
              <Text style={styles.mainActionTitle}>ADD VISITOR</Text>
              <Text style={styles.mainActionSub}>Tap to start registration</Text>
            </View>
            <ArrowRight size={24} color="#fff" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Activity', { filter: 'PENDING' })}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {recentEntries.length > 0 ? (
            recentEntries.map((item: any, idx: number) => (
              <View 
                key={item.id || idx} 
                style={[
                  styles.activityBubble, 
                  { backgroundColor: colors.card, borderColor: colors.border }
                ]}
              >
                <View style={[styles.activityIcon, { backgroundColor: colors.primary + '15' }]}>
                  {item.photoUrl ? (
                    <Image source={{ uri: getMediaUrl(item.photoUrl) }} style={styles.bubbleAvatar} />
                  ) : (
                    <User size={18} color={colors.primary} />
                  )}
                </View>
                <View style={styles.bubbleContent}>
                  <View style={styles.bubbleHeader}>
                    <Text style={[styles.nameText, { color: colors.text }]}>{item.visitor?.name || 'Guest'}</Text>
                    <Text style={[styles.timeText, { color: colors.text + '40' }]}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={[styles.unitText, { color: colors.text + '60' }]}>Unit {item.unitNumber}</Text>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text + '20' }} />
                    <Text style={[
                      styles.statusText, 
                      { color: item.status === 'PENDING_APPROVAL' ? '#E65100' : '#4CAF50' }
                    ]}>
                      {item.status === 'PENDING_APPROVAL' ? 'WAITING' : 'CHECKED IN'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.emptyActivity, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.text + '40', fontStyle: 'italic' }}>No recent activity detected</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.historyCard, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Activity', { filter: 'HISTORY' })}
        >
          <View>
            <Text style={styles.historyTitle}>Full History Logs</Text>
            <Text style={styles.historySub}>Review all past gate interactions</Text>
          </View>
          <View style={styles.historyArrow}>
            <ArrowRight size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgBlob: { position: 'absolute', width: 400, height: 400, borderRadius: 200, opacity: 0.6 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    marginBottom: 32 
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 20, 
    borderWidth: 1,
    gap: 6
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  greeting: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  name: { fontSize: 26, fontWeight: '900', marginTop: 2, letterSpacing: -0.5 },
  profileBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
  },
  activeBadge: { 
    position: 'absolute', 
    top: -2, 
    right: -2, 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    borderWidth: 2, 
    borderColor: '#fff' 
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12
  },
  statCard: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  statIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statTitle: { fontSize: 11, fontWeight: '700' },
  
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    marginBottom: 16 
  },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },

  actionGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 16,
    marginBottom: 24
  },
  actionCard: { 
    width: '46%', 
    margin: '2%',
    padding: 20, 
    borderRadius: 28, 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  actionIconCircle: { 
    width: 52, 
    height: 52, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 16,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  actionTextContainer: { marginBottom: 12 },
  actionTitle: { fontSize: 16, fontWeight: '800' },
  actionSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  arrowCircle: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    alignSelf: 'flex-end'
  },
  
  quickActions: { paddingHorizontal: 24, marginBottom: 32 },
  mainAction: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 24, 
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15
  },
  actionIconRound: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  mainActionTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  mainActionSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },

  activityList: { paddingHorizontal: 24, marginBottom: 30 },
  activityBubble: { 
    flexDirection: 'row', 
    padding: 16, 
    borderRadius: 24, 
    borderBottomLeftRadius: 4,
    marginBottom: 12, 
    borderWidth: 1,
    alignItems: 'center'
  },
  bubbleAvatar: { width: '100%', height: '100%', borderRadius: 12 },
  bubbleContent: { flex: 1, marginLeft: 12 },
  bubbleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  nameText: { fontSize: 16, fontWeight: '800' },
  timeText: { fontSize: 10, fontWeight: 'bold' },
  unitText: { fontSize: 12, fontWeight: '600' },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  emptyActivity: { padding: 30, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center' },

  historyCard: { 
    marginHorizontal: 24, 
    padding: 24, 
    borderRadius: 32, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8
  },
  historyTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  historySub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  historyArrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Plus, ClipboardList, Shield, User, ArrowRight, Clock, Settings, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/Card';

export default function DashboardScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <View>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.text + '60' }]}>{title}</Text>
      </View>
    </View>
  );

  const ActionCard = ({ title, sub, icon: Icon, color, onPress, fullWidth }: any) => (
    <TouchableOpacity 
      style={[
        styles.actionCard, 
        { backgroundColor: colors.card, borderColor: colors.border },
        fullWidth && styles.fullWidthCard
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIconCircle, { backgroundColor: color }]}>
        <Icon size={24} color="#fff" />
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: insets.top + 20 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text + '60' }]}>Security Gate,</Text>
            <Text style={[styles.name, { color: colors.text }]}>KLB Guard Panel</Text>
          </View>
          <TouchableOpacity 
            style={[styles.profileBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <User size={24} color={colors.primary} />
            <View style={[styles.activeBadge, { backgroundColor: '#4CAF50' }]} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatCard title="Total Entries" value="24" icon={User} color={colors.primary} />
          <StatCard title="Active Logs" value="08" icon={ClipboardList} color="#FF9800" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <Shield size={18} color={colors.primary + '60'} />
        </View>
        
        <View style={styles.actionGrid}>
          <ActionCard 
            title="Add Visitor" 
            sub="Check-in guest" 
            icon={Plus} 
            color={colors.primary} 
            onPress={() => navigation.navigate('AddVisitor')} 
          />
          <ActionCard 
            title="Pre-approved" 
            sub="Verify code" 
            icon={ClipboardList} 
            color="#2E7D32" 
            onPress={() => navigation.navigate('PreApprovedList')} 
          />
          <ActionCard 
            title="Daily Service" 
            sub="Milk, Maid, etc." 
            icon={Zap} 
            color="#00897B" 
            onPress={() => navigation.navigate('DailyServiceList')} 
          />
          <ActionCard 
            title="Pending" 
            sub="Wait for Resident" 
            icon={Clock} 
            color="#F57C00" 
            onPress={() => navigation.navigate('Pending')} 
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginHorizontal: 24, marginTop: 10, marginBottom: 15 }]}>Audit & History</Text>
        
        <View style={{ paddingHorizontal: 24 }}>
          <ActionCard 
            title="Entry Logs" 
            sub="Complete historical visitation data" 
            icon={ClipboardList} 
            color="#1976D2" 
            onPress={() => navigation.navigate('Logs')} 
            fullWidth
          />
        </View>

        <TouchableOpacity 
          style={[styles.settingsItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.settingsLeft}>
            <View style={[styles.settingsIcon, { backgroundColor: isDark ? '#fff1' : '#f0f0f0' }]}>
              <Settings size={20} color={colors.text + '80'} />
            </View>
            <View>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Terminal Settings</Text>
              <Text style={[styles.settingsSub, { color: colors.text + '40' }]}>Configure gate device</Text>
            </View>
          </View>
          <ArrowRight size={18} color={colors.text + '20'} />
        </TouchableOpacity>
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
    paddingHorizontal: 24, 
    marginBottom: 32 
  },
  greeting: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  profileBtn: { 
    width: 52, 
    height: 52, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
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
    padding: 16, 
    borderRadius: 24,
    borderWidth: 1,
    gap: 12
  },
  statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statTitle: { fontSize: 11, fontWeight: '600' },
  
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    marginBottom: 16 
  },
  sectionTitle: { fontSize: 20, fontWeight: '900' },
  
  actionGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 18,
    marginBottom: 20
  },
  actionCard: { 
    width: '45%', 
    margin: '2.5%',
    padding: 20, 
    borderRadius: 32, 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  fullWidthCard: { width: '95%' },
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
  actionTitle: { fontSize: 16, fontWeight: 'bold' },
  actionSub: { fontSize: 11, fontWeight: '500', marginTop: 4 },
  arrowCircle: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    alignSelf: 'flex-end'
  },
  
  settingsItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    borderRadius: 28, 
    borderWidth: 1,
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 40
  },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  settingsIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  settingsTitle: { fontSize: 16, fontWeight: 'bold' },
  settingsSub: { fontSize: 12, fontWeight: '500', marginTop: 2 }
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Plus, ClipboardList, Shield, User, ArrowRight, Clock, Settings, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/Card';

export default function DashboardScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.text + '80' }]}>{title}</Text>
    </Card>
  );

  const ActionButton = ({ title, sub, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.mainAction, { backgroundColor: color }]}
      onPress={onPress}
    >
      <View style={styles.actionLeft}>
        <Icon size={28} color="#fff" />
        <View>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSub}>{sub}</Text>
        </View>
      </View>
      <ArrowRight size={20} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingHorizontal: 20, paddingTop: insets.top }}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text + '80' }]}>Security Gate,</Text>
            <Text style={[styles.name, { color: colors.text }]}>KLB Guard Panel</Text>
          </View>
          <TouchableOpacity 
            style={[styles.profileBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <User size={24} color="#fff" />
          </TouchableOpacity>
        </View>

      <View style={styles.statsRow}>
        <StatCard title="Today's Entries" value="24" icon={User} color={colors.primary} />
        <StatCard title="Active Logs" value="08" icon={ClipboardList} color="#FF9800" />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      
      <ActionButton 
        title="Add Visitor" 
        sub="Check-in new guest" 
        icon={Plus} 
        color={colors.primary} 
        onPress={() => navigation.navigate('AddVisitor')} 
      />
      
      <ActionButton 
        title="Pre-approved Entry" 
        sub="View shared codes & guests" 
        icon={ClipboardList} 
        color="#2E7D32" 
        onPress={() => navigation.navigate('PreApprovedList')} 
      />

      <ActionButton 
        title="Daily Service" 
        sub="Milk, Maid, Cleaning, etc." 
        icon={Zap} 
        color="#00897B" 
        onPress={() => navigation.navigate('DailyServiceList')} 
      />

      <ActionButton 
        title="Pending Approvals" 
        sub="Wait for resident confirmation" 
        icon={Clock} 
        color="#F57C00" 
        onPress={() => navigation.navigate('Pending')} 
      />

      <ActionButton 
        title="Entry Logs" 
        sub="View historical data" 
        icon={ClipboardList} 
        color="#1976D2" 
        onPress={() => navigation.navigate('Logs')} 
      />

      <TouchableOpacity 
        style={[styles.secondaryAction, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('Profile')}
      >
        <View style={styles.actionLeft}>
          <Settings size={24} color={colors.primary} />
          <View>
            <Text style={[styles.actionTitleSec, { color: colors.text }]}>My Profile</Text>
            <Text style={[styles.actionSubSec, { color: colors.text + '60' }]}>View your details</Text>
          </View>
        </View>
        <ArrowRight size={20} color={colors.primary} />
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 30 },
  greeting: { fontSize: 16 },
  name: { fontSize: 24, fontWeight: 'bold' },
  profileBtn: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { width: '47%', alignItems: 'center', padding: 20 },
  iconBox: { padding: 12, borderRadius: 15, marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statTitle: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  mainAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 24, marginBottom: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  actionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  actionSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  secondaryAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 40 },
  actionTitleSec: { fontSize: 18, fontWeight: 'bold' },
  actionSubSec: { fontSize: 14 },
});

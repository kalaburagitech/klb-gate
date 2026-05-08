import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Clock, User, LogIn, LogOut, Home, ArrowRight, ShieldCheck, ShieldAlert, Phone } from 'lucide-react-native';
import { visitorApi } from '../../services/api';

export default function EntryLogsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await visitorApi.getAll();
      setLogs(res.data.data);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleAction = async (entryId: string, action: 'checkin' | 'checkout') => {
    try {
      if (action === 'checkin') {
        await visitorApi.checkIn(entryId);
        Alert.alert('Success', 'Access Granted - Gate Open');
      } else {
        await visitorApi.checkOut(entryId);
        Alert.alert('Success', 'Visitor Exit Recorded');
      }
      fetchLogs();
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
      default: return { label: status, color: '#666', icon: User };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Gate Activity</Text>
        <Text style={[styles.subtitle, { color: colors.text + '60' }]}>Real-time site visitation logs</Text>
      </View>
      
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLogs(); }} />}
        renderItem={({ item }) => {
          const config = getStatusConfig(item.status);
          const StatusIcon = config.icon;
          
          return (
            <View style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.topRow}>
                <View style={styles.visitorInfo}>
                  {item.photoUrl ? (
                    <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
                      <User size={24} color={colors.text + '20'} />
                    </View>
                  )}
                  <View>
                      <Text style={[styles.name, { color: colors.text }]}>{item.visitor.name}</Text>
                      <View style={styles.phoneRow}>
                        <Phone size={10} color={colors.primary} />
                        <Text style={[styles.phoneText, { color: colors.primary }]}>{item.visitor.phone}</Text>
                      </View>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
                  <StatusIcon size={12} color={config.color} />
                  <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
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

              {item.status === 'APPROVED' || item.status === 'CHECKED_IN' ? (
                <View style={styles.actions}>
                  {item.status === 'APPROVED' && (
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]} 
                      onPress={() => handleAction(item.id, 'checkin')}
                    >
                      <LogIn size={18} color="#fff" />
                      <Text style={styles.actionBtnText}>LET IN</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === 'CHECKED_IN' && (
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: '#1E293B' }]} 
                      onPress={() => handleAction(item.id, 'checkout')}
                    >
                      <LogOut size={18} color="#fff" />
                      <Text style={styles.actionBtnText}>LET OUT (EXIT)</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}

              {item.status === 'PENDING_APPROVAL' && (
                <View style={[styles.pendingNotice, { backgroundColor: isDark ? '#E6510022' : '#FFF3E0' }]}>
                  <ActivityIndicator size="small" color="#E65100" />
                  <Text style={styles.pendingText}>Awaiting Resident Decision...</Text>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 100 }} /> : 
          <View style={styles.empty}>
            <ShieldCheck size={48} color={isDark ? colors.text + '10' : '#E2E8F0'} />
            <Text style={[styles.emptyText, { color: colors.text + '40' }]}>No activity recorded today</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 60, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  logCard: { marginBottom: 16, padding: 16, borderRadius: 24, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  visitorInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#f0f0f0' },
  name: { fontSize: 17, fontWeight: 'bold' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  phoneText: { fontSize: 11, fontWeight: '800' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  detailsRow: { flexDirection: 'row', gap: 16, marginTop: 16, marginBottom: 4 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, fontWeight: '700' },
  actions: { marginTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 16 },
  actionBtn: { height: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  pendingNotice: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16 },
  pendingText: { fontSize: 12, fontWeight: 'bold', color: '#E65100' },
  empty: { alignItems: 'center', marginTop: 150 },
  emptyText: { marginTop: 16, fontSize: 15, fontWeight: 'bold' }
});

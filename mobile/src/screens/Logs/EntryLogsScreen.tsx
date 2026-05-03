import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/Card';
import { Clock, User, LogIn, LogOut, Home, ArrowRight } from 'lucide-react-native';
import { visitorApi } from '../../services/api';

export default function EntryLogsScreen() {
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
        Alert.alert('Success', 'Visitor allowed entry');
      } else {
        await visitorApi.checkOut(entryId);
        Alert.alert('Success', 'Visitor checked out');
      }
      fetchLogs();
    } catch (error) {
      Alert.alert('Error', `Failed to ${action}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#2E7D32';
      case 'CHECKED_IN': return '#1976D2';
      case 'CHECKED_OUT': return '#64748B';
      case 'REJECTED': return '#D32F2F';
      case 'PENDING_APPROVAL': return '#E65100';
      default: return '#666';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Site Activity Logs</Text>
      
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLogs(); }} />}
        renderItem={({ item }) => (
          <Card style={styles.logCard}>
            <View style={styles.topRow}>
              <View style={styles.visitorInfo}>
                <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
                <View>
                  <Text style={[styles.name, { color: colors.text }]}>{item.visitor.name}</Text>
                  <View style={styles.metaRow}>
                    <Home size={12} color={isDark ? colors.text + '40' : '#666'} />
                    <Text style={[styles.metaText, { color: isDark ? colors.text + '40' : '#666' }]}>Visiting Unit {item.unitNumber}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status === 'PENDING_APPROVAL' ? 'WAITING' : item.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.footer}>
              <View style={styles.timeInfo}>
                <Clock size={14} color={isDark ? colors.text + '30' : "#999"} />
                <Text style={[styles.timeText, { color: colors.text + '40' }]}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <View style={styles.actions}>
                {item.status === 'APPROVED' && (
                  <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: '#2E7D32' }]} 
                    onPress={() => handleAction(item.id, 'checkin')}
                  >
                    <LogIn size={16} color="#fff" />
                    <Text style={styles.btnText}>LET IN</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'CHECKED_IN' && (
                  <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: '#1E293B' }]} 
                    onPress={() => handleAction(item.id, 'checkout')}
                  >
                    <LogOut size={16} color="#fff" />
                    <Text style={styles.btnText}>EXIT</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'PENDING_APPROVAL' && (
                  <View style={[styles.waitingNotice, { backgroundColor: isDark ? '#E6510022' : '#FFF3E0' }]}>
                    <ActivityIndicator size="small" color="#E65100" />
                    <Text style={styles.waitingText}>Awaiting Resident</Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : 
          <View style={styles.empty}><Text style={[styles.emptyText, { color: colors.text + '40' }]}>No activity recorded today</Text></View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
  logCard: { marginBottom: 16, padding: 16, borderRadius: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  visitorInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#f0f0f0' },
  name: { fontSize: 16, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: 'bold' },
  divider: { height: 1, marginVertical: 14 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  btnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  waitingNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  waitingText: { fontSize: 10, fontWeight: 'bold', color: '#E65100' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 14 }
});

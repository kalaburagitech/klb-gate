import React, { useState, useEffect, useCallback } from 'react';
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
import { Clock, Check, X, User, Home, Phone, ArrowRight } from 'lucide-react-native';
import { visitorApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

export default function PendingApprovalsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await visitorApi.getPending();
      setEntries(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPending();
      const interval = setInterval(fetchPending, 30000); // 30 seconds
      return () => clearInterval(interval);
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>Waiting for Approval</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Logs')}>
          <Text style={[styles.viewLogs, { color: colors.primary }]}>View Logs</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: any) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
              <View style={styles.headerInfo}>
                <Text style={[styles.visitorName, { color: colors.text }]}>{item.visitor.name}</Text>
                <View style={styles.unitRow}>
                  <Home size={14} color={isDark ? colors.text + '80' : '#666'} />
                  <Text style={[styles.unitText, { color: isDark ? colors.text + '80' : '#666' }]}>Visiting Flat {item.unitNumber}</Text>
                </View>
              </View>
              <View style={[styles.pendingBadge, { backgroundColor: isDark ? '#E6510033' : '#FFF3E0' }]}>
                <Clock size={12} color="#E65100" />
                <Text style={styles.pendingText}>WAITING</Text>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.footer}>
              <Text style={[styles.infoText, { color: colors.text + '60' }]}>Awaiting resident approval...</Text>
              <TouchableOpacity 
                style={styles.detailBtn}
                onPress={() => navigation.navigate('Logs')}
              >
                <Text style={[styles.detailBtnText, { color: colors.primary }]}>Check Progress</Text>
                <ArrowRight size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPending(); }} />
        }
        ListEmptyComponent={
          loading ? <ActivityIndicator color={colors.primary} /> :
          <View style={styles.emptyState}>
            <Clock size={48} color={isDark ? colors.text + '20' : '#ccc'} />
            <Text style={[styles.emptyText, { color: colors.text + '40' }]}>No visitors currently waiting</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]} 
        onPress={() => (navigation as any).navigate('AddVisitor')}
      >
        <User size={24} color="#fff" />
        <Text style={styles.fabText}>NEW VISITOR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold' },
  viewLogs: { fontWeight: 'bold', fontSize: 14 },
  listContent: { paddingBottom: 100 },
  card: { borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#f0f0f0' },
  headerInfo: { flex: 1, marginLeft: 16 },
  visitorName: { fontSize: 18, fontWeight: 'bold' },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  unitText: { fontSize: 13 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  pendingText: { fontSize: 10, fontWeight: 'bold', color: '#E65100' },
  divider: { height: 1, marginVertical: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoText: { fontSize: 12, fontStyle: 'italic' },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailBtnText: { fontSize: 12, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 120 },
  emptyText: { marginTop: 16 },
  fab: { position: 'absolute', bottom: 30, right: 20, left: 20, height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});

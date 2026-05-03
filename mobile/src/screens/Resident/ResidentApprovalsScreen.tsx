import React, { useState, useEffect } from 'react';
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
import { ShieldCheck, ShieldX, User, Home, Clock } from 'lucide-react-native';
import { visitorApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ResidentApprovalsScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const unitNumber = user?.unitNumber || "";

  const fetchMyEntries = async () => {
    try {
      const res = await visitorApi.getMyUnitEntries();
      // Filter for PENDING in UI or let backend do it
      const pending = res.data.data.filter((e: any) => e.status === 'PENDING_APPROVAL');
      setEntries(pending);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyEntries();
  }, []);

  const handleDecision = async (entryId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await visitorApi.approve({ entryId, status });
      Alert.alert('Success', `Visitor ${status.toLowerCase()}`);
      fetchMyEntries();
    } catch (error) {
      Alert.alert('Error', 'Action failed');
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.visitorName}>{item.visitor.name}</Text>
          <Text style={styles.metaText}>Waiting at the gate</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleDecision(item.id, 'REJECTED')}
        >
          <ShieldX size={20} color="#dc2626" />
          <Text style={styles.rejectText}>REJECT</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleDecision(item.id, 'APPROVED')}
        >
          <ShieldCheck size={20} color="#fff" />
          <Text style={styles.approveText}>APPROVE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator color="#2E7D32" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visitor Requests</Text>
        <View style={styles.unitBadge}><Text style={styles.unitText}>{unitNumber}</Text></View>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMyEntries} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ShieldCheck size={48} color="#ccc" />
            <Text style={styles.emptyText}>All secure. No pending requests.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B5E20' },
  unitBadge: { backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  unitText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  listContent: { paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f0f0' },
  headerInfo: { flex: 1, marginLeft: 16 },
  visitorName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  metaText: { fontSize: 12, color: '#666', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, height: 50, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  rejectButton: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' },
  approveButton: { backgroundColor: '#2E7D32' },
  rejectText: { color: '#dc2626', fontWeight: 'bold', fontSize: 14 },
  approveText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 120 },
  emptyText: { color: '#999', marginTop: 16, fontSize: 14 },
});

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ChevronLeft, Search, User, Home, Clock, CheckCircle, ArrowRight, Clipboard } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { visitorApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function PreApprovedListScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVisits = async () => {
    try {
      const res = await visitorApi.getPreApproved();
      setVisits(res.data.data);
    } catch (e) {
      console.error('Failed to fetch pre-approvals', e);
      Alert.alert('Error', 'Could not load pre-approved list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const filteredVisits = visits.filter(v => 
    v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.resident?.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.resident?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.resident?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.navigate('AddVisitor', { 
        type: 'PRE_APPROVED',
        code: item.code
      })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.guestInfo}>
          <View style={styles.iconCircle}>
            <User size={20} color="#2E7D32" />
          </View>
          <View>
            <Text style={[styles.guestName, { color: colors.text }]}>{item.visitorName}</Text>
            <Text style={styles.guestPhone}>{item.phoneNumber || 'No phone provided'}</Text>
          </View>
        </View>
        <View style={[styles.codeBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.codeText}>{item.code}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Home size={14} color="#666" />
          <Text style={styles.footerText}>Unit {item.resident?.unitNumber} • {item.resident?.firstName} {item.resident?.lastName}</Text>
        </View>
        <View style={styles.footerItem}>
          <Clock size={14} color="#666" />
          <Text style={styles.footerText}>
            {new Date(item.expectedDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.processBtn}>
          <Text style={styles.processText}>CHECK-IN</Text>
          <ArrowRight size={14} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.primary }]}>Pre-approved Guests</Text>
            <Text style={[styles.subtitle, { color: colors.text + '80' }]}>{visits.length} active invitations</Text>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.searchBar, { backgroundColor: isDark ? colors.background : '#F1F5F9' }]}>
            <Search size={20} color={isDark ? colors.text + '50' : '#94A3B8'} />
            <TextInput 
              placeholder="Search name, unit or code..."
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

      <FlatList
        data={filteredVisits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVisits(); }} />}
        ListEmptyComponent={
          loading ? <ActivityIndicator color="#2E7D32" style={{ marginTop: 40 }} /> : (
            <View style={styles.empty}>
              <Clipboard size={60} color="#E2E8F0" />
              <Text style={styles.emptyTitle}>No Pre-approvals Found</Text>
              <Text style={styles.emptySub}>
                {searchQuery ? "Try a different search" : "Residents haven't shared any codes yet"}
              </Text>
            </View>
          )
        }
      />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 24, 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '900' },
  subtitle: { fontSize: 12, color: '#666', fontWeight: '500' },
  searchContainer: { padding: 20, backgroundColor: '#fff' },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 52,
    gap: 12
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  list: { padding: 20 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  guestInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  guestName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  guestPhone: { fontSize: 12, color: '#666', marginTop: 2 },
  codeBadge: { backgroundColor: '#1B5E20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  codeText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#f5f5f5', marginVertical: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: '#666', fontWeight: '600' },
  processBtn: { 
    backgroundColor: '#2E7D32', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  processText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 20 },
  emptySub: { fontSize: 14, color: '#94A3B8', marginTop: 4, textAlign: 'center' }
});

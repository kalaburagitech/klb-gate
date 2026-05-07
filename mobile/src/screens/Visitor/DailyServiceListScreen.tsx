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
  Platform,
  Image
} from 'react-native';
import { ChevronLeft, Search, User, Home, Clock, CheckCircle, ArrowRight, Clipboard, Zap } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api, { visitorApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function DailyServiceListScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const res = await visitorApi.getRecurring();
      setServices(res.data.data);
    } catch (e) {
      console.error('Failed to fetch recurring services', e);
      Alert.alert('Error', 'Could not load daily services');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleQuickCheckIn = async (item: any) => {
    setProcessingId(item.id);
    try {
      // Create a daily service entry automatically
      const res = await visitorApi.requestEntry({
        name: item.name,
        phone: item.phone,
        type: 'DAILY_SERVICE',
        unitNumber: item.resident?.unitNumber,
        residentId: item.residentId,
        purpose: `Daily Service: ${item.serviceType}`,
        photoUrl: 'DAILY_ASSET' // Placeholder or the visitor's stored photo
      });

      if (res.data.success) {
        Alert.alert('Success', `${item.name} has been let in for Unit ${item.resident?.unitNumber}`);
        navigation.goBack();
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Quick check-in failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.resident?.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      disabled={processingId === item.id}
      onPress={() => handleQuickCheckIn(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.guestInfo}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Zap size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.guestName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.guestType, { color: colors.primary }]}>{item.serviceType.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.timeBadge}>
          <Clock size={12} color="#666" />
          <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Home size={14} color="#666" />
          <Text style={[styles.footerText, { color: colors.text + '80' }]}>Unit {item.resident?.unitNumber} • {item.resident?.firstName}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.quickBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleQuickCheckIn(item)}
          disabled={processingId === item.id}
        >
          {processingId === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.quickText}>LET IN</Text>
              <ArrowRight size={14} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.primary }]}>Daily Services</Text>
          <Text style={[styles.subtitle, { color: colors.text + '80' }]}>{services.length} registered workers</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? colors.background : '#F1F5F9' }]}>
          <Search size={20} color={isDark ? colors.text + '50' : '#94A3B8'} />
          <TextInput 
            placeholder="Search service, name or unit..."
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchServices(); }} />}
        ListEmptyComponent={
          loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
            <View style={styles.empty}>
              <Zap size={60} color="#E2E8F0" />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Daily Services Found</Text>
              <Text style={styles.emptySub}>
                Residents haven't registered any recurring workers yet
              </Text>
            </View>
          )
        }
      />
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
  title: { fontSize: 24, fontWeight: '900' },
  subtitle: { fontSize: 13, fontWeight: '600' },
  searchContainer: { padding: 20 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 56,
    gap: 12
  },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '600' },
  list: { padding: 20, paddingTop: 0 },
  card: { 
    borderRadius: 28, 
    padding: 20, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  guestInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  guestName: { fontSize: 18, fontWeight: 'bold' },
  guestType: { fontSize: 10, fontWeight: '900', marginTop: 2, letterSpacing: 1 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  timeText: { fontSize: 10, fontWeight: 'bold', color: '#666' },
  divider: { height: 1, marginVertical: 16, opacity: 0.5 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  footerText: { fontSize: 12, fontWeight: '600' },
  quickBtn: { 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2
  },
  quickText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySub: { fontSize: 14, color: '#94A3B8', marginTop: 4, textAlign: 'center', paddingHorizontal: 40 }
});

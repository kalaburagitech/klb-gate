import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl
} from 'react-native';
import { 
  Search, 
  UserPlus, 
  ChevronRight, 
  User as UserIcon, 
  Shield, 
  Building,
  Trash2,
  Mail,
  Phone,
  Camera,
  X as CloseIcon,
  Edit3,
  MoreVertical
} from 'lucide-react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function UserManagementScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('admin/users');
      setUsers(res.data.data);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      Alert.alert('Error', 'You cannot delete your own account');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`admin/users/${id}`);
              setUsers(users.filter(u => u.id !== id));
            } catch (e) {
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUsers);
    return unsubscribe;
  }, [navigation]);

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return '#D32F2F';
      case 'ORG_ADMIN': return '#7B1FA2';
      case 'TENANT_ADMIN': return '#1976D2';
      case 'GUARD': return '#E65100';
      case 'RESIDENT': return '#2E7D32';
      default: return '#666';
    }
  };

  const renderUser = ({ item }: { item: any }) => (
    <View style={[styles.userCard, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <TouchableOpacity 
          onPress={() => item.photoUrl && setSelectedPhoto(item.photoUrl)}
          style={[styles.avatarContainer, { backgroundColor: isDark ? colors.background : '#F1F8E9' }]}
        >
          {item.photoUrl ? (
            <Image 
              source={{ uri: item.photoUrl }} 
              style={styles.avatarImg} 
            />
          ) : (
            <UserIcon size={24} color={colors.primary} />
          )}
          {item.photoUrl && (
            <View style={[styles.photoBadge, { backgroundColor: colors.primary }]}>
              <Camera size={10} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.mainInfo}>
          <View style={styles.nameBadgeRow}>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
              {item.firstName} {item.lastName}
            </Text>
            <View style={[styles.rolePill, { backgroundColor: getRoleColor(item.role) + (isDark ? '33' : '15') }]}>
              <Text style={[styles.rolePillText, { color: isDark ? '#fff' : getRoleColor(item.role) }]}>
                {item.role.replace('_', ' ')}
              </Text>
            </View>
          </View>
          
          <View style={styles.subDetailRow}>
            <Building size={12} color={colors.text + '40'} />
            <Text style={[styles.societyName, { color: colors.text + '60' }]} numberOfLines={1}>
              {item.tenant?.name || 'Global Access'}
            </Text>
            {item.unitNumber && (
              <View style={styles.dot} />
            )}
            {item.unitNumber && (
              <Text style={[styles.unitText, { color: colors.primary }]}>Unit {item.unitNumber}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.moreBtn}
          onPress={() => navigation.navigate('EditUser', { userId: item.id })}
        >
          <Edit3 size={18} color={colors.text + '40'} />
        </TouchableOpacity>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

      <View style={styles.cardFooter}>
        <View style={styles.contactGroup}>
          <View style={styles.contactItem}>
            <Mail size={12} color={colors.text + '30'} />
            <Text style={[styles.contactLabel, { color: colors.text + '40' }]}>{item.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Phone size={12} color={colors.text + '30'} />
            <Text style={[styles.contactLabel, { color: colors.text + '40' }]}>{item.phoneNumber}</Text>
          </View>
        </View>

        {item.id !== currentUser?.id && (
          <TouchableOpacity 
            style={[styles.deleteActionBtn, { backgroundColor: isDark ? '#FF525222' : '#FFEBEE' }]}
            onPress={() => handleDeleteUser(item.id)}
          >
            <Trash2 size={16} color="#FF5252" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Users</Text>
        <View style={styles.headerBadges}>
          <View style={[styles.countBadge, { backgroundColor: isDark ? colors.primary + '33' : '#E8F5E9' }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>{users.length} Total</Text>
          </View>
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
        <Search size={20} color={isDark ? colors.text + '40' : "#999"} />
        <TextInput 
          placeholder="Search by name or email..."
          placeholderTextColor={isDark ? colors.text + '30' : "#999"}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList 
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <UserIcon size={48} color={isDark ? colors.text + '20' : "#ccc"} />
              <Text style={[styles.emptyText, { color: colors.text + '40' }]}>No users found</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!selectedPhoto} transparent animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedPhoto(null)}>
            <CloseIcon size={28} color="#fff" />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddUser')}
      >
        <UserPlus size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 24, 
    paddingTop: 60, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  title: { fontSize: 32, fontWeight: '900' },
  headerBadges: { flexDirection: 'row', gap: 8 },
  countBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  countText: { fontSize: 12, fontWeight: 'bold' },
  searchBox: { 
    margin: 20, 
    borderRadius: 24, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    height: 60,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600' },
  list: { padding: 20, paddingTop: 0, paddingBottom: 100 },
  userCard: { 
    borderRadius: 32, 
    padding: 16, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden'
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarContainer: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  photoBadge: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  mainInfo: { flex: 1 },
  nameBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  userName: { fontSize: 17, fontWeight: 'bold' },
  rolePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  rolePillText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  subDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  societyName: { fontSize: 12, fontWeight: '600' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#999' },
  unitText: { fontSize: 11, fontWeight: 'bold' },
  moreBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardDivider: { height: 1, marginVertical: 14, opacity: 0.5 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactGroup: { flex: 1, gap: 4 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactLabel: { fontSize: 11, fontWeight: '500' },
  deleteActionBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    width: 64, 
    height: 64, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8
  },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 18, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '80%',
    borderRadius: 20,
  }
});

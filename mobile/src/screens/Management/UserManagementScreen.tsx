import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { 
  Search, 
  UserPlus, 
  ChevronRight, 
  User, 
  Shield, 
  Building,
  Trash2,
  Mail,
  Phone
} from 'lucide-react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function UserManagementScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('admin/users');
      setUsers(res.data.data);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
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
      <View style={[styles.avatar, { backgroundColor: isDark ? colors.background : '#E8F5E9' }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>{item.firstName?.[0]}{item.lastName?.[0]}</Text>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.firstName} {item.lastName}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + (isDark ? '33' : '15') }]}>
            <Text style={[styles.roleText, { color: isDark ? '#fff' : getRoleColor(item.role) }]}>
              {item.role.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <View style={styles.contactRow}>
          <Mail size={12} color={colors.text + '40'} />
          <Text style={[styles.contactText, { color: colors.text + '60' }]}>{item.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Phone size={12} color={colors.text + '40'} />
          <Text style={[styles.contactText, { color: colors.text + '60' }]}>{item.phoneNumber}</Text>
        </View>
        {item.tenant && (
          <View style={styles.tenantRow}>
            <Building size={12} color={colors.primary} />
            <Text style={[styles.tenantText, { color: colors.primary }]}>{item.tenant.name}</Text>
            {item.unitNumber && (
              <View style={[styles.unitBadge, { backgroundColor: isDark ? colors.primary + '33' : '#E8F5E9' }]}>
                <Text style={[styles.unitText, { color: colors.primary }]}>FLAT {item.unitNumber}</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      {item.id !== currentUser?.id && (
        <View style={styles.actionColumn}>
          <TouchableOpacity 
            style={[styles.editBtn, { backgroundColor: isDark ? colors.background : '#E8F5E9' }]}
            onPress={() => navigation.navigate('EditUser', { userId: item.id })}
          >
            <ChevronRight size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.deleteBtn, { backgroundColor: isDark ? '#B71C1C44' : '#FFEBEE' }]}
            onPress={() => handleDeleteUser(item.id)}
          >
            <Trash2 size={18} color="#EF5350" />
          </TouchableOpacity>
        </View>
      )}
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
          ListEmptyComponent={
            <View style={styles.empty}>
              <User size={48} color={isDark ? colors.text + '20' : "#ccc"} />
              <Text style={[styles.emptyText, { color: colors.text + '40' }]}>No users found</Text>
            </View>
          }
        />
      )}

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
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2
  },
  avatar: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, fontWeight: 'bold' },
  userInfo: { flex: 1, marginLeft: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  contactText: { fontSize: 13, fontWeight: '500' },
  tenantRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  tenantText: { fontSize: 12, fontWeight: 'bold' },
  unitBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 4 },
  unitText: { fontSize: 10, fontWeight: '900' },
  actionColumn: { gap: 12 },
  editBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
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
  emptyText: { marginTop: 16, fontSize: 18, fontWeight: '600' }
});

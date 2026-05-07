import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Building,
  CheckCircle,
  X,
  Globe,
  Home,
  ChevronLeft
} from 'lucide-react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditUserScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { userId } = route.params;
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
    tenantId: '',
    unitId: '',
    organizationId: ''
  });

  const fetchData = async () => {
    try {
      const [userRes, tenantsRes, orgsRes] = await Promise.all([
        api.get(`admin/users`), // Assuming we get all users and find ours, or add getById endpoint
        api.get('admin/tenants'),
        currentUser?.role === 'SUPER_ADMIN' ? api.get('admin/organizations') : Promise.resolve({ data: { data: [] } })
      ]);

      const targetUser = userRes.data.data.find((u: any) => u.id === userId);
      if (targetUser) {
        setForm({
          firstName: targetUser.firstName || '',
          lastName: targetUser.lastName || '',
          email: targetUser.email || '',
          phoneNumber: targetUser.phoneNumber || '',
          role: targetUser.role || '',
          tenantId: targetUser.tenantId || '',
          unitId: targetUser.unitId || '',
          organizationId: targetUser.organizationId || ''
        });
        
        if (targetUser.tenantId) {
          fetchUnits(targetUser.tenantId);
        }
      }

      setTenants(tenantsRes.data.data);
      setOrganizations(orgsRes.data.data);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async (tenantId: string) => {
    try {
      const res = await api.get(`admin/units?tenantId=${tenantId}`);
      setUnits(res.data.data);
    } catch (e) {
      console.error('Failed to load units');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (form.tenantId) {
      fetchUnits(form.tenantId);
    } else {
      setUnits([]);
    }
  }, [form.tenantId]);

  const handleUpdate = async () => {
    if (!form.firstName || !form.email) {
      Alert.alert('Error', 'Required fields missing');
      return;
    }

    setSaving(true);
    try {
      await api.put(`admin/users/${userId}`, form);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const getAvailableRoles = () => {
    if (currentUser?.role === 'SUPER_ADMIN') return ['SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN', 'OFFICER', 'GUARD', 'RESIDENT'];
    if (currentUser?.role === 'ORG_ADMIN') return ['TENANT_ADMIN', 'OFFICER', 'GUARD', 'RESIDENT'];
    return ['OFFICER', 'GUARD', 'RESIDENT'];
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>Syncing Profile...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? colors.background : '#F1F8E9' }]}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Manage Personnel</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={styles.sectionTitle}>User Identity</Text>
            <View style={styles.inputRow}>
              <View style={[styles.inputBox, { flex: 1, backgroundColor: isDark ? colors.background : '#F1F8E9' }]}>
                <User size={18} color={colors.primary} />
                <TextInput 
                  placeholder="First Name"
                  placeholderTextColor={isDark ? colors.text + '30' : "#999"}
                  style={[styles.input, { color: colors.text }]}
                  value={form.firstName}
                  onChangeText={v => setForm({...form, firstName: v})}
                />
              </View>
              <View style={[styles.inputBox, { flex: 1, marginLeft: 12, backgroundColor: isDark ? colors.background : '#F1F8E9' }]}>
                <TextInput 
                  placeholder="Last Name"
                  placeholderTextColor={isDark ? colors.text + '30' : "#999"}
                  style={[styles.input, { color: colors.text }]}
                  value={form.lastName}
                  onChangeText={v => setForm({...form, lastName: v})}
                />
              </View>
            </View>

            <View style={[styles.inputBox, { backgroundColor: isDark ? colors.background : '#F1F8E9' }]}>
              <Mail size={18} color={colors.primary} />
              <TextInput 
                placeholder="Email"
                placeholderTextColor={isDark ? colors.text + '30' : "#999"}
                style={[styles.input, { color: colors.text + '60' }]}
                value={form.email}
                editable={false}
              />
            </View>

            <View style={[styles.inputBox, { backgroundColor: isDark ? colors.background : '#F1F8E9' }]}>
              <Phone size={18} color={colors.primary} />
              <TextInput 
                placeholder="Phone"
                placeholderTextColor={isDark ? colors.text + '30' : "#999"}
                style={[styles.input, { color: colors.text }]}
                value={form.phoneNumber}
                onChangeText={v => setForm({...form, phoneNumber: v})}
              />
            </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Contextual Assignment</Text>
          
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Society / Project</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollSelect}>
            {tenants.map(t => (
              <TouchableOpacity 
                key={t.id}
                style={[
                  styles.chip, 
                  { backgroundColor: isDark ? colors.background : '#f5f5f5' },
                  form.tenantId === t.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setForm({...form, tenantId: t.id, unitId: ''})}
              >
                <Building size={14} color={form.tenantId === t.id ? '#fff' : (isDark ? colors.text + '40' : '#666')} />
                <Text style={[styles.chipText, { color: isDark ? colors.text + '60' : '#666' }, form.tenantId === t.id && styles.chipTextSelected]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.fieldLabel, { color: colors.text }]}>Unit / Flat Number</Text>
          <View style={styles.unitGrid}>
            <TouchableOpacity 
              style={[
                styles.unitChip, 
                { backgroundColor: isDark ? colors.background : '#f0f0f0', borderColor: colors.border },
                !form.unitId && { backgroundColor: isDark ? colors.primary + '20' : '#E8F5E9', borderColor: colors.primary }
              ]}
              onPress={() => setForm({...form, unitId: ''})}
            >
              <Text style={[styles.unitChipText, { color: isDark ? colors.text + '40' : '#666' }, !form.unitId && { color: colors.primary }]}>Unassigned</Text>
            </TouchableOpacity>
            {units.map(u => (
              <TouchableOpacity 
                key={u.id}
                style={[
                  styles.unitChip, 
                  { backgroundColor: isDark ? colors.background : '#f0f0f0', borderColor: colors.border },
                  form.unitId === u.id && { backgroundColor: isDark ? colors.primary + '20' : '#E8F5E9', borderColor: colors.primary },
                  u.isOccupied && u.id !== form.unitId && styles.unitChipDisabled
                ]}
                onPress={() => !u.isOccupied || u.id === form.unitId ? setForm({...form, unitId: u.id}) : null}
              >
                <Text style={[
                  styles.unitChipText, 
                  { color: isDark ? colors.text + '40' : '#666' },
                  form.unitId === u.id && { color: colors.primary },
                  u.isOccupied && u.id !== form.unitId && styles.unitChipTextDisabled
                ]}>Unit {u.unitNumber}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 10 }]}>Role</Text>
          <View style={styles.roleGrid}>
            {getAvailableRoles().map(r => (
              <TouchableOpacity 
                key={r}
                style={[
                  styles.roleChip, 
                  { backgroundColor: isDark ? colors.background : '#f5f5f5' },
                  form.role === r && { backgroundColor: colors.primary }
                ]}
                onPress={() => setForm({...form, role: r})}
              >
                <Text style={[styles.roleChipText, { color: isDark ? colors.text + '60' : '#666' }, form.role === r && styles.roleChipTextSelected]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : (
              <>
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.saveText}>Commit Account Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontWeight: 'bold' },
  header: { 
    padding: 24, 
    paddingTop: 60, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900' },
  content: { padding: 20 },
  card: { borderRadius: 32, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#999', letterSpacing: 1.5, marginBottom: 16, textTransform: 'uppercase' },
  fieldLabel: { fontSize: 13, fontWeight: 'bold', marginTop: 16, marginBottom: 12 },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    height: 60,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '600' },
  scrollSelect: { flexDirection: 'row', marginBottom: 4 },
  chip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12, 
    marginRight: 10, 
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  chipText: { fontSize: 11, fontWeight: 'bold' },
  chipTextSelected: { color: '#fff' },
  unitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  unitChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  unitChipDisabled: { opacity: 0.4 },
  unitChipText: { fontSize: 11, fontWeight: 'bold' },
  unitChipTextDisabled: { color: '#ccc', textDecorationLine: 'line-through' },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  roleChipText: { fontSize: 11, fontWeight: 'bold' },
  roleChipTextSelected: { color: '#fff' },
  saveBtn: { 
    height: 60, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 32,
    gap: 12,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

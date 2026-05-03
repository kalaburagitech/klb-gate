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
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Shield, 
  Building,
  CheckCircle,
  X,
  Globe
} from 'lucide-react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddUserScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'RESIDENT',
    tenantId: '',
    organizationId: ''
  });

  useEffect(() => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      api.get('admin/tenants').then(res => setTenants(res.data.data));
      api.get('admin/organizations').then(res => setOrganizations(res.data.data));
    } else if (currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'TENANT_ADMIN') {
      api.get('admin/tenants').then(res => setTenants(res.data.data));
      setForm(f => ({ ...f, organizationId: currentUser.organizationId || '' }));
    }
  }, [currentUser]);

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.firstName) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('admin/users', form);
      Alert.alert('Success', 'User created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRoles = () => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      return ['SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN', 'OFFICER', 'GUARD', 'RESIDENT'];
    }
    if (currentUser?.role === 'ORG_ADMIN') {
      return ['TENANT_ADMIN', 'OFFICER', 'GUARD', 'RESIDENT'];
    }
    if (currentUser?.role === 'TENANT_ADMIN') {
      return ['OFFICER', 'GUARD', 'RESIDENT'];
    }
    return [];
  };

  const roles = getAvailableRoles();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>New User</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <Text style={styles.label}>Personal Details</Text>
            <View style={styles.inputRow}>
              <View style={[styles.inputBox, { flex: 1, backgroundColor: isDark ? colors.background : '#F1F8E9' }]}>
                <User size={18} color={isDark ? colors.text + '40' : "#999"} />
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
              <Mail size={18} color={isDark ? colors.text + '40' : "#999"} />
              <TextInput 
                placeholder="Email Address"
                placeholderTextColor={isDark ? colors.text + '30' : "#999"}
                style={[styles.input, { color: colors.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={v => setForm({...form, email: v})}
              />
            </View>

            <View style={[styles.inputBox, { backgroundColor: isDark ? colors.background : '#F1F8E9' }]}>
              <Phone size={18} color={isDark ? colors.text + '40' : "#999"} />
              <TextInput 
                placeholder="Phone Number"
                placeholderTextColor={isDark ? colors.text + '30' : "#999"}
                style={[styles.input, { color: colors.text }]}
                keyboardType="phone-pad"
                value={form.phoneNumber}
                onChangeText={v => setForm({...form, phoneNumber: v})}
              />
            </View>

            <Text style={[styles.label, { marginTop: 24 }]}>Access & Security</Text>
            <View style={[styles.inputBox, { backgroundColor: isDark ? colors.background : '#F1F8E9' }]}>
              <Lock size={18} color={isDark ? colors.text + '40' : "#999"} />
              <TextInput 
                placeholder="Initial Password"
                placeholderTextColor={isDark ? colors.text + '30' : "#999"}
                style={[styles.input, { color: colors.text }]}
                secureTextEntry
                value={form.password}
                onChangeText={v => setForm({...form, password: v})}
              />
            </View>

          <Text style={[styles.subLabel, { color: isDark ? colors.text + '60' : '#666' }]}>System Role</Text>
          <View style={styles.roleGrid}>
            {roles.map(r => (
              <TouchableOpacity 
                key={r}
                style={[
                  styles.roleItem,
                  { backgroundColor: isDark ? colors.background : '#f0f0f0' },
                  form.role === r && { backgroundColor: colors.primary }
                ]}
                onPress={() => setForm({...form, role: r})}
              >
                <Text style={[
                  styles.roleItemText,
                  { color: isDark ? colors.text + '60' : '#666' },
                  form.role === r && styles.roleItemTextSelected
                ]}>{r.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {currentUser?.role === 'SUPER_ADMIN' && (
            <>
              <Text style={[styles.subLabel, { color: isDark ? colors.text + '60' : '#666' }]}>Parent Organization</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tenantScroll}>
                {organizations.map(org => (
                  <TouchableOpacity 
                    key={org.id}
                    style={[
                      styles.tenantItem,
                      { backgroundColor: isDark ? colors.background : '#f5f5f5' },
                      form.organizationId === org.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setForm({...form, organizationId: org.id, tenantId: ''})}
                  >
                    <Globe size={14} color={form.organizationId === org.id ? '#fff' : (isDark ? colors.text + '40' : '#666')} />
                    <Text style={[
                      styles.tenantItemText,
                      { color: isDark ? colors.text + '60' : '#666' },
                      form.organizationId === org.id && styles.tenantItemTextSelected
                    ]}>{org.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'TENANT_ADMIN') && form.role !== 'SUPER_ADMIN' && (
            <>
              <Text style={[styles.subLabel, { color: isDark ? colors.text + '60' : '#666' }]}>Target Society</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tenantScroll}>
                {tenants
                  .filter(t => !form.organizationId || t.organizationId === form.organizationId)
                  .map(t => (
                  <TouchableOpacity 
                    key={t.id}
                    style={[
                      styles.tenantItem,
                      { backgroundColor: isDark ? colors.background : '#f5f5f5' },
                      form.tenantId === t.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setForm({...form, tenantId: t.id})}
                  >
                    <Building size={14} color={form.tenantId === t.id ? '#fff' : (isDark ? colors.text + '40' : '#666')} />
                    <Text style={[
                      styles.tenantItemText,
                      { color: isDark ? colors.text + '60' : '#666' },
                      form.tenantId === t.id && styles.tenantItemTextSelected
                    ]}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.submitText}>Create User Account</Text>
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
  header: { 
    padding: 24, 
    paddingTop: 60, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  formCard: { borderRadius: 32, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  label: { fontSize: 12, fontWeight: '900', color: '#999', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' },
  subLabel: { fontSize: 13, fontWeight: 'bold', marginTop: 16, marginBottom: 12 },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 56,
    marginBottom: 16
  },
  input: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '500' },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleItem: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  roleItemText: { fontSize: 11, fontWeight: 'bold' },
  roleItemTextSelected: { color: '#fff' },
  tenantScroll: { flexDirection: 'row', marginBottom: 10 },
  tenantItem: { 
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
  tenantItemText: { fontSize: 11, fontWeight: 'bold' },
  tenantItemTextSelected: { color: '#fff' },
  submitBtn: { 
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
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

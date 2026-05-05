import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, StatusBar, Dimensions } from 'react-native';
import { User, Phone, Shield, Home, LogOut, FileCheck, ChevronRight, Bell, Settings, HardDrive, Moon, Sun } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();

  if (!user) return null;

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'TENANT_ADMIN';
  const isSecurity = user.role === 'OFFICER' || user.role === 'GUARD';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Premium Background Header */}
      <View style={[styles.headerBg, { backgroundColor: colors.primary }]}>
        <View style={styles.headerCircle} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarOuter, { borderColor: '#fff' }]}>
              <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.avatarText}>{user.firstName[0]}{user.lastName[0]}</Text>
              </View>
            </View>
            <View style={[styles.statusDot, { borderColor: colors.primary }]} />
          </View>

          <Text style={[styles.name, { color: '#fff' }]}>{user.firstName} {user.lastName}</Text>
          <View style={[styles.roleContainer, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', borderWidth: 1 }]}>
            <Shield size={14} color="#fff" />
            <Text style={[styles.roleText, { color: "#fff" }]}>
              {user.role === 'SUPER_ADMIN' ? 'SYSTEM OVERSEER' :
                user.role === 'TENANT_ADMIN' ? 'ESTATE MANAGER' :
                  user.role === 'RESIDENT' ? 'VERIFIED RESIDENT' :
                    user.role === 'GUARD' ? 'SECURITY PERSONNEL' : 'SECURITY OFFICER'}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text + '40' }]}>CORE IDENTITY</Text>

          <View style={styles.menuItem}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? colors.primary + '22' : '#E8F5E9' }]}>
              <Phone size={20} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={[styles.menuLabel, { color: colors.text + '40' }]}>MOBILE NETWORK</Text>
              <Text style={[styles.menuValue, { color: colors.text }]}>{user.phoneNumber || 'Not Linked'}</Text>
            </View>
          </View>

          {user.role === 'RESIDENT' && (
            <View style={styles.menuItem}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#1E88E522' : '#E3F2FD' }]}>
                <Home size={20} color={isDark ? "#42A5F5" : "#1976D2"} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, { color: colors.text + '40' }]}>RESIDENTIAL UNIT</Text>
                <Text style={[styles.menuValue, { color: colors.text }]}>{user.unitNumber || 'Pending Assignment'}</Text>
              </View>
            </View>
          )}

          {isAdmin && (
            <View style={styles.menuItem}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#673AB722' : '#EDE7F6' }]}>
                <Settings size={20} color={isDark ? "#9575CD" : "#512DA8"} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, { color: colors.text + '40' }]}>ADMINISTRATION LEVEL</Text>
                <Text style={[styles.menuValue, { color: colors.text }]}>Level 1 Access</Text>
              </View>
            </View>
          )}

          <View style={styles.menuItem}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? '#FF980022' : '#FFF3E0' }]}>
              <FileCheck size={20} color={isDark ? "#FFB74D" : "#E65100"} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={[styles.menuLabel, { color: colors.text + '40' }]}>SECURITY STATUS</Text>
              <Text style={[styles.menuValue, { color: colors.text }]}>System Verified</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text + '40' }]}>SYSTEM PREFERENCES</Text>

          <TouchableOpacity style={styles.menuLink}>
            <View style={styles.linkLeft}>
              <Bell size={20} color={colors.text + '40'} />
              <Text style={[styles.linkText, { color: colors.text }]}>Notifications</Text>
            </View>
            <ChevronRight size={18} color={colors.text + '20'} />
          </TouchableOpacity>

          <View style={styles.menuLink}>
            <View style={styles.linkLeft}>
              <Shield size={20} color={colors.text + '40'} />
              <Text style={[styles.linkText, { color: colors.text }]}>Automatic Theme</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary }}>SYSTEM SYNCED</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <LogOut size={20} color="#F87171" />
          <Text style={styles.logoutText}>TERMINATE SESSION</Text>
        </TouchableOpacity>

        <Text style={styles.version}>KLB CONNECT • BUILD 2026.1</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 260, borderBottomLeftRadius: 60, borderBottomRightRadius: 60 },
  headerCircle: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)' },
  content: { padding: 24, paddingTop: 60 },
  profileCard: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: { position: 'relative', marginBottom: 20 },
  avatarOuter: { padding: 4, borderRadius: 60, borderWidth: 2 },
  avatar: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', shadowColor: '#4ADE80', shadowOpacity: 0.2, shadowRadius: 15 },
  avatarText: { fontSize: 38, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  statusDot: { position: 'absolute', bottom: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: '#4ADE80', borderWidth: 3 },
  name: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  roleContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5 },
  section: { borderRadius: 32, padding: 24, marginBottom: 20, borderWidth: 1 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  menuInfo: { marginLeft: 16 },
  menuLabel: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  menuValue: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  menuLink: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  // ✅ Restored missing styles
  linkLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  linkText: { fontSize: 15, fontWeight: '600' },
  // Theme selector styles
  themeSelectorContainer: { marginBottom: 24 },
  segmentContainer: { flexDirection: 'row', borderRadius: 16, padding: 4, height: 50 },
  segmentButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12 },
  segmentLabel: { fontSize: 13, fontWeight: '700' },
  themeDescription: { fontSize: 11, fontWeight: '500', marginTop: 12, paddingHorizontal: 4, lineHeight: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20, paddingVertical: 20, borderRadius: 24, backgroundColor: 'rgba(248, 113, 113, 0.1)', borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.2)' },
  logoutText: { color: '#F87171', fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  version: { textAlign: 'center', color: 'rgba(150,150,150,0.15)', marginTop: 40, marginBottom: 40, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }
});

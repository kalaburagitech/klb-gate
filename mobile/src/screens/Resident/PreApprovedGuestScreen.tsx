import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  Linking,
  KeyboardAvoidingView
} from 'react-native';
import { 
  UserPlus, 
  Phone, 
  Calendar, 
  CheckCircle, 
  ChevronLeft,
  Share2,
  Copy,
  Clock
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Clipboard from 'expo-clipboard';
import api, { visitorApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function PreApprovedGuestScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [form, setForm] = useState({
    visitorName: '',
    phoneNumber: '',
    expectedDate: new Date().toISOString().split('T')[0]
  });

  const handleCreate = async () => {
    if (!form.visitorName) {
      Alert.alert('Error', 'Please enter guest name');
      return;
    }

    setLoading(true);
    console.log('🚀 [PreApproved] Creating with form:', form);
    try {
      const res = await visitorApi.createPreApproved(form);
      console.log('✅ [PreApproved] Success:', res.data);
      setGeneratedCode(res.data.data.code);
      setSuccess(true);
    } catch (e: any) {
      console.error('❌ [PreApproved] Error:', e);
      const msg = e.response?.data?.message || e.message || 'Failed to create pre-approval';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const shareMessage = async () => {
    try {
      await Share.share({
        message: `KLB Connect Guest Code: ${generatedCode}. Please show this at the gate.`,
        title: 'Guest Invitation',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share invitation');
    }
  };

// keep copyToClipboard if needed
const copyToClipboard = async () => {
  await Clipboard.setStringAsync(`KLB Connect Guest Code: ${generatedCode}. Please show this at the gate.`);
  Alert.alert('Copied', 'Invitation message copied to clipboard');
};

// Share via WhatsApp using Linking API
const shareViaWhatsApp = async () => {
  const message = `KLB Connect Guest Code: ${generatedCode}. Please show this at the gate.`;
  const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'WhatsApp is not installed on your device.');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to open WhatsApp');
  }
};

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContent}>
          <View style={[styles.successIcon, { backgroundColor: colors.primary }]}>
            <CheckCircle size={60} color="#fff" />
          </View>
          <Text style={[styles.successTitle, { color: colors.primary }]}>Guest Pre-Approved!</Text>
          <Text style={[styles.successSub, { color: colors.text + '80' }]}>Share this code with {form.visitorName}</Text>
          
          <View style={[styles.codeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.codeLabel, { color: colors.text + '40' }]}>ENTRY CODE</Text>
            <Text style={[styles.codeValue, { color: colors.primary }]}>{generatedCode}</Text>
          </View>

          <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.primary }]} onPress={copyToClipboard}>
            <Share2 size={20} color="#fff" />
            <Text style={styles.shareText}>Copy Invite</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.whatsappBtn, { backgroundColor: isDark ? colors.card : '#fff', borderColor: '#25D366' }]} onPress={shareViaWhatsApp}>
            <Share2 size={20} color="#25D366" />
            <Text style={styles.whatsappText}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={[styles.doneText, { color: colors.primary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primary }]}>Add Guest</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
        <View style={[styles.infoBox, { backgroundColor: colors.primary + '15' }]}>
          <Clock size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            The guest code will be valid for 24 hours. You can share it via WhatsApp or SMS.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
            <UserPlus size={20} color={colors.primary} />
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              placeholder="Guest Full Name"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              value={form.visitorName}
              onChangeText={(v) => setForm({...form, visitorName: v})}
            />
          </View>

          <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
            <Phone size={20} color={colors.primary} />
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              placeholder="Guest Phone Number"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              keyboardType="phone-pad"
              value={form.phoneNumber}
              onChangeText={(v) => setForm({...form, phoneNumber: v})}
            />
          </View>

          <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
            <Calendar size={20} color={colors.primary} />
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              placeholder="Expected Date (YYYY-MM-DD)"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              value={form.expectedDate}
              onChangeText={(v) => setForm({...form, expectedDate: v})}
            />
          </View>

          <TouchableOpacity 
            style={[styles.createBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]} 
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.createText}>Generate Entry Code</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 24, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '900' },
  scroll: { padding: 24 },
  infoBox: { padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  infoText: { fontSize: 13, flex: 1, fontWeight: '500' },
  form: { gap: 16 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 20, height: 68 },
  input: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '500' },
  createBtn: { 
    height: 64, 
    borderRadius: 32, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 24,
    gap: 12,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  createText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  successContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  successIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  successSub: { fontSize: 14, textAlign: 'center', marginBottom: 40 },
  codeCard: { width: '100%', padding: 32, borderRadius: 32, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5, marginBottom: 40, borderWidth: 1 },
  codeLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 3, marginBottom: 16 },
  codeValue: { fontSize: 48, fontWeight: '900', letterSpacing: 5 },
  shareBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 24, flexDirection: 'row', gap: 12, alignItems: 'center' },
  shareText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  whatsappBtn: { 
    paddingHorizontal: 32, 
    paddingVertical: 16, 
    borderRadius: 24, 
    flexDirection: 'row', 
    gap: 12, 
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 12
  },
  whatsappText: { color: '#25D366', fontWeight: 'bold', fontSize: 16 },
  doneBtn: { marginTop: 24, padding: 16 },
  doneText: { fontWeight: 'bold', fontSize: 14 }
});

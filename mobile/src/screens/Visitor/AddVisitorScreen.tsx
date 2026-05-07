import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Camera as CameraIcon, User, Phone, Clipboard, CheckCircle, X, RotateCcw, Home as HomeIcon, Search } from 'lucide-react-native';
import CameraScreen from '../../components/CameraModule';
import api, { visitorApi, mediaApi, unitApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function AddVisitorScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const isFocused = useIsFocused();

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedResident, setSelectedResident] = useState<any>(null);

  const [form, setForm] = useState({
    name: route?.params?.name || '',
    phone: route?.params?.phone || '',
    purpose: route?.params?.purpose || '',
    unitNumber: route?.params?.unitNumber || '',
    residentId: route?.params?.residentId || '',
    type: route?.params?.type || 'GUEST',
    verificationCode: route?.params?.code || '',
  });

  useEffect(() => {
    if (route?.params?.code) {
      handleVerifyCode(route.params.code);
    }
    if (route?.params?.residentId && route?.params?.unitNumber) {
      setSelectedResident({
        name: 'Resident',
        unitNumber: route.params.unitNumber,
        id: route.params.residentId
      });
    }
  }, [route?.params?.code, route?.params?.residentId]);

  const handleVerifyCode = async (code: string) => {
    setLoading(true);
    try {
      const res = await visitorApi.verifyPreApproved(code);
      const pre = res.data.data;
      setForm({
        ...form,
        name: pre.visitorName,
        phone: pre.phoneNumber || '',
        unitNumber: pre.resident.unitNumber,
        residentId: pre.residentId,
      });
      setSelectedResident({
        name: `${pre.resident.firstName} ${pre.resident.lastName}`,
        unitNumber: pre.resident.unitNumber,
        id: pre.residentId
      });
      Alert.alert('Code Verified', `This code is for ${pre.visitorName} visiting Flat ${pre.resident.unitNumber}`);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Invalid or expired code');
      setForm({...form, verificationCode: ''});
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    setShowResults(true);
    try {
      // Using the new /users/search API
      const res = await api.get(`admin/users/search?q=${text}`);
      setSearchResults(res.data.data);
    } catch (e) {
      console.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const selectResident = (resident: any) => {
    setSelectedResident(resident);
    setForm({ 
      ...form, 
      unitNumber: resident.unitNumber,
      residentId: resident.id 
    });
    setSearchQuery(`${resident.name} - ${resident.unitNumber}`);
    setShowResults(false);
  };

  const handleOpenCamera = () => {
    setCameraVisible(true);
  };

  const handleCapture = (uri: string) => {
    setPhoto(uri);
    setCameraVisible(false);
  };

  const handleCheckIn = async () => {
    if (!form.name || !form.phone || !form.unitNumber || !photo) {
      Alert.alert('Error', 'Please fill all mandatory fields and capture a photo');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Photo
      const formData = new FormData();
      formData.append('file', {
        uri: photo,
        type: 'image/jpeg',
        name: 'visitor.jpg',
      } as any);

      const mediaRes = await mediaApi.upload(formData);
      const photoId = mediaRes.data.data.id;

      // 2. Create Visitor Entry Request
      const entryRes = await visitorApi.requestEntry({
        ...form,
        photoUrl: photoId
      });

      const entry = entryRes.data.data;
      
      if (entry.status === 'PENDING_APPROVAL') {
        Alert.alert('Success', 'Approval request sent to resident.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Success', `${form.name} approved and checked in.`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to process entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.primary }]}>Visitor Entry</Text>
        
        <View style={styles.typeSelector}>
          {['GUEST', 'DAILY_SERVICE', 'PRE_APPROVED'].map((t) => (
            <TouchableOpacity 
              key={t}
              style={[
                styles.typeButton, 
                { backgroundColor: colors.card, borderColor: colors.border },
                form.type === t && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]} 
              onPress={() => setForm({...form, type: t})}
            >
              <Text style={[styles.typeText, { color: isDark ? 'rgba(255,255,255,0.4)' : '#666' }, form.type === t && styles.typeTextActive]}>
                {t === 'DAILY_SERVICE' ? 'DAILY' : t === 'PRE_APPROVED' ? 'PRE-APP' : 'GUEST'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <View style={styles.photoContainer}>
            {photo ? (
              <View style={{ flex: 1 }}>
                <Image source={{ uri: photo }} style={styles.previewImage} />
                <TouchableOpacity style={styles.retakeBadge} onPress={() => setCameraVisible(true)}>
                  <RotateCcw size={14} color="#fff" />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.photoPlaceholder, { backgroundColor: colors.card }]} onPress={handleOpenCamera}>
                <View style={styles.iconCircle}>
                  <CameraIcon size={32} color="#fff" />
                </View>
                <Text style={[styles.photoText, { color: colors.primary }]}>CAPTURE PHOTO</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
            <User size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              placeholder="Visitor Name"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              value={form.name}
              onChangeText={(v) => setForm({...form, name: v})}
            />
          </View>

          <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
            <Phone size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              placeholder="Phone Number"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => setForm({...form, phone: v})}
            />
          </View>

          <View style={styles.searchSection}>
            <Text style={[styles.fieldLabel, { color: colors.primary }]}>WHO ARE THEY VISITING?</Text>
            {!selectedResident ? (
              <View style={[
                styles.inputGroup, 
                { backgroundColor: colors.card },
                searchQuery.length > 0 && styles.inputGroupSearchActive
              ]}>
                <HomeIcon size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Search Unit or Resident Name..."
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>
            ) : (
              <View style={[styles.selectedResidentCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                <View style={styles.selectedResidentInfo}>
                  <View style={[styles.iconCircleSmall, { backgroundColor: colors.primary }]}>
                    <HomeIcon size={16} color="#fff" />
                  </View>
                  <View>
                    <Text style={[styles.selectedName, { color: colors.text }]}>{selectedResident.name}</Text>
                    <Text style={[styles.selectedUnit, { color: colors.text + '60' }]}>Unit {selectedResident.unitNumber}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => {
                  setSelectedResident(null);
                  setSearchQuery('');
                  setForm({...form, residentId: '', unitNumber: ''});
                }}>
                  <X size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
            )}

            {showResults && searchResults.length > 0 && !selectedResident && (
              <View style={[styles.resultsDropdown, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                {searching ? (
                  <ActivityIndicator color={colors.primary} />
                ) : searchResults.length > 0 ? (
                  searchResults.map((item: any) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={[styles.resultItem, { borderBottomColor: colors.border }]} 
                      onPress={() => {
                        setSelectedResident(item);
                        setForm({...form, residentId: item.id, unitNumber: item.unitNumber});
                        setShowResults(false);
                      }}
                    >
                      <View>
                        <Text style={[styles.resultUnit, { color: colors.primary }]}>{item.name}</Text>
                        <Text style={[styles.resultOwner, { color: colors.text + '60' }]}>Unit {item.unitNumber}</Text>
                      </View>
                      <CheckCircle size={20} color={colors.primary} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ padding: 10, color: '#999', textAlign: 'center' }}>No residents found</Text>
                )}
              </View>
            )}
          </View>

          {form.type === 'PRE_APPROVED' && (
            <View style={[styles.inputGroup, { backgroundColor: colors.card, borderBottomWidth: form.verificationCode.length === 6 ? 2 : 1, borderBottomColor: form.verificationCode.length === 6 ? colors.primary : colors.border }]}>
              <Clipboard size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Verification Code"
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                maxLength={6}
                value={form.verificationCode}
                onChangeText={(v) => {
                  const val = v.toUpperCase();
                  setForm({...form, verificationCode: val});
                  if (val.length === 6) {
                    handleVerifyCode(val);
                  }
                }}
              />
              {loading && <ActivityIndicator size="small" color="#2E7D32" />}
            </View>
          )}

          <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
            <Clipboard size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Purpose of visit (Optional)"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              value={form.purpose}
              onChangeText={(v) => setForm({...form, purpose: v})}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleCheckIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CheckCircle size={24} color="#fff" />
              <Text style={styles.submitText}>SUBMIT CHECK-IN</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>

      <Modal visible={cameraVisible && isFocused} animationType="slide">
        <CameraScreen 
          onCapture={handleCapture} 
          onClose={() => setCameraVisible(false)} 
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 32, letterSpacing: -1, marginTop: 20 },
  photoContainer: { width: '100%', height: 280, borderRadius: 32, overflow: 'hidden', marginBottom: 32, shadowColor: '#2E7D32', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, borderWidth: 1 },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  photoText: { fontWeight: '800', letterSpacing: 1, fontSize: 12 },
  previewImage: { width: '100%', height: '100%' },
  retakeBadge: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  retakeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  form: { gap: 20, marginBottom: 40 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 20, height: 68, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 15, elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  inputGroupSearchActive: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  inputIcon: { marginRight: 16 },
  input: { flex: 1, fontSize: 18, fontWeight: '500' },
  searchSection: { position: 'relative', zIndex: 100 },
  resultsDropdown: { borderBottomLeftRadius: 20, borderBottomRightRadius: 20, padding: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, borderTopWidth: 1 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  resultUnit: { fontSize: 16, fontWeight: 'bold' },
  resultOwner: { fontSize: 12 },
  submitButton: { backgroundColor: '#2E7D32', height: 72, borderRadius: 36, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, shadowColor: '#2E7D32', shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 },
  disabledButton: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  typeButton: { flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  typeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  typeTextActive: { color: '#fff' },
  fieldLabel: { fontSize: 10, fontWeight: '900', marginBottom: 12, letterSpacing: 1 },
  selectedResidentCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderRadius: 20, 
    padding: 16,
    borderWidth: 1,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  selectedResidentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircleSmall: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  selectedName: { fontSize: 16, fontWeight: 'bold' },
  selectedUnit: { fontSize: 12, fontWeight: '500' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 40 },
  closeCameraButton: { alignSelf: 'flex-end', marginTop: 20 },
  captureBoundary: { width: width - 80, height: width - 80, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 20, alignSelf: 'center', borderStyle: 'dashed' },
  cameraFooter: { alignItems: 'center', marginBottom: 20 },
  captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
});

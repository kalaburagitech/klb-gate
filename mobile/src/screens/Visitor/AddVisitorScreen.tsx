import React, { useState, useEffect } from 'react';
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
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { 
  Camera as CameraIcon, 
  User, 
  Phone, 
  Clipboard, 
  CheckCircle, 
  X, 
  RotateCcw, 
  Home as HomeIcon, 
  Search,
  ChevronDown,
  Info,
  LogIn
} from 'lucide-react-native';
import CameraScreen from '../../components/CameraModule';
import api, { visitorApi, mediaApi, getMediaUrl } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function AddVisitorScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);


  // Form State
  const [form, setForm] = useState({
    name: '',
    phone: '',
    purpose: '',
    comment: '',
    unitNumber: '',
    residentId: '',
  });

  // Media State
  const [photos, setPhotos] = useState<{uri: string, type: 'FACE' | 'ID_PROOF' | 'VEHICLE', isRemote?: boolean}[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [activePhotoType, setActivePhotoType] = useState<'FACE' | 'ID_PROOF' | 'VEHICLE'>('FACE');

  // Search/Suggestions States
  const [visitorSearching, setVisitorSearching] = useState(false);
  const [visitorSuggestions, setVisitorSuggestions] = useState<any[]>([]);
  const [residentSearchQuery, setResidentSearchQuery] = useState('');
  const [residentSuggestions, setResidentSuggestions] = useState<any[]>([]);
  const [searchingResidents, setSearchingResidents] = useState(false);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [purposes] = useState([
    { id: '1', name: 'Delivery' },
    { id: '2', name: 'Friend' },
    { id: '3', name: 'Relative' },
    { id: '4', name: 'Meeting' },
    { id: '5', name: 'Maintenance' },
    { id: '6', name: 'Food Delivery' },
    { id: '7', name: 'Courier' },
    { id: '8', name: 'Maid' },
    { id: '9', name: 'Milk' },
    { id: '10', name: 'Newspaper' },
    { id: '11', name: 'Water Can' },
    { id: '12', name: 'Electrician' },
    { id: '13', name: 'Plumber' },
    { id: '14', name: 'Other' }
  ]);
  const [showPurposes, setShowPurposes] = useState(false);


  useEffect(() => {
    if (route.params?.preApprovedData) {
      const p = route.params.preApprovedData;
      setForm(prev => ({
        ...prev,
        name: p.visitor?.name || p.visitorName || '',
        phone: p.visitor?.phone || p.phoneNumber || '',
        unitNumber: p.unitNumber || '',
        residentId: p.residentId || '',
        purpose: 'Pre-approved visit',
        preApprovedId: p.id
      }));
      setResidentSearchQuery(`${p.resident?.firstName || ''} (Unit ${p.unitNumber || ''})`);
    }
  }, [route.params]);

  const handleVisitorSearch = async (phone: string) => {
    if (phone.length !== 10) return;
    setVisitorSearching(true);
    try {
      const res = await visitorApi.search(phone);
      const data = res.data.data;
      if (data && data.profile) {
        setForm(prev => ({
          ...prev,
          name: data.profile.name,
          purpose: data.lastPurpose || prev.purpose
        }));

        // Pre-fill photos from previous visits
        if (data.profile.media && data.profile.media.length > 0) {
          const prevFace = data.profile.media.find((m: any) => m.type === 'FACE');
          const prevId = data.profile.media.find((m: any) => m.type === 'ID_PROOF');
          const prevVehicle = data.profile.media.find((m: any) => m.type === 'VEHICLE');
          
          const autofilledPhotos = [];
          if (prevFace) autofilledPhotos.push({ uri: prevFace.fileUrl, type: 'FACE' as const, isRemote: true });
          if (prevId) autofilledPhotos.push({ uri: prevId.fileUrl, type: 'ID_PROOF' as const, isRemote: true });
          if (prevVehicle) autofilledPhotos.push({ uri: prevVehicle.fileUrl, type: 'VEHICLE' as const, isRemote: true });
          
          if (autofilledPhotos.length > 0) {
            setPhotos(autofilledPhotos);
          }
        }

        // Suggestions for residents
        if (data.suggestions && data.suggestions.length > 0) {
          setVisitorSuggestions(data.suggestions);
          // Auto-select if only one clear suggestion
          if (data.suggestions.length === 1) {
            selectResident(data.suggestions[0]);
          }
        }
      }
    } catch (e) {
      console.error('Visitor search failed');
    } finally {
      setVisitorSearching(false);
    }
  };

  const handleResidentSearch = async (text: string) => {
    setResidentSearchQuery(text);
    if (text.length < 2) {
      setResidentSuggestions([]);
      return;
    }
    setSearchingResidents(true);
    try {
      const res = await api.get(`admin/users/search?q=${text}`);
      setResidentSuggestions(res.data.data);
    } catch (e) {
      console.error('Resident search failed');
    } finally {
      setSearchingResidents(false);
    }
  };

  const selectResident = (res: any) => {
    setSelectedResident(res);
    setForm({ ...form, residentId: res.id, unitNumber: res.unitNumber });
    setResidentSearchQuery(`${res.name} (Unit ${res.unitNumber})`);
    setResidentSuggestions([]);
  };

  const handleCapture = (uri: string) => {
    // If we're retaking a specific index
    const existingIndex = photos.findIndex(p => p.type === activePhotoType);
    if (existingIndex !== -1) {
      const newPhotos = [...photos];
      newPhotos[existingIndex] = { uri, type: activePhotoType };
      setPhotos(newPhotos);
    } else {
      const newPhotos = [...photos, { uri, type: activePhotoType }];
      setPhotos(newPhotos);
    }
    setCameraVisible(false);
  };

  const handleSubmit = async () => {


    setLoading(true);
    try {
      // 1. Upload only local Photos
      const uploadedMedia = await Promise.all(photos.map(async (p) => {
        if (p.isRemote) {
          // Extract the media ID from the URL if needed, but for now we assume fileUrl is fine 
          // Actually we should probably just send the URL or the ID back.
          // In processNewEntry, it expects photoId or media objects.
          return { url: p.uri, type: p.type, isExisting: true };
        }
        
        const formData = new FormData();
        formData.append('file', {
          uri: p.uri,
          type: 'image/jpeg',
          name: `${p.type.toLowerCase()}.jpg`,
        } as any);
        const res = await mediaApi.upload(formData);
        return { url: res.data.data.id, type: p.type };
      }));

      // 2. Create Entry or Approve Pre-approval
      if (form.preApprovedId) {
        await visitorApi.approvePreApprovedVisit(form.preApprovedId, {
          photoUrl: uploadedMedia.find(m => m.type === 'FACE')?.url,
          additionalPhotos: uploadedMedia,
        });
      } else {
        await visitorApi.requestEntry({
          ...form,
          photoUrl: uploadedMedia.find(m => m.type === 'FACE')?.url,
          additionalPhotos: uploadedMedia,
          type: 'GUEST'
        });
      }

      Alert.alert(
        'Success', 
        form.preApprovedId ? 'Pre-approved visitor checked in.' : 'Visitor request sent to resident.', 
        [
          { text: 'OK', onPress: () => {
            setForm({ name: '', phone: '', purpose: '', comment: '', unitNumber: '', residentId: '' });
            setPhotos([]);
            navigation.navigate('Activity');
          }}
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to process entry');
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: colors.primary }]}>Visitor Entry</Text>
          

          <View style={styles.form}>
            <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
              <Phone size={20} color={colors.primary} style={styles.icon} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                placeholder="Mobile Number"
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8'}
                keyboardType="phone-pad"
                maxLength={10}
                value={form.phone}
                onChangeText={(v) => {
                  setForm({ ...form, phone: v });
                  if (v.length < 10) {
                    setVisitorSuggestions([]);
                    setSelectedResident(null);
                  }
                  if (v.length === 10) handleVisitorSearch(v);
                }}
              />
              {visitorSearching && <ActivityIndicator size="small" color={colors.primary} />}
              {!visitorSearching && form.phone.length === 10 && visitorSuggestions.length > 0 && (
                <View style={[styles.matchedBadge, { backgroundColor: '#4CAF5015' }]}>
                  <CheckCircle size={14} color="#4CAF50" />
                  <Text style={{ color: '#4CAF50', fontSize: 10, fontWeight: '900', marginLeft: 4 }}>RECOGNIZED</Text>
                </View>
              )}
            </View>

            <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
              <User size={20} color={colors.primary} style={styles.icon} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                placeholder="Visitor Name"
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8'}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
              />
              {form.name.length > 0 && visitorSuggestions.length > 0 && (
                <View style={{ marginRight: 8 }}>
                  <CheckCircle size={18} color="#4CAF50" />
                </View>
              )}
            </View>

            {visitorSuggestions.length > 0 && !selectedResident && (
              <View style={styles.visitorSuggestions}>
                <Text style={[styles.suggestionLabel, { color: colors.text + '60' }]}>RECENTLY VISITED UNITS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionScroll}>
                  {visitorSuggestions.map((s, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[styles.unitChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
                      onPress={() => selectResident(s)}
                    >
                      <HomeIcon size={14} color={colors.primary} />
                      <Text style={[styles.unitChipText, { color: colors.primary }]}>{s.unitNumber}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.searchSection}>
              <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
                <HomeIcon size={20} color={colors.primary} style={styles.icon} />
                <TextInput 
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Search Resident or Flat..."
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8'}
                  value={residentSearchQuery}
                  onChangeText={handleResidentSearch}
                />
                {searchingResidents && <ActivityIndicator size="small" color={colors.primary} />}
              </View>
              
              {residentSuggestions.length > 0 && (
                <View style={[styles.suggestions, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {residentSuggestions.map((item) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                      onPress={() => selectResident(item)}
                    >
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{item.name}</Text>
                      <Text style={styles.suggestionUnit}>Unit {item.unitNumber}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.inputGroup, { backgroundColor: colors.card }]}
              onPress={() => setShowPurposes(true)}
            >
              <Clipboard size={20} color={colors.primary} style={styles.icon} />
              <Text style={[styles.input, { color: form.purpose ? colors.text : (isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8'), paddingTop: 18 }]}>
                {form.purpose || 'Purpose of Visit'}
              </Text>
              <ChevronDown size={20} color={colors.primary} />
            </TouchableOpacity>

            <Modal visible={showPurposes} transparent animationType="fade">
              <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setShowPurposes(false)}
              >
                <View style={[styles.purposeModal, { backgroundColor: colors.card }]}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Select Purpose</Text>
                    <TouchableOpacity onPress={() => setShowPurposes(false)}>
                      <X size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.purposeList}>
                    {purposes.map((p) => (
                      <TouchableOpacity 
                        key={p.id} 
                        style={[styles.purposeItem, form.purpose === p.name && { backgroundColor: colors.primary + '20' }]}
                        onPress={() => {
                          setForm({ ...form, purpose: p.name });
                          setShowPurposes(false);
                        }}
                      >
                        <Text style={[styles.purposeTextItem, { color: form.purpose === p.name ? colors.primary : colors.text }]}>
                          {p.name}
                        </Text>
                        {form.purpose === p.name && <CheckCircle size={18} color={colors.primary} />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Combined Photo Capture Section */}
            <View style={styles.photoContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[styles.photoLabel, { color: colors.text + '60', marginBottom: 0 }]}>SECURITY CAPTURE</Text>
                <View style={[styles.optionalBadge, { backgroundColor: isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(46, 125, 50, 0.1)' }]}>
                  <Text style={[styles.optionalText, { color: colors.primary }]}>PHOTOS (OPTIONAL)</Text>
                </View>
              </View>
              <View style={styles.photoList}>
                {['FACE', 'ID_PROOF'].map((type: any, idx) => {
                  const photo = photos.find(p => p.type === type);
                  return (
                    <View key={type} style={{ flex: 1 }}>
                      <Text style={[styles.slotLabel, { color: colors.text + '40' }]}>{type === 'FACE' ? 'VISITOR FACE (OPTIONAL)' : 'ID / VEHICLE (OPTIONAL)'}</Text>
                      {photo ? (
                        <View style={[styles.photoPreview, { borderColor: colors.border, backgroundColor: colors.card }]}>
                          <TouchableOpacity 
                            style={{ flex: 1 }} 
                            onPress={() => setSelectedPreviewImage(getMediaUrl(photo.uri))}
                          >
                            <Image source={{ uri: getMediaUrl(photo.uri) }} style={styles.previewImg} />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.retakeBtn, { backgroundColor: colors.primary }]} 
                            onPress={() => {
                              setActivePhotoType(type);
                              setCameraVisible(true);
                            }}
                          >
                            <RotateCcw size={12} color="#fff" />
                            <Text style={styles.retakeText}>Retake</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.removeBtn} 
                            onPress={() => setPhotos(photos.filter(p => p.type !== type))}
                          >
                            <X size={12} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity 
                          style={[styles.addPhotoBtn, { backgroundColor: colors.card, borderColor: colors.border, borderStyle: 'dashed' }]}
                          onPress={() => {
                            setActivePhotoType(type);
                            setCameraVisible(true);
                          }}
                        >
                          <View style={[styles.cameraIconBg, { backgroundColor: colors.primary + '15' }]}>
                            <CameraIcon size={24} color={colors.primary} />
                          </View>
                          <Text style={[styles.addPhotoText, { color: colors.primary }]}>{type === 'FACE' ? 'Tap to Capture' : 'Optional'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  {form.preApprovedId ? <LogIn size={20} color="#fff" /> : <CheckCircle size={20} color="#fff" />}
                  <Text style={styles.submitText}>
                    {form.preApprovedId ? 'LET IN (PRE-APPROVED)' : 'Submit Visitor Entry'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={cameraVisible && isFocused} animationType="slide">
        <CameraScreen onCapture={handleCapture} onClose={() => setCameraVisible(false)} />
      </Modal>

      {/* Image Preview Modal */}
      <Modal visible={!!selectedPreviewImage} transparent animationType="fade">
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPreviewImage(null)}>
            <X size={32} color="#fff" />
          </TouchableOpacity>
          {selectedPreviewImage && (
            <Image source={{ uri: getMediaUrl(selectedPreviewImage) }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 24, letterSpacing: -1 },
  form: { gap: 16 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', height: 60, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  textArea: { height: 100, alignItems: 'flex-start', paddingTop: 16 },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: '600' },
  searchSection: { zIndex: 100 },
  suggestions: { position: 'absolute', top: 64, left: 0, right: 0, borderRadius: 16, borderWidth: 1, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  suggestionItem: { padding: 16, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
  suggestionText: { fontSize: 14, fontWeight: '700' },
  suggestionUnit: { fontSize: 12, color: '#94A3B8' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  purposeModal: { width: '100%', maxHeight: '70%', borderRadius: 32, padding: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  purposeList: { marginBottom: 10 },
  purposeItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  purposeTextItem: { fontSize: 16, fontWeight: '600' },
  photoContainer: { marginTop: 10, marginBottom: 10 },
  photoLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' },
  photoList: { flexDirection: 'row', gap: 16 },
  photoPreview: { flex: 1, height: 160, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 6 },
  addPhotoBtn: { flex: 1, height: 160, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  addPhotoText: { fontSize: 10, fontWeight: '900', marginTop: 8 },
  cameraIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  slotLabel: { fontSize: 9, fontWeight: '900', marginBottom: 8, letterSpacing: 0.5 },
  retakeBtn: { position: 'absolute', bottom: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  retakeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
  fullImage: { width: '90%', height: '80%' },
  visitorSuggestions: { marginBottom: 8 },
  suggestionLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' },
  suggestionScroll: { gap: 8 },
  unitChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  unitChipText: { fontSize: 13, fontWeight: 'bold' },
  submitButton: { height: 60, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  matchedBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8,
    marginLeft: 8
  },
  optionalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  optionalText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  }
});

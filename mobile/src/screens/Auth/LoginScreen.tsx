import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Dimensions, 
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { Shield, Smartphone, Key, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true })
    ]).start();
  }, []);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.sendOTP(phoneNumber);
      
      if (response.data.otp) {
        setOtp(response.data.otp);
        setIsOtpSent(true);
        setLoading(false);
        // Auto-submit after a tiny delay
        setTimeout(() => {
          handleVerifyOtp(phoneNumber, response.data.otp);
        }, 1200);
      } else {
        setIsOtpSent(true);
        setLoading(false);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      Alert.alert('Connection Error', msg);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (phone = phoneNumber, code = otp) => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      await login({ phoneNumber: phone, otp: code }); 
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid OTP');
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#052E16' : '#F1F8E9' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Dynamic Background Elements */}
      <View style={[styles.bgCircle1, { backgroundColor: isDark ? '#14532D' : '#E8F5E9' }]} />
      <View style={[styles.bgCircle2, { backgroundColor: isDark ? '#064E3B' : '#DCEDC8' }]} />
      <View style={[styles.blurOverlay, { backgroundColor: isDark ? 'rgba(5, 46, 22, 0.4)' : 'rgba(241, 248, 233, 0.4)' }]} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          <Animated.View style={[styles.header, { transform: [{ scale: logoScale }] }]}>
            <View style={[styles.logoGlow, { backgroundColor: isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(46, 125, 50, 0.1)' }]}>
              <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                <Shield size={48} color="#fff" />
              </View>
            </View>
            <Text style={[styles.title, { color: isDark ? '#fff' : colors.primary }]}>KLB Connect</Text>
            <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(74, 222, 128, 0.2)' : 'rgba(46, 125, 50, 0.1)' }]}>
              <Text style={[styles.badgeText, { color: isDark ? '#4ADE80' : colors.primary }]}>ELITE SECURITY PLATFORM</Text>
            </View>
          </Animated.View>

          <View style={[styles.glassCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.7)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[styles.cardHeader, { color: isDark ? '#fff' : '#1B5E20' }]}>{isOtpSent ? 'Verify Access' : 'Secure Login'}</Text>
            <Text style={[styles.cardSub, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
              {isOtpSent 
                ? `Authorizing entry for +91 ${phoneNumber}` 
                : 'Enter your credentials to manage your society ecosystem'}
            </Text>

            <View style={styles.inputSection}>
              {isOtpSent ? (
                <View style={[styles.inputGroup, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F1F5F9', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent' }]}>
                  <Key size={22} color={isDark ? "#4ADE80" : colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: isDark ? '#fff' : '#333' }]}
                    placeholder="ENTER OTP"
                    placeholderTextColor={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus
                  />
                  {otp.length === 6 && <CheckCircle2 size={20} color={isDark ? "#4ADE80" : colors.primary} />}
                </View>
              ) : (
                <View style={[styles.inputGroup, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F1F5F9', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent' }]}>
                  <Smartphone size={22} color={isDark ? "#4ADE80" : colors.primary} style={styles.inputIcon} />
                  <Text style={[styles.prefix, { color: isDark ? '#fff' : '#333' }]}>+91</Text>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#fff' : '#333' }]}
                    placeholder="PHONE NUMBER"
                    placeholderTextColor={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.mainButton, { backgroundColor: colors.primary }, loading && styles.buttonLoading]}
              onPress={isOtpSent ? () => handleVerifyOtp() : handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    {isOtpSent ? 'AUTHORIZE NOW' : 'SEND ACCESS CODE'}
                  </Text>
                  <ArrowRight size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {isOtpSent && (
              <TouchableOpacity onPress={() => setIsOtpSent(false)} style={styles.backButton}>
                <Text style={[styles.backText, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>Edit Phone Number</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]}>ENTERPRISE GRADE SECURITY</Text>
            <View style={[styles.dot, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
            <Text style={[styles.footerText, { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]}>ENCRYPTED</Text>
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgCircle1: { position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: 150 },
  bgCircle2: { position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, borderRadius: 125 },
  blurOverlay: { ...StyleSheet.absoluteFillObject },
  keyboardView: { flex: 1 },
  inner: { flex: 1, padding: 32, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  logoGlow: { padding: 10, borderRadius: 40 },
  logoContainer: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', shadowColor: '#4ADE80', shadowOpacity: 0.3, shadowRadius: 20, elevation: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  title: { fontSize: 36, fontWeight: '900', marginTop: 16, letterSpacing: -1 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  glassCard: { borderRadius: 40, padding: 32, borderWidth: 1 },
  cardHeader: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  cardSub: { fontSize: 14, lineHeight: 20, marginBottom: 32 },
  inputSection: { marginBottom: 32 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 20, height: 68, borderWidth: 1 },
  inputIcon: { marginRight: 16 },
  prefix: { fontSize: 18, fontWeight: 'bold', marginRight: 12 },
  input: { flex: 1, fontSize: 18, fontWeight: '600', letterSpacing: 1 },
  mainButton: { height: 72, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  buttonLoading: { opacity: 0.8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  backButton: { marginTop: 24, alignItems: 'center' },
  backText: { fontSize: 14 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 48 },
  footerText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  dot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 12 }
});

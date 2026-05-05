import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { X, Camera as CameraIcon, RotateCcw, ShieldAlert, Settings as SettingsIcon } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

/**
 * KLB CONNECT - PREMIUM CAMERA COMPONENT
 * 
 * A robust, reusable camera interface that handles:
 * - Real-time permission lifecycle (Request/Denied/Permanently Denied)
 * - Hardware synchronization (Camera Ready status)
 * - Resource management (Focus-based lifecycle)
 * - High-fidelity UI with visual feedback
 */
export default function CameraScreen({ onCapture, onClose }: { onCapture: (uri: string) => void, onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);

  // Sync permission on every focus/mount to ensure state is fresh
  useEffect(() => {
    if (isFocused && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [isFocused, permission]);

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraReady) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: Platform.OS === 'android',
        base64: false,
      });

      if (photo?.uri) {
        onCapture(photo.uri);
      }
    } catch (error) {
      console.error('📸 [Camera] Capture failed:', error);
      Alert.alert('System Error', 'Failed to capture photo. Please check hardware permissions.');
    }
  };

  // 1. Loading State (Checking permissions)
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Initializing Optics...</Text>
      </View>
    );
  }

  // 2. Permission Denied State
  if (!permission.granted) {
    const isPermanentlyDenied = !permission.canAskAgain;

    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIconCircle}>
          <ShieldAlert size={40} color="#FF5252" />
        </View>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSub}>
          {isPermanentlyDenied 
            ? "We need camera access to verify visitors. Please enable it in your system settings."
            : "Permission is required to capture visitor documentation."}
        </Text>
        
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={isPermanentlyDenied ? () => Linking.openSettings() : () => requestPermission()}
        >
          <Text style={styles.primaryBtnText}>
            {isPermanentlyDenied ? "OPEN SETTINGS" : "GRANT PERMISSION"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
          <Text style={styles.secondaryBtnText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Active Camera View
  return (
    <View style={styles.container}>
      {isFocused ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
          onMountError={(error) => {
            console.error('📸 [Camera] Mount Error:', error);
            Alert.alert('Hardware Error', 'Could not sync with camera module.');
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X color="#fff" size={28} />
              </TouchableOpacity>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: cameraReady ? '#4CAF50' : '#FFC107' }]} />
                <Text style={styles.statusText}>{cameraReady ? 'LIVE' : 'SYNCING'}</Text>
              </View>
            </View>

            <View style={styles.viewfinderWrapper}>
              <View style={styles.viewfinderGuide} />
              <Text style={styles.guideText}>Position face/ID within frame</Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.captureWrapper}>
                <TouchableOpacity
                  style={[styles.captureOuter, !cameraReady && { opacity: 0.5 }]}
                  onPress={handleCapture}
                  disabled={!cameraReady}
                >
                  <View style={styles.captureInner} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </CameraView>
      ) : (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 40,
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontWeight: '700',
    letterSpacing: 2,
    fontSize: 10,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  viewfinderWrapper: {
    alignItems: 'center',
  },
  viewfinderGuide: {
    width: width * 0.75,
    height: width * 0.75,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 32,
    borderStyle: 'dashed',
  },
  guideText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 20,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
  },
  captureWrapper: {
    padding: 10,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,82,82,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  primaryBtn: {
    backgroundColor: '#2E7D32',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 14,
  },
  secondaryBtn: {
    marginTop: 20,
    paddingVertical: 12,
  },
  secondaryBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 12,
  },
});

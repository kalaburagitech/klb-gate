import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing, StatusBar } from 'react-native';
import { Lock, ShieldCheck } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  // Animation Values
  const kOpacity = useRef(new Animated.Value(0)).current;
  const kScale = useRef(new Animated.Value(0.8)).current;
  
  // Security Arms (Coming from sides)
  const leftArmPos = useRef(new Animated.Value(-width)).current;
  const rightArmPos = useRef(new Animated.Value(width)).current;
  const armOpacity = useRef(new Animated.Value(0)).current;

  // Gate Connection & Impact
  const connectionPulse = useRef(new Animated.Value(0)).current;
  const gateFrameOpacity = useRef(new Animated.Value(0)).current;
  
  // Branding
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTracking = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // 1. Identity Reveal
    Animated.parallel([
      Animated.timing(kOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(kScale, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }),
    ]).start();

    // 2. Side Arms Connection with Text Labels
    Animated.parallel([
      Animated.timing(armOpacity, { toValue: 1, duration: 500, delay: 600, useNativeDriver: true }),
      Animated.timing(leftArmPos, { 
        toValue: 0, 
        duration: 1800, 
        delay: 600, 
        easing: Easing.bezier(0.19, 1, 0.22, 1), 
        useNativeDriver: true 
      }),
      Animated.timing(rightArmPos, { 
        toValue: 0, 
        duration: 1800, 
        delay: 600, 
        easing: Easing.bezier(0.19, 1, 0.22, 1), 
        useNativeDriver: true 
      }),
    ]).start();

    // 3. Connection Impact
    Animated.sequence([
      Animated.delay(2400),
      Animated.parallel([
        Animated.timing(gateFrameOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(connectionPulse, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.timing(connectionPulse, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // 4. Branding Final Reveal
    Animated.parallel([
      Animated.timing(textOpacity, { toValue: 1, duration: 1500, delay: 3500, useNativeDriver: false }),
      Animated.timing(textTracking, { toValue: 6, duration: 2500, delay: 3500, useNativeDriver: false }),
    ]).start();

    const timer = setTimeout(onFinish, 8000);
    return () => clearTimeout(timer);
  }, []);

  const pulseScale = connectionPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const pulseOpacity = connectionPulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.vignette} />

      <View style={styles.gateStage}>
        
        {/* Core Identity */}
        <Animated.View style={[styles.kCore, { opacity: kOpacity, transform: [{ scale: kScale }] }]}>
          <Text style={styles.letterK}>K</Text>
        </Animated.View>

        {/* The Gate Frame */}
        <Animated.View style={[styles.gateBox, { opacity: gateFrameOpacity }]}>
          <View style={styles.boxScanner} />
        </Animated.View>

        {/* Connecting Side Arms with Text labels */}
        <View style={styles.armsLayer}>
          
          {/* Left Arm (KLB) */}
          <Animated.View style={[
            styles.securityArm, 
            { opacity: armOpacity, transform: [{ translateX: leftArmPos }] }
          ]}>
            <View style={styles.armContent}>
              <Text style={styles.armText}>KLB</Text>
              <View style={styles.armLine} />
            </View>
            <View style={styles.armHead} />
          </Animated.View>

          {/* Right Arm (GATE) */}
          <Animated.View style={[
            styles.securityArm, 
            { opacity: armOpacity, transform: [{ translateX: rightArmPos }] }
          ]}>
            <View style={styles.armHead} />
            <View style={styles.armContent}>
              <Text style={styles.armText}>GATE</Text>
              <View style={styles.armLine} />
            </View>
          </Animated.View>
        </View>

        {/* Energy Pulse on Connection */}
        <Animated.View style={[styles.impactPulse, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />

      </View>

      {/* Corporate Branding */}
      <View style={styles.footer}>
        <Animated.Text style={[styles.appName, { opacity: textOpacity, letterSpacing: textTracking }]}>
          KLB GATE
        </Animated.Text>
        <Animated.View style={[styles.taglineRow, { opacity: textOpacity }]}>
          <ShieldCheck size={14} color="#2E7D32" />
          <Text style={styles.tagline}>INTELLIGENT GATE ECOSYSTEM</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#010101', justifyContent: 'center', alignItems: 'center' },
  vignette: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'transparent' },
  gateStage: { width: width, height: 260, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  kCore: { width: 100, height: 100, borderRadius: 28, backgroundColor: 'rgba(46, 125, 50, 0.03)', borderWidth: 1, borderColor: 'rgba(46, 125, 50, 0.4)', justifyContent: 'center', alignItems: 'center', shadowColor: '#2E7D32', shadowRadius: 20, shadowOpacity: 0.5 },
  letterK: { color: '#fff', fontSize: 60, fontWeight: '100', letterSpacing: -2 },
  gateBox: { position: 'absolute', width: 150, height: 150, borderWidth: 1, borderColor: '#2E7D32', borderRadius: 16, shadowColor: '#2E7D32', shadowRadius: 20, shadowOpacity: 0.6 },
  boxScanner: { position: 'absolute', width: '100%', height: 2, backgroundColor: 'rgba(46, 125, 50, 0.5)', top: '50%' },
  armsLayer: { position: 'absolute', width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  securityArm: { flexDirection: 'row', alignItems: 'center' },
  armContent: { alignItems: 'center' },
  armText: { color: '#2E7D32', fontSize: 10, fontWeight: 'bold', letterSpacing: 3, marginBottom: 4, textShadowColor: 'rgba(46, 125, 50, 0.5)', textShadowRadius: 5 },
  armLine: { width: width / 2 - 80, height: 2, backgroundColor: '#2E7D32', opacity: 0.8 },
  armHead: { width: 4, height: 40, backgroundColor: '#2E7D32', borderRadius: 2, shadowColor: '#2E7D32', shadowRadius: 10, shadowOpacity: 1 },
  impactPulse: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 5, borderColor: '#2E7D32' },
  footer: { position: 'absolute', bottom: 80, alignItems: 'center' },
  appName: { color: '#fff', fontSize: 30, fontWeight: '700' },
  taglineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15 },
  tagline: { color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: 4, fontWeight: '700' },
});

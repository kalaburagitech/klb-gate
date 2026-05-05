import React from 'react';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TextInputProps,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
  ActivityIndicator,
  Modal,
  Dimensions,
  Image
} from 'react-native';
import { X } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * PREMIUM PHOTO MODAL COMPONENT
 */
export const PhotoModal = ({ 
  visible, 
  onClose, 
  photoUrl, 
  title 
}: { 
  visible: boolean, 
  onClose: () => void, 
  photoUrl: string | undefined,
  title?: string
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalCloseArea} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <Animated.View style={[
          styles.modalContent, 
          { backgroundColor: colors.card, borderColor: colors.border }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title || 'Visitor Photo'}</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.imageContainer}>
            {photoUrl ? (
              <Image 
                source={{ uri: photoUrl }} 
                style={styles.fullImage} 
                resizeMode="contain" 
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={{ color: colors.text, opacity: 0.5 }}>No Photo Available</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.modalFooterBtn, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.modalFooterText}>CLOSE VIEW</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
import { useTheme } from '../context/ThemeContext';

/**
 * PREMIUM CARD COMPONENT
 */
export const Card = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        shadowColor: isDark ? '#000' : '#2E7D32',
      }, 
      style
    ]}>
      {children}
    </View>
  );
};

/**
 * PREMIUM BUTTON COMPONENT
 */
export const Button = ({ 
  title, 
  loadingTitle,
  onPress, 
  variant = 'primary', 
  loading = false, 
  icon,
  style 
}: { 
  title: string, 
  loadingTitle?: string,
  onPress: () => void, 
  variant?: 'primary' | 'secondary' | 'outline',
  loading?: boolean,
  icon?: React.ReactNode,
  style?: ViewStyle
}) => {
  const { colors } = useTheme();
  const scale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  const getStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary, borderRadius: 24 };
      case 'secondary':
        return { backgroundColor: colors.background, borderRadius: 24, borderWidth: 1, borderColor: colors.border };
      case 'outline':
        return { backgroundColor: 'transparent', borderRadius: 24, borderWidth: 2, borderColor: colors.primary };
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[styles.button, getStyle(), style, loading && styles.buttonLoading]}
        disabled={loading}
      >
        <View style={styles.buttonContent}>
          {loading ? (
            <>
              <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} size="small" />
              {loadingTitle && (
                <Text style={[
                  styles.buttonText, 
                  { color: variant === 'primary' ? '#fff' : colors.primary, marginLeft: 10 }
                ]}>
                  {loadingTitle}
                </Text>
              )}
            </>
          ) : (
            <>
              {icon && <View style={styles.buttonIcon}>{icon}</View>}
              <Text style={[
                styles.buttonText, 
                { color: variant === 'primary' ? '#fff' : colors.primary }
              ]}>
                {title}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * PREMIUM INPUT COMPONENT
 */
export const Input = (props: TextInputProps & { label?: string, icon?: React.ReactNode }) => {
  const { colors, isDark } = useTheme();
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={styles.inputContainer}>
      {props.label && <Text style={[styles.label, { color: colors.primary }]}>{props.label}</Text>}
      <View style={[
        styles.inputWrapper, 
        { 
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          borderColor: focused ? colors.primary : 'transparent',
          borderWidth: 1.5
        }
      ]}>
        {props.icon && <View style={styles.inputIcon}>{props.icon}</View>}
        <TextInput
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
          style={[styles.input, { color: colors.text }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 16,
  },
  button: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 68,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCloseArea: {
    ...StyleSheet.absoluteFillObject
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullImage: {
    width: '100%',
    height: '100%'
  },
  placeholderImage: {
    padding: 40,
    alignItems: 'center'
  },
  modalFooterBtn: {
    margin: 20,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalFooterText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2
  }
});

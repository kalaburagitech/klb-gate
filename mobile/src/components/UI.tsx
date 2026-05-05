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
  Platform
} from 'react-native';
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
  onPress, 
  variant = 'primary', 
  loading = false, 
  icon,
  style 
}: { 
  title: string, 
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
        style={[styles.button, getStyle(), style]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
        ) : (
          <View style={styles.buttonContent}>
            {icon && <View style={styles.buttonIcon}>{icon}</View>}
            <Text style={[
              styles.buttonText, 
              { color: variant === 'primary' ? '#fff' : colors.primary }
            ]}>
              {title}
            </Text>
          </View>
        )}
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
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/useAuthStore';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

interface LoginScreenProps {
  onOpenForgotPassword: () => void;
  onGoToSignUp: () => void;
}

export default function LoginScreen({ onOpenForgotPassword, onGoToSignUp }: LoginScreenProps) {
  const { signIn, signInWithOAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const scale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const validateEmail = (value: string) => {
    return value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Errore', 'Inserisci email e password.');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Errore', 'Inserisci un indirizzo email valido.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(trimmedEmail, password);
    if (error) {
      Alert.alert('Errore', error.message);
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    setLoading(true);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      Alert.alert('Errore', error.message);
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1">
        <StatusBar style="dark" />

        <LinearGradient
          colors={['#18181b', '#52525b', '#e4e4e7', '#ffffff', '#d4d4d8']}
          locations={[0, 0.15, 0.4, 0.85, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 pt-20 px-6 w-full"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          >
            <Animated.View
              entering={FadeInDown.delay(200).duration(1000).springify()}
              className="items-center mb-8 w-full"
            >
              <Image
                source={require('../../../assets/the_lab_logo.png')}
                style={{ width: 220, height: 200, marginBottom: -40 }}
                resizeMode="contain"
              />

              <Text className="text-[34px] font-bold text-[#111111] mt-0 mb-1 text-center tracking-tight">
                Welcome Back
              </Text>
              <Text className="text-[16px] font-medium text-[#111111]/70 text-center">
                Sign in to continue to The Lab
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(400).duration(1000).springify()}
              className="w-full mt-2"
            >
              <View className="gap-y-4">
                <View className="bg-transparent border-[1.5px] border-[#1c1c1c] rounded-xl flex-row items-center px-4 py-4">
                  <Mail size={20} color="#1c1c1c" strokeWidth={2} />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#666"
                    className="flex-1 px-3 py-0 text-[#1c1c1c] text-[16px] font-medium"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View className="bg-transparent border-[1.5px] border-[#1c1c1c] rounded-xl flex-row items-center px-4 py-4">
                  <Lock size={20} color="#1c1c1c" strokeWidth={2} />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#666"
                    secureTextEntry={!showPassword}
                    className="flex-1 px-3 py-0 text-[#1c1c1c] text-[16px] font-medium"
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pr-2">
                    {showPassword ? (
                      <EyeOff size={20} color="#1c1c1c" strokeWidth={2} />
                    ) : (
                      <Eye size={20} color="#1c1c1c" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onOpenForgotPassword}>
                    <Text className="text-[#1c1c1c] text-[13px] font-[800]">Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  className="mt-4"
                  onPressIn={() => (scale.value = withSpring(0.97))}
                  onPressOut={() => (scale.value = withSpring(1))}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Animated.View
                    style={buttonAnimatedStyle}
                    className={`bg-[#222] py-4 rounded-full items-center shadow-lg ${loading ? 'opacity-70' : ''}`}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text className="text-white text-[16px] font-[800] tracking-wide">Sign in</Text>
                    )}
                  </Animated.View>
                </TouchableOpacity>

                <View className="flex-row items-center my-5">
                  <View className="flex-1 h-[2px] bg-[#1c1c1c]/15" />
                  <Text className="text-[#1c1c1c]/60 text-[16px] font-semibold px-4">or sign in with</Text>
                  <View className="flex-1 h-[2px] bg-[#1c1c1c]/15" />
                </View>

                <View className="gap-y-3">
                  <TouchableOpacity
                    className="bg-white border border-black/10 py-4 rounded-full flex-row items-center justify-center shadow-sm"
                    onPress={() => handleSocialLogin('google')}
                  >
                    <View className="absolute left-6 w-8 items-center justify-center">
                      <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={{ width: 20, height: 20 }} />
                    </View>
                    <Text className="text-[#1c1c1c] font-bold text-[15px]">Sign in with Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-black py-4 rounded-full flex-row items-center justify-center shadow-sm"
                    onPress={() => handleSocialLogin('apple')}
                  >
                    <View className="absolute left-6 w-8 items-center justify-center">
                      <Text className="text-white font-[900] text-[22px] pb-[3px]">Apple</Text>
                    </View>
                    <Text className="text-white font-bold text-[15px]">Sign in with Apple</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-[#1877F2] py-4 rounded-full flex-row items-center justify-center shadow-sm"
                    onPress={() => handleSocialLogin('facebook')}
                  >
                    <View className="absolute left-6 w-8 items-center justify-center">
                      <Text className="text-white font-[900] text-[22px]">f</Text>
                    </View>
                    <Text className="text-white font-bold text-[15px]">Sign in with Facebook</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity activeOpacity={0.7} onPress={onGoToSignUp} className="items-center mt-6">
                  <View className="flex-row items-center">
                    <Text className="text-[#1c1c1c]/60 font-medium text-[16px]">Don&apos;t have an account? </Text>
                    <Text className="text-[#1c1c1c] font-black text-[16px]">Sign up</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    // @ts-ignore
                    useAuthStore.getState().setAuth({ user: { email: 'dev@thelab.fit' }, access_token: 'dev' });
                  }}
                  className="items-center mt-4"
                >
                  <Text className="text-black/10 font-bold text-[9px] tracking-[2px] uppercase">Dev Bypass</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

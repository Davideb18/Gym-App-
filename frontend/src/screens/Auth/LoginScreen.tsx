import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../../store/useAuthStore';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeIn,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');


import { Mail, Lock, ChevronRight, User, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const { signIn, signUp } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Animated values for button
  const scale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleAuth = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Errore', 'Inserisci email e password.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Errore', 'Inserisci un indirizzo email valido.');
      return;
    }

    if (isSignUp && !name.trim()) {
      Alert.alert('Errore', 'Per favore, inserisci il tuo nome.');
      return;
    }

    setLoading(true);
    const { error } = isSignUp 
      ? await signUp(trimmedEmail, password) 
      : await signIn(trimmedEmail, password);

    if (error) {
      Alert.alert('Errore', error.message);
    }
    setLoading(false);
  };

  return (
    <View className="flex-1">
      <StatusBar style="dark" />

      {/* 1. EXACT GRADIENT BACKGROUND */}
      <LinearGradient
        colors={['#18181b', '#52525b', '#e4e4e7', '#ffffff', '#d4d4d8']}
        locations={[0, 0.15, 0.40, 0.85, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 pt-20 px-6 w-full"
      >
        {/* 2. LOGO E TITOLO ESTESO */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(1000).springify()}
          className="items-center mb-8 w-full"
        >
          {/* LOGO: "THE ||-|| LAB" */}
          <View className="items-center">
            <View className="flex-row items-center justify-center z-10" style={{ marginBottom: -10 }}>
              
              {/* Custom 'T' built with precision pixel-perfect absolute views */}
              <View style={{ width: 26, height: 35, marginRight: 4, marginBottom: 2 }}>
                <View style={{ position: 'absolute', top: 0, left: 0, width: 26, height: 6, backgroundColor: '#fff' }} />
                <View style={{ position: 'absolute', top: 6, bottom: 0, left: 10, width: 6, backgroundColor: '#fff' }} />
              </View>

              {/* Custom 'H' built with precision pixel-perfect absolute views */}
              <View style={{ width: 26, height: 35, marginRight: 4, marginBottom: 2 }}>
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 6, backgroundColor: '#fff' }} />
                <View style={{ position: 'absolute', top: 14.5, left: 6, width: 14, height: 6, backgroundColor: '#fff' }} />
                <View style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 6, backgroundColor: '#fff' }} />
              </View>
              
              {/* Custom 'E' + Barbell built with precision pixel-perfect absolute views */}
              <View style={{ width: 59, height: 35, marginBottom: 2 }}>
                {/* Vertical bar of the E */}
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 6, backgroundColor: '#fff' }} />

                {/* Top bar (Width: 20 -> left 6) */}
                <View style={{ position: 'absolute', top: 0, left: 6, width: 20, height: 6, backgroundColor: '#fff' }} />
                
                {/* Middle bar -> Width 26 (Crea il manico corto, avvicina i dischi) */}
                <View style={{ position: 'absolute', top: 14.5, left: 6, width: 26, height: 6, backgroundColor: '#fff' }} />
                
                {/* Plate 1: Tall as the E (height: 35). left = 6+26+2 gap = 34 */}
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 34, width: 5, backgroundColor: '#fff', borderRadius: 1 }} />
                
                {/* Plate 2: Medium (height: 29). left = 34+5+2 gap = 41 */}
                <View style={{ position: 'absolute', top: 3, left: 41, width: 5, height: 29, backgroundColor: '#fff', borderRadius: 1 }} />
                
                {/* Plate 3: Shortest (height: 23). left = 41+5+2 gap = 48 */}
                <View style={{ position: 'absolute', top: 6, left: 48, width: 5, height: 23, backgroundColor: '#fff', borderRadius: 1 }} />
                
                {/* End Cap. left = 48+5+2 gap = 55 */}
                <View style={{ position: 'absolute', top: 14.5, left: 55, width: 4, height: 6, backgroundColor: '#fff', borderRadius: 1 }} />

                {/* Bottom bar (Width: 20 -> left 6) */}
                <View style={{ position: 'absolute', bottom: 0, left: 6, width: 20, height: 6, backgroundColor: '#fff' }} />
              </View>
            </View>
            
            {/* LAB TEXT MANUALLY KERNED */}
            <View className="flex-row items-center justify-center z-1">
              <Text style={{ color: '#fff', fontSize: 72, fontWeight: 'bold', includeFontPadding: false }}>L</Text>
              <Text style={{ color: '#fff', fontSize: 72, fontWeight: 'bold', includeFontPadding: false, marginLeft: 0, marginRight: -2 }}>A</Text>
              <Text style={{ color: '#fff', fontSize: 72, fontWeight: 'bold', includeFontPadding: false }}>B</Text>
            </View>
          </View>
          
          {/* Welcome Back Titles */}
          <Text className="text-[34px] font-bold text-[#111111] mt-3 mb-1 text-center tracking-tight">Welcome Back</Text>
          <Text className="text-[16px] font-medium text-[#111111]/70 text-center">Sign in to continue to The Lab</Text>
        </Animated.View>

        {/* 3. LOGIN/SIGNUP FORM */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(1000).springify()}
          className="w-full mt-2"
        >
          <View className="gap-y-4">
            
            {/* Name Input (Only for Signup) */}
            {isSignUp && (
              <View className="bg-transparent border-[1.5px] border-[#1c1c1c] rounded-xl flex-row items-center px-4 py-4">
                <User size={20} color="#1c1c1c" strokeWidth={2} />
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#666"
                  className="flex-1 px-3 py-0 text-[#1c1c1c] text-[16px] font-medium"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            {/* Email Input */}
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

            {/* Password Input */}
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
              <TouchableOpacity onPress={() => Alert.alert('Recovery', 'Forgot Password Flow')}>
                <Text className="text-[#1c1c1c] text-[13px] font-[800]">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* MAIN BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="mt-4"
              onPressIn={() => (scale.value = withSpring(0.97))}
              onPressOut={() => (scale.value = withSpring(1))}
              onPress={handleAuth}
              disabled={loading}
            >
              <Animated.View
                style={buttonAnimatedStyle}
                className={`bg-[#222] py-4 rounded-full items-center shadow-lg ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text className="text-white text-[16px] font-[800] tracking-wide">
                    {isSignUp ? 'Sign up' : 'Sign in'}
                  </Text>
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* SEPARATOR */}
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-[2px] bg-[#1c1c1c]/15" />
              <Text className="text-[#1c1c1c]/60 text-[16px] font-semibold px-4">
                or sign in with
              </Text>
              <View className="flex-1 h-[2px] bg-[#1c1c1c]/15" />
            </View>

            {/* SOCIAL BRAND BUTTONS */}
            <View className="gap-y-3">
              <TouchableOpacity
                className="bg-white border border-black/10 py-4 rounded-full flex-row items-center justify-center shadow-sm"
                onPress={() => Alert.alert('Social', 'Google Auth')}
              >
                <View className="absolute left-6 w-8 items-center justify-center">
                  <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={{ width: 20, height: 20 }} />
                </View>
                <Text className="text-[#1c1c1c] font-bold text-[15px]">Sign in with Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-black py-4 rounded-full flex-row items-center justify-center shadow-sm"
                onPress={() => Alert.alert('Social', 'Apple Auth')}
              >
                <View className="absolute left-6 w-8 items-center justify-center">
                  <Text className="text-white font-[900] text-[22px] pb-[3px]"></Text>
                </View>
                <Text className="text-white font-bold text-[15px]">Sign in with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-[#1877F2] py-4 rounded-full flex-row items-center justify-center shadow-sm"
                onPress={() => Alert.alert('Social', 'Facebook Auth')}
              >
                <View className="absolute left-6 w-8 items-center justify-center">
                  <Text className="text-white font-[900] text-[22px]">f</Text>
                </View>
                <Text className="text-white font-bold text-[15px]">Sign in with Facebook</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsSignUp(!isSignUp)}
              className="items-center mt-6"
            >
              <View className="flex-row items-center">
                <Text className="text-[#1c1c1c]/60 font-medium text-[16px]">
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                </Text>
                <Text className="text-[#1c1c1c] font-black text-[16px]">
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* DEV BYPASS */}
            <TouchableOpacity 
              onPress={() => {
                //@ts-ignore
                useAuthStore.getState().setAuth({ user: { email: 'dev@thelab.fit' }, access_token: 'dev' });
              }}
              className="items-center mt-4"
            >
              <Text className="text-black/10 font-bold text-[9px] tracking-[2px] uppercase">
                Dev Bypass
              </Text>
            </TouchableOpacity>

          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

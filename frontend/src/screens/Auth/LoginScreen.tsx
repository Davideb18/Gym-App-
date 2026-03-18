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
        colors={['#4B5563', '#FFFFFF', '#4B5563']}
        className="absolute inset-0"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center items-center px-6"
      >
        {/* 2. LOGO AREA */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(1000).springify()}
          className="items-center mb-10"
        >
          <View className="items-center">
            <Text className="text-black text-[120px] font-[1000] tracking-[-12px] uppercase leading-[90px]">
              THE
            </Text>
            <Text className="text-black text-[110px] font-[1000] tracking-[-10px] uppercase leading-[90px] border-t-[10px] border-black pt-2 mt-2">
              LAB
            </Text>
          </View>
          
          <Text className="text-black/20 font-black mt-16 text-[10px] uppercase tracking-[6px]">
            Laboratory Access v6.0
          </Text>
        </Animated.View>

        {/* 3. LOGIN/SIGNUP FORM */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(1000).springify()}
          className="w-full"
        >
          <View className="gap-y-4">
            
            {/* Name Input (Only for Signup) */}
            {isSignUp && (
              <View className="bg-white/70 rounded-[22px] border border-black/10 flex-row items-center px-5 py-1.5 shadow-sm">
                <User size={20} color="#666" strokeWidth={2.5} />
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#A0A0A0"
                  className="flex-1 p-4 text-black text-base font-bold"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            {/* Email Input */}
            <View className="bg-white/70 rounded-[22px] border border-black/10 flex-row items-center px-5 py-1.5 shadow-sm">
              <Mail size={20} color="#666" strokeWidth={2.5} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#A0A0A0"
                className="flex-1 p-4 text-black text-base font-bold"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <View className="bg-white/70 rounded-[22px] border border-black/10 flex-row items-center px-5 py-1.5 shadow-sm">
              <Lock size={20} color="#666" strokeWidth={2.5} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={!showPassword}
                className="flex-1 p-4 text-black text-base font-bold"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
              </TouchableOpacity>
            </View>

            {/* MAIN BUTTON */}
            <TouchableOpacity
              activeOpacity={0.9}
              className="mt-4"
              onPressIn={() => (scale.value = withSpring(0.97))}
              onPressOut={() => (scale.value = withSpring(1))}
              onPress={handleAuth}
              disabled={loading}
            >
              <Animated.View
                style={buttonAnimatedStyle}
                className={`bg-[#1A1A1A] py-5 rounded-[22px] items-center shadow-2xl ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text className="text-white text-lg font-bold uppercase tracking-[4px]">
                    {isSignUp ? 'Apply Now' : 'Sign In'}
                  </Text>
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* DEV BYPASS - SOLO PER SVILUPPO */}
            <TouchableOpacity 
              onPress={() => {
                //@ts-ignore
                useAuthStore.getState().setAuth({ user: { email: 'dev@thelab.fit' }, access_token: 'dev' });
              }}
              className="items-center mt-2"
            >
              <Text className="text-gray-300 font-bold text-[8px] uppercase tracking-[2px]">
                Dev: Skip Login & Enter Lab
              </Text>
            </TouchableOpacity>

            {/* SEPARATOR */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px] bg-black/10" />
              <Text className="text-black/30 text-[9px] font-black uppercase tracking-[3px] px-6">
                or sign in with
              </Text>
              <View className="flex-1 h-[1px] bg-black/10" />
            </View>

            {/* SOCIAL BRAND BUTTONS */}
            <View className="gap-y-3">
              <TouchableOpacity
                className="bg-white border border-black/10 py-4 rounded-[22px] flex-row items-center px-8 shadow-sm"
                onPress={() => Alert.alert('Social', 'Coming Soon')}
              >
                <View className="w-5 h-5 bg-black/5 rounded-full items-center justify-center mr-4">
                  <Text className="text-black font-black text-[10px]">G</Text>
                </View>
                <Text className="text-black font-black text-xs uppercase tracking-[3px] flex-1 text-center">Google Access</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-black py-4 rounded-[22px] flex-row items-center px-8 shadow-md"
                onPress={() => Alert.alert('Social', 'Coming Soon')}
              >
                <View className="w-5 h-5 bg-white/20 rounded-full items-center justify-center mr-4">
                  <Text className="text-white font-black text-[10px]">A</Text>
                </View>
                <Text className="text-white font-black text-xs uppercase tracking-[3px] flex-1 text-center">Apple ID</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsSignUp(!isSignUp)}
              className="items-center mt-6"
            >
              <View className="flex-row">
                <Text className="text-black/30 font-bold uppercase text-[10px] tracking-widest">
                  {isSignUp ? 'Existing member? ' : "Don't have an account? "}
                </Text>
                <Text className="text-black font-black uppercase text-[10px] tracking-[3px] border-b-2 border-black/10">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

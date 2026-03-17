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
import { supabase } from '../../api/supabaseClient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // FUNCTION TO LOGIN
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Errore', 'Inserisci email e password per entrare nel laboratorio.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Accesso Negato', error.message);
    } else {
      // Il listener in App.tsx o il router gestirà il cambio di schermata
      console.log('Accesso eseguito con successo!');
    }
    setLoading(false);
  };

  // FUNCTION TO SIGN UP
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Errore', 'Inserisci email e password per entrare nel laboratorio.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Accesso Negato', error.message);
    } else {
      // Il listener in App.tsx o il router gestirà il cambio di schermata
      console.log('Accesso eseguito con successo!');
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* 1. CINEMATIC GRADIENT BACKGROUND */}
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2d0a0a', '#000000']}
        className="absolute inset-0"
      />

      {/* 2. HERO IMAGE (WIDER) */}
      <View className="absolute inset-0 px-4 py-8 items-center justify-center">
        <View className="w-full h-full rounded-[48px] overflow-hidden border border-white/10 shadow-2xl">
          <ImageBackground
            source={require('../../../assets/images/fitness_hero_bg.png')}
            className="flex-1"
            imageStyle={{ borderRadius: 48 }}
            resizeMode="cover"
          >
            {/* Darker Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.98)']}
              className="absolute inset-0"
            />
          </ImageBackground>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center items-center px-8"
      >
        {/* 3. LOGO AREA */}
        <View className="items-center mb-10">
          <Text className="text-white text-6xl font-[900] tracking-[-3px]">
            GYM<Text className="text-[#E50914]">APP</Text>
          </Text>
          <Text className="text-[#888] text-sm font-bold uppercase tracking-[2px] mt-[-4px]">
            Sculpt your future.
          </Text>
        </View>

        {/* 4. LOGIN FORM OVERLAY */}
        <BlurView
          intensity={90}
          tint="dark"
          className="w-full rounded-[40px] p-8 border border-white/10 bg-black/60 overflow-hidden"
        >
          <View className="gap-y-6">
            <View>
              <Text className="text-[#AAA] text-[10px] font-extrabold uppercase tracking-[1.5px] mb-2 ml-1">
                Email Address
              </Text>
              <TextInput
                placeholder="email@example.com"
                placeholderTextColor="#555"
                className="bg-white/5 rounded-2xl p-4 text-white text-base border border-white/10"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text className="text-[#AAA] text-[10px] font-extrabold uppercase tracking-[1.5px] mb-2 ml-1">
                Password
              </Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#555"
                secureTextEntry
                className="bg-white/5 rounded-2xl p-4 text-white text-base border border-white/10"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* WEIGHT BENCH BUTTON */}
            <TouchableOpacity
              activeOpacity={0.9}
              className="mt-2"
              onPress={() => (isSignUp ? handleSignUp() : handleLogin())}
              disabled={loading}
            >
              <View
                className={`bg-[#E50914] p-5 rounded-2xl items-center border-b-[6px] border-[#8a060d] shadow-lg shadow-[#E50914]/50 ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text className="text-white text-lg font-[900] uppercase tracking-[2px]">
                    {isSignUp ? 'Create Account' : 'Enter the Lab'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <Text className="text-[#444] font-bold text-xs uppercase tracking-widest">
                Lost access?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsSignUp(!isSignUp)}
              className="items-center mt-2"
            >
              <Text className="text-[#888] font-bold text-xs uppercase tracking-widest">
                {isSignUp ? 'Already a member? Login' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* 5. PLATE SOCIAL SECTION */}
        <View className="w-full mt-10 items-center">
          <View className="flex-row items-center w-full mb-6">
            <View className="flex-1 h-[1px] bg-white/5" />
            <Text className="text-[#333] text-[9px] font-black uppercase tracking-[3px] px-4">
              Power Up With
            </Text>
            <View className="flex-1 h-[1px] bg-white/5" />
          </View>

          <View className="flex-row gap-x-6">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert('Social', 'In arrivo...')}
            >
              <Image
                source={require('../../../assets/images/google_plate.png')}
                className="w-16 h-16 rounded-full"
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert('Social', 'In arrivo...')}
            >
              <Image
                source={require('../../../assets/images/fb_plate.png')}
                className="w-16 h-16 rounded-full"
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert('Social', 'In arrivo...')}
            >
              <Image
                source={require('../../../assets/images/apple_plate.png')}
                className="w-16 h-16 rounded-full"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

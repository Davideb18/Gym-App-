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
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/useAuthStore';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { Mail, Lock, User, Eye, EyeOff, Square, CheckSquare } from 'lucide-react-native';

interface SignupScreenProps {
  onGoToLogin: () => void;
}

export default function SignupScreen({ onGoToLogin }: SignupScreenProps) {
  const { signUp } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Aggiunte per GDPR
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeHealthData, setAgreeHealthData] = useState(false);

  const scale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || !name.trim()) {
      Alert.alert('Errore', 'Compila tutti i campi.');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Errore', 'Inserisci un indirizzo email valido.');
      return;
    }
    if (!agreeTerms || !agreeHealthData) {
      Alert.alert(
        'Consensi Obbligatori', 
        'Devi accettare i Termini Generali e acconsentire al trattamento dei Dati Sanitari per permetterci di generare le tue schede di allenamento.'
      );
      return;
    }

    setLoading(true);
    const { error } = await signUp(trimmedEmail, password, name);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      Alert.alert(
        'Successo!', 
        'Registrazione completata. Controlla la tua email per confermare l\'account prima di accedere.'
      );
      onGoToLogin();
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1">
        <StatusBar style="dark" />
        <LinearGradient
          colors={['#18181b', '#52525b', '#e4e4e7', '#ffffff', '#d4d4d8']}
          locations={[0, 0.15, 0.40, 0.85, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 pt-20 px-6 w-full">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
            <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="items-center mb-8 w-full">
              <Image source={require('../../../assets/the_lab_logo.png')} style={{ width: 220, height: 200, marginBottom: -40 }} resizeMode="contain" />
              <Text className="text-[34px] font-bold text-[#111111] mt-0 mb-1 text-center tracking-tight">Join The Lab</Text>
              <Text className="text-[16px] font-medium text-[#111111]/70 text-center">Create your account to get started</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).duration(1000).springify()} className="w-full mt-2 gap-y-4">
              <View className="bg-transparent border-[1.5px] border-[#1c1c1c] rounded-xl flex-row items-center px-4 py-4">
                <User size={20} color="#1c1c1c" strokeWidth={2} />
                <TextInput placeholder="Full Name" placeholderTextColor="#666" className="flex-1 px-3 py-0 text-[#1c1c1c] text-[16px] font-medium" value={name} onChangeText={setName} />
              </View>

              <View className="bg-transparent border-[1.5px] border-[#1c1c1c] rounded-xl flex-row items-center px-4 py-4">
                <Mail size={20} color="#1c1c1c" strokeWidth={2} />
                <TextInput placeholder="Email" placeholderTextColor="#666" className="flex-1 px-3 py-0 text-[#1c1c1c] text-[16px] font-medium" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
              </View>

              <View className="bg-transparent border-[1.5px] border-[#1c1c1c] rounded-xl flex-row items-center px-4 py-4">
                <Lock size={20} color="#1c1c1c" strokeWidth={2} />
                <TextInput placeholder="Password" placeholderTextColor="#666" secureTextEntry={!showPassword} className="flex-1 px-3 py-0 text-[#1c1c1c] text-[16px] font-medium" value={password} onChangeText={setPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pr-2">
                  {showPassword ? <EyeOff size={20} color="#1c1c1c" strokeWidth={2} /> : <Eye size={20} color="#1c1c1c" strokeWidth={2} />}
                </TouchableOpacity>
              </View>

              <Animated.View entering={FadeIn.delay(100).duration(500)} className="mt-2 mb-2 gap-y-3">
                <View className="flex-row items-center pr-4">
                  <TouchableOpacity activeOpacity={0.7} onPress={() => setAgreeTerms(!agreeTerms)}>
                    {agreeTerms ? <CheckSquare size={22} color="#1c1c1c" strokeWidth={2} /> : <Square size={22} color="#1c1c1c" strokeWidth={1.5} />}
                  </TouchableOpacity>
                  <Text className="text-[#1c1c1c]/80 text-[13px] ml-3 flex-1 leading-5">
                    Accetto i <Text className="text-blue-600 font-bold" onPress={() => Linking.openURL('https://www.iubenda.com')}>Termini e Condizioni</Text> e la <Text className="text-blue-600 font-bold" onPress={() => Linking.openURL('https://www.iubenda.com')}>Privacy</Text>.
                  </Text>
                </View>

                <View className="flex-row items-start pr-4">
                  <TouchableOpacity activeOpacity={0.7} onPress={() => setAgreeHealthData(!agreeHealthData)} className="mt-[2px]">
                    {agreeHealthData ? <CheckSquare size={22} color="#1c1c1c" strokeWidth={2} /> : <Square size={22} color="#1c1c1c" strokeWidth={1.5} />}
                  </TouchableOpacity>
                  <Text className="text-[#1c1c1c]/80 text-[13px] ml-3 flex-1 leading-5">
                    Acconsento al trattamento dei miei <Text className="text-blue-600 font-bold" onPress={() => Linking.openURL('https://commission.europa.eu/')}>dati relativi alla salute</Text> esclusivamente per la generazione delle schede.
                  </Text>
                </View>
              </Animated.View>

              <TouchableOpacity activeOpacity={0.8} className="mt-4" onPressIn={() => (scale.value = withSpring(0.97))} onPressOut={() => (scale.value = withSpring(1))} onPress={handleSignUp} disabled={loading}>
                <Animated.View style={buttonAnimatedStyle} className={`bg-[#222] py-4 rounded-full items-center shadow-lg ${loading ? 'opacity-70' : ''}`}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text className="text-white text-[16px] font-[800] tracking-wide">Sign up</Text>}
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} onPress={onGoToLogin} className="items-center mt-6">
                <View className="flex-row items-center">
                  <Text className="text-[#1c1c1c]/60 font-medium text-[16px]">Already have an account? </Text>
                  <Text className="text-[#1c1c1c] font-black text-[16px]">Sign in</Text>
                </View>
              </TouchableOpacity>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '../../store/useAuthStore';

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export default function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuthStore();

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert(
        'Success!',
        'A reset link has been sent to your email. Please check your inbox.',
        [{ text: 'OK', onPress: onBack }],
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-[#18181b]">
        <StatusBar style="light" />

        {/* EXACT GRADIENT BACKGROUND FROM LOGIN */}
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
            {/* Header / Logo */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(1000).springify()}
              className="items-center mb-8 w-full"
            >
              <View className="items-center justify-center mb-4">
                <View className="flex-row items-center">
                  <Text className="text-[34px] font-black text-[#111111] tracking-tight">
                    SPOTTER
                  </Text>
                  <View className="ml-1 bg-[#10B981] px-2 py-1 rounded-md">
                    <Text className="text-black text-[24px] font-black italic">AI</Text>
                  </View>
                </View>
              </View>
              <Text className="text-[34px] font-bold text-[#111111] mt-0 mb-1 text-center tracking-tight">
                Reset Password
              </Text>
              <Text className="text-[16px] font-medium text-[#111111]/70 text-center px-4">
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInUp.delay(400).duration(1000).springify()}
              className="w-full mt-2"
            >
              <View className="gap-y-4">
                <View className="bg-transparent border-[1.5px] border-[#1c1c1c] rounded-xl flex-row items-center px-4 py-4">
                  <Mail size={20} color="#1c1c1c" strokeWidth={2} />
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="#666"
                    className="flex-1 px-3 py-0 text-[#1c1c1c] text-[16px] font-medium"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="mt-4"
                  onPress={handleReset}
                  disabled={loading}
                >
                  <View
                    className={`bg-[#222] py-4 rounded-full items-center shadow-lg ${loading ? 'opacity-70' : ''}`}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <View className="flex-row items-center">
                        <Text className="text-white text-[16px] font-[800] tracking-wide mr-2">
                          Send Reset Link
                        </Text>
                        <ArrowRight size={20} color="#00FF00" strokeWidth={3} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity
                  onPress={onBack}
                  className="mt-6 py-4 rounded-full border border-black/10 bg-white/50 items-center justify-center"
                >
                  <View className="flex-row items-center">
                    <ArrowLeft size={18} color="#1c1c1c" strokeWidth={2.5} />
                    <Text className="text-[#1c1c1c] font-bold ml-2">Back to login</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

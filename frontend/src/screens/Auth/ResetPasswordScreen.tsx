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
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../api/supabaseClient';

interface ResetPasswordScreenProps {
  onSuccess: () => void;
}

export default function ResetPasswordScreen({ onSuccess }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success!', 'Your password has been updated successfully.', [
        { text: 'OK', onPress: onSuccess },
      ]);
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
            {/* Header */}
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
                New Password
              </Text>
              <Text className="text-[16px] font-medium text-[#111111]/70 text-center px-4">
                Set a strong password for your account to finish the recovery.
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInUp.delay(400).duration(1000).springify()}
              className="w-full mt-2"
            >
              <View className="gap-y-4">
                {/* Password Field */}
                <View className="bg-transparent border-[1.5px] border-[#1c1c1c] rounded-xl flex-row items-center px-4 py-4">
                  <Lock size={20} color="#1c1c1c" strokeWidth={2} />
                  <TextInput
                    placeholder="New Password"
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
                </View>

                {/* Confirm Password Field */}
                <View className="bg-transparent border-[1.5px] border-[#1c1c1c] rounded-xl flex-row items-center px-4 py-4">
                  <Lock size={20} color="#1c1c1c" strokeWidth={2} />
                  <TextInput
                    placeholder="Confirm New Password"
                    placeholderTextColor="#666"
                    secureTextEntry={!showPassword}
                    className="flex-1 px-3 py-0 text-[#1c1c1c] text-[16px] font-medium"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="mt-4"
                  onPress={handleUpdatePassword}
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
                          Update Password
                        </Text>
                        <CheckCircle2 size={20} color="#00FF00" strokeWidth={3} />
                      </View>
                    )}
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

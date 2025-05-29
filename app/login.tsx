import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useAuth } from './auth-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Additional user details for signup
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  
  const router = useRouter();
  const { login, signup } = useAuth();
  const scrollViewRef = useRef(null);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Request permission for accessing the media library
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images.');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setUserImage(imageUri);
        
        // Save the image to the app's directory
        // const fileName = `profile_${Date.now()}.jpg`;
        const newPath = "file:///data/user/0/dev.codewithbeto.obscura/files/profile_1747824310613.jpg";
        
        try {
          await FileSystem.copyAsync({
            from: imageUri,
            to: newPath
          });
          console.log('Image saved successfully at:', newPath);
          
          // You would typically save this path to your user data in a real app
          return newPath;
        } catch (error) {
          console.error('Error saving image:', error);
          Alert.alert('Error', 'Failed to save the image');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick an image');
    }
  };

  const handleSubmit = async () => {
    if (isLogin) {
      login(email, password);
    } else {
      // Validate fields
      if (!fullName || !email || !password || !confirmPassword || !phoneNumber) {
        Alert.alert('Missing Information', 'Please fill in all required fields');
        return;
      }
      
      if (password !== confirmPassword) {
        Alert.alert('Password Error', 'Passwords do not match');
        return;
      }
      
      if (!userImage) {
        Alert.alert('Profile Image', 'Please upload a profile image');
        return;
      }
      
      // In a real app, you would pass all user data to your signup function
      signup(email, password);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
              <View style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                  <Text style={styles.title}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </Text>
                  <Text style={styles.subtitle}>
                    {isLogin ? 'Sign in to continue' : 'Join our community today'}
                  </Text>
                </View>
                
                {!isLogin && (
                  <View style={styles.profileImageContainer}>
                    <TouchableOpacity 
                      style={styles.profileImageButton} 
                      onPress={pickImage}
                    >
                      {userImage ? (
                        <Image source={{ uri: userImage }} style={styles.profileImage} />
                      ) : (
                        <View style={styles.placeholderContainer}>
                          <Ionicons name="person" size={40} color="rgba(255, 255, 255, 0.6)" />
                          <Text style={styles.uploadText}>Upload Photo</Text>
                        </View>
                      )}
                      <View style={styles.cameraIconContainer}>
                        <Ionicons name="camera" size={16} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
                
                <View style={styles.inputContainer}>
                  {!isLogin && (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Full Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={fullName}
                        onChangeText={setFullName}
                      />
                    </View>
                  )}
                  
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  
                  {!isLogin && (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Phone Number</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your phone number"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                      />
                    </View>
                  )}
                  
                  {!isLogin && (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Date of Birth</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={dateOfBirth}
                        onChangeText={setDateOfBirth}
                      />
                    </View>
                  )}
                  
                  {!isLogin && (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Address</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Enter your address"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={address}
                        onChangeText={setAddress}
                        multiline={true}
                        numberOfLines={3}
                      />
                    </View>
                  )}
                  
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                  
                  {!isLogin && (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Confirm Password</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm your password"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                      />
                    </View>
                  )}
                </View>
                
                {isLogin && (
                  <TouchableOpacity style={styles.forgotPasswordButton}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.submitButton} 
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
                
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => {
                    setIsLogin(!isLogin);
                    // Reset form fields when switching modes
                    if (isLogin) {
                      setFullName('');
                      setPhoneNumber('');
                      setDateOfBirth('');
                      setUserImage(null);
                      setAddress('');
                    }
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  <Text style={styles.switchButtonText}>
                    {isLogin 
                      ? "Don't have an account? " 
                      : 'Already have an account? '}
                    <Text style={styles.switchButtonTextHighlight}>
                      {isLogin ? "Sign Up" : 'Sign In'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background color
  },
  keyboardView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  animatedContainer: {
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentContainer: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 30, 46, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(30, 30, 46, 0.6)',
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: '#6366F1', // Indigo color
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
  },
  switchButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  switchButtonTextHighlight: {
    color: '#818CF8', // Lighter indigo
    fontWeight: '600',
  },
});
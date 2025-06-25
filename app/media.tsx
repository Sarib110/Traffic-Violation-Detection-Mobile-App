import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Alert, 
  StyleSheet, 
  View, 
  TouchableOpacity,
  Text,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { saveToLibraryAsync } from "expo-media-library";
import * as FileSystem from 'expo-file-system';
// Import our storage service
import { saveReport } from './services/reportStorage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// API configuration
const API_URL = 'http://192.168.137.1:5000/traffic_violation';

export default function MediaScreen() {
  const { media, type } = useLocalSearchParams();
  const router = useRouter();

  // Animated values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  // State variables
  const [videoError, setVideoError] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState(false);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedFileUri, setProcessedFileUri] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  
  // Video reference
  const videoRef = useRef(null);

  // Media URI preparation
  const mediaUri = Array.isArray(media) ? media[0] : media;
  const preparedMediaUri = Platform.select({
    android: mediaUri.startsWith('file://') ? mediaUri : `file://${mediaUri}`,
    ios: mediaUri,
    default: mediaUri
  });

  // Entrance animations
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 14,
        bounciness: 5,
        useNativeDriver: true,
      })
    ]).start();

    return () => {
      StatusBar.setBarStyle('default');
    };
  }, []);

  const checkFileExists = useCallback(async () => {
    try {
      setVideoError(null);
      setFileExists(false);
      setFileSize(null);
      setVideoLoaded(false);
      setIsLoading(true);

      const fileInfo = await FileSystem.getInfoAsync(preparedMediaUri, { 
        size: true, 
        md5: true,
      });

      if (fileInfo.exists) {
        setFileExists(true);
        setFileSize(fileInfo.size || null);
      } else {
        throw new Error('Media file not found');
      }
    } catch (error) {
      setVideoError(`Unable to access media file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setFileExists(false);
    } finally {
      setIsLoading(false);
    }
  }, [preparedMediaUri]);

  useEffect(() => {
    checkFileExists();
  }, [checkFileExists]);

  const handleVideoError = (error: any) => {
    setVideoError('Unable to play media. Please verify the file format.');
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setIsLoading(false);
  };

  const handleSave = async () => {
    try {
      await saveToLibraryAsync(processedFileUri || mediaUri as string);
      Alert.alert(
        "Success",
        "Media saved to your gallery",
        [{ text: "Continue", style: "default", onPress: () => router.back() }],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert(
        "Unable to Save",
        "Please check your permissions and try again",
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
    }
  };

  const handleSendToModel = async () => {
    try {
      setIsSending(true);
      setProcessingProgress(0);
      
      // Create a unique filename for the processed video
      const timestamp = new Date().getTime();
      const fileExtension = preparedMediaUri.split('.').pop();
      const processedFileName = `processed_${timestamp}.${fileExtension}`;
      
      console.log("Preparing to upload video from:", preparedMediaUri);
      
      // Create form data for React Native
      const formData = new FormData();
      formData.append('video', {
        uri: preparedMediaUri,
        type: `video/${fileExtension}`,
        name: `video.${fileExtension}`
      } as any);
      
      // Start a timer to simulate upload progress
      let progressValue = 0;
      const progressTimer = setInterval(() => {
        progressValue += 0.05; // Increment by 5%
        if (progressValue > 0.95) {
          progressValue = 0.95; // Cap at 95% until we confirm server response
          clearInterval(progressTimer);
        }
        setProcessingProgress(progressValue);
        console.log(`Simulated upload progress: ${Math.round(progressValue * 100)}%`);
      }, 300);
      
      // Upload the video file using fetch
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      // Clear the progress timer
      clearInterval(progressTimer);
      
      console.log("Upload completed with status:", response.status);
      
      if (response.ok) {
        // Parse the API response
        const responseData = await response.json();
        console.log("Response data:", responseData);
        
        // At this point, upload is 100% complete
        setProcessingProgress(1.0);
        
        // Mark as processed
        setProcessedFileUri(preparedMediaUri);
        
        // NEW CODE: Store the ML model response data
        // Create a report object with the response data
        const newReport = {
          id: `report_${timestamp}`,
          timestamp: new Date().toISOString(),
          videoUri: processedFileUri || preparedMediaUri,
          location: responseData.location || 'Mianwali',
          violationType: responseData.violation_type || 'Traffic violation',
          confidence: responseData.average_confidence || 85,
          details: responseData.details || {},
          status: responseData.status || 'submitted',
          // Store any additional data from the ML model response
          mlResults: responseData,
        };
        
        // Save the report to storage
        await saveReport(newReport);
        setReportData(newReport);
        
        // Show a nice thank you message
        setTimeout(() => {
          Alert.alert(
            "Thank You!",
            "Your traffic report has been successfully submitted and recorded. Thank you for helping to keep our roads safe.",
            [
              { 
                text: "Close", 
                style: "cancel",
                onPress: () => router.back()
              }
            ],
            { cancelable: false }
          );
        }, 500);
        
      } else {
        // Attempt to get detailed error message from response
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Request failed with status ${response.status}`;
        } catch (e) {
          errorMessage = `Request failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error processing video:", error);
      Alert.alert(
        "Submission Failed",
        "We couldn't process your traffic report at this time. Please try again later.",
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
    } finally {
      setIsSending(false);
      setProcessingProgress(0);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading your media...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (videoError || !fileExists) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={50} color="#FF3B30" />
          <Text style={styles.errorTitle}>Media Unavailable</Text>
          <Text style={styles.errorMessage}>{videoError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={checkFileExists}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View 
        style={[
          styles.mainContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Media Preview</Text>
            {processedFileUri && (
              <Text style={styles.processedLabel}>Processed</Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <MaterialIcons name="save-alt" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Media Content */}
        <View style={styles.mediaWrapper}>
          <View style={styles.mediaBackground}>
            {type === "video" && (
              <Video
                ref={videoRef}
                key={processedFileUri || preparedMediaUri}
                source={{ uri: processedFileUri || preparedMediaUri }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping
                useNativeControls
                onError={handleVideoError}
                onLoad={handleVideoLoad}
              />
            )}
          </View>
        </View>

        {/* Processing Progress */}
        {isSending && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${processingProgress * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(processingProgress * 100)}% - Processing video...
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, isSending ? styles.disabledButton : null]}
              onPress={handleSave}
              disabled={isSending}
              activeOpacity={0.7}
            >
              <MaterialIcons name="save-alt" size={22} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                isSending ? styles.disabledButton : null,
                processedFileUri ? styles.processedButton : null
              ]}
              onPress={handleSendToModel}
              disabled={isSending}
              activeOpacity={0.7}
            >
              {isSending ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>Processing</Text>
                </>
              ) : (
                <>
                  <Ionicons 
                    name={processedFileUri ? "refresh" : "send"} 
                    size={22} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.sendButtonText}>
                    {processedFileUri ? "Process Again" : "Send"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ?? 0)+20,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#1a1a1a',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  processedLabel: {
    fontSize: 12,
    color: '#4CD964',
    marginTop: 4,
  },
  mediaWrapper: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  mediaBackground: {
    flex: 1,
    justifyContent: 'center',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#262626',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#1a1a1a',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CD964',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#1a1a1a',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabledButton: {
    opacity: 0.6,
  },
  processedButton: {
    backgroundColor: '#4CD964',
    ...Platform.select({
      ios: {
        shadowColor: '#4CD964',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sendButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Alert, 
  StyleSheet, 
  View, 
  TouchableOpacity,
  Text,
  Platform,
  ActivityIndicator
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { saveToLibraryAsync } from "expo-media-library";
import * as FileSystem from 'expo-file-system';


export default function MediaScreen() {
  const { media, type } = useLocalSearchParams();
  const navigation = useNavigation();

  // State variables for managing video playback and errors
  const [videoError, setVideoError] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState(false);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Ensure media is a string and not an array
  const mediaUri = Array.isArray(media) ? media[0] : media;

  // Prepare the file path based on platform
  const preparedMediaUri = Platform.select({
    android: mediaUri.startsWith('file://') ? mediaUri : `file://${mediaUri}`,
    ios: mediaUri,
    default: mediaUri
  });
  

  // Comprehensive file check function
  const checkFileExists = useCallback(async () => {
    try {
      // Reset states
      setVideoError(null);
      setFileExists(false);
      setFileSize(null);
      setVideoLoaded(false);
      setIsLoading(true);

      // Log initial media information
      console.log('Initial Media URI:', mediaUri);
      console.log('Prepared Media URI:', preparedMediaUri);

      // Attempt to get file info with extended timeout
      const fileInfo = await FileSystem.getInfoAsync(preparedMediaUri, { 
        size: true, 
        md5: true,
      });

      console.log('Detailed File Information:', JSON.stringify(fileInfo, null, 2));

      if (fileInfo.exists) {
        setFileExists(true);
        setFileSize(fileInfo.size || null);
      } else {
        throw new Error('File does not exist');
      }
    } catch (error) {
      console.error('Comprehensive File Check Error:', error);
      setVideoError(`File access error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setFileExists(false);
    } finally {
      setIsLoading(false);
    }
  }, [preparedMediaUri, mediaUri]);

  // Use effect to check file on mount and when URI changes
  useEffect(() => {
    checkFileExists();
  }, [checkFileExists]);

  // Error handling for video
  const handleVideoError = (error: any) => {
    console.error('Video Playback Error:', JSON.stringify(error, null, 2));
    setVideoError('Unable to play video. Check file format or permissions.');
    setIsLoading(false);
  };

  // Video load success handler
  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setVideoLoaded(true);
    setIsLoading(false);
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.debugText}>Loading media...</Text>
      </View>
    );
  }

  // Render error state
  if (videoError || !fileExists) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Media Error</Text>
          <Text style={styles.debugText}>{videoError}</Text>
          <Text style={styles.debugText}>URI: {preparedMediaUri}</Text>
          <TouchableOpacity 
            onPress={checkFileExists} 
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Media Preview Container */}
      <View style={styles.mediaContainer}>
        {/* Video Playback */}
        {type === "video" && (
          <Video
            key={preparedMediaUri} // Force re-render on URI change
            source={{ uri: preparedMediaUri }}
            style={styles.mediaVideo}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            useNativeControls
            onError={handleVideoError}
            onLoad={handleVideoLoad}
          />
        )}
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          onPress={async () => {
            try {
              await saveToLibraryAsync(mediaUri as string);
              Alert.alert("Success", "Video saved to gallery!");
              navigation.goBack();
            } catch (error) {
              console.error("Failed to save media:", error);
              Alert.alert("Error", "Failed to save video to gallery.");
            }
          }} 
          style={styles.sendButton}
        >
          <Ionicons name="send" size={30} color="white" />
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  retryButton: {
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  cropButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  cropButtonText: {
    color: 'white',
    marginLeft: 5,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaVideo: {
    width: "100%",
    height: "100%",
  },
  bottomBar: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderRadius: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  debugContainer: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  debugText: {
    color: 'white',
    textAlign: 'center',
    marginVertical: 5,
  },
});
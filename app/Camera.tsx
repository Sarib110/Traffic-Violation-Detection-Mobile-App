import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Href, Stack } from "expo-router";
import {
  StyleSheet,
  Platform,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Linking,
  Text,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
} from "react-native-vision-camera";
import { Redirect, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CameraScreen() {
  // Hide the header - Fixed by using the boolean false instead of string "false"
  const router = useRouter();
  
  React.useEffect(() => {
    // This will hide the header if you're using expo-router
    // Using "0" instead of a boolean since router.setParams expects string/number
    router.setParams({ headerShown: "0" });
  }, [router]);
  
  const { hasPermission } = useCameraPermission();
  const microphonePermission = Camera.getMicrophonePermissionStatus();

  const camera = useRef<Camera>(null);
  const captureButtonPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  
  const devices = useCameraDevices();
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">("back");
  const device = useCameraDevice(cameraPosition);
  const [zoom, setZoom] = useState(1);
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [torch, setTorch] = useState<"off" | "on">("off");
  const redirectToPermissions =
    !hasPermission || microphonePermission === "not-determined";

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);

  // Update zoom when device changes
  useEffect(() => {
    if (device?.neutralZoom) {
      setZoom(device.neutralZoom);
    }
  }, [device]);

  // Create a pan responder for the capture button
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        // Only respond to vertical movements when recording
        return isRecording && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: (_evt, _gestureState) => {
        // No need to store initial position, we'll just use the gesture state dy
        setShowZoomIndicator(true);
      },
      onPanResponderMove: (_evt, gestureState) => {
        // Only handle vertical movement
        captureButtonPosition.setValue({
          x: 0,
          y: gestureState.dy
        });

        // Calculate new zoom based on vertical movement
        // Moving up increases zoom, moving down decreases zoom
        const zoomSensitivity = 0.01;
        const newZoom = Math.max(
          1, // Minimum zoom
          Math.min(
            device?.maxZoom || 10, // Maximum zoom
            zoom - (gestureState.dy * zoomSensitivity)
          )
        );
        setZoom(newZoom);
      },
      onPanResponderRelease: () => {
        // Reset button position when released
        Animated.spring(captureButtonPosition, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 7,
        }).start();
        
        // Hide zoom indicator after a delay
        setTimeout(() => {
          setShowZoomIndicator(false);
        }, 1500);
      }
    })
  ).current;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const takePicture = async () => {
    try {
      if (camera.current == null) throw new Error("Camera ref is null!");

      const photo = await camera.current.takePhoto({
        flash: flash,
        enableShutterSound: false,
      });
      router.replace({
        pathname: "/media",
        params: { media: photo.path, type: "photo" },
      });
    } catch (e) {
      console.error("Failed to take photo!", e);
    }
  };

  const startRecording = async () => {
    try {
      if (camera.current == null) throw new Error("Camera ref is null!");
  
      camera.current.startRecording({
        flash: flash,
        onRecordingFinished: async (video) => {
          if (!video || !video.path) {
            console.error("Invalid video object");
            return;
          }
          router.push({
            pathname: "/media",
            params: { media: video.path, type: "video" },
          });
        },
        onRecordingError: (error) => console.error("Recording error:", error),
      });
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimer.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      // Show zoom indicator when recording starts
      setShowZoomIndicator(true);
      setTimeout(() => setShowZoomIndicator(false), 3000);
    } catch (e) {
      console.error("Failed to start recording!", e);
    }
  };
  
  const stopRecording = async () => {
    try {
      if (camera.current == null || !isRecording) return;
  
      await camera.current.stopRecording();
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }      
    } catch (e) {
      console.error("Failed to stop recording!", e);
    }
  };

  if (redirectToPermissions) return <Redirect href={"/permissions"} />;
  if (!device) return null;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Camera
        ref={camera}
        style={styles.camera}
        photo={true}
        video={true}
        zoom={zoom}
        device={device!}
        isActive={true}
        resizeMode="cover"
        preview={true}
        torch={torch}
      />
      
      {/* Side Controls */}
      <View style={styles.sideControlsContainer}>
        <TouchableOpacity 
          onPress={() => setTorch(t => t === "off" ? "on" : "off")}
          style={styles.sideControlButton}
        >
          <Ionicons 
            name={torch === "on" ? "flashlight" : "flashlight-outline"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setFlash(f => f === "off" ? "on" : "off")}
          style={styles.sideControlButton}
        >
          <Ionicons 
            name={flash === "on" ? "flash" : "flash-off"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setCameraPosition(p => p === "back" ? "front" : "back")}
          style={styles.sideControlButton}
        >
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            const link = Platform.select({
              ios: "photos-redirect://",
              android: "content://media/external/images/media",
            });
            Linking.openURL(link!);
          }}
          style={styles.sideControlButton}
        >
          <Ionicons name="image" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace("/settings")}
          style={styles.sideControlButton}
        >
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Recording Indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Ionicons name="recording" size={20} color="white" />
          <Text style={styles.recordingText}>
            {formatTime(recordingTime)}
          </Text>
        </View>
      )}

      {/* Zoom Indicator */}
      {isRecording && showZoomIndicator && (
        <View style={styles.zoomIndicatorContainer}>
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
          </View>
          <View style={styles.zoomInstructions}>
            <Ionicons name="arrow-up" size={16} color="white" />
            <Text style={styles.zoomInstructionText}>Slide up to zoom in</Text>
            <Text style={styles.zoomInstructionText}>Slide down to zoom out</Text>
            <Ionicons name="arrow-down" size={16} color="white" />
          </View>
        </View>
      )}

      {/* Bottom Controls - Only Capture Button */}
      <SafeAreaView style={styles.bottomControlsContainer}>
        <Animated.View
          style={[
            {
              transform: [
                { translateX: captureButtonPosition.x },
                { translateY: captureButtonPosition.y }
              ]
            }
          ]}
          {...(isRecording ? panResponder.panHandlers : {})}
        >
          <TouchableOpacity
            onPress={takePicture}
            onLongPress={startRecording}
            onPressOut={(e) => {
              // Only stop recording if it was a long press release, not a tap
              if (isRecording) {
                stopRecording();
              }
            }}
            style={[
              styles.captureButton, 
              { 
                backgroundColor: isRecording ? "rgba(255,0,0,0.7)" : "transparent",
                borderColor: isRecording ? "red" : "white"
              }
            ]}
          >
            <FontAwesome5 
              name={isRecording ? "stop-circle" : "dot-circle"} 
              size={65} 
              color="white" 
            />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sideControlsContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 280,
  },
  sideControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  recordingText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  zoomIndicatorContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 120,
    alignItems: 'center',
  },
  zoomIndicator: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  zoomText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  zoomInstructions: {
    alignItems: 'center',
  },
  zoomInstructionText: {
    color: 'white',
    fontSize: 12,
    marginVertical: 2,
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    borderRadius: 70, 
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    elevation: 5,
  },
});
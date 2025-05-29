import * as React from "react";
import { useAuth } from "./auth-context";
import Camera from "./Camera";
import { Redirect } from "expo-router";
import { LogBox } from "react-native";
LogBox.ignoreAllLogs(true); // Suppress all warnings

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();

  // Directly handle authentication flow
  if (isAuthenticated) {
    // If authenticated, go to camera screen
    return <Camera />;
  } else {
    // If not authenticated, go to login screen
    return <Redirect href="/login" />;
  }
}
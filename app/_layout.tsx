import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from './auth-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={DarkTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="permissions"
              options={{ presentation: "modal", headerShown: true , headerBackVisible: true }}
            />
            <Stack.Screen
              name="media"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen
              name="settings"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen
              name="reports"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen
              name="AboutUs"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen
              name="Help"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen
              name="Camera"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen
              name="ContactUs"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen 
              name="login" 
              options={{ headerShown: false }} 
            />
            <Stack.Screen name="+not-found" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const Contact = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const submit = () => {
    if (!name.trim()) {
      Alert.alert("Input Error", "Please enter your full name");
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      Alert.alert("Input Error", "Please enter a valid email address");
      return;
    }

    if (!message.trim()) {
      Alert.alert("Input Error", "Please provide a message");
      return;
    }

    if (!agree) {
      Alert.alert("Terms and Conditions", "Please agree to the terms");
      return;
    }

    Alert.alert(
      "Thank You",
      `Dear ${name}, we have received your message and will respond shortly.`,
      [
        {
          text: "OK",
          onPress: () => {
            setName("");
            setEmail("");
            setMessage("");
            setAgree(false);
            router.push("/ContactUs");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Custom Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/settings")}>
          <Feather name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact</Text>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingHorizontal: 25, paddingVertical: 30 }}
      >
        <Text style={styles.mainHeader}>Professional Inquiry</Text>

        <Text style={styles.description}>
          Connect with our team. We value your communication and will respond promptly to your professional request.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.labels}>Full Name</Text>
          <TextInput
            style={styles.inputStyle}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.labels}>Corporate Email Address</Text>
          <TextInput
            style={styles.inputStyle}
            placeholder="name@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.labels}>Your Professional Inquiry</Text>
          <TextInput
            style={[styles.inputStyle, styles.multilineStyle]}
            placeholder="Describe your professional request or inquiry in detail"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={7}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            value={agree}
            onValueChange={() => setAgree(!agree)}
            color={agree ? "#2c3e50" : undefined}
          />
          <Text style={styles.checkboxText}>
            I have read and agree to the Terms of Professional Communication
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.buttonStyle,
            { backgroundColor: agree ? "#2c3e50" : "#95a5a6" },
          ]}
          disabled={!agree}
          onPress={submit}
        >
          <Text style={styles.buttonText}>Submit Professional Inquiry</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f4f6f7",
  },
    header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  mainHeader: {
    fontSize: 28,
    color: "#2c3e50",
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#34495e",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labels: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 8,
    fontWeight: "600",
  },
  inputStyle: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  multilineStyle: {
    height: 150,
    textAlignVertical: "top",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  checkboxText: {
    marginLeft: 10,
    color: "#2c3e50",
    fontSize: 14,
    flex: 1,
  },
  buttonStyle: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Contact;

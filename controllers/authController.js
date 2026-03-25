import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { loginUser } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {

      const res = await loginUser({
        email,
        password
      });

      console.log("🔥 FULL RESPONSE:", res.data);

      // ✅ TOKEN SAVE
      await AsyncStorage.setItem("token", res.data.token);

      // ✅ USER SAVE (if exists)
      if (res.data.user && res.data.user._id) {
        await AsyncStorage.setItem("userId", res.data.user._id);
        console.log("✅ USER ID SAVED:", res.data.user._id);
      } else {
        console.log("⚠️ USER not found in response");
      }

      setMessage("Login successful ✅");

      // ✅ NAVIGATION FIX
      setTimeout(() => {
        navigation.replace("Main");
      }, 500);

    } catch (error) {

      console.log("❌ LOGIN ERROR:", error?.response?.data || error.message);

      setMessage("Login Failed ❌");

    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Login</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter Email"
        style={styles.input}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter Password"
        secureTextEntry
        style={styles.input}
      />

      <Button title="Login" onPress={handleLogin} />

      <Text style={styles.message}>{message}</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 12,
    borderRadius: 10
  },
  message: {
    marginTop: 20,
    textAlign: "center"
  }
});
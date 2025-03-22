<script setup lang="ts">
import { ref } from "vue";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Import Firebase auth instance
import { useRouter } from "vue-router";

const router = useRouter();
const email = ref("");
const password = ref("");
const errorMessage = ref("");

const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    if (!result.user) throw new Error("No user data found!");

    // Get Firebase ID Token
    const userData = result.user;
    console.log("User Data:", userData);

    // Send token to backend
    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userData.email }),
    });

    const dataInfo = await response.json();
    console.log("Data Info:", dataInfo);

    if (dataInfo) {
      router.push("/dashboard");
      localStorage.setItem("token", userData.accessToken || "");
      localStorage.setItem("user_id", dataInfo.id || "");
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
  }
};

const loginWithEmail = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;
    console.log("Logged in User:", user);

    localStorage.setItem("token", user.accessToken || "");
    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = "Login failed. Please check your credentials.";
    console.error("Error logging in:", error);
  }
};

const signupWithEmail = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;
    console.log("Signed up User:", user);

    localStorage.setItem("token", user.accessToken || "");
    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = "Signup failed. Please try again.";
    console.error("Error signing up:", error);
  }
};
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h2>Welcome Back</h2>
      <p>Sign in to continue</p>

      <!-- Email & Password Login -->
      <div class="form-group">
        <input v-model="email" type="email" placeholder="Email" required class="input-field" />
      </div>
      <div class="form-group">
        <input v-model="password" type="password" placeholder="Password" required class="input-field" />
      </div>
      <button class="login-button" @click="loginWithEmail">Login with Email</button>
      <button class="signup-button" @click="signupWithEmail">Create Account</button>

      <hr class="divider" />

      <!-- Google Login -->
      <button class="google-button" @click="loginWithGoogle">
        <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google Icon" />
        Login with Google
      </button>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Background */
.login-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, #4facfe, #00f2fe);
}

/* Card Layout */
.login-card {
  width: 350px;
  padding: 25px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: fadeIn 0.5s ease-in-out;
}

h2 {
  margin-bottom: 5px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

p {
  color: #666;
  font-size: 14px;
}

/* Form Inputs */
.form-group {
  margin-bottom: 15px;
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  transition: 0.3s;
}

.input-field:focus {
  border-color: #007bff;
  box-shadow: 0px 0px 5px rgba(0, 123, 255, 0.5);
}

/* Buttons */
button {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: none;
  font-size: 16px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
}

.login-button {
  background: #007bff;
  color: white;
}

.login-button:hover {
  background: #0056b3;
}

.signup-button {
  background: #28a745;
  color: white;
}

.signup-button:hover {
  background: #218838;
}

.google-button {
  background: white;
  color: #333;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-button img {
  margin-right: 8px;
}

.google-button:hover {
  background: #f1f1f1;
}

/* Divider */
.divider {
  margin: 15px 0;
  border: 0;
  height: 1px;
  background: #ddd;
}

/* Error Message */
.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

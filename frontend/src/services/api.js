// src/services/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- General Market News Endpoints ---
export const fetchGeneralNews = async () => {
  try {
    const response = await api.get("/api/news/general");
    return response.data;
  } catch (error) {
    console.error("Error fetching general news:", error);
    throw error; // Re-throw to be caught by the component
  }
};

export const fetchOverallSentiment = async () => {
  try {
    const response = await api.get("/api/news/general-sentiment");
    return response.data;
  } catch (error) {
    console.error("Error fetching overall sentiment:", error);
    throw error;
  }
};

// --- Filtered News Endpoints ---
export const fetchFilteredNews = async (symbols) => {
  try {
    const response = await api.post("/api/news/filtered", { symbols });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching filtered news:", error);
    throw error;
  }
};

export const subscribeToNotifications = async (
  email,
  frequency,
  types,
  symbols
) => {
  try {
    const response = await api.post("/api/notifications/subscribe", {
      email,
      frequency,
      notificationTypes: types,
      portfolioSymbols: symbols,
    });
    return response.data;
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    throw error;
  }
};

export const unsubscribeFromNotifications = async (email) => {
  try {
    const response = await api.post("/api/notifications/unsubscribe", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Error unsubscribing from notifications:", error);
    throw error;
  }
};

export const sendTestEmail = async (recipientEmail) => {
  try {
    const response = await api.post("/api/notifications/send-test-email", {
      recipientEmail,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending test email:", error);
    throw error;
  }
};

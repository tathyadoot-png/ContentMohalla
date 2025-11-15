"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { getActiveGuest } from "@/utils/guest";

const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
  const [guestUser, setGuestUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState("subscribe");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchGuest = async () => {
      console.log("--- Context Debug Start ---");
      const guestId = localStorage.getItem("guestId");
      console.log("1. Found guestId in localStorage:", guestId);

      if (!guestId) {
        setShowPopup(true);
        setPopupMode("subscribe");
        setLoaded(true);
        console.log("--- Context Debug End: No guestId, showing popup. ---");
        return;
      }

      try {
        const response = await getActiveGuest(guestId); // Response mein { result, token } hoga
        const guest = response?.result;
        const token = response?.token;

        console.log("2. Fetched guest object from API:", guest);
        console.log("2a. Fetched token from API:", token);

        if (guest && token) { // Dono check karein
          const guestProfile = { ...guest, token: token }; // ✅ Token ko profile mein add karein
          setGuestUser(guestProfile);
          localStorage.setItem('guestProfile', JSON.stringify(guestProfile)); // ✅ Updated profile save karein
          
          const subscribed = guest.subscription && Object.keys(guest.subscription).length > 0;
          console.log("3. Is user subscribed?", subscribed);
          
          setIsSubscribed(subscribed);
          setPopupMode(subscribed ? "unsubscribe" : "subscribe");
          
          setShowPopup(!subscribed);
          console.log("4. Final decision: Setting showPopup to", !subscribed);
          
        } else {
          console.log("Guest invalid or token missing → show subscribe popup");
          localStorage.removeItem('guestProfile');
          localStorage.removeItem('guestId');
          setShowPopup(true);
          setPopupMode("subscribe");
        }
      } catch (err) {
        console.error("Guest fetch failed:", err);
        setShowPopup(true);
        setPopupMode("subscribe");
      } finally {
        setLoaded(true);
        console.log("--- Context Debug End ---");
      }
    };

    fetchGuest();
  }, []);

  return (
    <GuestContext.Provider
      value={{
        guestUser,
        setGuestUser,
        isSubscribed,
        setIsSubscribed,
        showPopup,
        setShowPopup,
        popupMode,
        setPopupMode,
        loaded,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => useContext(GuestContext);
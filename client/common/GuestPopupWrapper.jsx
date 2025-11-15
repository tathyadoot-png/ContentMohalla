"use client";
import React from "react";
import GuestPopup from "@/common/GuestPopup";
import { useGuest } from "@/context/GuestContext";

const GuestPopupWrapper = () => {
  const {
    guestUser,
    setGuestUser,
    isSubscribed,
    setIsSubscribed,
    showPopup, // This is the boolean state from GuestContext
    setShowPopup,
    popupMode,
    setPopupMode,
    loaded,
  } = useGuest();

  if (!loaded) return null; // Only render when context is loaded

  return (
    <GuestPopup
      showPopup={showPopup} // ✅ Correctly passing the state from context
      // ❌ Removed forceOpen={showPopup}
      mode={popupMode}
      guestUser={guestUser}
      setGuestUser={setGuestUser}
      isSubscribed={isSubscribed}
      setIsSubscribed={setIsSubscribed}
      setPopupMode={setPopupMode}
      setShowPopup={setShowPopup} // ✅ Passing context's setter function
    />
  );
};

export default GuestPopupWrapper;
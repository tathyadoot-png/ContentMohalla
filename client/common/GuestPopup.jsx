"use client";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiUser, FiMail, FiPhone } from "react-icons/fi";
import { FaBell } from "react-icons/fa";
import { registerGuest, subscribePush, unsubscribePush } from "@/utils/guest";

export default function GuestPopup({
  showPopup,
  mode,
  guestUser,
  setGuestUser,
  isSubscribed,
  setIsSubscribed,
  setPopupMode,
  setShowPopup,
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(showPopup);
  }, [showPopup]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ UPDATED: Popup band karne ka function, ab koi setTimeout nahi
  const closePopup = () => {
    setIsVisible(false); // Local state update karein
    setShowPopup(false); // Context state ko bhi turant update karein
  };

  const handleSubscribe = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await registerGuest(form);
      const guest = response.result;
      const token = response.token;
      if (!guest || !token) throw new Error("Login failed");

      const guestProfile = { ...guest, token: token };
      localStorage.setItem("guestId", guest._id);
      localStorage.setItem("guestProfile", JSON.stringify(guestProfile));
      
      try {
        const sw = await navigator.serviceWorker?.ready;
        const pushSub = await sw?.pushManager?.getSubscription();
        if (guest._id && pushSub?.endpoint) {
          await subscribePush(guest._id, pushSub);
          setIsSubscribed(true);
        }
      } catch (pushError) {
        console.error("Push subscription failed, but user is logged in.", pushError);
        setIsSubscribed(false);
      }

      setGuestUser(guestProfile);
      closePopup(); // ✅ Helper function ko call karein

    } catch (err) {
      setError(err.response?.data?.message || err.message || "कुछ गलत हो गया");
      localStorage.removeItem("guestId");
      localStorage.removeItem("guestProfile");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setError("");
    setLoading(true);
    try {
      if (!guestUser?._id) throw new Error("Guest ID missing");
      await unsubscribePush(guestUser._id);
      setIsSubscribed(false);
      setPopupMode("subscribe");
      closePopup(); // ✅ Helper function ko call karein
    } catch (err) {
      setError(err.response?.data?.message || err.message || "कुछ गलत हो गया");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && ( // ✅ 'isVisible' local state ka istemaal karein
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={closePopup}
          />
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-8 relative flex flex-col gap-5 sm:gap-6 z-10"
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
          >
            <button
              onClick={closePopup}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-accent  text-xl sm:text-2xl"
            >
              <FiX />
            </button>

            {mode === "subscribe" ? (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-center text-accent ">
                  "हर पल की अपडेट अब आपके हाथों में"
                </h2>
                <form
                  className="flex flex-col gap-3 sm:gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubscribe();
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 border p-2 sm:p-3 rounded-xl">
                    <FiUser className="text-accent " />
                    <input
                      type="text" name="name" placeholder="आपका नाम"
                      value={form.name} onChange={handleChange} required
                      className="w-full bg-transparent outline-none text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 border p-2 sm:p-3 rounded-xl">
                    <FiMail className="text-accent " />
                    <input
                      type="email" name="email" placeholder="ईमेल"
                      value={form.email} onChange={handleChange} required
                      className="w-full bg-transparent outline-none text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 border p-2 sm:p-3 rounded-xl">
                    <FiPhone className="text-accent "/>
                    <input
                      type="text" name="phone" placeholder="फोन नंबर"
                      value={form.phone} onChange={handleChange} 
                      className="w-full bg-transparent outline-none text-sm sm:text-base"
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs sm:text-sm text-center">{error}</p>
                  )}
                  <motion.button
                    type="submit" disabled={loading}
                    className="w-full py-3 sm:py-4 rounded-xl font-semibold text-white text-sm sm:text-base bg-gradient-to-r from-yellow-400 to-yellow-500 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaBell />
                    {loading ? "कृपया प्रतीक्षा करें..." : "हां, मुझे अपडेट रखें"}
                  </motion.button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-center">
                  क्या आप सब्सक्रिप्शन रद्द करना चाहते हैं?
                </h2>
                {error && (
                  <p className="text-red-500 text-xs sm:text-sm text-center">{error}</p>
                )}
                <motion.button
                  onClick={handleUnsubscribe} disabled={loading}
                  className="w-full py-3 sm:py-4 rounded-xl font-semibold text-white text-sm sm:text-base bg-red-500 disabled:opacity-50"
                >
                  {loading ? "कृपया प्रतीक्षा करें..." : "रद्द करें"}
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
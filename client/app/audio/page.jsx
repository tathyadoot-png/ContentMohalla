"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Download,
  Clock,
  Mic,
  Volume2,
  BookOpen,
  Search,
} from "lucide-react";

/* -------------------- MOCK DATA: PODCAST EPISODES -------------------- */
const podcastEpisodes = [
  {
    id: 1,
    title: "रस: सौंदर्य और आत्मा का ज्ञान",
    duration: "45:30",
    date: "10 Oct 2024",
    description:
      "भारतीय काव्यशास्त्र में 'रस' के सिद्धांत की गहराई और जीवन में सौंदर्य के महत्व पर चर्चा।",
    category: "काव्यशास्त्र",
    imageUrl: "https://placehold.co/100x100/A30000/fff?text=RASA",
  },
  {
    id: 2,
    title: "गद्य की विधाएँ: कहानी से निबंध तक",
    duration: "32:15",
    date: "05 Oct 2024",
    description:
      "हिंदी गद्य साहित्य के विकास-क्रम, प्रमुख लेखकों और विभिन्न साहित्यिक विधाओं की भूमिका का विश्लेषण।",
    category: "साहित्य",
    imageUrl: "https://placehold.co/100x100/6A4500/fff?text=GADHYA",
  },
  {
    id: 3,
    title: "विवाह संस्कार: सात फेरों का महत्व",
    duration: "58:00",
    date: "01 Oct 2024",
    description:
      "हिंदू विवाह परंपराओं के दार्शनिक और सांस्कृतिक आधार। सप्तपदी के हर चरण का गहरा अर्थ।",
    category: "संस्कृति",
    imageUrl: "https://placehold.co/100x100/006A6A/fff?text=VIVAH",
  },
  {
    id: 4,
    title: "यज्ञ: शुद्धि का प्राचीन विज्ञान",
    duration: "28:40",
    date: "25 Sep 2024",
    description:
      "यज्ञ करने की विधि, वैज्ञानिक लाभ और पर्यावरण पर इसके सकारात्मक प्रभाव।",
    category: "अनुष्ठान",
    imageUrl: "https://placehold.co/100x100/400080/fff?text=YAGYA",
  },
  {
    id: 5,
    title: "काल और समय की भारतीय अवधारणा",
    duration: "35:00",
    date: "12 Sep 2024",
    description:
      "चतुर्युग, कल्प और समय की चक्रीय प्रकृति जैसे भारतीय दर्शन में काल की जटिल अवधारणाओं की खोज।",
    category: "दर्शन",
    imageUrl: "https://placehold.co/100x100/3A3A3A/fff?text=KAAL",
  },
];

const categories = ["काव्यशास्त्र", "साहित्य", "संस्कृति", "अनुष्ठान", "दर्शन"];

/* -------------------- UI SUBCOMPONENTS -------------------- */
const DashboardCard = ({ title, children, className = "" }) => (
  <div
    className={`p-6 rounded-2xl bg-antique-paper/10 dark:bg-inky-charcoal border border-border-subtle shadow-md backdrop-blur-sm ${className}`}
  >
    <h3 className="text-xl font-playfair-display font-semibold text-muted-saffron mb-4 border-b border-border-subtle/50 pb-2">
      {title}
    </h3>
    {children}
  </div>
);

const MiniEpisodeItem = ({ episode }) => (
  <div className="flex items-center space-x-3 mb-4 p-2 bg-antique-paper/20 dark:bg-inky-charcoal/40 rounded-lg hover:bg-antique-paper/30 dark:hover:bg-inky-charcoal/60 transition duration-300 cursor-pointer">
    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-kalighat-red text-antique-paper font-serif text-sm">
      {episode.category.substring(0, 2)}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-inky-charcoal dark:text-antique-paper truncate">
        {episode.title}
      </p>
      <p className="text-xs text-ui-text-light">{episode.duration}</p>
    </div>
    <Play size={16} className="text-muted-saffron" fill="currentColor" />
  </div>
);

const AntiqueButton = ({
  icon,
  children,
  onClick,
  className = "bg-kalighat-red hover:bg-kalighat-indigo",
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 text-antique-paper rounded-lg shadow-md font-semibold text-sm transition-all duration-200 ${className}`}
  >
    {icon}
    <span>{children}</span>
  </motion.button>
);

/* -------------------- MAIN COMPONENT -------------------- */
export default function PodcastPage() {
  const featuredEpisode = podcastEpisodes[0];
  const latestEpisodes = podcastEpisodes.slice(1, 4);

  return (
    <div className="min-h-screen  text-inky-charcoal  dark:text-antique-paper font-devanagari transition-colors duration-500">
      <div className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-playfair-display font-extrabold text-kalighat-red dark:text-muted-saffron tracking-wider inline-block pb-3">
            प्राचीन ध्वनि संग्रह
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-ui-text-light mt-3 leading-relaxed">
            हमारे विद्वत्तापूर्ण पॉडकास्ट संग्रह का डैशबोर्ड।
          </p>
        </motion.header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            {/* Search */}
            <DashboardCard title="संग्रह खोजें (Find Archive)">
              <div className="relative">
                <input
                  type="text"
                  placeholder="रस, गद्य, या विषय खोजें..."
                  className="w-full p-3 pl-10 rounded-lg bg-antique-paper/20 dark:bg-inky-charcoal/70 text-inky-charcoal dark:text-antique-paper border border-border-subtle focus:ring-1 focus:ring-muted-saffron focus:border-muted-saffron transition"
                />
                <Search
                  size={20}
                  className="absolute left-3 top-3 text-ui-text-light"
                />
              </div>
            </DashboardCard>

            {/* Library Stats */}
            <DashboardCard title="पुस्तकालय विवरण">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-2 text-ui-text-light">
                    <Volume2 size={20} />
                    <span>कुल एपिसोड</span>
                  </span>
                  <span className="text-2xl font-bold text-kalighat-red">
                    125
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-2 text-ui-text-light">
                    <BookOpen size={20} />
                    <span>कुल श्रोता</span>
                  </span>
                  <span className="text-2xl font-bold text-kalighat-indigo">
                    50K+
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-2 text-ui-text-light">
                    <Clock size={20} />
                    <span>कुल सुनने का समय</span>
                  </span>
                  <span className="text-2xl font-bold text-muted-saffron">
                    100+ Hr
                  </span>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* CENTER COLUMN */}
          <div className="lg:col-span-1">
            <DashboardCard
              title="इस सप्ताह का प्रमुख अध्याय"
              className="h-full flex flex-col justify-between p-8"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-muted-saffron shadow-lg">
                  <img
                    src={featuredEpisode.imageUrl}
                    alt={featuredEpisode.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/100x100/A30000/fff?text=RASA";
                    }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-antique-paper"
                  >
                    <Play size={40} fill="white" />
                  </motion.button>
                </div>

                <p className="text-ui-text-light text-sm mb-1">
                  {featuredEpisode.category}
                </p>
                <h2 className="text-3xl font-playfair-display font-bold text-kalighat-red dark:text-muted-saffron mb-3">
                  {featuredEpisode.title}
                </h2>
                <p className="text-sm italic text-ui-text-light">
                  {featuredEpisode.description}
                </p>
              </div>

              <div className="mt-8 flex justify-center space-x-4">
                <AntiqueButton
                  icon={<Volume2 size={16} />}
                  onClick={() =>
                    console.log(`Playing ${featuredEpisode.title}`)
                  }
                >
                  पूरा सुनें
                </AntiqueButton>
                <AntiqueButton
                  icon={<Download size={16} />}
                  onClick={() =>
                    console.log(`Downloading ${featuredEpisode.title}`)
                  }
                  className="bg-kalighat-indigo hover:bg-muted-saffron text-antique-paper"
                >
                  डाउनलोड
                </AntiqueButton>
              </div>
            </DashboardCard>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <DashboardCard title="नवीनतम अध्याय">
              {latestEpisodes.map((episode) => (
                <MiniEpisodeItem key={episode.id} episode={episode} />
              ))}
            </DashboardCard>

            <DashboardCard title="विषय श्रेणियाँ">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-muted-saffron/20 dark:bg-kalighat-indigo/40 text-inky-charcoal dark:text-antique-paper text-xs font-medium rounded-full hover:bg-muted-saffron/30 dark:hover:bg-kalighat-indigo/60 transition cursor-pointer"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16 p-8 rounded-2xl  dark:bg-inky-charcoal border border-border-subtle shadow-md"
        >
          <h3 className="text-2xl font-playfair-display font-semibold text-kalighat-red dark:text-muted-saffron mb-4">
            क्या आप एक अतिथि विद्वान बनना चाहेंगे?
          </h3>
          <p className="text-ui-text-light max-w-2xl mx-auto mb-6">
            हमारे पुरातन ज्ञान संग्रह में योगदान दें। अपने ज्ञान और विशेषज्ञता
            को लाखों श्रोताओं के साथ साझा करें।
          </p>
          <AntiqueButton
            icon={<Mic size={16} />}
            onClick={() => console.log("Become a Contributor")}
            className="bg-kalighat-red hover:bg-kalighat-indigo mx-auto"
          >
            अतिथि विद्वान बनें
          </AntiqueButton>
        </motion.div>
      </div>
    </div>
  );
}

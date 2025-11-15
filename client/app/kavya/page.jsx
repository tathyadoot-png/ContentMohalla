"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

/* -------------------- SVG ICONS -------------------- */
const ShringarIcon = (props) => (
  <svg {...props} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 28 C16 18, 32 18, 32 30 C32 18, 48 18, 48 28" />
    <path d="M16 28 Q24 38 32 40 Q40 38 48 28" />
    <path d="M32 40 L32 50" />
    <circle cx="32" cy="50" r="4" fill="currentColor" stroke="none" />
  </svg>
);

const HasyaIcon = (props) => (
  <svg {...props} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="32" r="28" />
    <path d="M22 26 L26 26" />
    <path d="M38 26 L42 26" />
    <path d="M18 40 Q32 54 46 40" />
    <path d="M18 40 L46 40" strokeWidth="2" strokeDasharray="2 3" />
  </svg>
);

const KarunaIcon = (props) => (
  <svg {...props} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 6 L32 40" />
    <path d="M20 40 Q32 34 44 40" />
    <path d="M25 40 Q32 50 39 40" />
    <circle cx="32" cy="20" r="2" fill="currentColor" stroke="none" />
    <path d="M32 40 L32 58" stroke="blue" strokeWidth="2" />
    <path d="M32 58 L28 54 M32 58 L36 54" stroke="blue" strokeWidth="2" />
  </svg>
);

const RaudraIcon = (props) => (
  <svg {...props} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 15 L49 15 M15 49 L49 49 M15 15 L15 49 M49 15 L49 49" />
    <path d="M20 25 L44 25" />
    <path d="M20 30 L44 30" />
    <path d="M20 35 L44 35" />
    <path d="M20 40 L44 40" />
    <path d="M32 50 L32 55" />
    <path d="M32 55 L35 52 M32 55 L29 52" />
  </svg>
);

const VeerIcon = (props) => (
  <svg {...props} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 8 L40 20 L32 56 L24 20 Z" />
    <path d="M32 56 L32 60" strokeWidth="4" />
    <path d="M48 20 Q55 25 48 30 L40 20 Z" />
    <path d="M16 20 Q9 25 16 30 L24 20 Z" />
  </svg>
);

const BhayanakIcon = (props) => (
  <svg {...props} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 40 L20 44 L44 44 L44 40" />
    <path d="M20 40 Q32 30 44 40" />
    <circle cx="25" cy="28" r="3" />
    <circle cx="39" cy="28" r="3" />
    <path d="M22 22 L20 20 M42 22 L44 20" />
    <path d="M20 54 Q32 48 44 54" strokeWidth="2" strokeDasharray="4 4" />
  </svg>
);

const BibhatsIcon = (props) => (
  <svg {...props} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 45 Q32 35 44 45" />
    <path d="M20 35 L20 45 M44 35 L44 45" />
    <path d="M18 25 L46 25" />
    <path d="M18 30 L46 30" />
    <path d="M18 35 L46 35" />
    <path d="M32 55 L32 60" />
    <path d="M32 60 L28 56 M32 60 L36 56" />
  </svg>
);

const AdbhutIcon = (props) => (
  <svg {...props} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 6 L32 58" />
    <path d="M6 32 L58 32" />
    <path d="M16 16 L48 48 M16 48 L48 16" />
    <circle cx="32" cy="32" r="10" />
    <path d="M32 20 L32 44" strokeWidth="2" />
  </svg>
);

const ShantIcon = (props) => (
  <svg {...props} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 44 L48 44" />
    <path d="M32 44 L32 30" />
    <circle cx="32" cy="20" r="10" />
    <path d="M16 44 C12 50, 20 56, 32 56 C44 56, 52 50, 48 44" />
  </svg>
);

/* -------------------- RASAS DATA -------------------- */
const rasData = [
  { name: "शृंगार रस", slug: "shringar", description: "प्रेम, सौंदर्य और आकर्षण का रस है। इसमें रति और माधुर्य की भावना व्यक्त होती है।", example: "राधा-कृष्ण का प्रेम इसका श्रेष्ठ उदाहरण है।", color: "bg-pink-300/60 hover:bg-pink-400/80 border-rose-600", shades: "text-rose-900", icon: <ShringarIcon className="w-8 h-8 mb-2 text-rose-700" /> },
  { name: "हास्य रस", slug: "hasya", description: "यह आनंद और हँसी की भावना से भरपूर होता है।", example: "विदूषक के संवाद या हास्य कविताएँ।", color: "bg-yellow-100/70 hover:bg-yellow-200/90 border-yellow-500", shades: "text-yellow-800", icon: <HasyaIcon className="w-8 h-8 mb-2 text-yellow-600" /> },
  { name: "करुण रस", slug: "karuna", description: "यह दुख, दया और संवेदना की भावना उत्पन्न करता है।", example: "सीता का वनवास, यशोदा का वियोग।", color: "bg-gray-400/60 hover:bg-gray-500/80 border-gray-700", shades: "text-gray-900", icon: <KarunaIcon className="w-8 h-8 mb-2 text-gray-800" /> },
  { name: "रौद्र रस", slug: "raudra", description: "क्रोध और प्रतिशोध की भावना व्यक्त करता है।", example: "शिव का तांडव, दुर्गा का युद्ध।", color: "bg-red-400/60 hover:bg-red-500/80 border-red-700", shades: "text-red-900", icon: <RaudraIcon className="w-8 h-8 mb-2 text-red-800" /> },
  { name: "वीर रस", slug: "veer", description: "इस रस में साहस, पराक्रम और उत्साह की भावना होती है।", example: "राम का रावण वध या अर्जुन का पराक्रम।", color: "bg-amber-400/60 hover:bg-amber-500/80 border-amber-700", shades: "text-amber-900", icon: <VeerIcon className="w-8 h-8 mb-2 text-amber-800" /> },
  { name: "भयानक रस", slug: "bhayanak", description: "भय, आतंक और डर की भावना जगाता है।", example: "महिषासुर मर्दिनी या युद्ध के दृश्य।", color: "bg-slate-700/60 hover:bg-slate-800/80 border-slate-900", shades: "text-white", icon: <BhayanakIcon className="w-8 h-8 mb-2 text-slate-100" /> },
  { name: "बीभत्स रस", slug: "bibhats", description: "यह घृणा और वितृष्णा की भावना प्रकट करता है।", example: "मृत्यु, कूड़ा या अत्याचार के दृश्य।", color: "bg-lime-400/60 hover:bg-lime-500/80 border-lime-700", shades: "text-lime-900", icon: <BibhatsIcon className="w-8 h-8 mb-2 text-lime-800" /> },
  { name: "अद्भुत रस", slug: "adbhut", description: "आश्चर्य और विस्मय की भावना को प्रकट करता है।", example: "हनुमान का लंका जलाना, विश्व की सुंदरता।", color: "bg-indigo-300/60 hover:bg-indigo-400/80 border-indigo-600", shades: "text-indigo-900", icon: <AdbhutIcon className="w-8 h-8 mb-2 text-indigo-800" /> },
  { name: "शांत रस", slug: "shant", description: "यह वैराग्य और आत्मिक शांति की भावना उत्पन्न करता है।", example: "बुद्ध का ध्यान, तपस्वियों का जीवन।", color: "bg-cyan-200/60 hover:bg-cyan-300/80 border-cyan-600", shades: "text-cyan-900", icon: <ShantIcon className="w-8 h-8 mb-2 text-cyan-800" /> },
];

const MobileSpiralCard = ({ ras, index, router }) => (
  <motion.div
    onClick={() => router.push(`/kavya/${ras.slug}`)}
    className={`p-5 rounded-xl shadow-2xl border-2 transition-transform duration-300 mb-6 cursor-pointer ${ras.color} ${ras.shades} ${index % 2 === 0 ? "ml-auto" : "mr-auto"}`}
    style={{ maxWidth: "90%", minWidth: "70%" }}
    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, rotate: index % 2 === 0 ? -3 : 3 }}
    whileInView={{ opacity: 1, x: 0, rotate: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ type: "spring", stiffness: 100, delay: index * 0.05 }}
  >
    <div className="flex justify-center">{ras.icon}</div>
    <h2 className="text-2xl font-extrabold mb-2 border-b-2 border-current pb-1">{ras.name}</h2>
    <p className="text-sm leading-snug">{ras.description}</p>
    <p className="text-xs italic mt-2 font-medium">उदाहरण: {ras.example}</p>
  </motion.div>
);

export default function RasaChakra() {
  const router = useRouter();
  const centerRas = rasData[0];
  const outerRasas = rasData.slice(1);
  const radius = 300;

  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center py-20 px-6 relative">
      <div className="absolute inset-0 bg-stone-900/85 backdrop-blur-[1px]"></div>
      <div className="relative max-w-7xl mx-auto text-center z-10 mb-16">
        <motion.h1 initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} className="text-6xl lg:text-5xl font-extrabold text-kalighat-red tracking-wide pb-3 border-b-4 border-amber-600/50 inline-block">
          काव्य का नवरस चक्र
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="max-w-4xl mx-auto text-xl leading-relaxed text-kalighat-indigo mt-6">
          भारतीय काव्यशास्त्र में "रस" को आत्मा कहा गया है। ये नौ रस जीवन और कला की संपूर्ण भावनाएँ हैं।
        </motion.p>
      </div>

      {/* Mobile Layout */}
      <div className="block lg:hidden relative z-10 max-w-xl mx-auto">
        <h3 className="text-center text-amber-300 text-2xl font-bold mb-8">साहित्यिक अनुक्रम</h3>
        <div className="flex justify-center mb-8">
          <MobileSpiralCard ras={centerRas} index={0} router={router} />
        </div>
        {outerRasas.map((ras, index) => (
          <MobileSpiralCard key={ras.name} ras={ras} index={index + 1} router={router} />
        ))}
      </div>

      {/* Desktop Chakra */}
      <div className="hidden lg:flex relative w-full max-w-5xl h-[700px] mx-auto z-10 justify-center items-center">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="absolute h-[500px] w-[500px] border border-amber-700/50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute h-[700px] w-[700px] border border-amber-700/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <motion.div
          onClick={() => router.push(`/kavya/${centerRas.slug}`)}
          className={`absolute w-48 h-48 rounded-full flex flex-col justify-center items-center p-4 shadow-2xl border-4 cursor-pointer ${centerRas.color} ${centerRas.shades}`}
          style={{ top: "40%", left: "40%", transform: "translate(-40%, -40%)" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.8 }}
        >
          {centerRas.icon}
          <h2 className="text-3xl font-extrabold">{centerRas.name}</h2>
          <p className="text-center text-sm mt-1">{centerRas.description.split(".")[0]}</p>
        </motion.div>

        {outerRasas.map((ras, index) => {
          const angle = (index / outerRasas.length) * 2 * Math.PI;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <motion.div
              key={ras.name}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: index * 0.15 + 1 }}
              className={`absolute w-44 h-44 p-4 rounded-xl shadow-xl border-2 cursor-pointer transition-transform duration-300 hover:scale-[1.08] ${ras.color} ${ras.shades}`}
              style={{ top: `calc(40% + ${y}px)`, left: `calc(40% + ${x}px)`, transform: "translate(-25%, -25%)" }}
              onClick={() => router.push(`/kavya/${ras.slug}`)}
            >
              <div className="flex justify-center">{ras.icon}</div>
              <h2 className="text-xl font-bold mb-1">{ras.name}</h2>
              <p className="text-xs leading-snug">{ras.description}</p>
              <p className="text-[10px] italic mt-1 font-medium">उदा: {ras.example.split(" ").slice(0, 3).join(" ")}...</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

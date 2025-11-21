// utils/engToHindi.js

const engToHindi = (text = "") => {
  if (!text) return "";

  let t = text.toLowerCase();

  // --- VOWELS ---
  t = t.replace(/aa/g, "ा")
       .replace(/a/g, "अ")
       .replace(/i/g, "ि")
       .replace(/ee/g, "ी")
       .replace(/u/g, "ु")
       .replace(/oo/g, "ू")
       .replace(/e/g, "े")
       .replace(/ai/g, "ै")
       .replace(/o/g, "ो")
       .replace(/au/g, "ौ");

  // --- COMMON HINDI CONSONANTS ---
  t = t.replace(/kh/g, "ख")
       .replace(/gh/g, "घ")
       .replace(/chh/g, "छ")
       .replace(/ch/g, "च")
       .replace(/jh/g, "झ")
       .replace(/th/g, "थ")
       .replace(/dh/g, "ध")
       .replace(/ph/g, "फ")
       .replace(/bh/g, "भ");

  // single consonants
  t = t.replace(/k/g, "क")
       .replace(/g/g, "ग")
       .replace(/c/g, "क")
       .replace(/j/g, "ज")
       .replace(/t/g, "त")
       .replace(/d/g, "द")
       .replace(/n/g, "न")
       .replace(/p/g, "प")
       .replace(/b/g, "ब")
       .replace(/m/g, "म")
       .replace(/y/g, "य")
       .replace(/r/g, "र")
       .replace(/l/g, "ल")
       .replace(/v/g, "व")
       .replace(/s/g, "स")
       .replace(/h/g, "ह")
       .replace(/sh/g, "श")
       .replace(/zh/g, "ष")
       .replace(/f/g, "फ")
       .replace(/z/g, "ज़")
       .replace(/q/g, "क़")
       .replace(/x/g, "क्स");

  return t;
};

export default engToHindi;

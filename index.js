/**
 * ╔══════════════════════════════════════════════════════╗
 * ║         🎮 WHATSAPP GAME BOT - BY FUN BOT 🎮         ║
 * ║  Games: Tebak Bendera, Tebak Kata, Kuis, Math,       ║
 * ║  English, Cek TT, Cek Ganteng, Cek Saldo, dll        ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * INSTALL DULU:
 *   npm install @whiskeysockets/baileys qrcode-terminal pino
 *
 * JALANKAN:
 *   node index.js
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  PREFIX: ".",
  BOT_NAME: "Bot Game",
  OWNER: "6283171413750", // Ganti nomor owner
  SESSION_DIR: "./session",
};

// ─── STATE GAME (per chat) ────────────────────────────────────────────────────
const gameState = {};

function getState(jid) {
  if (!gameState[jid]) gameState[jid] = {};
  return gameState[jid];
}

// ════════════════════════════════════════════════════════
//  DATA GAME
// ════════════════════════════════════════════════════════

// 🏳️ TEBAK BENDERA
const BENDERA_DATA = [
  { emoji: "🇮🇩", jawaban: ["indonesia"], hint: "Negara kepulauan terbesar" },
  { emoji: "🇯🇵", jawaban: ["jepang", "japan"], hint: "Negeri Sakura" },
  { emoji: "🇺🇸", jawaban: ["amerika", "usa", "united states"], hint: "Negeri Paman Sam" },
  { emoji: "🇧🇷", jawaban: ["brazil", "brasil"], hint: "Juara Piala Dunia terbanyak" },
  { emoji: "🇨🇳", jawaban: ["china", "cina", "tiongkok"], hint: "Negeri Tirai Bambu" },
  { emoji: "🇰🇷", jawaban: ["korea selatan", "south korea", "korsel"], hint: "Negeri K-Pop" },
  { emoji: "🇫🇷", jawaban: ["perancis", "prancis", "france"], hint: "Negeri Menara Eiffel" },
  { emoji: "🇩🇪", jawaban: ["jerman", "germany"], hint: "Negeri Oktoberfest" },
  { emoji: "🇮🇹", jawaban: ["italia", "italy"], hint: "Negeri Pizza & Pasta" },
  { emoji: "🇦🇺", jawaban: ["australia"], hint: "Negeri Kanguru" },
  { emoji: "🇲🇾", jawaban: ["malaysia"], hint: "Tetangga Indonesia" },
  { emoji: "🇸🇬", jawaban: ["singapura", "singapore"], hint: "Negara Kota Asia" },
  { emoji: "🇹🇭", jawaban: ["thailand"], hint: "Negeri Gajah Putih" },
  { emoji: "🇵🇭", jawaban: ["filipina", "philippines"], hint: "Negeri 7000 Pulau" },
  { emoji: "🇮🇳", jawaban: ["india"], hint: "Negeri Bollywood" },
  { emoji: "🇷🇺", jawaban: ["rusia", "russia"], hint: "Negara terluas di dunia" },
  { emoji: "🇬🇧", jawaban: ["inggris", "uk", "united kingdom", "england"], hint: "Negeri Big Ben" },
  { emoji: "🇨🇦", jawaban: ["kanada", "canada"], hint: "Negeri Maple" },
  { emoji: "🇲🇽", jawaban: ["meksiko", "mexico"], hint: "Negeri Taco" },
  { emoji: "🇦🇷", jawaban: ["argentina"], hint: "Negeri Tango & Messi" },
  { emoji: "🇿🇦", jawaban: ["afrika selatan", "south africa"], hint: "Ujung selatan Afrika" },
  { emoji: "🇪🇬", jawaban: ["mesir", "egypt"], hint: "Negeri Firaun & Piramid" },
  { emoji: "🇸🇦", jawaban: ["arab saudi", "saudi arabia"], hint: "Negeri Mekah" },
  { emoji: "🇹🇷", jawaban: ["turki", "turkey"], hint: "Negeri dua benua" },
  { emoji: "🇳🇱", jawaban: ["belanda", "netherlands", "holland"], hint: "Negeri Kincir Angin" },
];

// 🔤 TEBAK KATA
const TEBAK_KATA_DATA = [
  { soal: "Hewan berkaki empat, suka mengeong", jawaban: "kucing", hint: "K***ng" },
  { soal: "Buah berwarna kuning, suka dimakan monyet", jawaban: "pisang", hint: "P***ng" },
  { soal: "Kendaraan roda dua bermesin", jawaban: "motor", hint: "M***r" },
  { soal: "Tempat menyimpan uang yang besar & resmi", jawaban: "bank", hint: "B**k" },
  { soal: "Alat komunikasi genggam modern", jawaban: "handphone", hint: "H*******e" },
  { soal: "Bintang terdekat dari bumi", jawaban: "matahari", hint: "M*****i" },
  { soal: "Hewan laut terbesar", jawaban: "paus", hint: "P**s" },
  { soal: "Bumbu masak berwarna merah & pedas", jawaban: "cabai", hint: "C***i" },
  { soal: "Alat tulis ujungnya lancip", jawaban: "pensil", hint: "P***il" },
  { soal: "Tempat tinggal raja", jawaban: "istana", hint: "I***na" },
  { soal: "Buah tropis berduri, baunya khas", jawaban: "durian", hint: "D***an" },
  { soal: "Hewan melata berbisa", jawaban: "ular", hint: "U**r" },
  { soal: "Olahraga menggunakan raket & kok", jawaban: "badminton", hint: "B*******n" },
  { soal: "Minuman panas dari daun teh", jawaban: "teh", hint: "T*h" },
  { soal: "Planet ketiga dari matahari", jawaban: "bumi", hint: "B**i" },
];

// 📚 KUIS UMUM
const KUIS_DATA = [
  {
    soal: "Ibukota Indonesia adalah?",
    opsi: ["A. Jakarta", "B. Surabaya", "C. Bandung", "D. Medan"],
    jawaban: "A",
    explain: "Jakarta adalah ibukota Indonesia (saat ini).",
  },
  {
    soal: "Siapa presiden pertama Indonesia?",
    opsi: ["A. Soeharto", "B. Habibie", "C. Soekarno", "D. Megawati"],
    jawaban: "C",
    explain: "Ir. Soekarno adalah presiden pertama RI (1945-1967).",
  },
  {
    soal: "Apa nama satelit alami Bumi?",
    opsi: ["A. Mars", "B. Venus", "C. Bulan", "D. Jupiter"],
    jawaban: "C",
    explain: "Bulan adalah satu-satunya satelit alami Bumi.",
  },
  {
    soal: "Berapa jumlah provinsi di Indonesia (2024)?",
    opsi: ["A. 33", "B. 34", "C. 37", "D. 38"],
    jawaban: "D",
    explain: "Setelah pemekaran Papua, Indonesia memiliki 38 provinsi.",
  },
  {
    soal: "Danau terluas di Indonesia adalah?",
    opsi: ["A. Danau Toba", "B. Danau Poso", "C. Danau Maninjau", "D. Danau Singkarak"],
    jawaban: "A",
    explain: "Danau Toba di Sumatera Utara adalah danau terluas di Indonesia sekaligus danau vulkanik terbesar di dunia.",
  },
  {
    soal: "Hewan apa yang menjadi simbol WWF?",
    opsi: ["A. Harimau", "B. Singa", "C. Panda", "D. Gajah"],
    jawaban: "C",
    explain: "Giant Panda adalah logo resmi WWF sejak 1961.",
  },
  {
    soal: "Bahasa pemrograman apa yang dibuat oleh Guido van Rossum?",
    opsi: ["A. Java", "B. Python", "C. Ruby", "D. PHP"],
    jawaban: "B",
    explain: "Python dibuat oleh Guido van Rossum, dirilis pertama tahun 1991.",
  },
  {
    soal: "Apa gas terbanyak di atmosfer Bumi?",
    opsi: ["A. Oksigen", "B. Karbon Dioksida", "C. Nitrogen", "D. Hidrogen"],
    jawaban: "C",
    explain: "Nitrogen menyusun sekitar 78% atmosfer Bumi.",
  },
  {
    soal: "Siapa penemu telepon?",
    opsi: ["A. Edison", "B. Newton", "C. Graham Bell", "D. Tesla"],
    jawaban: "C",
    explain: "Alexander Graham Bell dipatenkan sebagai penemu telepon tahun 1876.",
  },
  {
    soal: "Gunung tertinggi di dunia adalah?",
    opsi: ["A. Kilimanjaro", "B. Everest", "C. K2", "D. Elbrus"],
    jawaban: "B",
    explain: "Gunung Everest (8.848 m) di perbatasan Nepal-Tibet adalah yang tertinggi di dunia.",
  },
];

// 🔢 KUIS MATH
function generateMath() {
  const ops = ["+", "-", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, jawaban;
  if (op === "+") {
    a = rand(10, 200); b = rand(10, 200); jawaban = a + b;
  } else if (op === "-") {
    a = rand(50, 300); b = rand(10, a); jawaban = a - b;
  } else {
    a = rand(2, 25); b = rand(2, 25); jawaban = a * b;
  }
  return { soal: `Berapa hasil dari *${a} ${op} ${b}*?`, jawaban: jawaban.toString() };
}

// 🇬🇧 KUIS ENGLISH
const ENGLISH_DATA = [
  { soal: "Apa arti 'Beautiful' dalam bahasa Indonesia?", jawaban: ["cantik", "indah", "elok"], hint: "C****k / I***h" },
  { soal: "Apa bahasa Inggris dari 'Kucing'?", jawaban: ["cat"], hint: "C*t" },
  { soal: "Apa arti 'Dangerous'?", jawaban: ["berbahaya", "bahaya"], hint: "B*******a" },
  { soal: "Apa bahasa Inggris dari 'Hujan'?", jawaban: ["rain"], hint: "R**n" },
  { soal: "Apa arti 'Knowledge'?", jawaban: ["pengetahuan", "ilmu"], hint: "P**********n" },
  { soal: "Apa bahasa Inggris dari 'Bintang'?", jawaban: ["star"], hint: "S**r" },
  { soal: "Apa arti 'Friendship'?", jawaban: ["persahabatan", "pertemanan"], hint: "P**********n" },
  { soal: "Bahasa Inggris dari 'Pelajar/Murid'?", jawaban: ["student"], hint: "S*****t" },
  { soal: "Apa arti 'Butterfly'?", jawaban: ["kupu-kupu", "kupukupu"], hint: "K*****u" },
  { soal: "Bahasa Inggris dari 'Semangka'?", jawaban: ["watermelon"], hint: "W**********n" },
  { soal: "Apa arti 'Earthquake'?", jawaban: ["gempa bumi", "gempa"], hint: "G*****i" },
  { soal: "Bahasa Inggris dari 'Perpustakaan'?", jawaban: ["library"], hint: "L*****y" },
];

// ════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ════════════════════════════════════════════════════════

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function mention(jid) {
  return `@${jid.split("@")[0]}`;
}

// Simulated "check" values
function randomPercent() {
  return rand(10, 100);
}
function randomLevel(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ════════════════════════════════════════════════════════
//  COMMAND HANDLERS
// ════════════════════════════════════════════════════════

async function handleTebakBendera(sock, msg, jid, sender) {
  const state = getState(jid);
  if (state.tebakBendera) {
    return await reply(sock, msg, "⚠️ Game *Tebak Bendera* sedang berjalan! Tebak dulu:\n\n" + state.tebakBendera.emoji);
  }
  const soal = getRandom(BENDERA_DATA);
  state.tebakBendera = { ...soal, startedBy: sender, hints: 0 };
  await reply(sock, msg,
    `🏳️ *TEBAK BENDERA!* 🏳️\n\n` +
    `${soal.emoji}\n\n` +
    `Negara apa ini?\n` +
    `Ketik *.hint_bendera* untuk hint\n` +
    `Ketik *.skip_bendera* untuk skip`
  );
}

async function handleTebakKata(sock, msg, jid, sender) {
  const state = getState(jid);
  if (state.tebakKata) {
    return await reply(sock, msg, "⚠️ Game *Tebak Kata* sedang berjalan!\n\n🔤 " + state.tebakKata.soal);
  }
  const soal = getRandom(TEBAK_KATA_DATA);
  state.tebakKata = { ...soal, startedBy: sender };
  await reply(sock, msg,
    `🔤 *TEBAK KATA!* 🔤\n\n` +
    `📝 ${soal.soal}\n\n` +
    `Ketik *.hint_kata* untuk hint\n` +
    `Ketik *.skip_kata* untuk skip`
  );
}

async function handleKuis(sock, msg, jid, sender) {
  const state = getState(jid);
  if (state.kuis) {
    const k = state.kuis;
    return await reply(sock, msg,
      `⚠️ Kuis sedang berjalan!\n\n❓ ${k.soal}\n\n${k.opsi.join("\n")}\n\nJawab: A / B / C / D`
    );
  }
  const soal = getRandom(KUIS_DATA);
  state.kuis = { ...soal, startedBy: sender };
  await reply(sock, msg,
    `📚 *KUIS UMUM!* 📚\n\n` +
    `❓ ${soal.soal}\n\n` +
    soal.opsi.join("\n") +
    `\n\n✏️ Jawab dengan *A*, *B*, *C*, atau *D*\n` +
    `Ketik *.skip_kuis* untuk skip`
  );
}

async function handleKuisMath(sock, msg, jid, sender) {
  const state = getState(jid);
  if (state.kuisMath) {
    return await reply(sock, msg, `⚠️ Kuis Math sedang berjalan!\n\n🔢 ${state.kuisMath.soal}`);
  }
  const soal = generateMath();
  state.kuisMath = { ...soal, startedBy: sender };
  await reply(sock, msg,
    `🔢 *KUIS MATH!* 🔢\n\n` +
    `${soal.soal}\n\n` +
    `✏️ Ketik jawabannya!\n` +
    `Ketik *.skip_math* untuk skip`
  );
}

async function handleKuisEnglish(sock, msg, jid, sender) {
  const state = getState(jid);
  if (state.kuisEnglish) {
    return await reply(sock, msg, `⚠️ Kuis English sedang berjalan!\n\n🇬🇧 ${state.kuisEnglish.soal}`);
  }
  const soal = getRandom(ENGLISH_DATA);
  state.kuisEnglish = { ...soal, startedBy: sender };
  await reply(sock, msg,
    `🇬🇧 *KUIS ENGLISH!* 🇬🇧\n\n` +
    `❓ ${soal.soal}\n\n` +
    `✏️ Ketik jawabannya!\n` +
    `Ketik *.hint_english* untuk hint\n` +
    `Ketik *.skip_english* untuk skip`
  );
}

async function handleCekTT(sock, msg, jid, sender) {
  const name = sender.split("@")[0];
  const persen = randomPercent();
  const levels = [
    { min: 0, max: 20, label: "❌ Nggak menarik sama sekali" },
    { min: 21, max: 40, label: "😐 Biasa aja deh" },
    { min: 41, max: 60, label: "🙂 Lumayan lah" },
    { min: 61, max: 80, label: "😍 Cukup menawan!" },
    { min: 81, max: 100, label: "🔥 SUPER MENARIK! Idola sejati!" },
  ];
  const level = levels.find(l => persen >= l.min && persen <= l.max);
  await reply(sock, msg,
    `🎭 *CEK TINGKAT KETAMPANAN/KECANTIKAN*\n\n` +
    `👤 Nama: ${mention(sender)}\n` +
    `📊 Skor TT: *${persen}%*\n` +
    `🏷️ Status: ${level.label}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `${"🟩".repeat(Math.round(persen / 10))}${"⬜".repeat(10 - Math.round(persen / 10))}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `_Hasil ini hanya untuk fun ya! 😄_`
  );
}

async function handleCekGanteng(sock, msg, jid, sender) {
  const persen = randomPercent();
  const kata = [
    "Tampang biasa tapi senyum manis 😊",
    "Ganteng versi lokal, keren banget! 💪",
    "Literally jadi idola kalau jalan di mall 🔥",
    "Good looking level: SULTAN 👑",
    "Muka badak... tapi lucu! 🦏😂",
    "Kalau di drama Korea, pasti jadi pemeran utama! 🌟",
    "Gantengnya keterlaluan, bahaya buat wanita! 😅",
    "Tampan inside & outside! ✨",
  ];
  const roastList = [
    "Cermin bilang: 'buka kacamata dulu bro' 😂",
    "Gantengnya tersembunyi, perlu dikeluarkan dulu 🤔",
    "Level ganteng: masih dalam proses loading... ⏳",
  ];
  const result = persen >= 50 ? getRandom(kata) : getRandom(roastList);
  await reply(sock, msg,
    `😎 *CEK GANTENG* 😎\n\n` +
    `👤 ${mention(sender)}\n` +
    `📊 Tingkat Ganteng: *${persen}%*\n\n` +
    `${"⭐".repeat(Math.round(persen / 20))}${"☆".repeat(5 - Math.round(persen / 20))}\n\n` +
    `💬 ${result}\n\n` +
    `_Hanya untuk hiburan ya! 😁_`
  );
}

async function handleCekCantik(sock, msg, jid, sender) {
  const persen = randomPercent();
  const kata = [
    "Cantiknya natural, tanpa filter pun bersinar! 🌸",
    "Senyummu bikin hati meleleh 💕",
    "Gorgeous level: beyond expectation! 👑",
    "Kalau selfie, pasti viral di TikTok! 📱🔥",
    "Inner beauty + outer beauty = SEMPURNA! ✨",
    "Cantiknya bisa bikin orang noleh dua kali! 😍",
  ];
  await reply(sock, msg,
    `💄 *CEK CANTIK* 💄\n\n` +
    `👤 ${mention(sender)}\n` +
    `📊 Tingkat Kecantikan: *${persen}%*\n\n` +
    `${"💖".repeat(Math.round(persen / 20))}${"🤍".repeat(5 - Math.round(persen / 20))}\n\n` +
    `💬 ${getRandom(kata)}\n\n` +
    `_Hanya untuk hiburan ya! 😘_`
  );
}

async function handleCekSaldo(sock, msg, jid, sender) {
  const saldo = rand(1000, 999999999);
  const bank = getRandom(["BCA", "BNI", "Mandiri", "BRI", "CIMB", "Jenius", "GoPay", "OVO", "Dana"]);
  const status = saldo > 50000000 ? "💎 Sultan!" : saldo > 5000000 ? "🙂 Cukup" : "😅 Nabung dulu yuk";
  await reply(sock, msg,
    `💰 *CEK SALDO* (PARODY) 💰\n\n` +
    `👤 ${mention(sender)}\n` +
    `🏦 Bank: *${bank}*\n` +
    `💵 Saldo: *Rp ${saldo.toLocaleString("id-ID")}*\n` +
    `📊 Status: ${status}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `_❗ Ini BUKAN saldo asli, hanya untuk fun! 😂_`
  );
}

async function handleCekJodoh(sock, msg, jid, sender, text) {
  const args = text.trim().split(" ");
  if (args.length < 2) {
    return await reply(sock, msg, "❤️ *CEK JODOH*\n\nFormat: *.cekjodoh NamaPasangan*\nContoh: *.cekjodoh Budi*");
  }
  const pasangan = args.slice(1).join(" ");
  const persen = randomPercent();
  const status =
    persen >= 80 ? "💍 JODOH BANGET!" :
    persen >= 60 ? "💕 Cocok banget!" :
    persen >= 40 ? "🙂 Lumayan cocok" :
    persen >= 20 ? "😐 Kurang cocok" : "💔 Kayaknya bukan jodoh deh";
  await reply(sock, msg,
    `❤️ *CEK JODOH* ❤️\n\n` +
    `👦 ${mention(sender)}\n` +
    `💞 +\n` +
    `👧 ${pasangan}\n\n` +
    `📊 Kecocokan: *${persen}%*\n\n` +
    `${"❤️".repeat(Math.round(persen / 20))}${"🤍".repeat(5 - Math.round(persen / 20))}\n\n` +
    `💬 ${status}\n\n` +
    `_Hanya untuk hiburan! 💝_`
  );
}

async function handleCekBoty(sock, msg, jid, sender) {
  const sifat = [
    "Diam-diam robot tapi baperan 🤖💔",
    "CPU overload gara-gara mikirin kamu 💻😂",
    "Error 404: Perasaan not found 🤣",
    "Sudah diprogram untuk jadi bot terbaik! 🌟",
    "Baterai emosi: 100% fully charged! ⚡",
    "Running on love.exe 💕",
    "System update: Makin pintar setiap hari! 🧠",
  ];
  const versi = `v${rand(1, 9)}.${rand(0, 9)}.${rand(0, 99)}`;
  await reply(sock, msg,
    `🤖 *CEK BOTY* 🤖\n\n` +
    `🔧 Nama Bot: *${CONFIG.BOT_NAME}*\n` +
    `📌 Versi: *${versi}*\n` +
    `⚡ Status: *Online & Siap Melayani!*\n` +
    `🧠 IQ Bot: *${rand(100, 999)}*\n` +
    `💾 Memory: *${rand(50, 99)}% available*\n` +
    `🕐 Uptime: *${rand(1, 24)} jam ${rand(0, 59)} menit*\n\n` +
    `💬 *"${getRandom(sifat)}"*\n\n` +
    `_Botnya sehat dan siap main game! 🎮_`
  );
}

async function handleCekIQ(sock, msg, jid, sender) {
  const iq = rand(50, 180);
  const level =
    iq >= 160 ? "🧠 GENIUS LEVEL! Einstein reinkarnasi!" :
    iq >= 130 ? "🌟 Super Cerdas!" :
    iq >= 110 ? "📚 Di atas rata-rata" :
    iq >= 90  ? "😊 Normal / Rata-rata" :
    iq >= 70  ? "😅 Perlu belajar lebih giat" : "🦆 Masih ada harapan!";
  await reply(sock, msg,
    `🧠 *CEK IQ* 🧠\n\n` +
    `👤 ${mention(sender)}\n` +
    `📊 Skor IQ: *${iq}*\n` +
    `🏷️ Level: ${level}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `_Hanya untuk fun! IQ asli perlu tes resmi 😄_`
  );
}

async function handleCekNasib(sock, msg, jid, sender) {
  const nasib = [
    "🌟 Hari ini kamu akan dapat rezeki nomplok!",
    "😅 Hati-hati, jangan belanja berlebihan hari ini",
    "💕 Ada seseorang yang diam-diam suka sama kamu!",
    "🎯 Targetmu hari ini akan tercapai jika semangat!",
    "☕ Hari ini cobalah hal baru, kamu akan terkejut!",
    "😴 Istirahat yang cukup, jangan begadang terus!",
    "🚀 Potensimu hari ini sangat besar, manfaatkan!",
    "🍀 Keberuntungan sedang berpihak padamu hari ini!",
    "⚠️ Berhati-hati dalam berbicara hari ini",
    "💪 Hari yang keras, tapi kamu bisa melewatinya!",
  ];
  const bintang = rand(1, 5);
  await reply(sock, msg,
    `🔮 *CEK NASIB HARI INI* 🔮\n\n` +
    `👤 ${mention(sender)}\n\n` +
    `${"⭐".repeat(bintang)}${"☆".repeat(5 - bintang)} (${bintang}/5)\n\n` +
    `💬 ${getRandom(nasib)}\n\n` +
    `_Hanya ramalan fun, bukan sungguhan! 😄_`
  );
}

async function handleCekHoki(sock, msg, jid, sender) {
  const hoki = randomPercent();
  const color = getRandom(["🔴 Merah", "🔵 Biru", "🟡 Kuning", "🟢 Hijau", "🟣 Ungu", "🟠 Oranye"]);
  const angka = rand(1, 100);
  await reply(sock, msg,
    `🍀 *CEK HOKI* 🍀\n\n` +
    `👤 ${mention(sender)}\n` +
    `📊 Tingkat Hoki: *${hoki}%*\n` +
    `🎨 Warna Keberuntungan: *${color}*\n` +
    `🔢 Angka Hoki: *${angka}*\n\n` +
    `${"🍀".repeat(Math.round(hoki / 20))}${"☘️".repeat(5 - Math.round(hoki / 20))}\n\n` +
    `_Semoga harimu menyenangkan! 😊_`
  );
}

async function handleMenu(sock, msg, jid) {
  await reply(sock, msg,
    `╔══════════════════════════╗\n` +
    `║  🎮 ${CONFIG.BOT_NAME}  🎮  ║\n` +
    `╚══════════════════════════╝\n\n` +
    `🏳️ *GAME TEBAK-TEBAKAN*\n` +
    `┣ .tebakbendera - Tebak bendera negara\n` +
    `┣ .tebakkata    - Tebak kata dari clue\n` +
    `┣ .hint_bendera - Hint tebak bendera\n` +
    `┣ .hint_kata    - Hint tebak kata\n` +
    `┣ .skip_bendera - Skip soal bendera\n` +
    `┗ .skip_kata    - Skip soal kata\n\n` +
    `📚 *KUIS*\n` +
    `┣ .kuis         - Kuis pengetahuan umum\n` +
    `┣ .kuismath     - Kuis matematika\n` +
    `┣ .kuisengglish - Kuis bahasa Inggris\n` +
    `┣ .hint_english - Hint kuis english\n` +
    `┣ .skip_kuis    - Skip kuis umum\n` +
    `┣ .skip_math    - Skip kuis math\n` +
    `┗ .skip_english - Skip kuis english\n\n` +
    `🔮 *CEK-CEKAN (FUN)*\n` +
    `┣ .cektt        - Cek tingkat menarik\n` +
    `┣ .cekganteng   - Cek tingkat ganteng\n` +
    `┣ .cekcantik    - Cek tingkat cantik\n` +
    `┣ .ceksaldo     - Cek saldo (parody)\n` +
    `┣ .cekjodoh     - Cek kecocokan jodoh\n` +
    `┣ .cekiq        - Cek IQ kamu\n` +
    `┣ .ceknasib     - Cek nasib hari ini\n` +
    `┣ .cekhoki      - Cek keberuntungan\n` +
    `┗ .cekboty      - Info bot\n\n` +
    `ℹ️ *INFO*\n` +
    `┗ .menu / .help - Tampilkan menu ini\n\n` +
    `_Prefix: ${CONFIG.PREFIX} | Semua game hanya untuk fun! 🎉_`
  );
}

// ════════════════════════════════════════════════════════
//  ANSWER CHECKER
// ════════════════════════════════════════════════════════

async function checkAnswers(sock, msg, jid, sender, text) {
  const state = getState(jid);
  const lower = text.toLowerCase().trim();

  // --- TEBAK BENDERA ---
  if (state.tebakBendera) {
    const g = state.tebakBendera;
    if (g.jawaban.includes(lower)) {
      const pemenang = state.tebakBendera;
      delete state.tebakBendera;
      return await reply(sock, msg,
        `🎉 *BENAR!* 🎉\n\n` +
        `✅ ${mention(sender)} berhasil menebak!\n` +
        `🏳️ Jawabannya: *${pemenang.jawaban[0].toUpperCase()}* ${pemenang.emoji}\n` +
        `\n🎊 Selamat! Ketik *.tebakbendera* untuk main lagi!`
      );
    }
  }

  // --- TEBAK KATA ---
  if (state.tebakKata) {
    const g = state.tebakKata;
    if (lower === g.jawaban.toLowerCase()) {
      const pemenang = state.tebakKata;
      delete state.tebakKata;
      return await reply(sock, msg,
        `🎉 *BENAR!* 🎉\n\n` +
        `✅ ${mention(sender)} berhasil menebak!\n` +
        `🔤 Jawabannya: *${pemenang.jawaban.toUpperCase()}*\n` +
        `\n🎊 Selamat! Ketik *.tebakkata* untuk main lagi!`
      );
    }
  }

  // --- KUIS UMUM ---
  if (state.kuis) {
    const g = state.kuis;
    if (["a", "b", "c", "d"].includes(lower)) {
      const benar = lower.toUpperCase() === g.jawaban;
      const data = state.kuis;
      delete state.kuis;
      return await reply(sock, msg,
        benar
          ? `🎉 *BENAR!* ✅\n\n${mention(sender)} menjawab *${lower.toUpperCase()}*\n\n📖 ${data.explain}\n\n🎊 Ketik *.kuis* untuk soal berikutnya!`
          : `❌ *SALAH!*\n\n${mention(sender)} menjawab *${lower.toUpperCase()}*\nJawaban yang benar: *${data.jawaban}*\n\n📖 ${data.explain}\n\nCoba lagi dengan *.kuis*!`
      );
    }
  }

  // --- KUIS MATH ---
  if (state.kuisMath) {
    const g = state.kuisMath;
    if (lower === g.jawaban) {
      delete state.kuisMath;
      return await reply(sock, msg,
        `🎉 *BENAR!* 🔢\n\n` +
        `✅ ${mention(sender)} menjawab dengan tepat!\n` +
        `🔢 Jawabannya: *${g.jawaban}*\n\n` +
        `🎊 Ketik *.kuismath* untuk soal berikutnya!`
      );
    }
  }

  // --- KUIS ENGLISH ---
  if (state.kuisEnglish) {
    const g = state.kuisEnglish;
    if (g.jawaban.includes(lower)) {
      const data = state.kuisEnglish;
      delete state.kuisEnglish;
      return await reply(sock, msg,
        `🎉 *BENAR!* 🇬🇧\n\n` +
        `✅ ${mention(sender)} menjawab dengan tepat!\n` +
        `🔤 Jawabannya: *${data.jawaban[0].toUpperCase()}*\n\n` +
        `🎊 Ketik *.kuisengglish* untuk soal berikutnya!`
      );
    }
  }
}

// ════════════════════════════════════════════════════════
//  HINT & SKIP
// ════════════════════════════════════════════════════════

async function handleHintBendera(sock, msg, jid) {
  const state = getState(jid);
  if (!state.tebakBendera) return await reply(sock, msg, "❗ Tidak ada game Tebak Bendera yang berjalan. Ketik *.tebakbendera*");
  await reply(sock, msg, `💡 *HINT:* ${state.tebakBendera.hint}\n\n🏳️ ${state.tebakBendera.emoji}`);
}

async function handleHintKata(sock, msg, jid) {
  const state = getState(jid);
  if (!state.tebakKata) return await reply(sock, msg, "❗ Tidak ada game Tebak Kata yang berjalan. Ketik *.tebakkata*");
  await reply(sock, msg, `💡 *HINT:* ${state.tebakKata.hint}`);
}

async function handleHintEnglish(sock, msg, jid) {
  const state = getState(jid);
  if (!state.kuisEnglish) return await reply(sock, msg, "❗ Tidak ada Kuis English yang berjalan. Ketik *.kuisengglish*");
  await reply(sock, msg, `💡 *HINT:* ${state.kuisEnglish.hint}`);
}

async function handleSkipBendera(sock, msg, jid) {
  const state = getState(jid);
  if (!state.tebakBendera) return await reply(sock, msg, "❗ Tidak ada game Tebak Bendera yang berjalan.");
  const jawaban = state.tebakBendera.jawaban[0];
  const emoji = state.tebakBendera.emoji;
  delete state.tebakBendera;
  await reply(sock, msg, `⏭️ Soal di-skip!\n\n🏳️ Jawabannya: *${jawaban.toUpperCase()}* ${emoji}\n\nKetik *.tebakbendera* untuk main lagi!`);
}

async function handleSkipKata(sock, msg, jid) {
  const state = getState(jid);
  if (!state.tebakKata) return await reply(sock, msg, "❗ Tidak ada game Tebak Kata yang berjalan.");
  const jawaban = state.tebakKata.jawaban;
  delete state.tebakKata;
  await reply(sock, msg, `⏭️ Soal di-skip!\n\n🔤 Jawabannya: *${jawaban.toUpperCase()}*\n\nKetik *.tebakkata* untuk main lagi!`);
}

async function handleSkipKuis(sock, msg, jid) {
  const state = getState(jid);
  if (!state.kuis) return await reply(sock, msg, "❗ Tidak ada Kuis yang berjalan.");
  const data = state.kuis;
  delete state.kuis;
  await reply(sock, msg, `⏭️ Soal di-skip!\n\n✅ Jawabannya: *${data.jawaban}*\n📖 ${data.explain}\n\nKetik *.kuis* untuk soal baru!`);
}

async function handleSkipMath(sock, msg, jid) {
  const state = getState(jid);
  if (!state.kuisMath) return await reply(sock, msg, "❗ Tidak ada Kuis Math yang berjalan.");
  const jawaban = state.kuisMath.jawaban;
  delete state.kuisMath;
  await reply(sock, msg, `⏭️ Soal di-skip!\n\n🔢 Jawabannya: *${jawaban}*\n\nKetik *.kuismath* untuk soal baru!`);
}

async function handleSkipEnglish(sock, msg, jid) {
  const state = getState(jid);
  if (!state.kuisEnglish) return await reply(sock, msg, "❗ Tidak ada Kuis English yang berjalan.");
  const data = state.kuisEnglish;
  delete state.kuisEnglish;
  await reply(sock, msg, `⏭️ Soal di-skip!\n\n🇬🇧 Jawabannya: *${data.jawaban[0].toUpperCase()}*\n\nKetik *.kuisengglish* untuk soal baru!`);
}

// ════════════════════════════════════════════════════════
//  REPLY HELPER
// ════════════════════════════════════════════════════════

async function reply(sock, msg, text) {
  await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
}

// ════════════════════════════════════════════════════════
//  MESSAGE HANDLER
// ════════════════════════════════════════════════════════

async function handleMessage(sock, msg) {
  try {
    if (!msg.message) return;
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = jid.endsWith("@g.us");

    // Ambil teks pesan
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption || "";

    if (!text) return;

    const lower = text.toLowerCase().trim();
    const isCmd = lower.startsWith(CONFIG.PREFIX);
    const cmd = isCmd ? lower.slice(CONFIG.PREFIX.length).split(" ")[0] : "";

    // ── CEK JAWABAN (tanpa prefix) ──
    if (!isCmd) {
      await checkAnswers(sock, msg, jid, sender, text);
      return;
    }

    // ── ROUTING COMMAND ──
    switch (cmd) {
      // MENU
      case "menu":
      case "help":
      case "start":
        await handleMenu(sock, msg, jid);
        break;

      // GAME TEBAK
      case "tebakbendera":
        await handleTebakBendera(sock, msg, jid, sender);
        break;
      case "tebakkata":
        await handleTebakKata(sock, msg, jid, sender);
        break;

      // KUIS
      case "kuis":
        await handleKuis(sock, msg, jid, sender);
        break;
      case "kuismath":
        await handleKuisMath(sock, msg, jid, sender);
        break;
      case "kuisengglish":
      case "kuisenglish":
        await handleKuisEnglish(sock, msg, jid, sender);
        break;

      // HINT
      case "hint_bendera":
        await handleHintBendera(sock, msg, jid);
        break;
      case "hint_kata":
        await handleHintKata(sock, msg, jid);
        break;
      case "hint_english":
        await handleHintEnglish(sock, msg, jid);
        break;

      // SKIP
      case "skip_bendera":
        await handleSkipBendera(sock, msg, jid);
        break;
      case "skip_kata":
        await handleSkipKata(sock, msg, jid);
        break;
      case "skip_kuis":
        await handleSkipKuis(sock, msg, jid);
        break;
      case "skip_math":
        await handleSkipMath(sock, msg, jid);
        break;
      case "skip_english":
        await handleSkipEnglish(sock, msg, jid);
        break;

      // CEK-CEKAN
      case "cektt":
        await handleCekTT(sock, msg, jid, sender);
        break;
      case "cekganteng":
        await handleCekGanteng(sock, msg, jid, sender);
        break;
      case "cekcantik":
        await handleCekCantik(sock, msg, jid, sender);
        break;
      case "ceksaldo":
        await handleCekSaldo(sock, msg, jid, sender);
        break;
      case "cekjodoh":
        await handleCekJodoh(sock, msg, jid, sender, text);
        break;
      case "cekiq":
        await handleCekIQ(sock, msg, jid, sender);
        break;
      case "ceknasib":
        await handleCekNasib(sock, msg, jid, sender);
        break;
      case "cekhoki":
        await handleCekHoki(sock, msg, jid, sender);
        break;
      case "cekboty":
        await handleCekBoty(sock, msg, jid, sender);
        break;

      default:
        // Diam jika perintah tidak dikenal (biar tidak spam)
        break;
    }
  } catch (err) {
    console.error("❌ Error handleMessage:", err);
  }
}

// ════════════════════════════════════════════════════════
//  PAIRING CODE CONNECTION
// ════════════════════════════════════════════════════════

async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(CONFIG.SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    printQRInTerminal: false, // QR dimatikan, pakai pairing code
  });

  // ── Pairing Code (jika belum login) ──
  if (!state.creds.registered) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("📱 Masukkan nomor WA kamu (format: 628xxx): ", async (phone) => {
      rl.close();
      phone = phone.replace(/[^0-9]/g, "");
      const code = await sock.requestPairingCode(phone);
      console.log("\n╔══════════════════════════════════╗");
      console.log(`║  🔑 PAIRING CODE: ${code.match(/.{1,4}/g).join("-")}   ║`);
      console.log("╚══════════════════════════════════╝");
      console.log("📲 Buka WA → Perangkat Tertaut → Tautkan perangkat → Masukkan kode di atas\n");
    });
  }

  // ── Event: Koneksi ──
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("\n✅ Bot WhatsApp berhasil terhubung!");
      console.log(`🎮 ${CONFIG.BOT_NAME} siap melayani!`);
      console.log(`📌 Prefix: ${CONFIG.PREFIX}`);
      console.log("─────────────────────────────────\n");
    }
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const reconnect = code !== DisconnectReason.loggedOut;
      console.log(`⚠️ Koneksi terputus (${code}). Reconnect: ${reconnect}`);
      if (reconnect) {
        setTimeout(connectWhatsApp, 3000);
      } else {
        console.log("❌ Logged out. Hapus folder 'session' lalu jalankan ulang.");
      }
    }
  });

  // ── Event: Simpan credentials ──
  sock.ev.on("creds.update", saveCreds);

  // ── Event: Pesan masuk ──
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue; // Abaikan pesan dari bot sendiri
      await handleMessage(sock, msg);
    }
  });

  return sock;
}

// ════════════════════════════════════════════════════════
//  START BOT
// ════════════════════════════════════════════════════════

console.log("╔══════════════════════════════════════════════════════╗");
console.log("║         🎮 WHATSAPP GAME BOT - STARTING...  🎮       ║");
console.log("╚══════════════════════════════════════════════════════╝\n");

connectWhatsApp().catch(console.error);

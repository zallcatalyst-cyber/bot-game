/**
 * ╔══════════════════════════════════════════════════════╗
 * ║         🎮 WHATSAPP GAME BOT - BY FUN BOT 🎮         ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * INSTALL: npm install @whiskeysockets/baileys pino axios
 * RUN    : node index.js
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const pino    = require("pino");
const readline = require("readline");
const os      = require("os");
const axios   = require("axios");

// ─── GLOBAL CONFIG ────────────────────────────────────────────────────────────
global.namabot      = "Rijall";
global.ownernumber  = "6283171413650";   // ← Ganti nomor owner
global.ownername    = "rijall💫";           // ← Ganti nama owner
global.botMode      = true;              // true = Public, false = Self
global.prefix       = ".";
global.version      = "5.0.0";
global.sessionDir   = "./session";
global.menuImage    = "https://files.catbox.moe/63myza.jpeg";

// ─── RUNTIME HELPER ──────────────────────────────────────────────────────────
function runtime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}h ${h}j ${m}m ${s}d`;
}

// ─── GAME STATE ───────────────────────────────────────────────────────────────
const gameState = {};
function getState(jid) {
  if (!gameState[jid]) gameState[jid] = {};
  return gameState[jid];
}

// ═════════════════════════════════════════════════════════
//  DATA GAME
// ═════════════════════════════════════════════════════════

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

const KUIS_DATA = [
  { soal: "Ibukota Indonesia adalah?", opsi: ["A. Jakarta","B. Surabaya","C. Bandung","D. Medan"], jawaban: "A", explain: "Jakarta adalah ibukota Indonesia." },
  { soal: "Presiden pertama Indonesia?", opsi: ["A. Soeharto","B. Habibie","C. Soekarno","D. Megawati"], jawaban: "C", explain: "Ir. Soekarno (1945-1967)." },
  { soal: "Satelit alami Bumi?", opsi: ["A. Mars","B. Venus","C. Bulan","D. Jupiter"], jawaban: "C", explain: "Bulan adalah satu-satunya satelit alami Bumi." },
  { soal: "Jumlah provinsi Indonesia (2024)?", opsi: ["A. 33","B. 34","C. 37","D. 38"], jawaban: "D", explain: "Setelah pemekaran Papua menjadi 38 provinsi." },
  { soal: "Danau terluas di Indonesia?", opsi: ["A. Danau Toba","B. Danau Poso","C. Danau Maninjau","D. Danau Singkarak"], jawaban: "A", explain: "Danau Toba, Sumatera Utara." },
  { soal: "Simbol hewan WWF?", opsi: ["A. Harimau","B. Singa","C. Panda","D. Gajah"], jawaban: "C", explain: "Giant Panda, logo WWF sejak 1961." },
  { soal: "Python dibuat oleh?", opsi: ["A. Linus","B. Guido van Rossum","C. Bill Gates","D. Mark Z"], jawaban: "B", explain: "Guido van Rossum, 1991." },
  { soal: "Gas terbanyak di atmosfer?", opsi: ["A. Oksigen","B. CO2","C. Nitrogen","D. Hidrogen"], jawaban: "C", explain: "Nitrogen ~78% atmosfer Bumi." },
  { soal: "Penemu telepon?", opsi: ["A. Edison","B. Newton","C. Graham Bell","D. Tesla"], jawaban: "C", explain: "Alexander Graham Bell, 1876." },
  { soal: "Gunung tertinggi di dunia?", opsi: ["A. Kilimanjaro","B. Everest","C. K2","D. Elbrus"], jawaban: "B", explain: "Gunung Everest 8.848 m." },
];

const ENGLISH_DATA = [
  { soal: "Arti 'Beautiful'?", jawaban: ["cantik","indah","elok"], hint: "C****k / I***h" },
  { soal: "Bahasa Inggris 'Kucing'?", jawaban: ["cat"], hint: "C*t" },
  { soal: "Arti 'Dangerous'?", jawaban: ["berbahaya","bahaya"], hint: "B*******a" },
  { soal: "Bahasa Inggris 'Hujan'?", jawaban: ["rain"], hint: "R**n" },
  { soal: "Arti 'Knowledge'?", jawaban: ["pengetahuan","ilmu"], hint: "P**********n" },
  { soal: "Bahasa Inggris 'Bintang'?", jawaban: ["star"], hint: "S**r" },
  { soal: "Arti 'Friendship'?", jawaban: ["persahabatan","pertemanan"], hint: "P**********n" },
  { soal: "Bahasa Inggris 'Murid'?", jawaban: ["student"], hint: "S*****t" },
  { soal: "Arti 'Butterfly'?", jawaban: ["kupu-kupu","kupukupu"], hint: "K*****u" },
  { soal: "Bahasa Inggris 'Semangka'?", jawaban: ["watermelon"], hint: "W**********n" },
  { soal: "Arti 'Earthquake'?", jawaban: ["gempa bumi","gempa"], hint: "G*****i" },
  { soal: "Bahasa Inggris 'Perpustakaan'?", jawaban: ["library"], hint: "L*****y" },
];

// ═════════════════════════════════════════════════════════
//  HELPERS
// ═════════════════════════════════════════════════════════

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const mention  = (jid) => `@${jid.split("@")[0]}`;
const randomPercent = () => rand(10, 100);

async function reply(sock, msg, text, mentions) {
  const payload = { text };
  if (mentions && mentions.length) payload.mentions = mentions;
  await sock.sendMessage(msg.key.remoteJid, payload, { quoted: msg });
}

async function replyImage(sock, msg, imageUrl, caption, mentions) {
  try {
    const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(res.data);
    const payload = { image: buffer, caption, mimetype: "image/jpeg" };
    if (mentions && mentions.length) payload.mentions = mentions;
    await sock.sendMessage(msg.key.remoteJid, payload, { quoted: msg });
  } catch {
    await reply(sock, msg, caption, mentions);
  }
}

// ─── Hidetag helper ────────────────────────────────────────
// Ambil semua participant grup untuk dipasang di "mentions" tanpa
// menampilkan tulisan @nomor di teks (hidetag / tag semua diam-diam).
// Kalau bukan grup (chat pribadi), kembalikan array kosong.
async function getGroupMentions(sock, jid) {
  if (!jid.endsWith("@g.us")) return [];
  try {
    const meta = await sock.groupMetadata(jid);
    return meta.participants.map((p) => p.id);
  } catch {
    return [];
  }
}

// ─── Resolve target untuk command "cek-cekan" ─────────────
// Mendukung: tag/mention orang lain, atau ketik nama manual.
// Kalau tidak ada target sama sekali -> null (supaya handler bisa minta input).
function resolveTarget(msg, text, sender) {
  const mentionedJid =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if (mentionedJid) {
    return { isTag: true, jid: mentionedJid, label: mention(mentionedJid) };
  }

  // Ambil teks setelah command, contoh: ".cekganteng Budi" -> "Budi"
  const args = text.trim().split(/\s+/).slice(1).join(" ").trim();
  if (args) {
    return { isTag: false, jid: null, label: args };
  }

  return null;
}

// ═════════════════════════════════════════════════════════
//  HANDLERS — GAME
// ═════════════════════════════════════════════════════════

async function handleTebakBendera(sock, msg, jid, sender) {
  const state = getState(jid);
  if (state.tebakBendera) return reply(sock, msg, `⚠️ Game masih berjalan!\n\n${state.tebakBendera.emoji}\n\nTebak dulu atau ketik *.skip_bendera*`);
  const soal = getRandom(BENDERA_DATA);
  state.tebakBendera = { ...soal, startedBy: sender };
  reply(sock, msg, `🏳️ *TEBAK BENDERA*\n\n${soal.emoji}\n\nNegara apa ini?\n💡 *.hint_bendera* | ⏭️ *.skip_bendera*`);
}

async function handleTebakKata(sock, msg, jid, sender) {
  const state = getState(jid);
  if (state.tebakKata) return reply(sock, msg, `⚠️ Game masih berjalan!\n\n📝 ${state.tebakKata.soal}\n\nKetik *.skip_kata* untuk skip`);
  const soal = getRandom(TEBAK_KATA_DATA);
  state.tebakKata = { ...soal, startedBy: sender };
  reply(sock, msg, `🔤 *TEBAK KATA*\n\n📝 ${soal.soal}\n\n💡 *.hint_kata* | ⏭️ *.skip_kata*`);
}

async function handleKuis(sock, msg, jid, sender) {
  const state = getState(jid);
  if (state.kuis) {
    const k = state.kuis;
    return reply(sock, msg, `⚠️ Kuis masih berjalan!\n\n❓ ${k.soal}\n${k.opsi.join("\n")}\n\nJawab A/B/C/D`);
  }
  const soal = getRandom(KUIS_DATA);
  state.kuis = { ...soal, startedBy: sender };
  reply(sock, msg, `📚 *KUIS UMUM*\n\n❓ ${soal.soal}\n\n${soal.opsi.join("\n")}\n\n✏️ Jawab: A / B / C / D\n⏭️ *.skip_kuis*`);
}

function generateMath() {
  const ops = ["+", "-", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, jawaban;
  if (op === "+") { a = rand(10,200); b = rand(10,200); jawaban = a+b; }
  else if (op === "-") { a = rand(50,300); b = rand(10,a); jawaban = a-b; }
  else { a = rand(2,25); b = rand(2,25); jawaban = a*b; }
  return { soal: `Berapa *${a} ${op} ${b}*?`, jawaban: jawaban.toString() };
}

async function handleKuisMath(sock, msg, jid, sender) {
  const state = getState(jid);
  if (state.kuisMath) return reply(sock, msg, `⚠️ Kuis math masih berjalan!\n\n🔢 ${state.kuisMath.soal}\n\n⏭️ *.skip_math*`);
  const soal = generateMath();
  state.kuisMath = { ...soal, startedBy: sender };
  reply(sock, msg, `🔢 *KUIS MATH*\n\n${soal.soal}\n\n✏️ Ketik jawabannya!\n⏭️ *.skip_math*`);
}

async function handleKuisEnglish(sock, msg, jid, sender) {
  const state = getState(jid);
  if (state.kuisEnglish) return reply(sock, msg, `⚠️ Kuis English masih berjalan!\n\n🇬🇧 ${state.kuisEnglish.soal}\n\n⏭️ *.skip_english*`);
  const soal = getRandom(ENGLISH_DATA);
  state.kuisEnglish = { ...soal, startedBy: sender };
  reply(sock, msg, `🇬🇧 *KUIS ENGLISH*\n\n❓ ${soal.soal}\n\n💡 *.hint_english* | ⏭️ *.skip_english*`);
}

// ═════════════════════════════════════════════════════════
//  HANDLERS — CEK-CEKAN
//  Semua command di bawah ini SEKARANG WAJIB target:
//  - tag/mention orang lain (@nomor), ATAU
//  - ketik nama manual setelah command (.cekganteng Budi)
//  Kalau tidak ada target sama sekali, bot minta user kirim ulang.
// ═════════════════════════════════════════════════════════

async function handleCekTT(sock, msg, jid, sender, text) {
  const target = resolveTarget(msg, text, sender);
  if (!target) return reply(sock, msg, "🎭 *CEK TT*\n\nFormat:\n• Tag orangnya: *.cektt @nomor*\n• Atau ketik nama: *.cektt NamaOrang*");

  const namaTampil = target.isTag ? target.label : `*${target.label}*`;
  const p = randomPercent();
  const lvl = p>=81?"🔥 Super Menarik!":p>=61?"😍 Cukup Menawan":p>=41?"🙂 Lumayan":p>=21?"😐 Biasa Aja":"❌ Kurang Menarik";
  const teks = `🎭 *CEK TT*\n\n👤 Target: ${namaTampil}\n📊 Skor: *${p}%*\n${bar(p)}\n🏷️ ${lvl}\n\n_Hanya untuk fun! 😄_`;
  reply(sock, msg, teks, target.isTag ? [target.jid] : []);
}

async function handleCekGanteng(sock, msg, jid, sender, text) {
  const target = resolveTarget(msg, text, sender);
  if (!target) return reply(sock, msg, "😎 *CEK GANTENG*\n\nFormat:\n• Tag orangnya: *.cekganteng @nomor*\n• Atau ketik nama: *.cekganteng NamaOrang*");

  const namaTampil = target.isTag ? target.label : `*${target.label}*`;
  const p = randomPercent();
  const kata = p>=50
    ? getRandom(["Ganteng level sultan 👑","Literally jadi pemeran utama drama Korea! 🌟","Good looking parah, bahaya buat cewek 😅","Gantengnya bikin noleh dua kali! 😍"])
    : getRandom(["Cermin bilang: 'buka kacamata dulu bro' 😂","Level ganteng: masih loading... ⏳","Gantengnya tersembunyi, perlu dikeluarkan dulu 🤔"]);
  const teks = `😎 *CEK GANTENG*\n\n👤 Target: ${namaTampil}\n📊 ${p}%\n${bar(p)}\n💬 ${kata}\n\n_Hanya fun! 😁_`;
  reply(sock, msg, teks, target.isTag ? [target.jid] : []);
}

async function handleCekCantik(sock, msg, jid, sender, text) {
  const target = resolveTarget(msg, text, sender);
  if (!target) return reply(sock, msg, "💄 *CEK CANTIK*\n\nFormat:\n• Tag orangnya: *.cekcantik @nomor*\n• Atau ketik nama: *.cekcantik NamaOrang*");

  const namaTampil = target.isTag ? target.label : `*${target.label}*`;
  const p = randomPercent();
  const kata = getRandom(["Natural cantiknya, tanpa filter pun bersinar 🌸","Senyummu bikin hati meleleh 💕","Kalau selfie pasti viral di TikTok! 📱🔥","Cantiknya bikin orang noleh dua kali! 😍"]);
  const teks = `💄 *CEK CANTIK*\n\n👤 Target: ${namaTampil}\n📊 ${p}%\n${bar(p)}\n💬 ${kata}\n\n_Hanya fun! 😘_`;
  reply(sock, msg, teks, target.isTag ? [target.jid] : []);
}

async function handleCekSaldo(sock, msg, jid, sender) {
  const saldo = rand(1000, 999999999);
  const bank  = getRandom(["BCA","BNI","Mandiri","BRI","CIMB","GoPay","OVO","Dana"]);
  const status= saldo>50000000?"💎 Sultan!":saldo>5000000?"🙂 Cukup":"😅 Nabung dulu yuk";
  reply(sock, msg, `💰 *CEK SALDO* (PARODY)\n\n👤 ${mention(sender)}\n🏦 Bank: *${bank}*\n💵 Saldo: *Rp ${saldo.toLocaleString("id-ID")}*\n📊 ${status}\n\n_❗ Bukan saldo asli! 😂_`, [sender]);
}

async function handleCekJodoh(sock, msg, jid, sender, text) {
  const target = resolveTarget(msg, text, sender);
  if (!target) return reply(sock, msg, "❤️ *CEK JODOH*\n\nFormat:\n• Tag orangnya: *.cekjodoh @nomor*\n• Atau ketik nama: *.cekjodoh NamaPasangan*");

  const namaTampil = target.isTag ? target.label : `*${target.label}*`;
  const p = randomPercent();
  const status = p>=80?"💍 JODOH BANGET!":p>=60?"💕 Cocok banget!":p>=40?"🙂 Lumayan cocok":p>=20?"😐 Kurang cocok":"💔 Bukan jodohnya";
  const teks = `❤️ *CEK JODOH*\n\n👦 ${mention(sender)}\n💞 +\n👧 ${namaTampil}\n\n📊 Kecocokan: *${p}%*\n${bar(p)}\n💬 ${status}\n\n_Hanya fun! 💝_`;
  const mentions = target.isTag ? [sender, target.jid] : [sender];
  reply(sock, msg, teks, mentions);
}

async function handleCekIQ(sock, msg, jid, sender) {
  const iq = rand(50,180);
  const lvl = iq>=160?"🧠 GENIUS! Einstein reinkarnasi!":iq>=130?"🌟 Super Cerdas!":iq>=110?"📚 Di atas rata-rata":iq>=90?"😊 Rata-rata":iq>=70?"😅 Perlu belajar lebih":"🦆 Masih ada harapan!";
  reply(sock, msg, `🧠 *CEK IQ*\n\n👤 ${mention(sender)}\n📊 IQ: *${iq}*\n🏷️ ${lvl}\n\n_Hanya fun! 😄_`, [sender]);
}

async function handleCekNasib(sock, msg, jid, sender) {
  const list = ["🌟 Rezeki nomplok hari ini!","💕 Ada yang diam-diam suka kamu!","🎯 Targetmu akan tercapai!","☕ Coba hal baru hari ini!","😴 Jangan begadang malam ini","🚀 Potensimu sangat besar hari ini!","🍀 Keberuntungan berpihak padamu!","⚠️ Hati-hati dalam berbicara","💪 Hari keras, tapi kamu bisa!"];
  const bintang = rand(1,5);
  reply(sock, msg, `🔮 *CEK NASIB*\n\n👤 ${mention(sender)}\n${"⭐".repeat(bintang)}${"☆".repeat(5-bintang)}\n\n💬 ${getRandom(list)}\n\n_Hanya ramalan fun! 😄_`, [sender]);
}

async function handleCekHoki(sock, msg, jid, sender, text) {
  const target = resolveTarget(msg, text, sender);
  if (!target) return reply(sock, msg, "🍀 *CEK HOKI*\n\nFormat:\n• Tag orangnya: *.cekhoki @nomor*\n• Atau ketik nama: *.cekhoki NamaOrang*");

  const namaTampil = target.isTag ? target.label : `*${target.label}*`;
  const p = randomPercent();
  const color = getRandom(["🔴 Merah","🔵 Biru","🟡 Kuning","🟢 Hijau","🟣 Ungu","🟠 Oranye"]);
  const teks = `🍀 *CEK HOKI*\n\n👤 Target: ${namaTampil}\n📊 Hoki: *${p}%*\n${bar(p)}\n🎨 Warna Hoki: *${color}*\n🔢 Angka Hoki: *${rand(1,100)}*\n\n_Semoga harimu menyenangkan! 😊_`;
  reply(sock, msg, teks, target.isTag ? [target.jid] : []);
}

async function handleCekBoty(sock, msg, jid, sender) {
  const sifat = getRandom(["Running on love.exe 💕","CPU overload mikirin kamu 💻😂","Error 404: Perasaan not found 🤣","Sudah diprogram jadi bot terbaik! 🌟"]);
  reply(sock, msg, `🤖 *CEK BOTY*\n\n🔧 Nama: *${global.namabot}*\n📌 Versi: *${global.version}*\n⚡ Status: *Online!*\n🧠 IQ Bot: *${rand(100,999)}*\n\n💬 _"${sifat}"_`);
}

// ─── Progress bar helper ──────────────────────────────────
function bar(persen) {
  const fill = Math.round(persen / 10);
  return `${"🟩".repeat(fill)}${"⬜".repeat(10 - fill)} ${persen}%`;
}

// ═════════════════════════════════════════════════════════
//  HANDLERS — HINT & SKIP
// ═════════════════════════════════════════════════════════

async function handleHintBendera(sock, msg, jid) {
  const s = getState(jid);
  if (!s.tebakBendera) return reply(sock, msg, "❗ Tidak ada game Tebak Bendera. Ketik *.tebakbendera*");
  reply(sock, msg, `💡 Hint: ${s.tebakBendera.hint}\n\n${s.tebakBendera.emoji}`);
}
async function handleHintKata(sock, msg, jid) {
  const s = getState(jid);
  if (!s.tebakKata) return reply(sock, msg, "❗ Tidak ada game Tebak Kata. Ketik *.tebakkata*");
  reply(sock, msg, `💡 Hint: ${s.tebakKata.hint}`);
}
async function handleHintEnglish(sock, msg, jid) {
  const s = getState(jid);
  if (!s.kuisEnglish) return reply(sock, msg, "❗ Tidak ada Kuis English. Ketik *.kuisengglish*");
  reply(sock, msg, `💡 Hint: ${s.kuisEnglish.hint}`);
}
async function handleSkipBendera(sock, msg, jid) {
  const s = getState(jid);
  if (!s.tebakBendera) return reply(sock, msg, "❗ Tidak ada game Tebak Bendera.");
  const { jawaban, emoji } = s.tebakBendera; delete s.tebakBendera;
  reply(sock, msg, `⏭️ Skip!\n\n🏳️ Jawaban: *${jawaban[0].toUpperCase()}* ${emoji}`);
}
async function handleSkipKata(sock, msg, jid) {
  const s = getState(jid);
  if (!s.tebakKata) return reply(sock, msg, "❗ Tidak ada game Tebak Kata.");
  const { jawaban } = s.tebakKata; delete s.tebakKata;
  reply(sock, msg, `⏭️ Skip!\n\n🔤 Jawaban: *${jawaban.toUpperCase()}*`);
}
async function handleSkipKuis(sock, msg, jid) {
  const s = getState(jid);
  if (!s.kuis) return reply(sock, msg, "❗ Tidak ada Kuis yang berjalan.");
  const { jawaban, explain } = s.kuis; delete s.kuis;
  reply(sock, msg, `⏭️ Skip!\n\n✅ Jawaban: *${jawaban}*\n📖 ${explain}`);
}
async function handleSkipMath(sock, msg, jid) {
  const s = getState(jid);
  if (!s.kuisMath) return reply(sock, msg, "❗ Tidak ada Kuis Math.");
  const { jawaban } = s.kuisMath; delete s.kuisMath;
  reply(sock, msg, `⏭️ Skip!\n\n🔢 Jawaban: *${jawaban}*`);
}
async function handleSkipEnglish(sock, msg, jid) {
  const s = getState(jid);
  if (!s.kuisEnglish) return reply(sock, msg, "❗ Tidak ada Kuis English.");
  const { jawaban } = s.kuisEnglish; delete s.kuisEnglish;
  reply(sock, msg, `⏭️ Skip!\n\n🇬🇧 Jawaban: *${jawaban[0].toUpperCase()}*`);
}

// ═════════════════════════════════════════════════════════
//  CHECK ANSWERS
//  PENTING: "sender" di sini WAJIB diisi dari pengirim pesan
//  jawaban itu sendiri (lihat handleMessage di bawah, yang
//  mengambil msg.key.participant dari msg JAWABAN, bukan dari
//  msg soal). Jadi siapa pun yang ngetik jawaban benar duluan,
//  dialah yang ditandai — bukan nomor acak / nomor starter game.
// ═════════════════════════════════════════════════════════

async function checkAnswers(sock, msg, jid, sender, text) {
  const s = getState(jid);
  const lower = text.toLowerCase().trim();

  if (s.tebakBendera && s.tebakBendera.jawaban.includes(lower)) {
    const { jawaban, emoji } = s.tebakBendera; delete s.tebakBendera;
    return reply(sock, msg, `🎉 *BENAR!*\n\n✅ ${mention(sender)} berhasil!\n🏳️ Jawaban: *${jawaban[0].toUpperCase()}* ${emoji}\n\nKetik *.tebakbendera* untuk lanjut!`, [sender]);
  }
  if (s.tebakKata && lower === s.tebakKata.jawaban.toLowerCase()) {
    const { jawaban } = s.tebakKata; delete s.tebakKata;
    return reply(sock, msg, `🎉 *BENAR!*\n\n✅ ${mention(sender)} berhasil!\n🔤 Jawaban: *${jawaban.toUpperCase()}*\n\nKetik *.tebakkata* untuk lanjut!`, [sender]);
  }
  if (s.kuis && ["a","b","c","d"].includes(lower)) {
    const benar = lower.toUpperCase() === s.kuis.jawaban;
    const { jawaban, explain } = s.kuis; delete s.kuis;
    return reply(sock, msg, benar
      ? `🎉 *BENAR!* ✅\n\n${mention(sender)} menjawab *${lower.toUpperCase()}*\n📖 ${explain}`
      : `❌ *SALAH!*\n\n${mention(sender)} menjawab *${lower.toUpperCase()}*\n✅ Jawaban benar: *${jawaban}*\n📖 ${explain}`,
      [sender]
    );
  }
  if (s.kuisMath && lower === s.kuisMath.jawaban) {
    const { jawaban } = s.kuisMath; delete s.kuisMath;
    return reply(sock, msg, `🎉 *BENAR!* 🔢\n\n✅ ${mention(sender)} tepat!\nJawaban: *${jawaban}*`, [sender]);
  }
  if (s.kuisEnglish && s.kuisEnglish.jawaban.includes(lower)) {
    const { jawaban } = s.kuisEnglish; delete s.kuisEnglish;
    return reply(sock, msg, `🎉 *BENAR!* 🇬🇧\n\n✅ ${mention(sender)} tepat!\nJawaban: *${jawaban[0].toUpperCase()}*`, [sender]);
  }
}

// ═════════════════════════════════════════════════════════
//  MENU — dengan gambar & case switch style
// ═════════════════════════════════════════════════════════

async function handleMenu(sock, msg, jid) {
  const teksmenu =
`▲ 𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : *${global.ownername}*
▲ 𝐍𝐮𝐦𝐛𝐞𝐫 : *${global.ownernumber}*
▲ 𝐍𝐚𝐦𝐚 𝐁𝐨𝐭 : *${global.namabot}*
▲ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧 : *${global.version}*
▲ 𝐌𝐨𝐝𝐞 : *${global.botMode ? "Public" : "Self"}*
▲ 𝐑𝐮𝐧𝐭𝐢𝐦𝐞 : *${runtime(process.uptime())}*
▲ 𝐕𝐏𝐒 𝐔𝐩𝐭𝐢𝐦𝐞 : *${runtime(os.uptime())}*

🏳️ *TEBAK-TEBAKAN*
┣ .tebakbendera
┣ .tebakkata
┣ .hint_bendera / .hint_kata
┗ .skip_bendera / .skip_kata

📚 *KUIS*
┣ .kuis
┣ .kuismath
┣ .kuisengglish
┣ .hint_english
┗ .skip_kuis / .skip_math / .skip_english

🔮 *CEK-CEKAN* (tag orang atau ketik nama)
┣ .cektt @nomor / .cektt Nama
┣ .cekganteng @nomor / .cekganteng Nama
┣ .cekcantik @nomor / .cekcantik Nama
┣ .ceksaldo / .cekjodoh @nomor / .cekjodoh Nama
┣ .cekiq / .ceknasib
┣ .cekhoki @nomor / .cekhoki Nama
┗ .cekboty

_Prefix: ${global.prefix} | Have fun! 🎉_`;

  // Hidetag: kalau dipanggil di dalam grup, mention semua member
  // tapi tanpa menampilkan tulisan @nomor di captionnya.
  const mentions = await getGroupMentions(sock, jid);
  await replyImage(sock, msg, global.menuImage, teksmenu, mentions);
}

// ═════════════════════════════════════════════════════════
//  MESSAGE HANDLER
// ═════════════════════════════════════════════════════════

async function handleMessage(sock, msg) {
  try {
    if (!msg.message) return;
    const jid    = msg.key.remoteJid;
    // PENTING: "sender" selalu diambil dari msg INI (pesan yang baru
    // masuk), bukan dari pesan soal sebelumnya. Untuk pesan di grup,
    // msg.key.participant adalah JID asli si pengirim. Fallback ke
    // remoteJid hanya berlaku di chat pribadi (1-on-1).
    const sender = msg.key.participant || msg.key.remoteJid;

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption || "";

    if (!text) return;

    const lower = text.toLowerCase().trim();
    const isCmd = lower.startsWith(global.prefix);
    const command = isCmd ? lower.slice(global.prefix.length).split(" ")[0] : "";

    if (!isCmd) { await checkAnswers(sock, msg, jid, sender, text); return; }

    switch (command) {
      case "menu": case "help": case "start":
        await handleMenu(sock, msg, jid); break;

      case "tebakbendera": await handleTebakBendera(sock, msg, jid, sender); break;
      case "tebakkata":    await handleTebakKata(sock, msg, jid, sender); break;

      case "kuis":         await handleKuis(sock, msg, jid, sender); break;
      case "kuismath":     await handleKuisMath(sock, msg, jid, sender); break;
      case "kuisengglish": case "kuisenglish":
        await handleKuisEnglish(sock, msg, jid, sender); break;

      case "hint_bendera": await handleHintBendera(sock, msg, jid); break;
      case "hint_kata":    await handleHintKata(sock, msg, jid); break;
      case "hint_english": await handleHintEnglish(sock, msg, jid); break;

      case "skip_bendera": await handleSkipBendera(sock, msg, jid); break;
      case "skip_kata":    await handleSkipKata(sock, msg, jid); break;
      case "skip_kuis":    await handleSkipKuis(sock, msg, jid); break;
      case "skip_math":    await handleSkipMath(sock, msg, jid); break;
      case "skip_english": await handleSkipEnglish(sock, msg, jid); break;

      case "cektt":      await handleCekTT(sock, msg, jid, sender, text); break;
      case "cekganteng": await handleCekGanteng(sock, msg, jid, sender, text); break;
      case "cekcantik":  await handleCekCantik(sock, msg, jid, sender, text); break;
      case "ceksaldo":   await handleCekSaldo(sock, msg, jid, sender); break;
      case "cekjodoh":   await handleCekJodoh(sock, msg, jid, sender, text); break;
      case "cekiq":      await handleCekIQ(sock, msg, jid, sender); break;
      case "ceknasib":   await handleCekNasib(sock, msg, jid, sender); break;
      case "cekhoki":    await handleCekHoki(sock, msg, jid, sender, text); break;
      case "cekboty":    await handleCekBoty(sock, msg, jid, sender); break;

      default: break;
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

// ═════════════════════════════════════════════════════════
//  CONNECT — PAIRING CODE
// ═════════════════════════════════════════════════════════

async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(global.sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    printQRInTerminal: false,
  });

  if (!state.creds.registered) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("📱 Nomor WA (628xxx): ", async (phone) => {
      rl.close();
      phone = phone.replace(/[^0-9]/g, "");
      const code = await sock.requestPairingCode(phone);
      console.log("\n╔══════════════════════════════════╗");
      console.log(`║  🔑 KODE: ${code.match(/.{1,4}/g).join("-")}            ║`);
      console.log("╚══════════════════════════════════╝");
      console.log("📲 WA → Perangkat Tertaut → Tautkan dengan nomor → masukkan kode\n");
    });
  }

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log(`✅ ${global.namabot} terhubung! Prefix: ${global.prefix}`);
    }
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log("⚠️ Reconnecting...");
        setTimeout(connectWhatsApp, 3000);
      } else {
        console.log("❌ Logged out. Hapus folder session lalu jalankan ulang.");
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      await handleMessage(sock, msg);
    }
  });
}

console.log(`\n🎮 Starting ${global.namabot}...\n`);
connectWhatsApp().catch(console.error);

const MESSAGES = [
  { label: "Hari ini moodmu perlu diselamatkan oleh sepiring yang enak 🍽️", sub: "Pilih yang bikin hatimu senang!" },
  { label: "Perutmu udah nunggu dari tadi — yuk pilih sesuatu yang istimewa 🌟", sub: "Menu terbaik sudah siap untukmu!" },
  { label: "Satu gigitan dari D'Foria bikin semua lelah hari ini terbayar 😌", sub: "Kamu berhak dapat yang terbaik!" },
  { label: "Hari belum lengkap tanpa hidangan yang bikin senyum 😊", sub: "Temukan favoritmu sekarang!" },
  { label: "Mau makan apa hari ini? Biar kita yang urus 🤌", sub: "Setiap menu dibuat dengan sepenuh hati!" },
  { label: "Sudah kerja keras, waktunya reward diri dengan makanan favorit 🏆", sub: "Kamu pantas mendapatkan yang terbaik!" },
  { label: "Aroma masakan D'Foria sudah menunggu sejak pagi — jangan tahan lagi! 🌿", sub: "Pesan sekarang, nikmati dalam hitungan menit!" },
  { label: "Hari yang baik dimulai dari makanan yang tepat ☀️", sub: "Mari kita mulai dengan pilihan terbaikmu!" },
  { label: "Makanan bukan sekadar kenyang — ini soal kebahagiaan 💛", sub: "Pilih yang bikin perut dan hatimu puas!" },
  { label: "Dari dapur kami ke mejamu — dengan cinta dan bumbu pilihan ❤️", sub: "Rasakan perbedaannya di setiap suapan!" },
  { label: "Kali ini biarkan kami yang memasak untukmu 👨‍🍳", sub: "Santai dulu, pesanan sudah di tangan kami!" },
  { label: "Lapar itu tanda bahwa kamu perlu sesuatu yang luar biasa 🔥", sub: "Dan kami punya jawabannya!" },
  { label: "Hidangan spesial hari ini menunggumu! Siapa yang beruntung? 🍀", sub: "Mungkin kamu orangnya!" },
  { label: "Jangan biarkan perut kosong menghalangi hari produktifmu 💪", sub: "Isi energi dengan menu pilihan terbaik!" },
  { label: "Makan enak itu hak, bukan kemewahan — dan kami percaya itu 🌺", sub: "Nikmati setiap momen makan bersamamu!" },
  { label: "Kamu yang tahu selera terbaikmu — kami yang tahu cara memasaknya 🎯", sub: "Perpaduan sempurna menunggumu!" },
  { label: "Setiap suapan D'Foria adalah cerita rasa yang tak terlupakan 📖", sub: "Mulai ceritamu hari ini!" },
  { label: "Hari ini rezekimu adalah makanan enak — tinggal pilih! 🥰", sub: "Semua menu siap hadir untukmu!" },
  { label: "Rahasia hari yang menyenangkan? Dimulai dari perut yang bahagia! 😄", sub: "Ayo, temukan hidangan favoritmu!" },
  { label: "Ada yang bilang makanan enak bisa memperbaiki mood — dan kami setuju! 🌈", sub: "Biarkan kami buktikan hari ini!" },
  { label: "Jangan pilih asal-asalan — pilih yang benar-benar kamu inginkan 🎪", sub: "Karena kamu layak dapat yang terbaik!" },
  { label: "Satu pesanan dari D'Foria, seribu alasan untuk tersenyum 😃", sub: "Yuk, mulai dari sini!" },
  { label: "Sedang mikir mau makan apa? Berhenti mikir, langsung pilih! 🚀", sub: "Pesananmu sudah kami tunggu!" },
  { label: "Menu hari ini tampak lebih menggoda dari biasanya — atau mungkin karena kamu? 😏", sub: "Lihat sendiri dan buktikan!" },
  { label: "Tidak ada masalah yang tidak bisa diselesaikan dengan makanan enak 🧠", sub: "Solusi terbaikmu ada di sini!" },
  { label: "Waktu makan yang sempurna adalah sekarang — dan tempat terbaiknya di sini! ⏰", sub: "Jangan sampai kehabisan menu favorit!" },
  { label: "Setiap hidangan kami diramu khusus — bukan hanya untuk perut, tapi untuk jiwa 🕊️", sub: "Rasakan keistimewaannya!" },
  { label: "Hari ini kami masak dengan ekstra semangat — spesial buat kamu! 👏", sub: "Pilih dan rasakan bedanya!" },
  { label: "Masakan terbaik lahir dari bahan segar dan cinta tulus ❤️‍🔥", sub: "Kami jamin keduanya ada di sini!" },
  { label: "Kamu sudah jauh datang ke sini — pilih yang terbaik untuk dirimu! 🌸", sub: "Tidak ada kata salah saat pilih di D'Foria!" },
];

const GREETINGS = [
  { range: [0, 10], text: "Selamat Pagi! ☕" },
  { range: [10, 12], text: "Selamat Siang! 🌤️" },
  { range: [12, 15], text: "Sudah Lapar? 🍜" },
  { range: [15, 18], text: "Sore yang Enak! 🌅" },
  { range: [18, 21], text: "Waktunya Makan Malam! 🌙" },
  { range: [21, 24], text: "Malam Masih Panjang! 🌟" },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getPersonSeed(): number {
  const KEY = "dforia_person_seed";
  const stored = sessionStorage.getItem(KEY);
  if (stored) return parseInt(stored, 10);
  const seed = Math.floor(Math.random() * 100);
  sessionStorage.setItem(KEY, String(seed));
  return seed;
}

export function useDailyGreeting() {
  const hour = new Date().getHours();
  const greeting = GREETINGS.find(g => hour >= g.range[0] && hour < g.range[1])?.text ?? "Halo! 👋";

  const dayOfYear = getDayOfYear();
  const personSeed = getPersonSeed();
  const idx = (dayOfYear * 7 + personSeed * 13) % MESSAGES.length;
  const message = MESSAGES[idx];

  return { greeting, label: message.label, sub: message.sub };
}

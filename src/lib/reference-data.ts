/**
 * Data referensi katalog tanaman untuk pasar Indonesia.
 * Nutrient demand: "tinggi" (berat), "sedang", "rendah" (ringan)
 * Soil impact   : "berat" (menguras), "netral", "pembenah" (mengikat nitrogen)
 */

export type NutrientDemand = "tinggi" | "sedang" | "rendah";
export type SoilImpact = "berat" | "netral" | "pembenah";

export type FamilySeed = {
  name: string;
  localName: string;
  description: string;
  pestRisk: string;
};

export type CropSeed = {
  commonName: string;
  slug: string;
  family: string;
  nutrientDemand: NutrientDemand;
  soilImpact: SoilImpact;
  daysToHarvest: number;
  minPh: number;
  maxPh: number;
  emoji: string;
  description: string;
};

export const FAMILY_SEED: FamilySeed[] = [
  {
    name: "Solanaceae",
    localName: "Terung-terungan",
    description:
      "Tomat, cabai, terung, dan kentang. Borong nutrisi besar dan sangat rentan hama sama (lalat buah, pengorok daun, layu fusarium).",
    pestRisk: "Layu bakteri, fusarium, lalat buah, kutu daun",
  },
  {
    name: "Fabaceae",
    localName: "Polong-polongan",
    description:
      "Kacang-kacangan yang bersimbiosis dengan rhizobium sehingga menambah nitrogen tanah. Tanaman pembenah tanah terbaik untuk rotasi.",
    pestRisk: "Kutu daun, ulat polong, karat daun",
  },
  {
    name: "Brassicaceae",
    localName: "Kubis-kubisan",
    description:
      "Sawi, pakcoy, kubis, brokoli. Menuai nitrogen cepat dan punya musuh bersama: ulat krop (Plutella xylostella).",
    pestRisk: "Ulat krop, ulat grayak, penyakit akar gada",
  },
  {
    name: "Cucurbitaceae",
    localName: "Labu-labuan",
    description:
      "Timun, labu, semangka, melon. Daur ulang hara cepat, sensitif terhadap layu dan virus yang bertahan di tanah.",
    pestRisk: "Kutu daun, thrips, virus kuning, layu fusarium",
  },
  {
    name: "Asteraceae",
    localName: "Kenikir-kenikiran",
    description:
      "Selada dan tanaman berbunga daisy. Akar dangkal, butuh tanah gembur dan dingin.",
    pestRisk: "Kutu daun, busuk akar pada tanah tergenang",
  },
  {
    name: "Apiaceae",
    localName: "Apiri-apirian",
    description:
      "Wortel, seledri, peterseli. Umbi dan daun aromatik, tumbuh lambat, baik sebagai pemberat rotasi.",
    pestRisk: "Lalat wortel, busuk leher",
  },
  {
    name: "Amaryllidaceae",
    localName: "Bawang-bawangan",
    description:
      "Bawang merah, bawang putih, daun bawang. Antimikroba alami, membantu menekan patogen tanah.",
    pestRisk: "Ulat bawang, trip, busuk leher",
  },
  {
    name: "Poaceae",
    localName: "Rumput-rumputan",
    description:
      "Jagung, padi, serealia. Serat tinggi, menambah bahan organik, akar serabut merombak struktur tanah.",
    pestRisk: "Ulat grayak, wereng (untuk padi)",
  },
  {
    name: "Amaranthaceae",
    localName: "Bayam-bayaman",
    description:
      "Bayam, bit, kangkong china. Tumbuh cepat, penyerap kalsium dan nitrogen sedang.",
    pestRisk: "Kutu daun, cacing tanah perusak akar",
  },
  {
    name: "Convolvulaceae",
    localName: "Ubi-ubian",
    description:
      "Kangkung dan ubi jalar. Tumbuh agresif, penutup tanah alami yang menekan gulma.",
    pestRisk: "Ulat daun, pengorok daun",
  },
  {
    name: "Lamiaceae",
    localName: "Mija-mijaan / aromatik",
    description:
      "Kemangi, mint, oregano. Aromatik yang mengusir serangga, baik sebagai penjela antara musim.",
    pestRisk: "Sangat tahan hama, jamur saat terlalu lembap",
  },
  {
    name: "Malvaceae",
    localName: "Kapas-kapasan",
    description:
      "Okra/bendi dan jute. Kuat pada musim panas, serat kuat, akar dalam.",
    pestRisk: "Kutu putih, busuk buah",
  },
  {
    name: "Zingiberaceae",
    localName: "Embei-embeian",
    description:
      "Jahe, kunyit, lengkuas. Rimpang dalam, butuh tanah gembur, memecah tanah padat.",
    pestRisk: "Penggerek rimpang, busuk rimpang",
  },
  {
    name: "Euphorbiaceae",
    localName: "Singkong-singkongan",
    description:
      "Singkong dan tanaman susu. Sangat menguras kalium, harus diikuti tanaman pembenah.",
    pestRisk: "Kutu putih, virus daun keropeng",
  },
  {
    name: "Musaceae",
    localName: "Pisang-pisangan",
    description:
      "Pisang dan kerabatnya. Tanaman tahunan pemakan kalium besar.",
    pestRisk: "Penggerek batang, layu panama",
  },
];

export const CROP_SEED: CropSeed[] = [
  // Solanaceae
  { commonName: "Tomat", slug: "tomat", family: "Solanaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 75, minPh: 6.0, maxPh: 6.8, emoji: "🍅", description: "Butuh sinar matahari penuh dan penopang. Pemakan hara utama." },
  { commonName: "Cabai Merah", slug: "cabai-merah", family: "Solanaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 90, minPh: 5.8, maxPh: 6.8, emoji: "🌶️", description: "Sensitif genangan air; rentan antraknosa dan layu." },
  { commonName: "Terung Ungu", slug: "terung-ungu", family: "Solanaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 80, minPh: 5.8, maxPh: 6.8, emoji: "🍆", description: "Panen bertahap, suka tanah hangat kaya kompos." },
  { commonName: "Kentang", slug: "kentang", family: "Solanaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 100, minPh: 5.0, maxPh: 6.5, emoji: "🥔", description: "Cocok dataran tinggi, butuh gundukan tanah pada batang." },

  // Fabaceae
  { commonName: "Kacang Panjang", slug: "kacang-panjang", family: "Fabaceae", nutrientDemand: "rendah", soilImpact: "pembenah", daysToHarvest: 60, minPh: 5.5, maxPh: 7.0, emoji: "🫛", description: "Mengikat nitrogen lewat akar, ideal setelah tanaman berat." },
  { commonName: "Buncis", slug: "buncis", family: "Fabaceae", nutrientDemand: "rendah", soilImpact: "pembenah", daysToHarvest: 58, minPh: 5.8, maxPh: 7.0, emoji: "🫘", description: "Pembenah tanah cepat, cocok dataran tinggi." },
  { commonName: "Kacang Hijau", slug: "kacang-hijau", family: "Fabaceae", nutrientDemand: "rendah", soilImpact: "pembenah", daysToHarvest: 65, minPh: 5.5, maxPh: 7.5, emoji: "🌱", description: "Tanaman pendek umur, pembenah tanah musim hujan." },
  { commonName: "Kedelai", slug: "kedelai", family: "Fabaceae", nutrientDemand: "sedang", soilImpact: "pembenah", daysToHarvest: 90, minPh: 5.8, maxPh: 7.0, emoji: "🫛", description: "Sumber protein, menambah residu nitrogen tinggi." },
  { commonName: "Kacang Tanah", slug: "kacang-tanah", family: "Fabaceae", nutrientDemand: "rendah", soilImpact: "pembenah", daysToHarvest: 100, minPh: 5.5, maxPh: 6.8, emoji: "🥜", description: "Mengikat nitrogen dan melonggarkan tanah pasir." },

  // Brassicaceae
  { commonName: "Sawi Hijau", slug: "sawi-hijau", family: "Brassicaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 45, minPh: 6.0, maxPh: 7.2, emoji: "🥬", description: "Cepat panen, penutup tanah sementara yang baik." },
  { commonName: "Pakcoy", slug: "pakcoy", family: "Brassicaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 40, minPh: 6.0, maxPh: 7.0, emoji: "🥬", description: "Populer untuk hidroponik dan petak kecil." },
  { commonName: "Kubis / Kol", slug: "kubis-kol", family: "Brassicaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 95, minPh: 6.0, maxPh: 7.0, emoji: "🥬", description: "Memakan nitrogen besar, rawan ulat krop." },
  { commonName: "Brokoli", slug: "brokoli", family: "Brassicaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 90, minPh: 6.0, maxPh: 7.0, emoji: "🥦", description: "Butuh pupuk nitrogen dan suhu sejuk." },
  { commonName: "Kembang Kol", slug: "kembang-kol", family: "Brassicaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 95, minPh: 6.0, maxPh: 7.0, emoji: "🥦", description: "Butuh pendinginan ringan, tanah gembur subur." },

  // Cucurbitaceae
  { commonName: "Timun", slug: "timun", family: "Cucurbitaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 55, minPh: 5.8, maxPh: 7.0, emoji: "🥒", description: "Air rutin, panen tiap 2 hari pada musim produktif." },
  { commonName: "Labu Siam", slug: "labu-siam", family: "Cucurbitaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 120, minPh: 5.5, maxPh: 7.0, emoji: "🍈", description: "Tanaman pagar produktif, satu tanaman bisa melimpah." },
  { commonName: "Semangka", slug: "semangka", family: "Cucurbitaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 85, minPh: 6.0, maxPh: 7.0, emoji: "🍉", description: "Butuh ruang lebar dan drainase sangat baik." },
  { commonName: "Labu Kuning", slug: "labu-kuning", family: "Cucurbitaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 100, minPh: 5.8, maxPh: 7.0, emoji: "🎃", description: "Tahan kering, penutup tanah luas." },
  { commonName: "Melon", slug: "melon", family: "Cucurbitaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 80, minPh: 6.0, maxPh: 7.0, emoji: "🍈", description: "Perlu kalium tinggi untuk kemanisan buah." },

  // Asteraceae
  { commonName: "Selada Hijau", slug: "selada-hijau", family: "Asteraceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 40, minPh: 6.0, maxPh: 7.0, emoji: "🥗", description: "Akar dangkal, butuh kelembapan konstan." },
  { commonName: "Selada Merah", slug: "selada-merah", family: "Asteraceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 45, minPh: 6.0, maxPh: 7.0, emoji: "🥗", description: "Varietas premium bernilai jual tinggi." },

  // Apiaceae
  { commonName: "Wortel", slug: "wortel", family: "Apiaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 90, minPh: 6.0, maxPh: 7.0, emoji: "🥕", description: "Butuh tanah gembur bebas batu agar umbi lurus." },
  { commonName: "Seledri", slug: "seledri", family: "Apiaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 85, minPh: 6.0, maxPh: 7.0, emoji: "🌿", description: "Panen berkala, butuh kelembapan tinggi." },
  { commonName: "Peterseli", slug: "peterseli", family: "Apiaceae", nutrientDemand: "rendah", soilImpact: "netral", daysToHarvest: 70, minPh: 6.0, maxPh: 7.2, emoji: "🌿", description: "Herbs nilai jual tinggi untuk hotel dan restoran." },

  // Amaryllidaceae
  { commonName: "Bawang Merah", slug: "bawang-merah", family: "Amaryllidaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 70, minPh: 5.8, maxPh: 7.0, emoji: "🧅", description: "Membantu menekan patogen tanah, musim kering." },
  { commonName: "Bawang Putih", slug: "bawang-putih", family: "Amaryllidaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 110, minPh: 5.8, maxPh: 7.0, emoji: "🧄", description: "Cocok dataran tinggi, panen saat daun menguning." },
  { commonName: "Daun Bawang", slug: "daun-bawang", family: "Amaryllidaceae", nutrientDemand: "rendah", soilImpact: "netral", daysToHarvest: 60, minPh: 6.0, maxPh: 7.2, emoji: "🧅", description: "Panen berkala, pembanding yang bagus di pinggir petak." },

  // Poaceae
  { commonName: "Jagung Manis", slug: "jagung-manis", family: "Poaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 80, minPh: 5.8, maxPh: 7.0, emoji: "🌽", description: "Serat akarnya menambah bahan organik tanah." },
  { commonName: "Jagung Pakan", slug: "jagung-pakan", family: "Poaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 100, minPh: 5.5, maxPh: 7.2, emoji: "🌽", description: "Tahan kering, sumber hijauan pakan ternak." },
  { commonName: "Padi Sawah", slug: "padi-sawah", family: "Poaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 120, minPh: 5.5, maxPh: 6.8, emoji: "🌾", description: "Untuk petak basah; waspadai wereng batang cokelat." },

  // Amaranthaceae
  { commonName: "Bayam Hijau", slug: "bayam-hijau", family: "Amaranthaceae", nutrientDemand: "rendah", soilImpact: "netral", daysToHarvest: 25, minPh: 6.0, maxPh: 7.5, emoji: "🍃", description: "Sangat cepat panen, cocok sebagai tanaman pengisi." },
  { commonName: "Bit Merah", slug: "bit-merah", family: "Amaranthaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 60, minPh: 6.0, maxPh: 7.2, emoji: "🫒", description: "Umbi bernilai jual tinggi, butuh fosfor cukup." },

  // Convolvulaceae
  { commonName: "Kangkung Darat", slug: "kangkung-darat", family: "Convolvulaceae", nutrientDemand: "rendah", soilImpact: "netral", daysToHarvest: 30, minPh: 5.5, maxPh: 7.5, emoji: "🌿", description: "Paling mudah dibudidayakan, panen berulang." },
  { commonName: "Ubi Jalar", slug: "ubi-jalar", family: "Convolvulaceae", nutrientDemand: "rendah", soilImpact: "netral", daysToHarvest: 110, minPh: 5.2, maxPh: 6.8, emoji: "🍠", description: "Penutup tanah alami, menekan gulma dan erosi." },

  // Lamiaceae
  { commonName: "Kemangi", slug: "kemangi", family: "Lamiaceae", nutrientDemand: "rendah", soilImpact: "netral", daysToHarvest: 35, minPh: 5.5, maxPh: 7.0, emoji: "🌿", description: "Aromatik pengusir serangga, panen daun berkala." },
  { commonName: "Mint", slug: "mint", family: "Lamiaceae", nutrientDemand: "rendah", soilImpact: "netral", daysToHarvest: 45, minPh: 6.0, maxPh: 7.2, emoji: "🌿", description: "Cepat menyebar; batasi arealnya dengan batas petak." },

  // Malvaceae
  { commonName: "Okra / Bendi", slug: "okra-bendi", family: "Malvaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 60, minPh: 5.8, maxPh: 7.2, emoji: "🫑", description: "Tahan panas, panen harian saat musimnya." },

  // Zingiberaceae
  { commonName: "Jahe Emprit", slug: "jahe-emprit", family: "Zingiberaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 240, minPh: 5.5, maxPh: 6.8, emoji: "🫚", description: "Rimpang bernilai tinggi, panen panjang." },
  { commonName: "Kunyit", slug: "kunyit", family: "Zingiberaceae", nutrientDemand: "sedang", soilImpact: "netral", daysToHarvest: 270, minPh: 5.5, maxPh: 7.0, emoji: "🫚", description: "Membantu memecah tanah padat dengan rimpangnya." },

  // Euphorbiaceae
  { commonName: "Singkong", slug: "singkong", family: "Euphorbiaceae", nutrientDemand: "sedang", soilImpact: "berat", daysToHarvest: 300, minPh: 4.8, maxPh: 7.0, emoji: "🥔", description: "Sangat menguras kalium; wajib diikuti tanaman pembenah." },

  // Musaceae
  { commonName: "Pisang Cavendish", slug: "pisang-cavendish", family: "Musaceae", nutrientDemand: "tinggi", soilImpact: "berat", daysToHarvest: 365, minPh: 5.8, maxPh: 7.0, emoji: "🍌", description: "Tanaman tahunan pemakan kalium besar." },
];

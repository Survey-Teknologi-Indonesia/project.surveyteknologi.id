export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  clientType: "Government" | "Private" | "BUMN";
  areaHa: number;
  location: string;
  coordinates: string;
  status: "Completed" | "In Progress" | "Planning";
  progressPercentage: number;
  startDate: string;
  targetEndDate: string;
  budget: string;
  sensorType: string;
  resolution: string;
  description: string;
  leadSurveyor: string;
  deliverables: {
    name: string;
    type: string;
    size: string;
    status: "Ready" | "Processing" | "Pending";
  }[];
  milestones: {
    title: string;
    date: string;
    completed: boolean;
  }[];
}

export const initialProjects: Project[] = [
  {
    id: "PRJ-001",
    code: "STI-IKN-2026",
    name: "Pemetaan Topografi & LiDAR Kawasan Inti IKN",
    client: "Otorita Ibu Kota Nusantara",
    clientType: "Government",
    areaHa: 6500,
    location: "Kec. Sepaku, Kab. Penajam Paser Utara, Kalimantan Timur",
    coordinates: "0°58'24.6\"S 116°41'32.1\"E",
    status: "In Progress",
    progressPercentage: 68,
    startDate: "12 Jan 2026",
    targetEndDate: "30 Apr 2026",
    budget: "Rp 1.450.000.000",
    sensorType: "LiDAR Airborne + Multispectral Satellite",
    resolution: "GSD 5 cm (LiDAR) / 30 cm (Satelit)",
    description:
      "Pengambilan data elevasi tinggi presisi (DEM/DTM) dan ortofoto resolusi sangat tinggi untuk perencanaan tata ruang zona KIPP 1A dan sistem drainase perkotaan ramah lingkungan.",
    leadSurveyor: "Ir. Hendra Pratama, S.T., M.Eng.",
    deliverables: [
      { name: "Digital Elevation Model (DEM) High-Res", type: "GeoTIFF (32-bit)", size: "4.2 GB", status: "Ready" },
      { name: "Raw Point Cloud Classified", type: "LAS / LAZ", size: "18.6 GB", status: "Ready" },
      { name: "Orthomosaic Color-Balanced Tile Grid", type: "ECW / GeoTIFF", size: "9.8 GB", status: "Processing" },
      { name: "Laporan Validasi GCP & Kontur 0.5m", type: "PDF / DWG", size: "120 MB", status: "Pending" },
    ],
    milestones: [
      { title: "Akuisisi Data Drone LiDAR Tahap 1", date: "18 Jan 2026", completed: true },
      { title: "Pemasangan dan Pengukuran BM & GCP Geodetik", date: "28 Jan 2026", completed: true },
      { title: "Pengolahan Point Cloud & Ekstraksi DTM", date: "15 Feb 2026", completed: true },
      { title: "Quality Control & Uji Ketelitian Horisontal/Vertikal", date: "10 Mar 2026", completed: false },
      { title: "Serah Terima Laporan Akhir & Peta Garis", date: "30 Apr 2026", completed: false },
    ],
  },
  {
    id: "PRJ-002",
    code: "STI-SWT-2026",
    name: "Survey Fotogrametri Perkebunan Kelapa Sawit Blok A-D",
    client: "PT Astra Agro Lestari Tbk",
    clientType: "Private",
    areaHa: 12400,
    location: "Kab. Rokan Hulu, Riau",
    coordinates: "0°52'11.0\"N 100°31'45.2\"E",
    status: "Completed",
    progressPercentage: 100,
    startDate: "05 Feb 2026",
    targetEndDate: "25 Feb 2026",
    budget: "Rp 850.000.000",
    sensorType: "Fixed-Wing UAV RGB High-Res",
    resolution: "GSD 7 cm",
    description:
      "Perhitungan sensus pokok sawit (tree counting AI), deteksi pohon abnormal, pemetaan batas blok kebun, serta analisis indeks vegetasi (NDVI) untuk efisiensi pemupukan.",
    leadSurveyor: "Bambang Kurniawan, S.Si.",
    deliverables: [
      { name: "Peta Sensus & Titik Pohon Sawit (AI Vector)", type: "Shapefile (.shp)", size: "450 MB", status: "Ready" },
      { name: "Ortofoto Mosaik Seluruh Blok A-D", type: "GeoTIFF", size: "14.5 GB", status: "Ready" },
      { name: "Peta Indeks Kesehatan Tanaman NDVI", type: "GeoTIFF & PDF", size: "2.1 GB", status: "Ready" },
      { name: "Laporan Analisis Kesehatan Tanaman", type: "PDF", size: "85 MB", status: "Ready" },
    ],
    milestones: [
      { title: "Penerbangan UAV Misi Pagi (Blok A & B)", date: "08 Feb 2026", completed: true },
      { title: "Penerbangan UAV Misi Siang (Blok C & D)", date: "12 Feb 2026", completed: true },
      { title: "AI Tree Counting & Canopy Analysis", date: "19 Feb 2026", completed: true },
      { title: "Final Deliverables & Presentasi Manajemen Kebun", date: "25 Feb 2026", completed: true },
    ],
  },
  {
    id: "PRJ-003",
    code: "STI-MNG-2026",
    name: "Monitoring & Pemetaan Batas Konsesi Tambang Nikel",
    client: "PT Vale Indonesia Tbk",
    clientType: "Private",
    areaHa: 4800,
    location: "Sorowako, Luwu Timur, Sulawesi Selatan",
    coordinates: "2°32'40.5\"S 121°21'18.8\"E",
    status: "In Progress",
    progressPercentage: 45,
    startDate: "20 Feb 2026",
    targetEndDate: "20 Apr 2026",
    budget: "Rp 920.000.000",
    sensorType: "Optical Satellite Stereo 30cm & Multi-Rotor UAV",
    resolution: "GSD 30 cm (Satelit) & 3 cm (Area Pit)",
    description:
      "Monitoring berkala pergerakan lereng tambang (slope stability), perhitungan volume cut and fill over burden (OB), serta verifikasi kepatuhan batas pinjam pakai kawasan hutan (IPPKH).",
    leadSurveyor: "Dimas Aditya, S.T.",
    deliverables: [
      { name: "Model 3D Mesh Pit Tambang & Lereng", type: "OBJ / FBX / 3D PDF", size: "6.8 GB", status: "Processing" },
      { name: "Kalkulasi Volume Disposal & Stockpile", type: "Excel & DXF", size: "60 MB", status: "Ready" },
      { name: "Peta Overlay Batas Konsesi vs Realisasi Bukaan", type: "GeoPackage / SHP", size: "180 MB", status: "Processing" },
    ],
    milestones: [
      { title: "Akuisisi Citra Satelit Stereo Resolusi 30cm", date: "22 Feb 2026", completed: true },
      { title: "Drone Survey Area Pit Aktif & Stockpile", date: "28 Feb 2026", completed: true },
      { title: "Kalkulasi Volume & Slope Monitoring", date: "15 Mar 2026", completed: false },
      { title: "Laporan Triwulan KTT & Minerba", date: "20 Apr 2026", completed: false },
    ],
  },
  {
    id: "PRJ-004",
    code: "STI-KHT-2026",
    name: "Audit Tutupan Lahan & Analisis Deforestasi Kawasan Hutan",
    client: "Kementerian Lingkungan Hidup dan Kehutanan",
    clientType: "Government",
    areaHa: 28500,
    location: "Taman Nasional Sebangau, Kalimantan Tengah",
    coordinates: "2°45'15.3\"S 113°52'40.9\"E",
    status: "Completed",
    progressPercentage: 100,
    startDate: "10 Jan 2026",
    targetEndDate: "15 Feb 2026",
    budget: "Rp 2.100.000.000",
    sensorType: "SAR Radar Sentinel-1 + PlanetScope Optical Super-Resolution",
    resolution: "GSD 3 meter Multi-Temporal",
    description:
      "Analisis deret waktu (time-series) tutupan hutan primer/sekunder, pemetaan jejak kanal gambut liar, dan identifikasi potensi kebakaran lahan gambut berbasis remote sensing radar.",
    leadSurveyor: "Dr. Rian Nugroho, M.Sc.",
    deliverables: [
      { name: "Peta Klasifikasi Tutupan Lahan Hutan & Gambut", type: "GeoTIFF & GeoJSON", size: "3.4 GB", status: "Ready" },
      { name: "Peta Analisis Perubahan Tutupan Lahan (2020-2026)", type: "Shapefile (.shp)", size: "850 MB", status: "Ready" },
      { name: "Atlas Digital Zonasi Kerentanan Karhutla", type: "Interactive WebGIS", size: "Cloud Hosted", status: "Ready" },
      { name: "Dokumen Laporan Ilmiah & Rekomendasi Kebijakan", type: "PDF", size: "140 MB", status: "Ready" },
    ],
    milestones: [
      { title: "Download & Pra-pengolahan Data Radar & Optik 5 Tahun", date: "15 Jan 2026", completed: true },
      { title: "Ground Check Verifikasi Lapangan (30 Titik Sampel)", date: "25 Jan 2026", completed: true },
      { title: "Klasifikasi Supervised Random Forest Machine Learning", date: "05 Feb 2026", completed: true },
      { title: "Penyusunan Laporan & Diseminasi Stakeholder", date: "15 Feb 2026", completed: true },
    ],
  },
  {
    id: "PRJ-005",
    code: "STI-PLN-2026",
    name: "Survey Jalur Transmisi SUTET 500kV Trans-Sumatera",
    client: "PT PLN (Persero)",
    clientType: "BUMN",
    areaHa: 3200,
    location: "Lahat ke Betung, Sumatera Selatan",
    coordinates: "3°47'22.1\"S 103°32'15.4\"E",
    status: "Planning",
    progressPercentage: 15,
    startDate: "01 Mar 2026",
    targetEndDate: "31 Mei 2026",
    budget: "Rp 1.150.000.000",
    sensorType: "LiDAR Corridor Mapping UAV",
    resolution: "GSD 3 cm + 120 pts/m² LiDAR",
    description:
      "Pemetaan koridor jalur transmisi tegangan ekstra tinggi sepanjang 140 km untuk identifikasi Right of Way (ROW), deteksi pohon berbahaya mendekati konduktor, dan penempatan tower.",
    leadSurveyor: "Agus Setyawan, S.T.",
    deliverables: [
      { name: "Model Koridor 3D Tower & Saluran Konduktor", type: "PLS-CADD (.bak / .xyz)", size: "8.5 GB", status: "Pending" },
      { name: "Peta Bahaya Pohon Tumbang (Danger Tree Analysis)", type: "GeoPDF & SHP", size: "1.2 GB", status: "Pending" },
      { name: "Profil Penampang Melintang & Memanjang Jalur", type: "AutoCAD .DWG", size: "750 MB", status: "Pending" },
    ],
    milestones: [
      { title: "Izin Terbang & Koordinasi Keselamatan Jalur", date: "02 Mar 2026", completed: true },
      { title: "Penerbangan Corridor UAV Sesi 1", date: "15 Mar 2026", completed: false },
      { title: "Ekstraksi Clearance Analysis Konduktor", date: "10 Apr 2026", completed: false },
      { title: "Final Deliverables ke Divisi Transmisi PLN", date: "31 Mei 2026", completed: false },
    ],
  },
  {
    id: "PRJ-006",
    code: "STI-AGR-2026",
    name: "Pemetaan Multispektral Kesuburan Tanah Lahan Tebu",
    client: "PT Perkebunan Nusantara III (Holding)",
    clientType: "BUMN",
    areaHa: 8900,
    location: "Kediri & Lumajang, Jawa Timur",
    coordinates: "7°50'12.0\"S 112°01'30.4\"E",
    status: "In Progress",
    progressPercentage: 55,
    startDate: "18 Feb 2026",
    targetEndDate: "30 Mar 2026",
    budget: "Rp 680.000.000",
    sensorType: "Drone Multispectral 5-Bands (RedEdge/NDRE/NDVI)",
    resolution: "GSD 8 cm",
    description:
      "Monitoring estimasi rendemen gula tebu, deteksi dini defisiensi nitrogen & klorofil tanaman, serta pemetaan saluran irigasi mikro pada perkebunan tebu rakyat binaan PTPN.",
    leadSurveyor: "Wahyu Hidayat, S.P., M.Sc.",
    deliverables: [
      { name: "Peta Indeks NDRE & Klorofil Kanopi Tebu", type: "GeoTIFF 32-bit Float", size: "3.8 GB", status: "Ready" },
      { name: "Peta Rekomendasi Pemupukan Presisi Variabel", type: "Vigor Shapefile (.shp)", size: "220 MB", status: "Processing" },
      { name: "Dashboard GIS Interaktif Manajemen Kebun", type: "Cloud WebApp", size: "Live Data", status: "Ready" },
    ],
    milestones: [
      { title: "Akuisisi 5-Band Sensor Fase Tunas", date: "21 Feb 2026", completed: true },
      { title: "Kalibrasi Panel Radiometrik Lapangan", date: "24 Feb 2026", completed: true },
      { title: "Korelasi Uji Lab Daun & Spektral Nilai", date: "08 Mar 2026", completed: false },
      { title: "Serah Terima Rekomendasi Pemupukan", date: "30 Mar 2026", completed: false },
    ],
  },
  {
    id: "PRJ-007",
    code: "STI-MAR-2026",
    name: "Batimetri & Pemetaan Garis Pantai Pengembangan Pelabuhan",
    client: "PT Pelabuhan Indonesia (Pelindo)",
    clientType: "BUMN",
    areaHa: 1750,
    location: "Kawasan Pelabuhan Bitung, Sulawesi Utara",
    coordinates: "1°26'35.2\"N 125°11'20.0\"E",
    status: "Completed",
    progressPercentage: 100,
    startDate: "15 Jan 2026",
    targetEndDate: "18 Feb 2026",
    budget: "Rp 790.000.000",
    sensorType: "Single-beam Echosounder + RTK Drone Photogrammetry",
    resolution: "GSD 2 cm (Darat) & Grid Kedalaman 1m (Laut)",
    description:
      "Survey hidrografi dan batimetri alur pelayaran kapal kargo, perhitungan sedimentasi kolam pelabuhan, serta ortofoto dermaga untuk perluasan terminal peti kemas internasional.",
    leadSurveyor: "Kapten Laut (Purn) Fajar Santoso, S.T.",
    deliverables: [
      { name: "Peta Batimetri Kontur Kedalaman (Chart Datum)", type: "GeoTIFF & DWG", size: "1.9 GB", status: "Ready" },
      { name: "Model 3D Bathymetric Mesh Alur Pelayaran", type: "3D Geotiff & XYZ", size: "4.5 GB", status: "Ready" },
      { name: "Laporan Analisis Laju Sedimentasi Kolam", type: "PDF & Raw Sounding Log", size: "310 MB", status: "Ready" },
    ],
    milestones: [
      { title: "Pemasangan Pasang Surut Air Laut (Tidal Gauge)", date: "16 Jan 2026", completed: true },
      { title: "Pemeruman Batimetri Echosounder Sisi Laut", date: "25 Jan 2026", completed: true },
      { title: "Drone Topografi Pasang Surut Pesisir", date: "02 Feb 2026", completed: true },
      { title: "Penyusunan Peta Laut & Sertifikasi Surveyor", date: "18 Feb 2026", completed: true },
    ],
  },
];

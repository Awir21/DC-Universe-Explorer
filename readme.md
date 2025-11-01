# ⚡ DC Universe Explorer 🌌

Sebuah aplikasi eksplorasi yang dirancang untuk menganalisis dan membandingkan statistik kekuatan pahlawan dan penjahat dari DC Universe. Proyek ini dibangun sebagai demonstrasi **frontend development** murni dengan fokus pada **optimasi performa *client-side*** dan **User Experience (UX)**.

---

## ✨ Fitur Utama

Aplikasi ini dilengkapi dengan fitur-fitur yang meningkatkan interaktivitas dan manajemen data:

* **Perbandingan Pahlawan Dinamis:** Pengguna dapat memilih hingga 3 hero untuk membandingkan statistik kekuatan mereka secara *side-by-side* dalam modal khusus (`compare-modal`).
* **Persistent State:** Menggunakan `localStorage` untuk menyimpan preferensi pengguna (Tema Terang/Gelap), daftar Pahlawan Favorit, dan Riwayat Perbandingan.
* **Filter & Pencarian Lanjut:** Pencarian berbasis nama dan alias, dilengkapi dengan filter berdasarkan statistik kekuatan (terkuat/terlemah), *alignment* (Baik/Jahat), dan kategori tim (misalnya: Justice League, Batman Family).
* **Tema Interaktif:** Fitur *Theme Toggle* dengan animasi yang mulus. Seluruh skema warna dikelola menggunakan **CSS Custom Properties** untuk implementasi tema yang efisien.
* **Statistik Global:** Menghitung dan menampilkan ringkasan statistik database secara *real-time* (misalnya, total hero, hero terkuat secara rata-rata, dll.).
* **UX Enhancements:** Tombol musik latar, layar pemuatan interaktif, dan tombol *Scroll to Top*.

---

## 🛠️ Tumpukan Teknologi

| Area | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Struktur** | HTML5 (Semantik) | Struktur dasar dan penandaan untuk aksesibilitas (`aria-label`, `role`). |
| **Gaya** | CSS3 Murni | Implementasi *styling*, responsivitas (`@media queries`), dan animasi. |
| **Logic** | JavaScript ES6+ Murni | Semua logika, manipulasi DOM, *state management*, dan *event handling*. |
| **Data** | JSON API (Simulasi) | Menggunakan data hero dalam format JSON. |

---

## 💡 Highlight Teknis (Untuk Peninjau Teknis)

Bagian ini menyoroti praktik dan optimasi kode yang diterapkan untuk menjaga performa dan *maintainability*:

1.  **Event Debouncing:** Diterapkan pada `searchInput` untuk membatasi frekuensi pemanggilan fungsi `filterHeroes()`. Ini mencegah *thread* utama JavaScript terblokir (*jank*) dan meningkatkan responsivitas aplikasi saat pengguna mengetik.
2.  **Manajemen DOM yang Efisien:** Menggunakan **DOM Caching** (`const element = ...`) untuk menyimpan referensi elemen DOM dan menerapkan **Event Delegation** pada `heroContainer`. Hal ini secara signifikan mengurangi jumlah *event listener* dan overhead memori.
3.  **Skalabilitas Styling:** Seluruh Tema Terang dan Gelap dikelola menggunakan **CSS Custom Properties** (`:root` dan `[data-theme="light"]`). Ini memungkinkan perubahan tema yang cepat, bersih, dan konsisten di seluruh aplikasi.
4.  **Modularitas Kode JavaScript:** Logika kode dibagi secara jelas menjadi fungsi-fungsi spesifik (`renderHeroes`, `toggleFavorite`, `showCompareModal`), membuat `dev.js` lebih mudah dibaca, diuji, dan dipelihara.
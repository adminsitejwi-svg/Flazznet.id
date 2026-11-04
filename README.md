# Flazznet.id

Landing page statis dengan HTML, CSS, JavaScript, dan Tailwind CSS. Tampilan berasal dari template MediCloud.

## Menjalankan

Buka `index.html` di browser. Tidak perlu server atau build.

## Mengubah tampilan

File `assets/css/style.css` adalah hasil build Tailwind. Jangan diedit langsung, dan build ulang setiap kali class di `index.html` atau isi `assets/css/input.css` berubah. Node.js hanya dibutuhkan untuk langkah ini.

```bash
npm install
npm run dev     # build otomatis setiap ada perubahan
npm run build   # build sekali, hasil diperkecil
```

## Struktur

```
index.html              Halaman
assets/css/input.css    Sumber CSS: warna, ukuran teks, komponen
assets/css/style.css    Hasil build, file yang dipakai halaman
assets/js/main.js       Animasi, menu mobile, navbar aktif, FAQ
assets/images/          Gambar, logo, dan favicon
```

## Lisensi

Desain dan kode template: Copyright © [Codescandy](https://codescandy.com), lisensi MIT. Didistribusikan oleh [ThemeWagon](https://themewagon.com).

# 121 Notebook

Buku catatan 121 pribadi: siapa yang pernah 121, isi bisnisnya, dan progress hubungan, bisa dicari kapan saja.

Versi lama (BNI Referral Engine) diarsipkan di branch `archive/v1-bni-referral-engine`. Hanya backup, jangan dipakai.

## Isi
- `index.html`: seluruh aplikasi (tanpa build). Buka langsung atau host di GitHub Pages.
- `apps-script/Code.gs`: backend Google Sheet + Google Calendar (opsional, tapi disarankan).

## 4 halaman
1. **Dashboard**: target 4 121 per minggu, tren 8 minggu, strip konsistensi 26 minggu (rata-rata, persen minggu kena target, streak terpanjang), grafik referral dapat vs beri vs income per bulan, corong referral diterima → diproses → jadi, klasifikasi terbanyak, daftar "perlu tindak lanjut", pencarian (nama, bisnis, trigger words, isi catatan).
2. **Catat**: form 121. Nama yang sudah ada otomatis mengisi data lama dan menampilkan next step sebelumnya.
3. **Jadwal**: rencana 121, agenda terisi dari next step terakhir, masuk Google Calendar.
4. **Orang**: semua orang, filter per klasifikasi.

**Log referral**: tiap referral dicatat dengan arah (dapat atau beri), tanggal, status (dibahas, diproses, jadi, batal), dan nilai Rp satu kali saat jadi. Income dihitung dari referral yang diterima dan berstatus jadi. Tersimpan di tab `Referrals` pada Sheet.

Satu orang = satu profil yang terus diperbarui dari semua catatan 121-nya. Kedalaman hubungan: Kenal, Paham, Referral. Tandai juga siapa yang pernah kasih referral bagus ke Anda (⬇) dan siapa yang pernah Anda kasih referral (⬆). Nomor WhatsApp tersimpan di profil; tombol WhatsApp membuka chat dengan pesan siap kirim (pengingat jadwal, follow-up next step, atau sapaan). Pesan dikirim manual oleh Anda, bukan otomatis.

## Pasang Google Sheet + Calendar (sekali, sekitar 5 menit)
1. Buat Google Sheet kosong. Menu **Extensions > Apps Script**.
2. Tempel isi `apps-script/Code.gs`. Ganti `TOKEN` dengan kata sandi bebas.
3. **Project Settings**: set time zone ke `Asia/Jakarta`.
4. Pilih fungsi `setup`, klik **Run**, setujui izin Sheet dan Calendar.
5. **Deploy > New deployment > Web app**. Execute as: **Me**. Who has access: **Anyone**. Salin URL `/exec`.
6. Di app, tap indikator status kanan atas, isi URL dan kata sandi, **Simpan & tes koneksi**.

Data lokal yang sudah ada otomatis terkirim. Tanpa langkah ini app tetap jalan, datanya hanya di browser (ada tombol Unduh/Impor JSON), dan jadwal bisa ditambah ke Calendar lewat tombol link.

Jika kode Apps Script diubah (misalnya menambah tab `Referrals`), tempel ulang `Code.gs`, simpan, lalu buat **New version** di Manage deployments. Tab baru dibuat otomatis.  buat **New version** di Manage deployments agar URL yang sama memakai kode baru.

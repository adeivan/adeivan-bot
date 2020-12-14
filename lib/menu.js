const fs = require('fs-extra')
const { 
    prefix
} = JSON.parse(fs.readFileSync('./settings/setting.json'))

/*

Dimohon untuk tidak menghapus link github saya, butuh support dari kalian! makasih.

*/
exports.textHistory = () => {
    return `
🛸 *Releases*

*Version: r1.4*
-Provides a slide menu function
released this on Dec 13, 2020

*Version: r1.2*
-Menu/Notes Update
-Add Donasi Menu
-Add About
released this on Dec 13, 2020

*Version: r1.1*
-Add Kalender Akademik
-Add Menu
released this on Dec 11, 2020

*Version: r1.0 (First Release)*
-Create adeivan-bot
released this on Dec 10, 2020
`
}

exports.textSlide = () => {
    return `Untuk mengambil Slide silahkan ketik pesan dengan : #slide [Kode+Ke]

🔖 Contoh = #slide *pik14*

Kode Matkul
- *cct* = Creative Thingking
- *mm* = Multimedia
- *pik* = Pengatar Ilmu Komunikasi
- *bi* = Bahasa Indonesia
- *bid* = Bahasa Inggris Dasar`
}
exports.textSlideSalah = () => {
    return `Format salah 😒, silahkan ketik pesan dengan : #slide [Kode+Ke]

🔖 Contoh = #slide *pik14*

Kode Matkul
- *cct* = Creative Thingking
- *mm* = Multimedia
- *pik* = Pengatar Ilmu Komunikasi
- *bi* = Bahasa Indonesia
- *bid* = Bahasa Inggris Dasar`
}

exports.textAbout = () => {
    return `
🛸 *Connection Info*
Bot Name : adeivan-bot
Bot Version: 1.0.0
Server: Vultr 1028 GB RAM
Base: Linux

User name: @adeivan
My number: 6285157720488
Platform: Linux

Source : https://docs.openwa.dev/
Special Thanks : https://github.com/ArugaZ

Best regards, Ade Ivan💖`
}

exports.textMenu = (pushname) => {
    return `
Hai, ${pushname}! 👋️
Berikut adalah beberapa note yang ada pada bot ini!✨

- *${prefix}jadwal*
- *${prefix}tugas*
- *${prefix}slide*
- *${prefix}kalender*

- *${prefix}anggota*
- *${prefix}kelompok*
- *${prefix}mentionall*

- *${prefix}motivasi*
- *${prefix}pantun*
- *${prefix}fakta*

- *${prefix}about*
- *${prefix}donasi*

- *${prefix}admin* 🐞

Hope you have a great day!✨`
}

exports.textAdmin = () => {
    return `
⚠ [ *Admin Group Only* ] ⚠ 
Berikut adalah fitur admin grup yang ada pada bot ini!

- *${prefix}add*
- *${prefix}kick* @tag
- *${prefix}promote* @tag
- *${prefix}demote* @tag
- *${prefix}mutegrup*
- *${prefix}tag all*
- *${prefix}setprofile*
- *${prefix}del*

⚠ [ *Owner Group Only* ] ⚠

- *${prefix}kickall*
*Owner Group adalah pembuat grup.*
`
}


exports.textDonasi = () => {
    return `
Untuk mendukung BOT ini kamu bisa berdonasi dengan cara:

💰 *DANA/OVO* : 085157720488
💳 *BTPN* : 90320067294

Donasi akan digunakan untuk pengembangan dan pengoperasian bot ini.

Terimakasih, Ade Ivan🙏`
}

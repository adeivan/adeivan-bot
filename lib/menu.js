const fs = require('fs-extra')
const { 
    prefix
} = JSON.parse(fs.readFileSync('./settings/setting.json'))

exports.textSlide = () => {
    return `Untuk mengambil Slide silahkan ketik pesan dengan :

💡 *#slide pik14*

Kode Matkul
- *cct* = Creative Thingking
- *mm* = Multimedia
- *pik* = Pengatar Ilmu Komunikasi
- *bi* = Bahasa Indonesia
- *bid* = Bahasa Inggris Dasar`
}
exports.textSlideSalah = () => {
    return `Format salah 😒, silahkan ketik pesan dengan :

💡 *#slide pik14*

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
Server: 8028 GB RAM
Base: Windows 10 Pro

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
Berikut adalah beberapa note yang ada pada assistant ini!✨

- *${prefix}tugas*
- *${prefix}slide*
- *${prefix}agenda*

- *${prefix}anggota*
- *${prefix}mention-all*

- *${prefix}simisimi* \`\`\`[TRIAL🐤]\`\`\`
- *${prefix}katabijak*
- *${prefix}pantun*
- *${prefix}fakta*

- *${prefix}about*

Jangan lupa gunakan # untuk mengambil notes!✨`
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
- *${prefix}setprofile*
- *${prefix}del*

⚠ [ *Owner Group Only* ] ⚠

- *${prefix}kickall*
*Owner Group adalah pembuat grup.*
`
}


exports.textDonasi = () => {
    return `Ade Ivan🙏`
}

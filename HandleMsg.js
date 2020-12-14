require('dotenv').config()
const { decryptMedia } = require('@open-wa/wa-automate')

const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const axios = require('axios')
const fetch = require('node-fetch')

const appRoot = require('app-root-path')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const db_group = new FileSync(appRoot+'/lib/data/group.json')
const db = low(db_group)
db.defaults({ group: []}).write()

const {
    exec
} = require('child_process')

const { 
    menuId, 
    translate, 
    rugaapi
} = require('./lib')

const { 
    msgFilter, 
    color, 
    processTime, 
    isUrl,
} = require('./utils')


const fs = require('fs-extra')
const banned = JSON.parse(fs.readFileSync('./settings/banned.json'))
const setting = JSON.parse(fs.readFileSync('./settings/setting.json'))

let { 
    ownerNumber, 
    groupLimit, 
    memberLimit,
    prefix
} = setting

const {
} = JSON.parse(fs.readFileSync('./settings/api.json'))

function formatin(duit){
    let	reverse = duit.toString().split('').reverse().join('');
    let ribuan = reverse.match(/\d{1,3}/g);
    ribuan = ribuan.join('.').split('').reverse().join('');
    return ribuan;
}

const inArray = (needle, haystack) => {
    let length = haystack.length;
    for(let i = 0; i < length; i++) {
        if(haystack[i].id == needle) return i;
    }
    return false;
}

module.exports = HandleMsg = async (adeivan, message) => {
    try {
        const { type, id, from, t, sender, author, isGroupMsg, chat, chatId, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        var { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await adeivan.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await adeivan.getGroupAdmins(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
		const chats = (type === 'chat') ? body : (type === 'image' || type === 'video') ? caption : ''
		const pengirim = sender.id
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false

        // Bot Prefix
        body = (type === 'chat' && body.startsWith(prefix)) ? body : ((type === 'image' && caption || type === 'video' && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.trim().substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
		const argx = chats.slice(0).trim().split(/ +/).shift().toLowerCase()
        const isCmd = body.startsWith(prefix)
        const uaOverride = process.env.UserAgent
        const url = args.length !== 0 ? args[0] : ''
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
	    const isQuotedVideo = quotedMsg && quotedMsg.type === 'video'
		
		// [IDENTIFY]
		const isOwnerBot = ownerNumber.includes(pengirim)
        const isBanned = banned.includes(pengirim)

        // [BETA] Avoid Spam Message
        //if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        //if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        //
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }

        // [BETA] Avoid Spam Message
        //msgFilter.addFilter(from)
	
	//[AUTO READ] Auto read message 
	adeivan.sendSeen(chatId)
	    
	// Filter Banned People
        if (isBanned) {
            return console.log(color('[BAN]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        }
		
        switch (command) {
        // Menu and TnC
        case 'speed':
        case 'ping':
            await adeivan.sendText(from, `Pong!!!!\nSpeed: ${processTime(t, moment())} _Second_`)
            break
        case 'about':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            await adeivan.sendText(from, menuId.textAbout())
            break
        case 'release':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            await adeivan.sendText(from, menuId.textHistory(pushname))
            break
        case 'notes':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            await adeivan.sendText(from, menuId.textMenu(pushname))
            break
        case 'admin':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return adeivan.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            await adeivan.sendText(from, menuId.textAdmin())
            break
        case 'donate':
        case 'donasi':
            await adeivan.sendText(from, menuId.textDonasi())
            break
        case 'ownerbot':
            await adeivan.sendContact(from, ownerNumber)
            .then(() => adeivan.sendText(from, 'Jika kalian ingin request fitur silahkan chat nomor owner!'))
            break
        case 'botstat': {
            const loadedMsg = await adeivan.getAmountOfLoadedMessages()
            const chatIds = await adeivan.getAllChatIds()
            const groups = await adeivan.getAllGroups()
            adeivan.sendText(from, `Status :\n- *${loadedMsg}* Loaded Messages\n- *${groups.length}* Group Chats\n- *${chatIds.length - groups.length}* Personal Chats\n- *${chatIds.length}* Total Chats`)
            break
        }

        //Group All User
            
        case 'slide':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            const link = './media/document/pdf/slide/'
            if (args.length !== 1) return adeivan.reply(from, menuId.textSlide(), id)
            if (args[0] == 'pik1') {
                adeivan.sendFile(from, link+'pik/pik 1.pdf', 'pik 1.pdf', '', id)
            } else if (args[0] == 'pik2') {
                adeivan.sendFile(from, link+'pik/pik 1.pdf', 'pik 1.pdf', '', id)
            } else {
                adeivan.reply(from, menuId.textSlideSalah(), id)
            }
            break

        case 'jadwal':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            const inijadwal = await rugaapi.jadwalku()
            await adeivan.reply(from, inijadwal, id)
            .catch(() => {
                adeivan.reply(from, 'Ada yang Error!', id)
            })
            break

        case 'tugas':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            const initugas = await rugaapi.tugasku()
            await adeivan.reply(from, initugas, id)
            .catch(() => {
                adeivan.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'kalender':
        if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
        await adeivan.sendFile(from,'./media/document/pdf/kalender/Kalender Akademik UBSI 2020-2021.pdf','Kalender Akademik UBSI 2020-2021.pdf', '', id)
        break
        case 'grouplink':
                if (!isBotGroupAdmins) return adeivan.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
                if (isGroupMsg) {
                    const inviteLink = await adeivan.getGroupInviteLink(groupId);
                    adeivan.sendLinkWithAutoPreview(from, inviteLink, `\nLink group *${name}* Gunakan *${prefix}revoke* untuk mereset Link group`)
                } else {
                    adeivan.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
                }
                break
        case "revoke":
        if (!isBotGroupAdmins) return adeivan.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
                        if (isBotGroupAdmins) {
                            adeivan
                                .revokeGroupInviteLink(from)
                                .then((res) => {
                                    adeivan.reply(from, `Berhasil Revoke Grup Link gunakan *${prefix}grouplink* untuk mendapatkan group invite link yang terbaru`, id);
                                })
                                .catch((err) => {
                                    console.log(`[ERR] ${err}`);
                                });
                        }
                        break;
        
        // Random Kata
      	case 'motivasi':
            fetch('https://raw.githubusercontent.com/selyxn/motivasi/main/motivasi.txt')
            .then(res => res.text())
            .then(body => {
                let splitmotivasi = body.split('\n')
                let randommotivasi = splitmotivasi[Math.floor(Math.random() * splitmotivasi.length)]
                adeivan.reply(from, randommotivasi, id)
            })
            .catch(() => {
                adeivan.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'fakta':
            fetch('https://raw.githubusercontent.com/ARUGAZ/grabbed-results/main/random/faktaunix.txt')
            .then(res => res.text())
            .then(body => {
                let splitnix = body.split('\n')
                let randomnix = splitnix[Math.floor(Math.random() * splitnix.length)]
                adeivan.reply(from, randomnix, id)
            })
            .catch(() => {
                adeivan.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'katabijak':
            fetch('https://raw.githubusercontent.com/arugaz/grabbed-results/main/random/katabijax.txt')
            .then(res => res.text())
            .then(body => {
                let splitbijak = body.split('\n')
                let randombijak = splitbijak[Math.floor(Math.random() * splitbijak.length)]
                adeivan.reply(from, randombijak, id)
            })
            .catch(() => {
                adeivan.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'pantun':
            fetch('https://raw.githubusercontent.com/arugaz/grabbed-results/main/random/pantun.txt')
            .then(res => res.text())
            .then(body => {
                let splitpantun = body.split('\n')
                let randompantun = splitpantun[Math.floor(Math.random() * splitpantun.length)]
                adeivan.reply(from, randompantun.replace(/aruga-line/g,"\n"), id)
            })
            .catch(() => {
                adeivan.reply(from, 'Ada yang Error!', id)
            })
            break
        case 'quote':
            const quotex = await rugaapi.quote()
            await adeivan.reply(from, quotex, id)
            .catch(() => {
                adeivan.reply(from, 'Ada yang Error!', id)
            })
            break

        // Group Commands (group admin only)
	    case 'add':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return adeivan.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return adeivan.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
	        if (args.length !== 1) return adeivan.reply(from, `Untuk menggunakan ${prefix}add\nPenggunaan: ${prefix}add <nomor>\ncontoh: ${prefix}add 628xxx`, id)
                try {
                    await adeivan.addParticipant(from,`${args[0]}@c.us`)
                } catch {
                    adeivan.reply(from, 'Tidak dapat menambahkan target', id)
                }
            break
        case 'kick':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return adeivan.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return adeivan.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length === 0) return adeivan.reply(from, 'Maaf, format pesan salah.\nSilahkan tag satu atau lebih orang yang akan dikeluarkan', id)
            if (mentionedJidList[0] === botNumber) return await adeivan.reply(from, 'Maaf, format pesan salah.\nTidak dapat mengeluarkan akun bot sendiri', id)
            await adeivan.sendTextWithMentions(from, `Request diterima, mengeluarkan:\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return await adeivan.sendText(from, 'Gagal, kamu tidak bisa mengeluarkan admin grup.')
                await adeivan.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case 'promote':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return adeivan.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return adeivan.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length !== 1) return adeivan.reply(from, 'Maaf, hanya bisa mempromote 1 user', id)
            if (groupAdmins.includes(mentionedJidList[0])) return await adeivan.reply(from, 'Maaf, user tersebut sudah menjadi admin.', id)
            if (mentionedJidList[0] === botNumber) return await adeivan.reply(from, 'Maaf, format pesan salah.\nTidak dapat mempromote akun bot sendiri', id)
            await adeivan.promoteParticipant(groupId, mentionedJidList[0])
            await adeivan.sendTextWithMentions(from, `Request diterima, menambahkan @${mentionedJidList[0].replace('@c.us', '')} sebagai admin.`)
            break
        case 'demote':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return adeivan.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return adeivan.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length !== 1) return adeivan.reply(from, 'Maaf, hanya bisa mendemote 1 user', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return await adeivan.reply(from, 'Maaf, user tersebut belum menjadi admin.', id)
            if (mentionedJidList[0] === botNumber) return await adeivan.reply(from, 'Maaf, format pesan salah.\nTidak dapat mendemote akun bot sendiri', id)
            await adeivan.demoteParticipant(groupId, mentionedJidList[0])
            await adeivan.sendTextWithMentions(from, `Request diterima, menghapus jabatan @${mentionedJidList[0].replace('@c.us', '')}.`)
            break
        case 'bye':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return adeivan.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            adeivan.sendText(from, 'Good bye... ( ⇀‸↼‶ )').then(() => adeivan.leaveGroup(groupId))
            break
        case 'del':
            if (!isGroupAdmins) return adeivan.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!quotedMsg) return adeivan.reply(from, `Maaf, format pesan salah silahkan.\nReply pesan bot dengan caption ${prefix}del`, id)
            if (!quotedMsgObj.fromMe) return adeivan.reply(from, `Maaf, format pesan salah silahkan.\nReply pesan bot dengan caption ${prefix}del`, id)
            adeivan.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        case 'mentionall':
            if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return adeivan.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            const groupMem = await adeivan.getGroupMembers(groupId)
            let hehex = ''
            for (let i = 0; i < groupMem.length; i++) {
                hehex += '👋🏻'
                hehex += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
            }
            await adeivan.sendTextWithMentions(from, hehex)
            break
		case 'mutegrup':
			if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return adeivan.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return adeivan.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
			if (args.length !== 1) return adeivan.reply(from, `Untuk mengubah settingan group chat agar hanya admin saja yang bisa chat\n\nPenggunaan:\n${prefix}mutegrup on --aktifkan\n${prefix}mutegrup off --nonaktifkan`, id)
            if (args[0] == 'on') {
				adeivan.setGroupToAdminsOnly(groupId, true).then(() => adeivan.sendText(from, 'Berhasil mengubah agar hanya admin yang dapat chat!'))
			} else if (args[0] == 'off') {
				adeivan.setGroupToAdminsOnly(groupId, false).then(() => adeivan.sendText(from, 'Berhasil mengubah agar semua anggota dapat chat!'))
			} else {
				adeivan.reply(from, `Untuk mengubah settingan group chat agar hanya admin saja yang bisa chat\n\nPenggunaan:\n${prefix}mutegrup on --aktifkan\n${prefix}mutegrup off --nonaktifkan`, id)
			}
			break
		case 'setprofile':
			if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return adeivan.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return adeivan.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
			if (isMedia && type == 'image' || isQuotedImage) {
				const dataMedia = isQuotedImage ? quotedMsg : message
				const _mimetype = dataMedia.mimetype
				const mediaData = await decryptMedia(dataMedia, uaOverride)
				const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
				await adeivan.setGroupIcon(groupId, imageBase64)
			} else if (args.length === 1) {
				if (!isUrl(url)) { await adeivan.reply(from, 'Maaf, link yang kamu kirim tidak valid.', id) }
				adeivan.setGroupIconByUrl(groupId, url).then((r) => (!r && r !== undefined)
				? adeivan.reply(from, 'Maaf, link yang kamu kirim tidak memuat gambar.', id)
				: adeivan.reply(from, 'Berhasil mengubah profile group', id))
			} else {
				adeivan.reply(from, `Commands ini digunakan untuk mengganti icon/profile group chat\n\n\nPenggunaan:\n1. Silahkan kirim/reply sebuah gambar dengan caption ${prefix}setprofile\n\n2. Silahkan ketik ${prefix}setprofile linkImage`)
			}
			break
			
        //Owner Group
        case 'kickall': //mengeluarkan semua member
        if (!isGroupMsg) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
        let isOwner = chat.groupMetadata.owner == pengirim
        if (!isOwner) return adeivan.reply(from, 'Maaf, perintah ini hanya dapat dipakai oleh owner grup!', id)
        if (!isBotGroupAdmins) return adeivan.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            const allMem = await adeivan.getGroupMembers(groupId)
            for (let i = 0; i < allMem.length; i++) {
                if (groupAdmins.includes(allMem[i].id)) {

                } else {
                    await adeivan.removeParticipant(groupId, allMem[i].id)
                }
            }
            adeivan.reply(from, 'Success kick all member', id)
        break

        //Owner Bot
        case 'ban':
            if (!isOwnerBot) return adeivan.reply(from, 'Perintah ini hanya untuk Owner bot!', id)
            if (args.length == 0) return adeivan.reply(from, `Untuk banned seseorang agar tidak bisa menggunakan commands\n\nCaranya ketik: \n${prefix}ban add 628xx --untuk mengaktifkan\n${prefix}ban del 628xx --untuk nonaktifkan\n\ncara cepat ban banyak digrup ketik:\n${prefix}ban @tag @tag @tag`, id)
            if (args[0] == 'add') {
                banned.push(args[1]+'@c.us')
                fs.writeFileSync('./settings/banned.json', JSON.stringify(banned))
                adeivan.reply(from, 'Success banned target!')
            } else
            if (args[0] == 'del') {
                let xnxx = banned.indexOf(args[1]+'@c.us')
                banned.splice(xnxx,1)
                fs.writeFileSync('./settings/banned.json', JSON.stringify(banned))
                adeivan.reply(from, 'Success unbanned target!')
            } else {
             for (let i = 0; i < mentionedJidList.length; i++) {
                banned.push(mentionedJidList[i])
                fs.writeFileSync('./settings/banned.json', JSON.stringify(banned))
                adeivan.reply(from, 'Success ban target!', id)
                }
            }
            break
        case 'leaveall': //mengeluarkan bot dari semua group serta menghapus chatnya
            if (!isOwnerBot) return adeivan.reply(from, 'Perintah ini hanya untuk Owner bot', id)
            const allChatz = await adeivan.getAllChatIds()
            const allGroupz = await adeivan.getAllGroups()
            for (let gclist of allGroupz) {
                await adeivan.sendText(gclist.contact.id, `Maaf bot sedang pembersihan, total chat aktif : ${allChatz.length}`)
                await adeivan.leaveGroup(gclist.contact.id)
                await adeivan.deleteChat(gclist.contact.id)
            }
            adeivan.reply(from, 'Success leave all group!', id)
            break
        case 'clearall': //menghapus seluruh pesan diakun bot
            if (!isOwnerBot) return adeivan.reply(from, 'Perintah ini hanya untuk Owner bot', id)
            const allChatx = await adeivan.getAllChats()
            for (let dchat of allChatx) {
                await adeivan.deleteChat(dchat.id)
            }
            adeivan.reply(from, 'Success clear all chat!', id)
            break
        default:
            break
        }
		
    } catch (err) {
        console.log(color('[EROR]', 'red'), err)
    }
}

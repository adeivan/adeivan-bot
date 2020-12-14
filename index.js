const { create, Client } = require('@open-wa/wa-automate')
const figlet = require('figlet')
const options = require('./utils/options')
const { color, messageLog } = require('./utils')
const HandleMsg = require('./HandleMsg')

const start = (adeivan = new Client()) => {
    console.log(color(figlet.textSync('adeivan BOT', { font: 'Ghost', horizontalLayout: 'default' })))
    console.log(color('[DEV]'), color('ADE IVAN', 'yellow'))
    console.log(color('[~>>]'), color('Berhasil Masuk! ✅', 'green'))

    // Mempertahankan sesi agar tetap nyala
    adeivan.onStateChanged((state) => {
        console.log(color('[~>>]', 'red'), state)
        if (state === 'CONFLICT' || state === 'UNLAUNCHED') adeivan.forceRefocus()
    })

    // ketika bot diinvite ke dalam group
    adeivan.onAddedToGroup(async (chat) => {
	const groups = await adeivan.getAllGroups()
	// kondisi ketika batas group bot telah tercapai,ubah di file settings/setting.json
	if (groups.length > groupLimit) {
	await adeivan.sendText(chat.id, `Sorry, the group on this Bot is full\nMax Group is: ${groupLimit}`).then(() => {
	      adeivan.leaveGroup(chat.id)
	      adeivan.deleteChat(chat.id)
	  }) 
	} else {
	// kondisi ketika batas member group belum tercapai, ubah di file settings/setting.json
	    if (chat.groupMetadata.participants.length < memberLimit) {
	    await adeivan.sendText(chat.id, `Sorry, Bot comes out if the group members do not exceed ${memberLimit} people`).then(() => {
	      adeivan.leaveGroup(chat.id)
	      adeivan.deleteChat(chat.id)
	    })
	    } else {
        await adeivan.simulateTyping(chat.id, true).then(async () => {
          await adeivan.sendText(chat.id, `Hai minna~, Im adeivan Bot. To find out the commands on this bot type ${prefix}menu`)
        })
	    }
	}
    })

    // ketika seseorang masuk/keluar dari group
    adeivan.onGlobalParicipantsChanged(async (event) => {
        const host = await adeivan.getHostNumber() + '@c.us'
		let profile = await adeivan.getProfilePicFromServer(event.who)
		if (profile == '' || profile == undefined) profile = 'https://raw.githubusercontent.com/adeivan/adeivan-bot/main/media/logo.png'
        // kondisi ketika seseorang diinvite/join group lewat link
        if (event.action === 'add' && event.who !== host) {
			await adeivan.sendFileFromUrl(event.chat, profile, 'profile.jpg', '')
            await adeivan.sendTextWithMentions(event.chat, `Hi, Welcome to the group @${event.who.replace('@c.us', '')} \n\nHave fun with us✨`)
        }
        // kondisi ketika seseorang dikick/keluar dari group
        if (event.action === 'remove' && event.who !== host) {
			await adeivan.sendFileFromUrl(event.chat, profile, 'profile.jpg', '')
            await adeivan.sendTextWithMentions(event.chat, `Good bye @${event.who.replace('@c.us', '')}, We'll miss you✨`)
        }
    })

    // ketika seseorang mengirim pesan
    adeivan.onMessage(async (message) => {
        adeivan.getAmountOfLoadedMessages() // menghapus pesan cache jika sudah 3000 pesan.
            .then((msg) => {
                if (msg >= 3000) {
                    console.log('[adeivan]', color(`Loaded Message Reach ${msg}, cuting message cache...`, 'yellow'))
                    adeivan.cutMsgCache()
                }
            })
        HandleMsg(adeivan, message)    
    
    })
	
    // Message log for analytic
    adeivan.onAnyMessage((anal) => { 
        messageLog(anal.fromMe, anal.type)
    })
}

//create session
create(options(true, start))
    .then((adeivan) => start(adeivan))
    .catch((err) => new Error(err))

const axios = require('axios')
const link = 'https://arugaz.herokuapp.com'

const jadwalku = async () => new Promise((resolve, reject) => {
    axios.get(`https://raw.githubusercontent.com/adeivan/adeivan-bot/main/document/jadwal.txt`)
    .then((res) => {
        resolve(res.data)
    })
    .catch((err) =>{
        reject(err)
    })
})

const tugasku = async () => new Promise((resolve, reject) => {
    axios.get(`https://raw.githubusercontent.com/adeivan/adeivan-bot/main/document/tugas.txt`)
    .then((res) => {
        resolve(res.data)
    })
    .catch((err) =>{
        reject(err)
    })
})

const quote = async () => new Promise((resolve, reject) => {
    axios.get(`${link}/api/randomquotes`)
    .then((res) => {
        const text = `Author: ${res.data.author}\n\nQuote: ${res.data.quotes}`
        resolve(text)
    })
    .catch((err) =>{
        reject(err)
    })
})

const wiki = async (url) => new Promise((resolve, reject) => {
    axios.get(`${link}/api/wiki?q=${url}`)
    .then((res) => {
        resolve(res.data.result)
    })
    .catch((err) =>{
        reject(err)
    })
})

const artinama = async (nama) => new Promise((resolve, reject) => {
	axios.get(`${link}/api/artinama?nama=${nama}`)
	.then((res) => {
		resolve(res.data.result)
	})
	.catch((err) => {
		reject(err)
	})
})

module.exports = {
    jadwalku,
    tugasku,
    quote,
    wiki,
	artinama,
}

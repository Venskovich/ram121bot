// Setting up telegram bot
const TelegramApi = require("node-telegram-bot-api")
const token = require("./token")
const bot = new TelegramApi(token, { polling: true })

// Getting data from files to operate with
const specialChatId = require("./specialChatId.json")
const devId = require("./devId.json")
var chats = require("./chats.json")
var stats = require("./stats.json")
var players = require("./players.json")

// Import
const { delay, delayToMonday, saveStats, savePlayers, sendMessage, deleteMessage, getTopLength, sendMessageEverywhere, saveChats } = require("./otherFunctions")
const { createPlayer, getPlayer, updatePlayed, isPlayer } = require("./playerFunctions")
const { ram, top, topWin, readme, start } = require("./mainFunctions")
const { getStats } = require("./devFunctions")



// Setting up commands
bot.setMyCommands([
    {command: "/ram", description: "Play the game"},
    {command: "/top", description: "See top players of the week"},
    {command: "/topwin", description: "See top players of all time"},
    {command: "/readme", description: "Gameplay & Update news"}
])

// Creating these variables to make it easier to operate with commands
var commands = {
    ram: "/ram",
    top: "/top",
    topWin: "/topwin",
    readme: "/readme",

    update: "/update@ram121bot",
    stats: "/stats@ram121bot",

    start: "/start"
}
var allCommands = ["/ram", "/ram@ram121bot", "/top", "/top@ram121bot", "/topwin", "/topwin@ram121bot", "/readme", "/readme@ram121bot", "/start", "/start@ram121bot"]
var devCommands = ["/stats@ram121bot", "/update@ram121bot"]




// Main
bot.on("message", msg => {

    // Creating these variables to make it easier to operate with message
    let text = msg.text.toLowerCase()
    let chatId = msg.chat.id
    let msgId = msg.message_id
    let user = msg.from

    // Declaring player variable. It is initialized if the user calls any bot command
    // Declared to make it easier to operate with player data
    let player = null

    // Variable which contains message reply text
    let reply = ""


    // If a message is not a command request, then ignore it and do not execute the following code
    // The same is if message was sent by bot
    // Otherwise create the new player or initialize it
    if ((!allCommands.includes(text) && !(devCommands.includes(text) && user.id === devId)) || user.is_bot) {

        return

    } else {

        // Checking if this user is already a player. If it is, the new player is NOT created
        if (!isPlayer(user.id, players)) {
            players.push(createPlayer(user))
            savePlayers(players)
        }
        
        player = getPlayer(user.id, players)

        // Pushing the chatId to chats array
        if (!chats.includes(chatId)) {
            chats.push(chatId)
            saveChats(chats)
        }

    }


    // Main bot commands
    if (text.includes(commands.ram)) {

        reply = ram(player, players)

        // Saving data
        savePlayers(players)

    } else if (text.includes(commands.topWin)) {
        
        reply = topWin(players)

    } else if (text.includes(commands.top)) {

        reply = top(players)

    } else if (text.includes(commands.readme)) {

        reply = readme()

    } else if (text.includes(commands.start)) {

        reply = start()

    }


    // Developer commands
    if (text.includes(commands.stats)) {

        reply = getStats(stats)

    } else if (text.includes(commands.update)) {

        updatePlayed(players)
        reply = `Dev in da house: you can /ram one more time today`

    }


    // If a player plays the game outside the chat the bot was created for, then warn him to play rambot there
    // Do not delete messages if it is another chat
    if (chatId != specialChatId && allCommands.includes(text) && !(text.includes(commands.start) || text.includes(commands.readme))) {
        reply += "\n\nPlay there: @nause121"
    }

    // Sending reply message
    sendMessage(bot, chatId, reply)

    // Deleting message which contains command request
    deleteMessage(bot, chatId, msgId)
    if (!text.includes(commands.start)) {
        deleteMessage(bot, chatId, msgId + 1, 30)
    }

    // Updating stats
    if (user.id != devId) {
        saveStats(++stats)
    }

})




// Update played status at 6am and 5pm
setTimeout(function () {

    updatePlayed(players)
    sendMessageEverywhere(bot, chats, `/ram is allowed`)
    savePlayers(players)

    setInterval(function () {

        updatePlayed(players)
        sendMessageEverywhere(bot, chats, `/ram is allowed`)
        savePlayers(players)

    }, 24 * 60 * 60 * 1000)

}, delay(6))

setTimeout(function () {

    updatePlayed(players)
    sendMessageEverywhere(bot, chats, `/ram is allowed`)
    savePlayers(players)

    setInterval(function () {

        updatePlayed(players)
        sendMessageEverywhere(bot, chats, `/ram is allowed`)
        savePlayers(players)

    }, 24 * 60 * 60 * 1000)

}, delay(17))

// Execute startNewWeek() function every Monday midnigh
setTimeout(function () {

    sendMessageEverywhere(bot, chats, startNewWeek(players))
    savePlayers(players)

    chats = []
    saveChats(chats)

    setInterval(function () {

        sendMessageEverywhere(bot, chats, startNewWeek(players))
        savePlayers(players)

        chats = []
        saveChats(chats)

    }, 7 * 24 * 60 * 60 * 1000)

}, delayToMonday())




// Function to start new week : calculating win points and renewing ram values
function startNewWeek(players) {

    // Creating copy of players array, buy only of active players
    let playersCopy = []
    for (player of players) {
        if (player.active) {
            playersCopy.push(player)
        }
    }

    // Sorting players by ram
    playersCopy.sort(function (a, b) {
        if (a.ram < b.ram) {
            return 1
        }
        if (a.ram > b.ram) {
            return -1
        }
        return 0
    })


    // Calculating winRank for topPlayers
    let topLenght = getTopLength(playersCopy, "ram")
    for (let i = 0; i < topLenght; i++) {
        let player = playersCopy[i]
        player.winRank += 10 - i
    }


    // Sending message with all players list and their ram value
    let reply = "<b>Top players of the week</b>\n"
    for (let i = 0; i < playersCopy.length; i++) {
        let player = players[i]
        reply += `${i + 1}. ${player.ram}GB - <a href="tg://user?id=${player.id}">${player.name}</a>\n`
    }

    // Updating ram values and playerToday status
    for (player of players) {
        player.played = false
        player.ram = 0
        player.active = false
    }

    return reply

}
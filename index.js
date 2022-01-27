// Setting up telegram bot
const TelegramApi = require("node-telegram-bot-api")
const token = require("./token")
const bot = new TelegramApi(token, { polling: true })

// Getting data from files to operate with
const fs = require("fs")
var specialChatId = require("./specialChatId")
var devId = require("./devId")
var stats = require("./stats")
var players = require("./players")



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
    stats: "/stats",

    start: "/start"
}
var allCommands = ["/ram", "/ram@ram121bot", "/top", "/top@ram121bot", "/topwin", "/topwin@ram121bot", "/readme", "/readme@ram121bot", "/start", "/start@ram121bot"]
var devCommands = ["/stats", "/stats@ram121bot", "/update", "/update@nauweekbot"]



// Main
bot.on("message", msg => {

    // Creating these variables to make it easier to operate with message
    let text = msg.text.toLowerCase()
    let chatId = msg.chat.id
    let msgId = msg.message_id
    let userId = msg.from.id
    let user = msg.from

    // Declaring player variable. It is initialized if the user calls any bot command
    // Declared to make it easier to operate with player data
    let player = null

    // Developer commands
    if (devCommands.includes(text) && userId === devId) {

        if (text.includes(commands.stats)) {

            sendMessage(chatId, getStats())

        } else if (text.includes(commands.update)) {

            update()
            sendMessage(chatId, `Dev in da house: you can /ram one more time today`)

            // Deleting messages
            deleteMessages(chatId, msgId, false)
            return

        }

        // Deleting messages
        deleteMessages(chatId, msgId, true, 10)
        return

    }


    // If a message is not a command request, then ignore it and do not execute the following code
    // The same is if message was sent by bot
    // Otherwise create the new player or initialize it
    if (!allCommands.includes(text) || user.is_bot) {

        return

    } else {

        createPlayer(user)
        player = getPlayer(user.id)

    }


    // Main bot commands
    if (text.includes(commands.ram)) {

        sendMessage(chatId, ram(player))

        // Saving data
        savePlayers()

    } else if (text.includes(commands.topWin)) {
        
        sendMessage(chatId, topWin())

    } else if (text.includes(commands.top)) {

        sendMessage(chatId, top())

    } else if (text.includes(commands.readme)) {

        sendMessage(chatId, readme())

    } else if (text.includes(commands.start)) {

        sendMessage(chatId, start())

        // A user calls this command 90% times at private messages with the bot, when getting acquinted with it. Clearing up all messages means autodelete the chat from chatlist of the user. So it is mandatory not to delete the bot answer
        deleteMessages(chatId, msgId, false)
        return

    }


    // Deleting messages
    deleteMessages(chatId, msgId)

    // Increasing stats counter
    stats++

    // Saving data
    saveStats()


    // If a player plays the game outside the chat the bot was created for, then warn him to play rambot there
    if (chatId != specialChatId) {
        sendMessage(chatId, `Play there: @nause121`)
    }

})



// Update playedToday status every midnight
setTimeout(function () {

    update()
    sendMessage(specialChatId, `/ram is allowed`)
    savePlayers()

    setInterval(function () {

        update()
        sendMessage(specialChatId, `/ram is allowed`)
        savePlayers()

    }, 24 * 60 * 60 * 1000)

}, delayToMidnight())

// Function to calculate delay to midnight
function delayToMidnight() {

    let thisDay = new Date()
    let nextDay = new Date()

    nextDay.setDate(thisDay.getDate() + 1)
    nextDay.setHours(0, 0, 0, 0)

    return nextDay.getTime() - thisDay.getTime()

}



// Execute startNewWeek() function every Monday midnigh
setTimeout(function () {

    startNewWeek()
    savePlayers()

    setInterval(function () {

        startNewWeek()
        savePlayers()

    }, 7 * 24 * 60 * 60 * 1000)

}, delayToMonday())

// Calculate time to Monday
function delayToMonday() {

    let today = new Date()
    let monday = new Date()

    // Calulating days to Monday
    let daysToMonday = 7 - today.getDay()
    if (daysToMonday == 7) {
        daysToMonday = 0
    }

    monday.setDate(today.getDate() + daysToMonday + 1)
    monday.setHours(0, 0, 0, 0)

    return monday.getTime() - today.getTime()

}



// Function to play ram game
function ram(player) {

    let reply = `<a href="tg://user?id=${player.id}">${player.name}</a>, `


    // If player has already played ram today, then return him the following message
    if (player.playedToday) {
        return `${reply} you have already played today\n>RAM: ${player.ram}\n>Pos: ${getTopPosition(player.id)} of ${players.length}`
    }


    // Calculating RAM change
    let changeRange = [-16, -8, -4, -2, 2, 4, 8, 16, 32]
    let change = changeRange[Math.floor(Math.random() * changeRange.length)]

    // Updating player data
    player.ram += change
    player.playedToday = true
    player.activeDuringWeek = true

    // Returning a message of change
    return `${reply} your ram was ${change < 0 ? "decreased" : "increased"} by ${change}\n>RAM: ${player.ram}\n>Pos: ${getTopPosition(player.id)} of ${players.length}`

}



// Function to get top 10 players of the week
function top() {

    // Sorting players by ram
    players.sort(function (a, b) {
        if (a.ram < b.ram) {
            return 1
        }
        if (a.ram > b.ram) {
            return -1
        }
        return 0
    })

    // Writing the message
    let reply = "<code>"
    for (let i = 0; i < 10; i++) {
        if (players[i]) {
            reply += `${players[i].ram}GB - ${players[i].name}\n`
        }
    }
    reply += "</code>"

    // Returning the message of top players
    return reply

}

// Function to get top 10 players for the whole time
function topWin() {

    // Sorting players by winRank
    players.sort(function (a, b) {
        if (a.winRank < b.winRank) {
            return 1
        }
        if (a.winRank > b.winRank) {
            return -1
        }
        return 0
    })

    // Writing the message
    let reply = "<code>"
    for (let i = 0; i < 10; i++) {
        if (players[i]) {
            reply += `${players[i].winRank} - ${players[i].name}\n`
        }
    }
    reply += "</code>"

    // Returning the message of top players
    return reply

}

// Function to get top ram position
function getTopPosition(id) {

    // Sorting players by ram
    players.sort(function (a, b) {
        if (a.ram < b.ram) {
            return 1
        }
        if (a.ram > b.ram) {
            return -1
        }
        return 0
    })

    // Writing the message
    for (let i = 0; i < players.length; i++) {
        if (players[i].id === id) {
            return i + 1
        }
    }

    return false

}



// Function to create new player
function createPlayer(user) {

    // Checking if this user is already a player. If it is, the new player is NOT created
    if (isPlayer(user.id)) {
        return
    }

    // Creating new player
    let newPlayer = {
        id: user.id,
        name: getName(user),
        ram: 0,
        playedToday: false,
        winRank: 0,
        activeDuringWeek: false
    }

    // Pushing new player
    players.push(newPlayer)

}

// Function to get player by id
function getPlayer(id) {

    for (player of players) {
        if (player.id === id) {
            return player
        }
    }

    return false

}

// Function to check if a user is already a player
function isPlayer(id) {

    for (player of players) {
        if (player.id === id) {
            return true
        }
    }

    return false

}



// Functions to get either readme or start message
function readme() {
    return `<a href="https://telegra.ph/ram121-01-15">Gameplay & Update news</a>`
}
function start() {
    return `Hi there! The @ram121bot is created for @nause121 chat`
}



// Developer command / Function to update players playerToday status
function update() {

    for (player of players) {
        player.playedToday = false
    }

}

// Developer command / Function to get stats info
function getStats() {
    return `stats: ${stats}`
}

// Function to start new week : calculating win points and renewing ram values
function startNewWeek() {

    // Sorting players by ram
    players.sort(function (a, b) {
        if (a.ram < b.ram) {
            return 1
        }
        if (a.ram > b.ram) {
            return -1
        }
        return 0
    })

    // Calculating winRank for topPlayers
    for (let i = 0; i < 5; i++) {
        players[i].winRank += 5 - i
    }


    // Sending message with all players list and their ram value
    let msg = "<b>Top players of the week</b>\n"
    for (let i = 0; i < players.length; i++) {
        if (players[i].activeDuringWeek) {
            msg += `${i + 1}. ${players[i].ram}GB - <a href="tg://user?id=${players[i].id}">${players[i].name}</a>\n`
        }
    }
    sendMessage(specialChatId, msg)


    // Updating ram values and playerToday status
    for (player of players) {
        player.playedToday = false
        player.ram = 0
    }

}



// Functions to save data
function saveStats() {
    fs.writeFile("stats.json", JSON.stringify(stats), err => {
        if (err) throw err; // Checking for errors
    })
}
function savePlayers() {
    fs.writeFile("players.json", JSON.stringify(players), err => {
        if (err) throw err; // Checking for errors
    })
}



// Function to get name from the user profile
function getName(user) {

    if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`
    } else if (user.first_name) {
        return `${user.first_name}`
    } else if (user.last_name) {
        return `${user.last_name}`
    } else {
        return `Player`
    }

}



// Simplified way to send a message
function sendMessage(chatId, text) {
    bot.sendMessage(chatId, text, { parse_mode: "HTML" })
}

// Function to clear up user command request message and bot's reply
function deleteMessages(chatId, msgId, deleteReply = true, delay = 60) {

    setTimeout(function () {
        bot.deleteMessage(chatId, msgId)
    }, 1 * 1000)

    if (deleteReply) {

        setTimeout(function () {
            bot.deleteMessage(chatId, ++msgId)
        }, delay * 1000)

    }

}
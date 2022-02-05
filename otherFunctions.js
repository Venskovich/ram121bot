// Import
const fs = require("fs")

//Export
module.exports = { delay, delayToMonday, saveStats, savePlayers, getName, sendMessage, deleteMessage, getTopLength, sendMessageEverywhere, saveChats }

// Function to calculate delay to midnight
function delay(hours) {

    let thisDay = new Date()
    let nextDay = new Date()

    nextDay.setHours(hours, 0, 0, 0)

    if (thisDay.getHours() >= nextDay.getHours()) {
        nextDay.setDate(thisDay.getDate() + 1)
    }

    return nextDay.getTime() - thisDay.getTime()

}

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

// Functions to save data
function saveStats(stats) {
    fs.writeFile("stats.json", JSON.stringify(stats), err => {
        if (err) throw err; // Checking for errors
    })
}
function savePlayers(players) {
    fs.writeFile("players.json", JSON.stringify(players), err => {
        if (err) throw err; // Checking for errors
    })
}
function saveChats(chats) {
    fs.writeFile("chats.json", JSON.stringify(chats), err => {
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

// Function to return length of top list 
function getTopLength(players, status = "") {
    
    let counter = 0

    if (status === "ram") {
        
        for (player of players) {
            counter += player.active ? 1 : 0
        }

    } else if (status === "winRank") {

        for (player of players) {
            counter += player.winRank > 0 ? 1 : 0
        }

    }

    return counter > 10 ? 10 : counter

}

// Simplified way to send a message
function sendMessage(bot, chatId, text) {
    bot.sendMessage(chatId, text, { parse_mode: "HTML" })
}

// Function to clear up user command request message and bot's reply
function deleteMessage(bot, chatId, msgId, delay = 1) {

    setTimeout(function () {
        bot.deleteMessage(chatId, msgId)
    }, delay * 1000)

}

// Function to send a message in every chat
function sendMessageEverywhere(bot, chats, text) {

    for (chatId of chats) {
        if (chatId) {
            sendMessage(bot, chatId, text)
        }
    }

}
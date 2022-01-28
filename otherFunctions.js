// Getting data from files to operate with
var stats = require("./stats.json")
var players = require("./players.json")

// Import
const fs = require("fs")

//Export
module.exports = { delay, delayToMonday, saveStats, savePlayers, getName }

// Function to calculate delay to appropriate hour
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

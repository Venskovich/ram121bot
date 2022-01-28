// Getting data from files to operate with
var players = require("./players.json")

// Import
const { getName } = require("./otherFunctions")

// Export
module.exports = { createPlayer, getPlayer, getTopPosition, update }



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

// Function to update players playerToday status
function update() {

    for (player of players) {
        player.playedToday = false
    }

}
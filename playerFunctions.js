// Import
const { getName, getTopLength } = require("./otherFunctions")

// Export
module.exports = { createPlayer, getPlayer, isPlayer, getTopPosition, updatePlayed }



// Function to create new player
function createPlayer(user) {

    // Creating new player
    let newPlayer = {
        id: user.id,
        name: getName(user),
        ram: 0,
        played: false,
        winRank: 0,
        active: false
    }

    // Returning newPlayer to be pushed
    return newPlayer

}

// Function to get player by id
function getPlayer(id, players) {

    for (player of players) {
        if (player.id === id) {
            return player
        }
    }

}

// Function to check if a user is already a player
function isPlayer(id, players) {

    for (player of players) {
        if (player.id === id) {
            return true
        }
    }

    return false

}

// Function to get top ram position
function getTopPosition(player, players) {

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

    for (let i = 0; i < playersCopy.length; i++) {

        if (playersCopy[i].id === player.id) {
            return `${i + 1} of ${playersCopy.length}`
        }

    }

}

// Function to update players playerToday status
function updatePlayed(players) {

    for (player of players) {
        player.played = false
    }

}
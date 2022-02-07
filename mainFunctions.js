// Import
const { getTopPosition } = require("./playerFunctions")
const { getTopLength } = require("./otherFunctions")

// Export
module.exports = { ram, top, topWin, readme, start }

// Function to play ram game
function ram(player, players) {

    let reply = `<a href="tg://user?id=${player.id}">${player.name}</a>,`


    // If player has already played ram, then return him the following message
    if (player.played) {
        return `${reply} you have already played\n>RAM: ${player.ram}GB\n>Pos: ${getTopPosition(player.id, players)}`
    }


    // Calculating RAM change
    let changeRange = [-16, -8, -4, -2, 2, 4, 8, 16, 32]
    let change = changeRange[Math.floor(Math.random() * changeRange.length)]

    // Updating player data
    player.ram += change
    player.played = true
    player.active = true

    // Returning a message of change
    return `${reply} your ram was ${change < 0 ? "decreased" : "increased"} by ${change}GB\n>RAM: ${player.ram}GB\n>Pos: ${getTopPosition(player.id, players)}`

}

// Function to get top 10 players of the week
function top(players) {

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

    
    // Checking if the list 
    let topLenght = getTopLength(playersCopy, "ram")

    if (topLenght === 0) {
        return `None has played this week yet`
    }


    // Writing the message
    let reply = "<code>"

    for (let i = 0; i < topLenght; i++) {
        let player = playersCopy[i]
        reply += `${player.ram}GB - ${player.name}`
        reply += i != topLenght - 1 ? `\n` : "</code>"
    } 

    // Returning the message of top players
    return reply

}

// Function to get top 10 players for the whole time
function topWin(players) {

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


    // Checking if the list 
    let topLenght = getTopLength(players, "winRank")

    if (topLenght === 0) {
        return `None has won yet`
    }
    

    // Writing the message
    let reply = "<code>"

    for (let i = 0; i < topLenght; i++) {
        reply += `${players[i].winRank} - ${players[i].name}`
        reply += i != topLenght - 1 ? `\n` : "</code>"
    }

    // Returning the message of top players
    return reply

}

// Functions to get either readme or start message
function readme() {
    return `<a href="https://telegra.ph/ram121-01-15">Gameplay & Update news</a>`
}
function start() {
    return `Hi there! Although you can play the game here, the @ram121bot was created to @nause121 chat\n\n/ram - play the game\n/top - get top10 players\n/readme - about gameplay`
}
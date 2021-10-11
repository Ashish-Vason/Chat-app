const users = []

// addUser, removeUser, getUser, getUserInRoom

const addUser = ({id, username, room}) => {
    
    // Clean the data

     username = username.trim().toLowerCase()
     room = room.trim().toLowerCase()

    // Validate the username, room

    if (!username || !room) {
        return {
            error: 'Username and room is required'
        }
    }

    // Check for existing users

    const existingUser = users.find((user => {
        return user.room === room && user.username === username
    }))

    // Validate the username and room

    if (existingUser) {
        return {
            error :"User is already taken in this room!"
        }
    }

    // Storing the user

    const user = {id, username, room}
    users.push(user)
    return {user}
    
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id )

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}


const getUserInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
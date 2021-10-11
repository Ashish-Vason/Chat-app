const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const http = require('http')
const path = require('path')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUserInRoom, getUser } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io =  socketio(server);

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')


app.use(express.static(publicDirectoryPath))

// let count = 0

io.on('connection', (socket) => {

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, message))
        
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback("Sensitive Words are restricted")
        }
        
        callback()
    })

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} is joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })

    socket.on('disconnect', () => {

        const user = removeUser(socket.id)
    
        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
        
    })

    socket.on('sendLocation', (coords, callback) => {
        // console.log(data);
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps/?q=${coords.latitude},${coords.longitude}`) )
        callback()
    })

})

server.listen(port, () => {
    console.log('Server is up on port', port);
})
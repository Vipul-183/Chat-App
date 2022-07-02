// Server Side

const path = require('path') //core node module hence no need to install
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { messageFunction, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 3000

//paths for express
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))



io.on('connection', (socket) => {
    console.log('Ladies and gentlemen! We have a new websocket connection.');

    socket.on('join', ({ username, room },callback) => {
        const {error, user} = addUser({ id: socket.id, username, room})


        if(error){
            return callback(error)
        }
        socket.join(user.room)
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
        socket.emit('message', messageFunction('System :-)', `Welcome aboard ${user.username}!!`))
        socket.broadcast.to(user.room).emit('message', messageFunction('System :-)', `${user.username} has joined the room!`))
        
    })

    socket.on('Send', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        
        io.to(user.room).emit('message', messageFunction(user.username, msg));
        callback();
    })

    socket.on('location', (position, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, 'https://www.google.com/maps?q=' + decodeURIComponent(position.lat) + ',' + decodeURIComponent(position.long)))
        callback()
    })

    socket.on('disconnect', () => {
        const user = getUser(socket.id)
        if(user){
            removeUser(socket.id)
            io.to(user.room).emit('message', messageFunction('System :-)', `${user.username} has left the room!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})



server.listen(port, () => {
    console.log('Server is up and running on ' + port);
})
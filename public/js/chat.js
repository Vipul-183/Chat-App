// Client Side

const socket = io()

const $messageForm = document.querySelector('form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#Location')
const $messages = document.querySelector('#messages')


// templates
const messageTemplates = document.querySelector('#message-template').innerHTML
const locationTemplates = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoscroll = () => {

    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// server --> client  :  roomData
socket.on('roomData', (roomData)=>{
    console.log(roomData);
    const html = Mustache.render(sidebarTemplate,{
        room:roomData.room,
        users: roomData.users
    })
    document.querySelector('#sidebar').innerHTML = html
    
})


// server --> client  :  messages
socket.on('message', (msg) => {
    console.log(msg.message);
    const html = Mustache.render(messageTemplates,{
        message: msg.message,
        time: moment(msg.time).format('h:mm a'),
        username:msg.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

// server --> client  :  location
socket.on('locationMessage',(URL)=>{
    console.log(URL);

    const html = Mustache.render(locationTemplates,{
        url: URL.url,
        time: moment(URL.time).format('h:mm a'),
        username: URL.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


// client --> server  :  messages
document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const msg = document.querySelector('input').value
    console.log('Clicked!');
    socket.emit('Send', msg, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {

            return console.log(error);
        }
        console.log('Message delivered successfully!');
    });
})

// client --> server  :  Location
document.querySelector('#Location').addEventListener('click', () => {
    if (navigator.geolocation) {

        $sendLocationButton.setAttribute('disabled', 'disabled') // disabled
        navigator.geolocation.getCurrentPosition((position) => {
            socket.emit('location', {
                lat: position.coords.latitude,
                long: position.coords.longitude
            }, () => {
                console.log('Location shared! ');
                $sendLocationButton.removeAttribute('disabled')
            });

        })
    }
    else {
        return alert('Geolocatuion is not supported!!')
    }
})

socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})
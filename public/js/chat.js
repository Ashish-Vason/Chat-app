
const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates

const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true}) 

const autoscroll = () => {
    // new Message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of the message container
    const containerHeight = $messages.scrollHeight

    // How Far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop= $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm A')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('locationMessage', (url) => {
    console.log(url);
    const locationHtml = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.location,
        createdAt: moment(url.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', locationHtml)
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
       if (error) {
          return console.log(error);
       }

       $messageFormButton.removeAttribute('disabled')
       $messageFormInput.value = ''
       $messageFormInput.focus()

       console.log("Message Delivered");
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href  = '/'
    }
})

$sendLocation.addEventListener('click', () => {

    if (!navigator.geolocation.getCurrentPosition) {
       return alert('Geolocation API is not supported in your browser')
    }

        $sendLocation.setAttribute('disabled', 'disabled')

         navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            if (error) {
                return console.log(error);
            }

            console.log("Location Shared Successfully!!");
            $sendLocation.removeAttribute('disabled')
        })
    })
})

//regex to convert urls in messages to links. Actual function itself found online, integrated into code by me.
function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

//clears all messages
function clearMessages(){
    document.querySelector('#messages').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    //creates data that is locally stored and tells the server that a user is connecting
    socket.on('connect', () => {
        var name = localStorage.getItem('name');
        if (!name)
        {
            localStorage.setItem('name','not set');
        }
        document.querySelector('#name').innerHTML = localStorage.getItem('name');
        currentChannel = localStorage.getItem('channel');
        if (!currentChannel)
        {
            localStorage.setItem('channel','general');
        }
        socket.emit('connecting');
    });

    // When connected, configure the page with the channel options and the messages for the current channel
    socket.on('connected', channel =>
    {
        document.querySelector('#channel-change').innerHTML = '';
        channels = JSON.parse( channel );
        var key = Object.keys(channels);
        for (var i = 0 ; i < key.length ; i++)
        {
            const option = document.createElement('option');
            option.innerHTML = key[i];
            option.value = key[i];
            option.id = key[i];
            document.querySelector('#channel-change').append(option);
        }
        channel = localStorage.getItem('channel');
        document.getElementById(channel).selected = true;
        socket.emit('channel change');
    });

    //this actually loads the messages and is used both when the user first loads the page and when they change channels
    socket.on('message load', channel =>
    {

        channels = JSON.parse(channel);
        currentChannel = localStorage.getItem('channel');
        var data = channels[currentChannel];
        document.querySelector('#messages').innerHTML = '';
        for (var i =0;i < data.length ;i++)
        {
            const li = document.createElement('li');
            li.innerHTML = urlify(data[i]);
            document.querySelector('#messages').append(li);
        }
    });

    //creates a channel and sends the neccessary data to the server
    document.querySelector('.channel').onsubmit = function() {
                    const channel = document.querySelector('#channelName').value;
                    socket.emit('create channel', {'channel': channel});
                    document.querySelector('#channelName').value = '';
                    return false;
                };

    //stores which channel the user currently is in and lets the server know the user changed channels so it can send the new information for that channel
    document.querySelector('#channel-change').onchange = function() {
                    localStorage.setItem('channel', this.value);
                    channel = localStorage.getItem('channel');
                    socket.emit('channel change');
                };

    //changes the users name that is stored
    document.querySelector('.name').onsubmit = function() {
        var name = document.querySelector('#changeName').value;
        localStorage.setItem('name', name);
        name = localStorage.getItem('name');
        document.querySelector('#name').innerHTML = name;
        document.querySelector('#changeName').value = '';
        return false;
    };

    //gets the information for a message, concatonates it into a string then sends the message back to the server
    document.querySelector('.message').onsubmit = function() {
        var date = new Date();
        var name = localStorage.getItem('name');
        var message = document.querySelector('#messageSent').value;
        const channel = localStorage.getItem('channel');
        message = name + ' said "' + message + '" at ' + date.getHours() + ':' + date.getMinutes() + ' on ' + (date.getMonth()+1) + '/' + date.getDate();

        socket.emit('create message',{'channel':channel}, {'message': message});
        document.querySelector('#messageSent').value = '';
        return false;
    };

    //when there is a new channel created adds it to the current list of channels
    socket.on('new channel', channel =>
    {
        const option = document.createElement('option');
        option.innerHTML = channel;
        option.id = channel;
        document.querySelector('#channel-change').append(option);
    });

    //when there is a new message checks if that message is in the current channel the user is in, and if it is it displays it.
    socket.on('new message', (message,channel) =>
    {
        if (channel == localStorage.getItem('channel'))
        {
            const li = document.createElement('li');
            li.innerHTML = urlify(message);
            document.querySelector('#messages').append(li);
        }
    });
});

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

function clearMessages(){
    console.log("hi")
    document.querySelector('#messages').innerHTML = '';
};

document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        var name = localStorage.getItem('name');
        if (name == 'null')
        {
            localStorage.setItem('name','not set');
        }
        currentChannel = localStorage.getItem('channel');
        if (currentChannel == 'null')
        {
            localStorage.setItem('channel','general');
        }
        document.querySelector('#name').append(name);
        socket.emit('connecting');
    });

    // When connected, configure stuff
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

    document.querySelector('.channel').onsubmit = function() {
                    const channel = document.querySelector('#channelName').value;
                    socket.emit('create channel', {'channel': channel});
                    document.querySelector('#channelName').value = '';
                    return false;
                };

    document.querySelector('#channel-change').onchange = function() {
                    localStorage.setItem('channel', this.value);
                    channel = localStorage.getItem('channel');

                    socket.emit('channel change');
                };

    document.querySelector('.name').onsubmit = function() {
        var name = document.querySelector('#changeName').value;
        localStorage.setItem('name', name);
        name = localStorage.getItem('name');
        document.querySelector('#name').innerHTML = name;
        document.querySelector('#changeName').value = '';
        return false;
    };

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


    /*
    var date = new Date(); // for now
        date.getHours(); // => 9
        date.getMinutes(); // =>  30
        date.getSeconds(); // => 51
    */

    socket.on('new channel', channel =>
    {
        const option = document.createElement('option');
        option.innerHTML = channel;
        option.id = channel;
        document.querySelector('#channel-change').append(option);
    });

    socket.on('new message', message =>
    {
        const li = document.createElement('li');
        li.innerHTML = urlify(message);
        document.querySelector('#messages').append(li);
    });
});

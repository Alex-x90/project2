document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure stuff
    socket.on('connect', () =>
    {

    });


    if (!localStorage.getItem('name'))
    {
        var name = prompt("Please enter your username");
        localStorage.setItem('name',name);
    }

    document.querySelector('.channel').onsubmit = function() {
                    const channel = document.querySelector('#channelName').value;
                    socket.emit('create channel', {'channel': channel});
                };

    document.querySelector('.message').onsubmit = function() {
            var date = new Date();
            name = localStorage.getItem('name');
            const message = document.querySelector('#messageSent').value;
            socket.emit('create message', {'message': message},{'date':date},{'name':name});
        };
    /*
    var date = new Date(); // for now
        date.getHours(); // => 9
        date.getMinutes(); // =>  30
        date.getSeconds(); // => 51

    socket.emit('create message', {'message': messaage},{'date':date},{'name':name});
    */

    socket.on('new channel', placeHolder =>
    {

    });

    socket.on('new message', placeHolder =>
    {

    });
});

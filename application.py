import os
import requests
import json

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit
import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


# dictionary of channels with a list as the data pair
channel_list = {}
channel_list['general'] = []

#stores initial message
channel_list['general'].append('Chat Bot said "Welcome to ChatterBot!" at 14:52 on 7/23')

#adds a message to the proper channel
@socketio.on("create message")
def message(channel,message):
    channel_list[f"{channel['channel']}"].append(message['message'])

    #if the number of messages in a channel is over 100 it deletes the value in the 0 index and stores the new message
    if len(channel_list[f"{channel['channel']}"]) > 100:
        del channel_list[f"{channel['channel']}"][0]
        emit("new message", channel_list[f"{channel['channel']}"][99], broadcast=True)

    #else it stores the message and returns the newest message
    else:
        value = len(channel_list[f"{channel['channel']}"])
        emit("new message", (channel_list[f"{channel['channel']}"][value-1],f"{channel['channel']}"), broadcast=True)

#sends data that allows the js to set up everything when it initially connects
@socketio.on("connecting")
def connect():
    channel = json.dumps(channel_list)
    emit("connected", channel, broadcast=False)

#when a user changes channel returns the channel data so the js can set up the page for that channel
@socketio.on("channel change")
def message_load():
    channel = json.dumps(channel_list)
    emit("message load", channel, broadcast=False)

#creates a new channel in the dict
@socketio.on("create channel")
def channel(channel):
    channel_list[f"{channel['channel']}"] = []
    emit("new channel", f"{channel['channel']}", broadcast=True)

#renders the page initially
@app.route("/")
def index():
    return render_template("index.html")

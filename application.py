import os
import requests
import json

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit
import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


# list of all channels
channel_list = {}
channel_list['general'] = []

#sets up storage for messages
channel_list['general'].append('Chat Bot said "Welcome to ChatterBot!" at 14:52 on 7/23')

@socketio.on("create message")
def message(channel,message):
    channel_list[f"{channel['channel']}"].append(message['message'])
    if len(channel_list[f"{channel['channel']}"]) > 100:
        del channel_list[f"{channel['channel']}"][0]
        emit("new message", channel_list[f"{channel['channel']}"][99], broadcast=True)
    else:
        value = len(channel_list[f"{channel['channel']}"])
        emit("new message", channel_list[f"{channel['channel']}"][value-1], broadcast=True)

@socketio.on("connecting")
def connect():
    channel = json.dumps(channel_list)
    emit("connected", channel, broadcast=False)

@socketio.on("channel change")
def message_load():
    channel = json.dumps(channel_list)
    emit("message load", channel, broadcast=False)

@socketio.on("create channel")
def channel(channel):
    channel_list[f"{channel['channel']}"] = []
    emit("new channel", f"{channel['channel']}", broadcast=True)

@app.route("/")
def index():
    return render_template("index.html")

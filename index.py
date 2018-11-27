## index.py
from __future__ import print_function
import os
import json
from pprint import pprint
from flask import Flask
from flask_ask import Ask, statement, question, session
from lgtv import lgtv

tv = None
app = Flask(__name__)
ask = Ask(app, '/')

@ask.launch
def start_skill():
    welcome_message = 'How should the t.v. update?'
    return question(welcome_message)


@ask.intent('ChangePowerIntent')
def change_power(power_value):
    print(power_value)
    if power_value == 'off':
        tv.turn_off()
    else:
        tv.turn_on()

    # Turn the TV on
    text = 'Turning the t.v. {}'.format(power_value)
    return statement(text)

@ask.intent('StartNetflix')
def start_netflix():
    tv.start_netflix()
    return statement('Starting netflix')


@ask.intent('Pause')
def pause():
    tv.pause()
    return statement('Ok')

@ask.intent('Play')
def play():
    tv.play()
    return statement('Ok')

@ask.intent('SetupVolume')
def set_volume(volume):
    tv.set_volume(int(volume))
    return statement('Done')


if __name__ == '__main__':
    tv = lgtv.lgtv()
    app.run(debug=True)
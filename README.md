# Bridge Alexa to LG tv
Controll LG tv using Alexa.

## Install on Raspi
```
  pip3 install flask flask-ask wakeonlan pylgtv 'cryptography<2.2'
  wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-arm.zip
```


## Setup Skill
Follow this guide to configure the Alexa Skill
https://hackernoon.com/make-your-tv-voice-controlled-through-amazon-alexa-and-raspberry-pi-a6373b7cf871
using the ```intent.json``` from the root folder.

## Run
```
./ngrok http 5000
python3 index.py
```

Tested on raspberryPi with Python version 3.5

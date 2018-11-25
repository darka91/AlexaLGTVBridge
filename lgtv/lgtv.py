from .tvHelper import LGTVScan
from pylgtv import WebOsClient
import wakeonlan as wol

import sys
import logging
logging.basicConfig(stream=sys.stdout, level=logging.INFO)

class lgtv(object):
    def __init__(self):
        devices = LGTVScan()
        if len(devices) == 0:
            raise Exception('No device found')
        print(devices[0])
        self.tv = devices[0]['address']
        self._setup_lg_lib()

    def _setup_lg_lib(self):
        try:
            self.webos_client = WebOsClient(self.tv)
            self.mac = self.webos_client.get_software_info()['device_id'].replace(':','.')
        except:
            print("Error connecting to TV")
    
    def turn_off(self):
        self.webos_client.power_off()
    
    def turn_on(self):
        wol.send_magic_packet(self.mac)

    def start_netflix(self):
        self.webos_client.launch_app('netflix')
    
    def pause(self):
        self.webos_client.pause()
    
    def play(self):
        self.webos_client.play()
        
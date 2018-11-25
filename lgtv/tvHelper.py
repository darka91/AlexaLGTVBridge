# -*- coding: utf-8 -*-
from types import FunctionType
import wakeonlan as wol
import json
import socket
import subprocess
import re
import os
import sys
import urllib

def LGTVScan(first_only=False):
    request = 'M-SEARCH * HTTP/1.1\r\n' \
              'HOST: 239.255.255.250:1900\r\n' \
              'MAN: "ssdp:discover"\r\n' \
              'MX: 2\r\n' \
              'ST: urn:schemas-upnp-org:device:MediaRenderer:1\r\n\r\n'

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(1)

    addresses = []
    attempts = 4
    while attempts > 0:
        sock.sendto(request.encode(), ('239.255.255.250', 1900))
        uuid = None
        address = None
        data = {}
        try:
            response, address = sock.recvfrom(512)
            for line in response.decode().split('\n'):
                if line.startswith("USN"):
                    uuid = re.findall(r'uuid:(.*?):', line)[0]
                data = {
                    'uuid': uuid,
                    'address': address[0]
                }
        except Exception as e:
            attempts -= 1
            continue

        if re.search('LGE', response.decode()):
            if first_only:
                sock.close()
                return data
            else:
                addresses.append(data)

        attempts -= 1

    sock.close()
    if first_only:
        return []

    if len(addresses) == 0:
        return []

    return addresses    

print(LGTVScan())
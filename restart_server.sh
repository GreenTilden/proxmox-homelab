#!/bin/bash
ssh -T -o BatchMode=yes -o StrictHostKeyChecking=no root@192.168.0.99 "pkill -f command_server.py && nohup python3 /root/mc-server/command_server.py > /root/mc-server/server.log 2>&1 &"

#!/bin/bash
scp -o BatchMode=yes -o StrictHostKeyChecking=no mc-server/command_server.py root@192.168.0.99:/root/mc-server/command_server.py

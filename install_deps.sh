#!/bin/bash
ssh -T -o BatchMode=yes -o StrictHostKeyChecking=no root@192.168.0.99 "pip3 install flask-cors"

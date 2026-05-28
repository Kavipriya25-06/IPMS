#!/usr/bin/bash
sudo cp /home/ubuntu/new_inventory_structure_17-10-24/new_project_structure/gunicorn/gunicorn.socket  /etc/systemd/system/gunicorn.socket
sudo cp /home/ubuntu/new_inventory_structure_17-10-24/new_project_structure/gunicorn/gunicorn.service  /etc/systemd/system/gunicorn.service

sudo systemctl start gunicorn.service
sudo systemctl enable gunicorn.service

#!/bin/bash

url=http://backend-927183125.us-east-1.elb.amazonaws.com/health-check
interval=30

echo "########## $(date) - Starting Health Check Monitor ########## "
echo "$(date) - Checking $url every $interval seconds"
while true; do
    response=$(curl -s -o /dev/null -w "%{http_code}" $url)
    if [[ $response -eq 200 ]]; then
        echo "$(date) | $(tput setaf 2)$response$(tput sgr0)"
    else
        echo "$(date) | $(tput setaf 1)$response$(tput sgr0)"
    fi
    sleep $interval
done
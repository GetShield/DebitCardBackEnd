#!/bin/bash

message=$1

if [ -z "$message" ]; then
    echo "Error: Message parameter is empty"
    exit 1
fi

git checkout main
git add .
git commit -m "$message"
git push

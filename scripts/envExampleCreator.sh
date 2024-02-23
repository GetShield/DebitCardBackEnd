#!/bin/bash

# Read .env file
while IFS='=' read -r name value
do
  # Write name to env.example
  echo "${name}=" >> .env.example
done < .env
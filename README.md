# Debit Card Back-End

This repository contains the back-end code for the Shield Debit Card application.

## Tech Stack

The Debit Card Back-End is built using the following technologies:

- Node.js: A JavaScript runtime environment that allows us to run JavaScript code on the server-side.
- Express.js: A fast and minimalist web application framework for Node.js.
- MongoDB: A popular NoSQL database for storing and retrieving data.
- TypeScript: A typed superset of JavaScript that compiles to plain JavaScript.

## Configuration

Before running the application, make sure to configure the following:

- .env: create an .env file based on env.example

## Scripts

The `scripts` folder contains the following scripts:

- runNgrok.sh: This script checks out the main branch, pulls the latest version, and runs your project in development mode.

- envExampleCreator.sh: This script reads your .env file and creates a .env.example file, which includes all the variable names from .env but without the values.

- connectToServer.sh: This script uses SSH to connect to your server. It uses the DebitCard.pem key and the server's address.

- simpleCommit.sh: This script takes a commit message as a parameter, checks out the main branch, stages all changes, commits them with the provided message, and pushes the commit to the main branch.

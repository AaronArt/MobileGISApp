# Mobile GIS App

## Overview

This project is a mobile GIS application built with Expo and React Native. The app allows users to find and navigate to nearby touristic places using Google Maps. Users can play a game by visiting these places and answering questions to gain points. Upon visiting all places and answering all questions correctly, the app displays a congratulatory message and allows the user to restart the game.

## Features

- Location-based services to find the nearest touristic places.
- Integration with Google Maps to show routes and locations.
- A game where users answer questions at each location to gain points.
- Persistent state to track visited places and answered questions.
- A restart feature to play the game again.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/AaronArt/MobileGISApp.git
   cd MobileGISApp
   
Install Dependencies

Make sure you have npm or yarn installed, then run:

bash
Copy code
npm install

Start the Development Server

bash
Copy code
npm start
This will start the Expo development server.

## Configuration
Google Maps API Key
Make sure to set your Google Maps API key in the MapViewDirections component.

Icon and Splash Screen
Replace the default icons and splash screen by updating the files in the assets directory and configuring the paths in app.json.

## Usage
Finding Nearest Places
Open the app and allow location permissions.
Press the "Get Location" button to center the map on your current location.
The map will display nearby touristic places as red markers.
### Playing the Game
Tap on a red marker to view details about the place and answer a question.
Answer the question correctly to turn the marker green and remove it from the map.
Visit all places and answer all questions to complete the game and see a congratulatory message.
### Restarting the Game
After completing the game, press the "Restart" button to play again with all places available.


# Developed By
Developed by Group 1: Aaron Artunduaga. All rights reserved.

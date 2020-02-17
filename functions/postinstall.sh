#!/bin/bash

# pull source from original repo
git clone https://github.com/justadudewhohacks/face-api.js 

# copy out tensorflow saved models to models/ folder
mv face-api.js/weights/ models/ 

# copy out face-api.min.js library to public/ folder
mv face-api.js/dist/face-api.min.js ../public/face-api.min.js

# remove folder after copied
rm -rf face-api.js
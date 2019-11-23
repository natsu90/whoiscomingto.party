#!/bin/bash

# pull source from original repo
git clone https://github.com/justadudewhohacks/face-api.js 

# copy out tensorflow saved models to models/ folder
mv face-api.js/weights/ models/ 

# copy out face-api.min.js library to libs/ folder
mv face-api.js/dist/face-api.min.js libs/face-api.min.js

# remove folder after copied
rm -rf face-api.js
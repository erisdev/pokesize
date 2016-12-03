#!/bin/sh

mkdir -p build
browserify -o build/bundle.js js/index.js
# rsync -r css vendor dist/

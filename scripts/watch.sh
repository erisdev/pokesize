#!/bin/sh

mkdir -p build
watchify -o build/bundle.js js/index.js

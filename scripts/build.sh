#!/bin/sh

if [[ $1 == watch ]]; then
    browserify=watchify
else
    browserify=browserify
fi

mkdir -p build
$browserify -o build/bundle.js js/index.js \
    -t [ babelify --extensions .js --presets es2015 ]

# rsync -r css vendor dist/

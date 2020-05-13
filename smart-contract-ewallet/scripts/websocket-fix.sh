#!/usr/bin/env bash
# Catch all script to fix/patch boo-boos in third-party libraries

# For RN 0.55.0 and up
# Download patch file and patch Websocket.js
wget https://github.com/facebook/react-native/commit/4b6e9d3dfd213689c5b319a4efee8d4f606d6f9d.patch
patch $PWD/../node_modules/react-native/Libraries/WebSocket/WebSocket.js 4b6e9d3dfd213689c5b319a4efee8d4f606d6f9d.patch
rm -f 4b6e9d3dfd213689c5b319a4efee8d4f606d6f9d.patch

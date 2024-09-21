#!/bin/bash

# Kill background processes on exit
trap 'kill $(jobs -p)' EXIT

# Check if fswatch is installed
if ! command -v fswatch &> /dev/null
then
    echo "fswatch is not installed. Please install it first."
    echo "You can install it using Homebrew: brew install fswatch"
    exit 1
fi

# Start npx serve in the background
npx serve . &

# Watch for changes and rebuild
fswatch -o src | while read f; do
    echo "Change detected. Running build..."
    node build.cjs
done &

# Wait for all background processes to finish
wait

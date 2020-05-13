#!/bin/sh

set -e

if [ "$1" = 'npm' ]; then
    exec "$@"
fi

# As argument is not related to npm,
# then assume that user wants to run his own process,
# for example a `bash` shell to explore this image
exec "$@"
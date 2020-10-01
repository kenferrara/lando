#!/bin/sh

set -e

# Get the key and comment
PUB_KEY="$1"

# Get the lando logger
. /helpers/log.sh
# Set the module
LANDO_MODULE="showkey"

# Make sure we are set up for success
mkdir -p /lando/keys

lando_print "weghweg"

# Provide instructions for the pubkey if we have it
if [ -f "/lando/keys/$PUB_KEY" ]; then
  cat "/lando/keys/$PUB_KEY"
fi

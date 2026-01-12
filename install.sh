#!/usr/bin/env bash
set -e

APP="pibox"
BIN="/usr/local/bin/$APP"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/$APP"
CONFIG_FILE="$CONFIG_DIR/hosts.conf"

echo "Installing $APP..."

# 1) Install binary
sudo cp "$APP" "$BIN"
sudo chmod +x "$BIN"

# 2) Install config directory
mkdir -p "$CONFIG_DIR"

# 3) Install example config if user doesn't have one
if [ ! -f "$CONFIG_FILE" ]; then
  cp hosts.conf.example "$CONFIG_FILE"
  echo "Installed example config to $CONFIG_FILE"
else
  echo "Config already exists: $CONFIG_FILE (not overwriting)"
fi

echo
echo "$APP installed!"
echo "Edit your hosts here:"
echo "  $CONFIG_FILE"
echo
echo "Run with:"
echo "  pibox"

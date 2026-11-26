#!/bin/sh
# Saves your Anthropic API key into .env (hidden input, never printed).
cd "$(dirname "$0")/.." || exit 1
printf "Anthropic API key paste karke Enter dabayein (screen par dikhegi nahi): "
stty -echo 2>/dev/null
read -r key
stty echo 2>/dev/null
echo
key=$(printf '%s' "$key" | tr -d '[:space:]"'"'")
if [ -z "$key" ]; then
  echo "Kuch paste nahi hua. Dobara chalayein: sh scripts/set-key.sh"
  exit 1
fi
printf 'ANTHROPIC_API_KEY=%s\n' "$key" > .env
echo "Saved ✓ (.env mein ${#key} characters)"

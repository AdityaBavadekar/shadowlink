#!/bin/bash
# if you change port in env or index.ts change it here too
echo "Run the following:"
echo "  pnpm run dev"
echo "  ngrok http http://localhost:8800/"

pnpm run dev &
ngrok http http://localhost:8800/ &
python send_live_url.py &

wait
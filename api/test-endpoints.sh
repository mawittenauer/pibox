#!/bin/bash

# Test script for pibox API endpoints
# Configure these variables before running
API_URL="${API_URL:-http://localhost:3000}"
TOKEN="${TOKEN:-test-token-12345}"
HOST="${HOST:-mypi}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "pibox API Endpoint Tests"
echo "=========================================="
echo "API URL: $API_URL"
echo "Token: ${TOKEN:0:10}..."
echo "Test Host: $HOST"
echo "=========================================="
echo ""

# Function to make API calls
call_api() {
  local method=$1
  local endpoint=$2
  local description=$3
  
  echo -e "${YELLOW}Testing: $description${NC}"
  echo "  $method $endpoint"
  
  if [[ "$method" == "GET" ]]; then
    curl -s -X GET \
      -H "Authorization: Bearer $TOKEN" \
      "$API_URL$endpoint" | jq '.'
  else
    curl -s -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      "$API_URL$endpoint" | jq '.'
  fi
  
  echo ""
}

# Test endpoints
echo -e "${GREEN}=== READ OPERATIONS (GET) ===${NC}"
echo ""

call_api "GET" "/health" "Health Check"
call_api "GET" "/api/hosts" "List All Hosts"
call_api "GET" "/api/hosts/$HOST" "Get Host Details"
call_api "GET" "/api/hosts/$HOST/uptime" "Get Uptime"
call_api "GET" "/api/hosts/$HOST/disk-usage" "Get Disk Usage"
call_api "GET" "/api/hosts/$HOST/memory" "Get Memory Usage"
call_api "GET" "/api/hosts/$HOST/systemctl" "Get Systemctl Status"

echo ""
echo -e "${GREEN}=== WRITE OPERATIONS (POST) ===${NC}"
echo ""

call_api "POST" "/api/hosts/$HOST/update" "Update Packages"
call_api "POST" "/api/hosts/$HOST/reboot" "Reboot Host"
call_api "POST" "/api/hosts/$HOST/poweroff" "Power Off Host"

echo ""
echo -e "${GREEN}=== ENDPOINT SUMMARY ===${NC}"
echo ""
echo "Available endpoints:"
echo ""
echo "READ (GET):"
echo "  GET  /health"
echo "  GET  /api/hosts"
echo "  GET  /api/hosts/:name"
echo "  GET  /api/hosts/:name/uptime"
echo "  GET  /api/hosts/:name/disk-usage"
echo "  GET  /api/hosts/:name/memory"
echo "  GET  /api/hosts/:name/systemctl"
echo ""
echo "WRITE (POST):"
echo "  POST /api/hosts/:name/reboot"
echo "  POST /api/hosts/:name/poweroff"
echo "  POST /api/hosts/:name/update"
echo ""

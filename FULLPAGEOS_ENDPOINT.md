# FullPageOS Set-URL Endpoint

## Endpoint Details

**POST** `/api/hosts/:name/set-url`

Updates the display URL for FullPageOS servers.

## Requirements

- Host must exist in hosts.conf
- Host must have OS type set to `fullpageos`
- URL must be provided in request body
- URL must start with `http://` or `https://`
- Valid authentication token required

## Usage

### Request

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  http://localhost:3000/api/hosts/display/set-url
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "FullPageOS URL updated on display",
  "host": "display",
  "command": "set-url",
  "url": "https://example.com",
  "output": "Updated: /boot/firmware/fullpageos.txt\nNew URL: https://example.com"
}
```

## Error Handling

### Host Not Found (404)
```json
{
  "success": false,
  "error": "Host 'invalid' not found"
}
```

### Not a FullPageOS Host (400)
```json
{
  "success": false,
  "error": "Host 'mypi' is not a FullPageOS server (OS: linux)"
}
```

### Missing or Invalid URL (400)
```json
{
  "success": false,
  "error": "URL is required and must be a non-empty string"
}
```

### Invalid URL Format (400)
```json
{
  "success": false,
  "error": "URL must start with http:// or https://"
}
```

### SSH Connection Error (500)
```json
{
  "success": false,
  "error": "Failed to update URL on host",
  "details": "Connection refused",
  "stderr": "ssh: connect to host 192.168.1.101 port 22: Connection refused"
}
```

## Configuration

For the endpoint to work, you need:

1. **hosts.conf entry** with FullPageOS OS type:
   ```
   display|192.168.1.101|pi|22|fullpageos
   ```

2. **SSH access** from the API server to the FullPageOS device

3. **Passwordless sudo** or password auth configured (for the `sudo tee` command)

## How It Works

1. Validates request authentication
2. Checks host exists in configuration
3. Verifies host OS type is exactly `fullpageos`
4. Validates URL format
5. Executes SSH command to FullPageOS device
6. Updates `/boot/firmware/fullpageos.txt` or `/boot/fullpageos.txt`
7. Returns success or detailed error

## Testing

```bash
# Set a token
export TOKEN="test-token-12345"

# Update FullPageOS URL
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://myapp.local"}' \
  http://localhost:3000/api/hosts/display/set-url

# Test with invalid host (should fail with 404)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  http://localhost:3000/api/hosts/invalid/set-url

# Test with non-FullPageOS host (should fail with 400)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  http://localhost:3000/api/hosts/mypi/set-url
```

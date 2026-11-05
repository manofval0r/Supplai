<#
.SYNOPSIS
  Call the project-scoped Supplai Supabase MCP endpoint using the stored PAT.

.DESCRIPTION
  Reads SUPPLAI_SUPABASE_ACCESS_TOKEN from the environment (never takes a token
  argument), performs the MCP initialize handshake, then invokes one tool.
  Nothing is written to disk except transient request/response bodies.

.EXAMPLE
  ./tools/dev/supabase-mcp.ps1 -Tool list_migrations
  ./tools/dev/supabase-mcp.ps1 -Tool execute_sql -Arguments '{"query":"select 1"}'
#>
param(
  [Parameter(Mandatory = $true)][string]$Tool,
  [string]$Arguments = '{}',
  [string]$ProjectRef = 'nigoztdsmxunmcxminmx'
)

$ErrorActionPreference = 'Stop'
$token = $env:SUPPLAI_SUPABASE_ACCESS_TOKEN
if (-not $token) { throw 'SUPPLAI_SUPABASE_ACCESS_TOKEN is not set in this process.' }

$uri = "https://mcp.supabase.com/mcp?project_ref=$ProjectRef"
$tmp = Join-Path $env:TEMP ("supplai-mcp-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp | Out-Null

function Send-Mcp([string]$Body, [string]$Session) {
  $hdr = Join-Path $tmp 'hdr.txt'
  $out = Join-Path $tmp 'out.txt'
  $in = Join-Path $tmp 'in.json'
  [IO.File]::WriteAllText($in, $Body)
  $args = @(
    '-s', '-D', $hdr, '-o', $out, '--max-time', '90',
    '-X', 'POST', $uri,
    '-H', "Authorization: Bearer $token",
    '-H', 'Accept: application/json, text/event-stream',
    '-H', 'Content-Type: application/json',
    '-H', 'MCP-Protocol-Version: 2025-06-18'
  )
  if ($Session) { $args += @('-H', "Mcp-Session-Id: $Session") }
  $args += @('--data-binary', "@$in")
  curl.exe @args | Out-Null
  $headers = Get-Content $hdr -Raw
  $body = if (Test-Path $out) { Get-Content $out -Raw } else { '' }
  $sessionId = $null
  $m = [regex]::Match($headers, '(?im)^mcp-session-id:\s*(\S+)')
  if ($m.Success) { $sessionId = $m.Groups[1].Value }
  [pscustomobject]@{ Headers = $headers; Body = $body; Session = $sessionId }
}

try {
  $init = Send-Mcp '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"opencode","version":"1.0"}}}' $null
  $session = $init.Session
  Send-Mcp '{"jsonrpc":"2.0","method":"notifications/initialized"}' $session | Out-Null

  $escapedTool = $Tool | ConvertTo-Json
  $call = '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":' + $escapedTool + ',"arguments":' + $Arguments + '}}'
  $result = Send-Mcp $call $session
  $result.Body
}
finally {
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}

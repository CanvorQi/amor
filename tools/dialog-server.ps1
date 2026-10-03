# Amor - Diyalog editörü için yerel sunucu (diyalog-editoru.bat açar)
# Projeyi http://localhost:<port>/ adresinden sunar, editörün kaydettiği
# kelime/cümle değişikliklerini js/data/custom-dialog.js dosyasına yazar.
# Sadece bu bilgisayardan erişilir. Kapatmak için pencereyi kapat ya da Ctrl+C.

param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$dataFile = Join-Path $root 'js\data\custom-dialog.js'
$swFile = Join-Path $root 'sw.js'
$utf8 = New-Object System.Text.UTF8Encoding($false)

$MIME = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'
  '.webp' = 'image/webp'; '.gif' = 'image/gif'; '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'; '.txt' = 'text/plain; charset=utf-8'
}

function Send($ctx, [int]$code, [string]$type, [byte[]]$bytes) {
  $res = $ctx.Response
  $res.StatusCode = $code
  $res.ContentType = $type
  $res.Headers['Cache-Control'] = 'no-store'
  $res.ContentLength64 = $bytes.Length
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
  $res.OutputStream.Close()
}
function SendJson($ctx, [int]$code, [string]$json) { Send $ctx $code 'application/json; charset=utf-8' $utf8.GetBytes($json) }

function ReadDialog {
  if (-not (Test-Path $dataFile)) { return '{"intents":{},"lines":{}}' }
  $txt = [IO.File]::ReadAllText($dataFile, $utf8)
  $m = [regex]::Match($txt, '(?s)Amor\.CUSTOM_DIALOG\s*=\s*(.*?);\s*$')
  if ($m.Success) { return $m.Groups[1].Value }
  return '{"intents":{},"lines":{}}'
}

function BumpSw {
  $sw = [IO.File]::ReadAllText($swFile, $utf8)
  $m = [regex]::Match($sw, "amor-v(\d+)")
  if (-not $m.Success) { return $null }
  $next = 'amor-v' + ([int]$m.Groups[1].Value + 1)
  [IO.File]::WriteAllText($swFile, $sw.Replace($m.Value, $next), $utf8)
  return $next
}

function SaveDialog($ctx) {
  $reader = New-Object IO.StreamReader($ctx.Request.InputStream, $utf8)
  $body = $reader.ReadToEnd()
  $reader.Close()
  try { $obj = $body | ConvertFrom-Json } catch { SendJson $ctx 400 '{"ok":false,"error":"Geçersiz JSON"}'; return }
  if ($null -eq $obj -or $null -eq $obj.intents -or $null -eq $obj.lines) { SendJson $ctx 400 '{"ok":false,"error":"intents/lines eksik"}'; return }
  $old = ReadDialog
  if ($old.Trim() -eq $body.Trim()) { SendJson $ctx 200 '{"ok":true,"changed":false}'; return }
  $content = "/* diyalog-editoru.bat ile duzenlenir (tools/dialog-editor.html) */`nwindow.Amor = window.Amor || {};`nAmor.CUSTOM_DIALOG = $body;`n"
  [IO.File]::WriteAllText($dataFile, $content, $utf8)
  $ver = BumpSw
  Write-Host ("  kaydedildi  " + (Get-Date -Format 'HH:mm:ss') + "  (sw: $ver)") -ForegroundColor Green
  SendJson $ctx 200 ('{"ok":true,"changed":true,"sw":"' + $ver + '"}')
}

function ServeFile($ctx, [string]$path) {
  if ($path -eq '/') { $path = '/index.html' }
  $full = [IO.Path]::GetFullPath((Join-Path $root ($path.TrimStart('/') -replace '/', '\')))
  if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $full -PathType Leaf)) {
    SendJson $ctx 404 '{"error":"yok"}'; return
  }
  $ext = [IO.Path]::GetExtension($full).ToLower()
  $type = $MIME[$ext]
  if (-not $type) { $type = 'application/octet-stream' }
  Send $ctx 200 $type ([IO.File]::ReadAllBytes($full))
}

# Boş port bul
$listener = $null
foreach ($p in 8765..8785) {
  try {
    $l = New-Object System.Net.HttpListener
    $l.Prefixes.Add("http://localhost:$p/")
    $l.Start()
    $listener = $l; $port = $p; break
  } catch { }
}
if (-not $listener) { Write-Host 'Boş port bulunamadı (8765-8785).' -ForegroundColor Red; exit 1 }

$editor = "http://localhost:$port/tools/dialog-editor.html"
Write-Host ''
Write-Host '  Amor - Diyalog editörü' -ForegroundColor Magenta
Write-Host "  Editör:    $editor"
Write-Host "  Uygulama:  http://localhost:$port/"
Write-Host '  Kapatmak için bu pencereyi kapat (ya da Ctrl+C).'
Write-Host ''
if (-not $NoBrowser) { Start-Process $editor }

try {
  while ($listener.IsListening) {
    $task = $listener.GetContextAsync()
    while (-not $task.AsyncWaitHandle.WaitOne(300)) { }
    $ctx = $task.GetAwaiter().GetResult()
    try {
      $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      $method = $ctx.Request.HttpMethod
      if ($path -eq '/api/dialog' -and $method -eq 'GET') { SendJson $ctx 200 (ReadDialog) }
      elseif ($path -eq '/api/dialog' -and $method -eq 'POST') { SaveDialog $ctx }
      elseif ($method -eq 'GET') { ServeFile $ctx $path }
      else { SendJson $ctx 405 '{"error":"desteklenmiyor"}' }
    } catch {
      Write-Host ("  hata: " + $_.Exception.Message) -ForegroundColor Red
      try { SendJson $ctx 500 '{"ok":false,"error":"sunucu hatası"}' } catch { }
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}

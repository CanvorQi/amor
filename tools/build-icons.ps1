# Amor - PWA ikonlarini uretir (icons/*.png)
#   powershell -ExecutionPolicy Bypass -File tools/build-icons.ps1
# Not: Windows PowerShell 5.1 uyumu icin bu dosyada sadece ASCII karakter var.

Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$dir = Join-Path $root 'icons'
New-Item -ItemType Directory -Force $dir | Out-Null

function Draw-Icon([int]$size, [string]$file, [bool]$maskable) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::Transparent)

  $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
  $c1 = [System.Drawing.Color]::FromArgb(255, 167, 139, 250)
  $c2 = [System.Drawing.Color]::FromArgb(255, 123, 92, 255)
  $c3 = [System.Drawing.Color]::FromArgb(255, 255, 92, 170)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c3, 45
  $blend = New-Object System.Drawing.Drawing2D.ColorBlend 3
  $blend.Colors = @($c1, $c2, $c3)
  $blend.Positions = @(0.0, 0.5, 1.0)
  $brush.InterpolationColors = $blend

  if ($maskable) {
    $g.FillRectangle($brush, $rect)
  } else {
    # yuvarlak koseli kare
    $r = [int]($size * 0.22)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $r * 2, $r * 2, 180, 90)
    $path.AddArc($size - $r * 2, 0, $r * 2, $r * 2, 270, 90)
    $path.AddArc($size - $r * 2, $size - $r * 2, $r * 2, $r * 2, 0, 90)
    $path.AddArc(0, $size - $r * 2, $r * 2, $r * 2, 90, 90)
    $path.CloseFigure()
    $g.FillPath($brush, $path)
  }

  # kalp (maskable ikonda guvenli alan icin daha kucuk)
  $s = if ($maskable) { $size * 0.42 } else { $size * 0.56 }
  $cx = $size / 2; $cy = $size / 2 + $s * 0.04
  $heart = New-Object System.Drawing.Drawing2D.GraphicsPath
  $top = $cy - $s * 0.28
  $heart.AddBezier([single]$cx, [single]($top + $s * 0.12), [single]($cx - $s * 0.05), [single]($top - $s * 0.18), [single]($cx - $s * 0.5), [single]($top - $s * 0.12), [single]($cx - $s * 0.5), [single]($top + $s * 0.18))
  $heart.AddBezier([single]($cx - $s * 0.5), [single]($top + $s * 0.18), [single]($cx - $s * 0.5), [single]($top + $s * 0.45), [single]($cx - $s * 0.2), [single]($top + $s * 0.6), [single]$cx, [single]($top + $s * 0.78))
  $heart.AddBezier([single]$cx, [single]($top + $s * 0.78), [single]($cx + $s * 0.2), [single]($top + $s * 0.6), [single]($cx + $s * 0.5), [single]($top + $s * 0.45), [single]($cx + $s * 0.5), [single]($top + $s * 0.18))
  $heart.AddBezier([single]($cx + $s * 0.5), [single]($top + $s * 0.18), [single]($cx + $s * 0.5), [single]($top - $s * 0.12), [single]($cx + $s * 0.05), [single]($top - $s * 0.18), [single]$cx, [single]($top + $s * 0.12))
  $heart.CloseFigure()
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $g.FillPath($white, $heart)

  $bmp.Save((Join-Path $dir $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  Write-Output "icons/$file"
}

Draw-Icon 192 'icon-192.png' $false
Draw-Icon 512 'icon-512.png' $false
Draw-Icon 512 'icon-maskable-512.png' $true
Draw-Icon 180 'apple-touch-icon.png' $true

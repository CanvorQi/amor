# Amor - fotograf listesi uretici
# GitHub Pages klasor icerigini listeleyemez; bu yuzden characters/*/photos
# icindeki dosyalari js/data/photos.js icine yaziyoruz.
# Yeni klasor/fotograf ekledikten sonra proje kokunde calistir:
#   powershell -ExecutionPolicy Bypass -File tools/build-photos.ps1
# (Not: Windows PowerShell 5.1 uyumu icin bu dosyada sadece ASCII karakter var.)

$root = Split-Path -Parent $PSScriptRoot
$charDir = Join-Path $root 'characters'
$out = Join-Path $root 'js\data\photos.js'

$sets = @()
Get-ChildItem $charDir -Directory | Sort-Object Name | ForEach-Object {
  # fotograflar characters/<set>/photos/ icinde ya da dogrudan characters/<set>/ icinde olabilir
  $photoDir = Join-Path $_.FullName 'photos'
  $sub = 'photos/'
  if (-not (Test-Path $photoDir)) { $photoDir = $_.FullName; $sub = '' }
  $files = Get-ChildItem $photoDir -File | Where-Object { $_.Extension -match '^\.(jpe?g|png|webp)$' } | Sort-Object Name
  if (-not $files) { return }
  # profil fotografi: adinda "profile" gecen, yoksa ilk dosya
  $profile = ($files | Where-Object { $_.Name -match 'profile' } | Select-Object -First 1)
  if (-not $profile) { $profile = $files[0] }
  $others = $files | Where-Object { $_.Name -ne $profile.Name } | ForEach-Object { '"' + $_.Name + '"' }
  $sets += "  { id: `"$($_.Name)`", dir: `"$sub`", profile: `"$($profile.Name)`", photos: [$($others -join ', ')] }"
}

$js = @"
/* Otomatik uretildi: tools/build-photos.ps1 (elle duzenleme) */
window.Amor = window.Amor || {};
Amor.PHOTO_SETS = [
$($sets -join ",`n")
];
"@
[System.IO.File]::WriteAllText($out, $js, (New-Object System.Text.UTF8Encoding $false))
Write-Output "$($sets.Count) photo sets -> $out"

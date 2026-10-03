# Amor - karakter ekleme / düzenleme penceresi
# Proje kökündeki karakter-ekle.bat ile açılır.
# Tanımlar js/data/custom-characters.js içine yazılır; uygulama açılışta bunları ekler/günceller.
# Boş bırakılan alanlar (yaş, şehir, meslek...) uygulamada rastgele seçilir.
# Not: Türkçe metinler için bu dosya UTF-8 BOM ile kaydedilmeli (Windows PowerShell 5.1).

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[Windows.Forms.Application]::EnableVisualStyles()

$inv = [Globalization.CultureInfo]::InvariantCulture
$utf8 = New-Object System.Text.UTF8Encoding $false
$root = Split-Path -Parent $PSScriptRoot
$charDir = Join-Path $root 'characters'
$dataFile = Join-Path $root 'js\data\custom-characters.js'
$imgRx = '^\.(jpe?g|png|webp)$'

function ReadText([string]$p) { [IO.File]::ReadAllText($p, [Text.Encoding]::UTF8) }
function WriteText([string]$p, [string]$t) { [IO.File]::WriteAllText($p, $t, $utf8) }

# ---------- Uygulama verilerinden seçenekler ----------
$archs = @()
$archText = ReadText (Join-Path $root 'js\data\archetypes.js')
$rx = [regex]"id: '(\w+)',\s*\r?\n\s*label: '([^']+)'[\s\S]*?big5: \{ O: ([\d.]+), C: ([\d.]+), E: ([\d.]+), A: ([\d.]+), N: ([\d.]+) \}"
foreach ($m in $rx.Matches($archText)) {
  $g = $m.Groups
  $archs += [pscustomobject]@{
    id = $g[1].Value; label = $g[2].Value
    big5 = @{ O = [double]$g[3].Value; C = [double]$g[4].Value; E = [double]$g[5].Value; A = [double]$g[6].Value; N = [double]$g[7].Value }
  }
}
$traitText = ReadText (Join-Path $root 'js\data\traits.js')
$traitDefs = @([regex]::Matches($traitText, "id: '(\w+)', label: '([^']+)', icon: '[^']+',\s*\r?\n\s*desc: '([^']+)'") | ForEach-Object {
  [pscustomobject]@{ id = $_.Groups[1].Value; label = $_.Groups[2].Value; desc = $_.Groups[3].Value }
})
$poolText = ReadText (Join-Path $root 'js\data\pools.js')
$cities = @([regex]::Matches($poolText, "\{ name: '([^']+)', at:") | ForEach-Object { $_.Groups[1].Value })
$jobs = @([regex]::Matches($poolText, "\{ title: '([^']+)'") | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique)

# mood.js PRESETS ile aynı (valence, arousal, energy, social)
$presets = [ordered]@{
  'Coşkulu'           = @(0.75, 0.85, 0.8, 0.85)
  'Huzurlu'           = @(0.6, 0.25, 0.65, 0.7)
  'Gergin'            = @(-0.6, 0.8, 0.55, 0.35)
  'Üzgün'             = @(-0.65, 0.2, 0.35, 0.3)
  'Yorgun'            = @(0.0, 0.15, 0.1, 0.45)
  'Sosyal pili bitik' = @(-0.1, 0.3, 0.45, 0.08)
}

# ---------- Tanım dosyası ----------
$defs = New-Object System.Collections.ArrayList
function LoadDefs {
  $defs.Clear()
  if (-not (Test-Path -LiteralPath $dataFile)) { return }
  $t = ReadText $dataFile
  $i = $t.IndexOf('= ['); $j = $t.LastIndexOf(']')
  if ($i -lt 0 -or $j -lt $i) { return }
  $parsed = ConvertFrom-Json $t.Substring($i + 2, $j - $i - 1)
  foreach ($d in @($parsed)) { if ($null -ne $d) { [void]$defs.Add($d) } }
}
function SaveDefs {
  $json = if ($defs.Count) { ConvertTo-Json -InputObject @($defs.ToArray()) -Depth 6 } else { '[]' }
  WriteText $dataFile ("/* karakter-ekle.bat ile duzenlenir (tools/add-character.ps1) */`nwindow.Amor = window.Amor || {};`nAmor.CUSTOM_CHARACTERS = " + $json + ";`n")
}
# Telefonlar yeni dosyaları alsın diye service worker sürümünü artır
function BumpSw {
  $p = Join-Path $root 'sw.js'
  $r = [regex]'amor-v(\d+)'
  WriteText $p ($r.Replace((ReadText $p), { param($m) 'amor-v' + ([int]$m.Groups[1].Value + 1) }, 1))
}

# ---------- Fotoğraf yardımcıları ----------
function PhotoDir([string]$dir) { $p = Join-Path $dir 'photos'; if (Test-Path -LiteralPath $p) { $p } else { $dir } }
function Images([string]$dir) {
  @(Get-ChildItem -LiteralPath (PhotoDir $dir) -File | Where-Object { $_.Extension -match $imgRx } | Sort-Object Name)
}
# build-photos.ps1 ile aynı kural: adında "profile" geçen, yoksa ilk dosya
function AutoProfile($files) {
  $p = $files | Where-Object { $_.Name -match 'profile' } | Select-Object -First 1
  if ($p) { $p } else { $files[0] }
}
function Slug([string]$s) {
  $s = $s.Replace('İ', 'i').Replace('I', 'i').ToLowerInvariant()
  foreach ($p in @(@('ç', 'c'), @('ğ', 'g'), @('ı', 'i'), @('ö', 'o'), @('ş', 's'), @('ü', 'u'))) { $s = $s.Replace($p[0], $p[1]) }
  $s = ($s -replace '[^a-z0-9]+', '-').Trim('-')
  if (-not $s) { $s = 'karakter' }
  $s
}

# ---------- Arayüz yardımcıları ----------
$tip = New-Object Windows.Forms.ToolTip
$tip.AutoPopDelay = 15000
function Pt($x, $y) { New-Object Drawing.Point($x, $y) }
function Sz($w, $h) { New-Object Drawing.Size($w, $h) }
function Lbl($parent, $text, $x, $y, $w = 115) {
  $l = New-Object Windows.Forms.Label
  $l.Text = $text; $l.Location = Pt $x $y; $l.Size = Sz $w 24; $l.TextAlign = 'MiddleLeft'
  $parent.Controls.Add($l); $l
}
function Ctl($parent, $type, $x, $y, $w, $h = 24) {
  $c = New-Object "Windows.Forms.$type"
  $c.Location = Pt $x $y; $c.Size = Sz $w $h
  $parent.Controls.Add($c); $c
}
function Combo($parent, $x, $y, $w, $items) {
  $c = Ctl $parent 'ComboBox' $x $y $w
  $c.DropDownStyle = 'DropDownList'; $c.MaxDropDownItems = 15
  foreach ($i in $items) { [void]$c.Items.Add($i) }
  $c
}
function Hint($parent, $text, $x, $y, $w, $h = 20) {
  $l = Lbl $parent $text $x $y $w
  $l.Height = $h; $l.ForeColor = [Drawing.Color]::Gray; $l.TextAlign = 'TopLeft'; $l
}
function Slider($parent, $text, $tipText, $y, $min, $max) {
  $l = Lbl $parent $text 12 ($y + 2) 170
  $tip.SetToolTip($l, $tipText)
  $tb = Ctl $parent 'TrackBar' 185 $y 290 30
  $tb.AutoSize = $false; $tb.Minimum = $min; $tb.Maximum = $max
  $tb.TickStyle = 'None'; $tb.SmallChange = 1; $tb.LargeChange = 10
  $tip.SetToolTip($tb, $tipText)
  $tb.Tag = Lbl $parent '0.00' 480 ($y + 2) 50
  $tb.Add_ValueChanged({ $this.Tag.Text = ($this.Value / 100).ToString('0.00', $inv) })
  $tb
}
function SetVal($tb, $v) {
  $tb.Value = [Math]::Max($tb.Minimum, [Math]::Min($tb.Maximum, [int][Math]::Round([double]$v * 100)))
  $tb.Tag.Text = ($tb.Value / 100).ToString('0.00', $inv)
}
function Warn($m) { [void][Windows.Forms.MessageBox]::Show($form, $m, 'Amor', 'OK', 'Warning') }
function Info($m) { [void][Windows.Forms.MessageBox]::Show($form, $m, 'Amor', 'OK', 'Information') }

# ---------- Pencere ----------
$form = New-Object Windows.Forms.Form
$form.Text = 'Amor - Karakter ekle'
$form.Font = New-Object Drawing.Font('Segoe UI', 9.5)
$form.StartPosition = 'CenterScreen'
$form.ClientSize = Sz 600 720
$form.MinimumSize = Sz 620 400
$form.MaximizeBox = $false

$body = New-Object Windows.Forms.Panel
$body.Dock = 'Fill'; $body.AutoScroll = $true
$bar = New-Object Windows.Forms.Panel
$bar.Dock = 'Bottom'; $bar.Height = 54
$form.Controls.Add($body); $form.Controls.Add($bar); $body.BringToFront()

# Düzenlenecek karakter
[void](Lbl $body 'Karakter' 12 12)
$cbEdit = Combo $body 130 12 300 @()
$btnDel = Ctl $body 'Button' 440 11 130 26
$btnDel.Text = 'Tanımı sil'

# Fotoğraflar
$gPhoto = Ctl $body 'GroupBox' 12 50 560 175
$gPhoto.Text = 'Fotoğraflar'
[void](Lbl $gPhoto 'Klasör' 10 26 70)
$tbFolder = Ctl $gPhoto 'TextBox' 80 26 250
$tbFolder.ReadOnly = $true
$btnFolder = Ctl $gPhoto 'Button' 336 25 75 26
$btnFolder.Text = 'Seç...'
[void](Lbl $gPhoto 'Profil' 10 60 70)
$cbProfile = Combo $gPhoto 80 60 331 @()
$lblCount = Hint $gPhoto '' 80 90 330
[void](Hint $gPhoto ("Klasördeki tüm fotoğraflar albüme eklenir. Klasör " + [char]0x201C + "characters" + [char]0x201D + " dışındaysa oraya kopyalanır.") 10 112 400 50)
$pic = Ctl $gPhoto 'PictureBox' 425 20 125 145
$pic.SizeMode = 'Zoom'; $pic.BackColor = [Drawing.Color]::WhiteSmoke

# Kimlik
$y = 240
[void](Lbl $body 'İsim' 12 $y);          $tbName = Ctl $body 'TextBox' 130 $y 200
$y += 32
[void](Lbl $body 'Kişilik' 12 $y);       $cbArch = Combo $body 130 $y 200 ($archs | ForEach-Object { $_.label })
$y += 32
[void](Lbl $body 'Yaş' 12 $y);           $tbAge = Ctl $body 'TextBox' 130 $y 60
[void](Lbl $body 'Boy (cm)' 230 $y 70);  $tbHeight = Ctl $body 'TextBox' 300 $y 60
[void](Hint $body 'boş = rastgele' 375 ($y + 3) 150)
$y += 32
[void](Lbl $body 'Şehir' 12 $y);         $cbCity = Combo $body 130 $y 200 (@('(rastgele)') + $cities)
$y += 32
[void](Lbl $body 'Meslek' 12 $y);        $cbJob = Combo $body 130 $y 300 (@('(rastgele)') + $jobs)
$y += 32
[void](Lbl $body 'Biyografi' 12 $y);     $tbBio = Ctl $body 'TextBox' 130 $y 440
[void](Hint $body 'boş = kişiliğe uygun rastgele bir biyografi' 130 ($y + 26) 400)

# Kişilik (Big Five)
$y += 60
$chkBig5 = Ctl $body 'CheckBox' 12 $y 560
$chkBig5.Text = 'Kişilik değerlerini kendim belirleyeyim'
$y += 26
$gBig5 = Ctl $body 'GroupBox' 12 $y 560 200
$gBig5.Text = 'Kişilik (0 = düşük, 1 = yüksek)'
$b5 = [ordered]@{}
$b5.O = Slider $gBig5 'Açıklık' 'Merak, yeni şeylere ilgi, hayal gücü.' 24 0 100
$b5.C = Slider $gBig5 'Sorumluluk' 'Düzen, planlılık, disiplin.' 56 0 100
$b5.E = Slider $gBig5 'Dışadönüklük' 'Sosyal enerji. Yüksekse normal ruh hali daha hareketli olur ve sosyal pili daha dolu kalır.' 88 0 100
$b5.A = Slider $gBig5 'Uyumluluk' 'Sıcaklık, anlayış, uzlaşmacılık.' 120 0 100
$b5.N = Slider $gBig5 'Duygusal hassasiyet' 'Nevrotiklik. Yüksekse normal moral seviyesi düşer ve kötü ruh hali daha uzun sürer.' 152 0 100
[void](Hint $gBig5 'İşaretli değilse seçilen kişiliğin değerleri (küçük rastgele farklarla) kullanılır.' 12 178 540)

# Huylar (js/data/traits.js)
$y += 215
$chkTraits = Ctl $body 'CheckBox' 12 $y 560
$chkTraits.Text = 'Huylarını kendim seçeyim'
$y += 26
$traitRows = [Math]::Ceiling($traitDefs.Count / 2)
$gTraits = Ctl $body 'GroupBox' 12 $y 560 (54 + $traitRows * 28)
$gTraits.Text = 'Huylar'
$traitBoxes = [ordered]@{}
for ($i = 0; $i -lt $traitDefs.Count; $i++) {
  $t = $traitDefs[$i]
  $cb = Ctl $gTraits 'CheckBox' (12 + ($i % 2) * 270) (24 + [Math]::Floor($i / 2) * 28) 260
  $cb.Text = $t.label
  $tip.SetToolTip($cb, $t.desc)
  $traitBoxes[$t.id] = $cb
}
[void](Hint $gTraits 'İşaretli değilse kişiliğe göre rastgele seçilir (ihtimaller diyalog editöründe). Üzerine gelince açıklaması görünür.' 12 (26 + $traitRows * 28) 540)

# Ruh hali
$y += $gTraits.Height + 15
$chkMood = Ctl $body 'CheckBox' 12 $y 560
$chkMood.Text = 'Başlangıç ruh halini belirleyeyim'
$y += 26
$gMood = Ctl $body 'GroupBox' 12 $y 560 245
$gMood.Text = 'Ruh hali'
[void](Lbl $gMood 'Hazır ayar' 12 24 170)
$cbPreset = Combo $gMood 185 24 200 (@('(seç)') + @($presets.Keys))
$mv = [ordered]@{}
$mv.valence = Slider $gMood 'Mutluluk (-1 / +1)' 'Valence: -1 mutsuz, +1 mutlu.' 58 -100 100
$mv.arousal = Slider $gMood 'Heyecan' 'Arousal: 0 sakin, 1 heyecanlı / gergin.' 90 0 100
$mv.energy = Slider $gMood 'Enerji' '0 yorgun, 1 dinç.' 122 0 100
$mv.social = Slider $gMood 'Sosyal pil' '0 bitik (çevrimdışı olur), 1 konuşmak istiyor.' 154 0 100
$chkLock = Ctl $gMood 'CheckBox' 12 188 540
$chkLock.Text = 'Sabitle (zamanla kendiliğinden değişmesin)'
[void](Hint $gMood 'Sabit değilse zamanla kişiliğine göre normale döner. Değiştirip kaydedince uygulamada bir kez yeniden uygulanır.' 12 212 540 30)

# Alt düğmeler
$btnSave = Ctl $bar 'Button' 340 12 120 32
$btnSave.Text = 'Kaydet'
$btnClose = Ctl $bar 'Button' 470 12 110 32
$btnClose.Text = 'Kapat'
$form.AcceptButton = $btnSave

# ---------- Davranış ----------
$script:editing = $null

function ArchDefaults {
  if ($chkBig5.Checked -or $cbArch.SelectedIndex -lt 0) { return }
  $a = $archs[$cbArch.SelectedIndex]
  foreach ($k in @($b5.Keys)) { SetVal $b5[$k] $a.big5[$k] }
}
function SetMood($vals) {
  SetVal $mv.valence $vals[0]; SetVal $mv.arousal $vals[1]; SetVal $mv.energy $vals[2]; SetVal $mv.social $vals[3]
}
function RefreshPhotos {
  $cbProfile.Items.Clear(); $pic.Image = $null; $lblCount.Text = ''
  $dir = $tbFolder.Text
  if (-not $dir -or -not (Test-Path -LiteralPath $dir)) { return }
  $files = Images $dir
  foreach ($f in $files) { [void]$cbProfile.Items.Add($f.Name) }
  $lblCount.Text = "$($files.Count) fotoğraf"
  if ($files.Count) { $cbProfile.SelectedItem = (AutoProfile $files).Name }
}
function ClearForm {
  $tbFolder.Text = ''; RefreshPhotos
  $tbName.Text = ''; $tbAge.Text = ''; $tbHeight.Text = ''; $tbBio.Text = ''
  $cbArch.SelectedIndex = 0; $cbCity.SelectedIndex = 0; $cbJob.SelectedIndex = 0
  $chkBig5.Checked = $false; ArchDefaults
  $chkTraits.Checked = $false; foreach ($cb in $traitBoxes.Values) { $cb.Checked = $false }
  $chkMood.Checked = $false; $chkLock.Checked = $false; $cbPreset.SelectedIndex = 0
  SetMood $presets['Huzurlu']
  $gBig5.Enabled = $false; $gTraits.Enabled = $false; $gMood.Enabled = $false
}
function FillForm($d) {
  $tbFolder.Text = Join-Path $charDir $d.setId; RefreshPhotos
  $tbName.Text = $d.name
  $ai = 0; for ($i = 0; $i -lt $archs.Count; $i++) { if ($archs[$i].id -eq $d.archetype) { $ai = $i } }
  $cbArch.SelectedIndex = $ai
  $tbAge.Text = if ($d.age) { "$($d.age)" } else { '' }
  $tbHeight.Text = if ($d.height) { "$($d.height)" } else { '' }
  $cbCity.SelectedIndex = if ($d.city -and $cbCity.Items.Contains($d.city)) { $cbCity.Items.IndexOf($d.city) } else { 0 }
  $cbJob.SelectedIndex = if ($d.job -and $cbJob.Items.Contains($d.job)) { $cbJob.Items.IndexOf($d.job) } else { 0 }
  $tbBio.Text = if ($d.bio) { $d.bio } else { '' }
  $chkBig5.Checked = [bool]$d.big5
  if ($d.big5) { foreach ($k in @($b5.Keys)) { SetVal $b5[$k] $d.big5.$k } } else { ArchDefaults }
  $chkTraits.Checked = $null -ne $d.traits
  foreach ($k in @($traitBoxes.Keys)) { $traitBoxes[$k].Checked = @($d.traits) -contains $k }
  $gTraits.Enabled = $chkTraits.Checked
  $cbPreset.SelectedIndex = 0
  $chkMood.Checked = [bool]$d.mood
  if ($d.mood) { SetMood @($d.mood.valence, $d.mood.arousal, $d.mood.energy, $d.mood.social) } else { SetMood $presets['Huzurlu'] }
  $chkLock.Checked = [bool]$d.moodLocked
  $gBig5.Enabled = $chkBig5.Checked; $gMood.Enabled = $chkMood.Checked
}
function PickChar {
  if ($script:loadingList) { return }
  if ($cbEdit.SelectedIndex -le 0) {
    $script:editing = $null; ClearForm
    $btnDel.Enabled = $false; $form.Text = 'Amor - Karakter ekle'
  } else {
    $script:editing = $defs[$cbEdit.SelectedIndex - 1]; FillForm $script:editing
    $btnDel.Enabled = $true; $form.Text = "Amor - $($script:editing.name) düzenleniyor"
  }
}
function RefreshList($selectId) {
  $script:loadingList = $true
  $cbEdit.Items.Clear(); [void]$cbEdit.Items.Add('+ Yeni karakter')
  $idx = 0
  for ($i = 0; $i -lt $defs.Count; $i++) {
    [void]$cbEdit.Items.Add("$($defs[$i].name)  ($($defs[$i].setId))")
    if ($defs[$i].id -eq $selectId) { $idx = $i + 1 }
  }
  $cbEdit.SelectedIndex = $idx
  $script:loadingList = $false
  PickChar
}
function MoodSame($old, $mood, [bool]$locked) {
  if ([bool]$old.moodLocked -ne $locked) { return $false }
  foreach ($k in @($mood.Keys)) { if ([Math]::Abs([double]$old.mood.$k - $mood[$k]) -gt 0.001) { return $false } }
  $true
}
function ReadNum([string]$text, $min, $max, [string]$what) {
  $t = $text.Trim()
  if (-not $t) { return $null }
  $n = 0
  if (-not [int]::TryParse($t, [ref]$n) -or $n -lt $min -or $n -gt $max) { throw "$what $min-$max arasında olmalı (ya da boş)." }
  $n
}

function SaveChar {
  $name = $tbName.Text.Trim()
  if (-not $name) { throw 'İsim yazmalısın.' }
  $src = $tbFolder.Text
  if (-not $src -or -not (Test-Path -LiteralPath $src)) { throw 'Fotoğraf klasörü seçmelisin.' }
  $files = Images $src
  if (-not $files.Count) { throw 'Klasörde jpg / png / webp fotoğraf yok.' }
  $age = ReadNum $tbAge.Text 18 50 'Yaş'
  $height = ReadNum $tbHeight.Text 145 195 'Boy'
  $profileName = [string]$cbProfile.SelectedItem
  if (-not $profileName) { $profileName = $files[0].Name }

  # Fotoğraf seti: characters içindeyse yerinde kullan, değilse kopyala
  $full = (Resolve-Path -LiteralPath $src).Path.TrimEnd('\')
  $setDir = if ((Split-Path -Leaf $full) -ieq 'photos') { Split-Path -Parent $full } else { $full }
  if ((Split-Path -Parent $setDir) -ieq $charDir) {
    $setId = Split-Path -Leaf $setDir
    $pdir = PhotoDir $setDir
    if ((AutoProfile $files).Name -ne $profileName) {
      # build-photos adında "profile" geçen dosyayı profil yapar
      foreach ($f in $files) {
        if ($f.Name -ne $profileName -and $f.Name -match 'profile') { Rename-Item -LiteralPath $f.FullName -NewName ($f.Name -replace '(?i)profile', 'foto') }
      }
      if ($profileName -notmatch 'profile') {
        Rename-Item -LiteralPath (Join-Path $pdir $profileName) -NewName ('profile_' + $profileName)
      }
    }
  } else {
    $base = Slug $name; $setId = $base; $k = 2
    while (Test-Path -LiteralPath (Join-Path $charDir $setId)) { $setId = "$base-$k"; $k++ }
    $dest = Join-Path $charDir $setId
    New-Item -ItemType Directory -Path $dest | Out-Null
    foreach ($f in $files) {
      $n = $f.Name
      if ($n -ne $profileName -and $n -match 'profile') { $n = $n -replace '(?i)profile', 'foto' }
      if ($n -eq $profileName -and $n -notmatch 'profile') { $n = 'profile_' + $n }
      Copy-Item -LiteralPath $f.FullName -Destination (Join-Path $dest $n)
    }
  }

  $old = $script:editing
  $id = if ($old) { $old.id } else { 'custom-' + $setId }
  $baseId = $id; $k = 2
  while (@($defs | Where-Object { $_.id -eq $id -and -not [object]::ReferenceEquals($_, $old) }).Count) { $id = "$baseId-$k"; $k++ }

  $big5 = $null
  if ($chkBig5.Checked) { $big5 = [ordered]@{}; foreach ($k in @($b5.Keys)) { $big5[$k] = $b5[$k].Value / 100 } }
  $traits = $null
  if ($chkTraits.Checked) { $traits = @($traitBoxes.Keys | Where-Object { $traitBoxes[$_].Checked }) }
  $mood = $null; $moodAt = $null; $locked = $false
  if ($chkMood.Checked) {
    $mood = [ordered]@{}; foreach ($k in @($mv.Keys)) { $mood[$k] = $mv[$k].Value / 100 }
    $locked = $chkLock.Checked
    $moodAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    if ($old -and $old.mood -and $old.moodAt -and (MoodSame $old $mood $locked)) { $moodAt = $old.moodAt }
  }

  $def = [pscustomobject][ordered]@{
    id = $id; setId = $setId; name = $name; archetype = $archs[$cbArch.SelectedIndex].id
    age = $age; height = $height
    city = if ($cbCity.SelectedIndex -gt 0) { [string]$cbCity.SelectedItem } else { '' }
    job = if ($cbJob.SelectedIndex -gt 0) { [string]$cbJob.SelectedItem } else { '' }
    bio = $tbBio.Text.Trim()
    big5 = $big5; traits = $traits; mood = $mood; moodLocked = $locked; moodAt = $moodAt
  }
  if ($old) { $defs[$defs.IndexOf($old)] = $def } else { [void]$defs.Add($def) }

  SaveDefs
  & (Join-Path $PSScriptRoot 'build-photos.ps1') | Out-Null
  BumpSw
  RefreshList $id
  Info ("$name kaydedildi (klasör: characters\$setId).`n`n" +
    "Yerelde denemek için sayfayı yenile. Telefonda görünmesi için değişiklikleri GitHub'a gönder (commit + push).")
}

$cbEdit.Add_SelectedIndexChanged({ PickChar })
$cbArch.Add_SelectedIndexChanged({ ArchDefaults })
$chkBig5.Add_CheckedChanged({ $gBig5.Enabled = $chkBig5.Checked; ArchDefaults })
$chkTraits.Add_CheckedChanged({ $gTraits.Enabled = $chkTraits.Checked })
$chkMood.Add_CheckedChanged({ $gMood.Enabled = $chkMood.Checked })
$cbPreset.Add_SelectedIndexChanged({ if ($cbPreset.SelectedIndex -gt 0) { SetMood $presets[[string]$cbPreset.SelectedItem] } })
$cbProfile.Add_SelectedIndexChanged({
  $pic.Image = $null
  try {
    $bytes = [IO.File]::ReadAllBytes((Join-Path (PhotoDir $tbFolder.Text) ([string]$cbProfile.SelectedItem)))
    $pic.Image = [Drawing.Image]::FromStream((New-Object IO.MemoryStream(, $bytes)))
  } catch { } # webp önizlenemez, sorun değil
})
$btnFolder.Add_Click({
  $dlg = New-Object Windows.Forms.FolderBrowserDialog
  $dlg.Description = 'Karakterin fotoğraflarının olduğu klasörü seç'
  $dlg.SelectedPath = if ($tbFolder.Text) { $tbFolder.Text } else { $charDir }
  if ($dlg.ShowDialog($form) -eq 'OK') {
    $tbFolder.Text = $dlg.SelectedPath; RefreshPhotos
    if (-not $tbName.Text.Trim()) {
      $leaf = Split-Path -Leaf $dlg.SelectedPath
      if ($leaf -ieq 'photos') { $leaf = Split-Path -Leaf (Split-Path -Parent $dlg.SelectedPath) }
      $tbName.Text = (Get-Culture).TextInfo.ToTitleCase($leaf)
    }
  }
})
$btnSave.Add_Click({ try { SaveChar } catch { Warn $_.Exception.Message } })
$btnClose.Add_Click({ $form.Close() })
$btnDel.Add_Click({
  $d = $script:editing
  if (-not $d) { return }
  $ok = [Windows.Forms.MessageBox]::Show($form, "$($d.name) tanımı silinsin mi?`n`nFotoğraf klasörü (characters\$($d.setId)) silinmez. Uygulamada zaten oluşmuş karakter normal bir karakter olarak kalır; istersen uygulamadan da silebilirsin.", 'Amor', 'YesNo', 'Question')
  if ($ok -ne 'Yes') { return }
  $defs.Remove($d); SaveDefs; BumpSw; RefreshList $null
})

LoadDefs
RefreshList $null
[void]$form.ShowDialog()

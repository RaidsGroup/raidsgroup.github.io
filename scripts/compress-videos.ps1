# Compress demo videos from assets/media/originals -> assets/media/compressed
# Both folders use the same filename: YYYY_topic-slug_author-slug.mp4

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$originals = Join-Path $root "assets\media\originals"
$compressed = Join-Path $root "assets\media\compressed"

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error "ffmpeg not found in PATH. Install ffmpeg and retry."
}

function Compress-Video([string]$inputPath, [string]$outputPath) {
    $args = @(
        "-y",
        "-i", $inputPath,
        "-vf", "scale=1280:-2",
        "-pix_fmt", "yuv420p",
        "-c:v", "libx264",
        "-profile:v", "high",
        "-level:v", "4.0",
        "-preset", "medium",
        "-crf", "28",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        $outputPath
    )

    Write-Host "Compressing: $(Split-Path -Leaf $inputPath)"
    & ffmpeg @args
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $inputPath" }

    $inSize = (Get-Item $inputPath).Length
    $outSize = (Get-Item $outputPath).Length
    $ratio = [math]::Round(100 * (1 - $outSize / $inSize), 1)
    Write-Host ("  {0:N2} MB -> {1:N2} MB ({2}% smaller)" -f ($inSize/1MB), ($outSize/1MB), $ratio)
}

New-Item -ItemType Directory -Force -Path $compressed | Out-Null

$inputs = Get-ChildItem -Path $originals -Filter "*.mp4" -File | Sort-Object Name
if (-not $inputs) {
    Write-Host "No .mp4 files found in $originals"
    exit 0
}

foreach ($file in $inputs) {
    $outPath = Join-Path $compressed $file.Name

    if (Test-Path $outPath) {
        Write-Host "Skip (already exists): $($file.Name)"
        continue
    }

    Compress-Video $file.FullName $outPath
}

Write-Host "Done."

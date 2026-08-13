[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$RuntimeDir = Join-Path $ProjectRoot "work\windows-deployment"
$DeploymentFile = Join-Path $RuntimeDir "deployment.json"

if (-not (Test-Path $DeploymentFile)) {
    Write-Host "No deployment record was found. Nothing was stopped." -ForegroundColor Yellow
    exit 0
}

$deployment = Get-Content -Raw -LiteralPath $DeploymentFile | ConvertFrom-Json
foreach ($entry in $deployment.processes) {
    $process = Get-Process -Id ([int]$entry.pid) -ErrorAction SilentlyContinue
    if (-not $process) {
        Write-Host "$($entry.name) is already stopped."
        continue
    }

    $actualStart = $process.StartTime.ToUniversalTime()
    $recordedStart = [datetime]::Parse($entry.startedAt).ToUniversalTime()
    if ([math]::Abs(($actualStart - $recordedStart).TotalSeconds) -gt 2) {
        Write-Warning "PID $($entry.pid) now belongs to a different process; it was not stopped."
        continue
    }

    Stop-Process -Id $process.Id -Force
    Write-Host "Stopped $($entry.name) (PID $($entry.pid))." -ForegroundColor Green
}

Remove-Item -LiteralPath $DeploymentFile -Force

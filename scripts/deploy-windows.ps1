[CmdletBinding()]
param(
    [ValidateSet("Production", "Development")]
    [string]$Mode = "Production",

    [ValidateRange(1024, 65535)]
    [int]$FrontendPort = 3000,

    [ValidateRange(1024, 65535)]
    [int]$BackendPort = 8010,

    [bool]$VisibleChrome = $true,

    [ValidateRange(0, 600)]
    [int]$ChromeHoldSeconds = 60,

    [switch]$SkipInstall,
    [switch]$SkipBuild,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$RuntimeDir = Join-Path $ProjectRoot "work\windows-deployment"
$VenvDir = Join-Path $ProjectRoot ".venv"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
$NpmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Assert-Command([string]$Name, [string]$InstallHint) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found. $InstallHint"
    }
}

function Test-Port([int]$Port) {
    try {
        return [bool](Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction Stop)
    } catch {
        $result = netstat -ano | Select-String -Pattern (":$Port\s+.*LISTENING")
        return [bool]$result
    }
}

function Wait-Endpoint([string]$Url, [int]$Seconds = 45) {
    $deadline = (Get-Date).AddSeconds($Seconds)
    do {
        try {
            $status = & curl.exe --noproxy "*" --silent --output NUL --write-out "%{http_code}" --max-time 3 $Url
            if ([int]$status -ge 200 -and [int]$status -lt 500) { return }
        } catch {
            Start-Sleep -Milliseconds 750
        }
    } while ((Get-Date) -lt $deadline)
    throw "Service did not become ready: $Url"
}

function Start-LoggedProcess(
    [string]$Name,
    [string]$FilePath,
    [string[]]$Arguments,
    [hashtable]$Environment = @{}
) {
    $stdout = Join-Path $RuntimeDir "$Name.stdout.log"
    $stderr = Join-Path $RuntimeDir "$Name.stderr.log"
    $quotedExecutable = '"' + $FilePath.Replace('"', '""') + '"'
    $quotedArguments = $Arguments | ForEach-Object { '"' + ([string]$_).Replace('"', '""') + '"' }
    $environmentPrefix = ($Environment.GetEnumerator() | ForEach-Object {
        'set "' + $_.Key + '=' + ([string]$_.Value).Replace('"', '') + '"&&'
    }) -join ' '
    $commandLine = "$environmentPrefix $quotedExecutable $($quotedArguments -join ' ') 1>`"$stdout`" 2>`"$stderr`""
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "$env:SystemRoot\System32\cmd.exe"
    $startInfo.Arguments = '/d /s /c "' + $commandLine + '"'
    $startInfo.WorkingDirectory = $ProjectRoot
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    [void]$process.Start()

    return [ordered]@{
        name = $Name
        pid = $process.Id
        startedAt = $process.StartTime.ToUniversalTime().ToString("o")
        executable = $FilePath
        stdout = $stdout
        stderr = $stderr
    }
}

Set-Location $ProjectRoot
New-Item -ItemType Directory -Force -Path $RuntimeDir | Out-Null

Write-Step "Checking prerequisites"
Assert-Command "node" "Install Node.js 22.13 or later."
Assert-Command "npm.cmd" "Install npm with Node.js."
Assert-Command "python" "Install Python 3.11 or later."
$nodeMajor = [int]((node --version).TrimStart("v").Split(".")[0])
if ($nodeMajor -lt 22) { throw "Node.js 22 or later is required; found $(node --version)." }
if ($FrontendPort -eq $BackendPort) { throw "FrontendPort and BackendPort must be different." }
if (Test-Port $FrontendPort) { throw "Port $FrontendPort is already in use. Stop that service or choose -FrontendPort." }
if (Test-Port $BackendPort) { throw "Port $BackendPort is already in use. Stop that service or choose -BackendPort." }

if (-not (Test-Path $PythonExe)) {
    Write-Step "Creating the Python environment"
    python -m venv $VenvDir
}

if (-not $SkipInstall) {
    Write-Step "Installing backend dependencies"
    & $PythonExe -m pip install --disable-pip-version-check -r (Join-Path $ProjectRoot "backend\requirements.txt")
    if ($LASTEXITCODE -ne 0) { throw "Python dependency installation failed." }

    Write-Step "Installing Playwright Chromium"
    & $PythonExe -m playwright install chromium
    if ($LASTEXITCODE -ne 0) { throw "Playwright Chromium installation failed." }

    Write-Step "Installing frontend dependencies"
    & $NpmCmd ci --ignore-scripts --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw "Frontend dependency installation failed." }
}

$apiUrl = "http://127.0.0.1:$BackendPort"
$frontendUrl = "http://localhost:$FrontendPort"
$env:NEXT_PUBLIC_QUOTE_API_URL = $apiUrl

if ($Mode -eq "Production" -and -not $SkipBuild) {
    Write-Step "Validating and building the frontend"
    & $NpmCmd run lint
    if ($LASTEXITCODE -ne 0) { throw "Frontend lint failed." }
    & $PythonExe -m pytest backend\tests -q -p no:cacheprovider
    if ($LASTEXITCODE -ne 0) { throw "Backend tests failed." }
    & $NpmCmd run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." }
}

Write-Step "Starting the Python backend"
$backendEnvironment = @{
    RATES_BROWSER_VISIBLE = $VisibleChrome.ToString().ToLowerInvariant()
    RATES_BROWSER_HOLD_SECONDS = $ChromeHoldSeconds
    NO_PROXY = "localhost,127.0.0.1"
}
$backend = Start-LoggedProcess "backend" $PythonExe @(
    "-m", "uvicorn", "backend.app.main:app",
    "--host", "127.0.0.1", "--port", "$BackendPort"
) $backendEnvironment

try {
    Wait-Endpoint "$apiUrl/health"

    Write-Step "Starting the frontend"
    $frontendScript = if ($Mode -eq "Development") { "dev" } else { "start" }
    $frontend = Start-LoggedProcess "frontend" $NpmCmd @(
        "run", $frontendScript, "--", "--host", "127.0.0.1", "--port", "$FrontendPort"
    ) @{ NEXT_PUBLIC_QUOTE_API_URL = $apiUrl }
    Wait-Endpoint $frontendUrl

    $deployment = [ordered]@{
        mode = $Mode
        projectRoot = $ProjectRoot
        frontendUrl = $frontendUrl
        backendUrl = $apiUrl
        createdAt = (Get-Date).ToUniversalTime().ToString("o")
        processes = @($backend, $frontend)
    }
    $deployment | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $RuntimeDir "deployment.json") -Encoding UTF8

    Write-Host "`nRatewise is running." -ForegroundColor Green
    Write-Host "Frontend: $frontendUrl"
    Write-Host "Backend:  $apiUrl"
    Write-Host "Logs:     $RuntimeDir"
    Write-Host "Stop:     .\scripts\stop-windows.ps1"

    if (-not $NoBrowser) { Start-Process $frontendUrl }
} catch {
    foreach ($entry in @($backend, $frontend)) {
        if ($null -ne $entry -and $entry.pid) {
            Stop-Process -Id $entry.pid -Force -ErrorAction SilentlyContinue
        }
    }
    throw
}

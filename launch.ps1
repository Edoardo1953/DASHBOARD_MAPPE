$port = 8055
$scriptDir = $PSScriptRoot
$serverScript = Join-Path $scriptDir "server.py"
$pythonw = "C:\Python314\pythonw.exe"

$ready = $false
try {
    $res = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/status" -UseBasicParsing -TimeoutSec 1
    if ($res.StatusCode -eq 200) { $ready = $true }
} catch {}

if (-not $ready) {
    Write-Host "Avvio server Python locale su porta $port..."
    Start-Process -FilePath $pythonw -ArgumentList "`"$serverScript`" $port" -WorkingDirectory $scriptDir -WindowStyle Hidden
    
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Milliseconds 250
        try {
            $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/status" -UseBasicParsing -TimeoutSec 1
            if ($r.StatusCode -eq 200) {
                $ready = $true
                break
            }
        } catch {}
    }
}

if ($ready) {
    Write-Host "Server pronto su http://127.0.0.1:$port"
} else {
    Write-Warning "Il server sta impiegando piu' tempo del previsto ad avviarsi."
}

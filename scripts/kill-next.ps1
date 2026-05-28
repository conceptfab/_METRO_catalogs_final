$ErrorActionPreference = "Stop"

$currentProcessId = $PID
$ports = 3000..3009
$patterns = @(
  "node_modules[\\/]\.bin[\\/]next",
  "node_modules[\\/]next[\\/]dist[\\/]bin[\\/]next",
  "next(\.cmd)?\s+(dev|start|build)"
)

$processesByCommand = @(Get-CimInstance Win32_Process |
  Where-Object {
    $proc = $_
    $proc.ProcessId -ne $currentProcessId -and
    $proc.CommandLine -and
    $proc.Name -match "^(node|npm|npx|cmd|powershell|pwsh)\.exe$" -and
    ($patterns | Where-Object { $proc.CommandLine -match $_ })
  })

$portProcessIds = @(netstat -ano |
  Select-String "LISTENING" |
  ForEach-Object {
    $line = $_.Line.Trim()
    $parts = $line -split "\s+"
    if ($parts.Length -lt 5) {
      return
    }

    $localAddress = $parts[1]
    $processId = [int]$parts[-1]

    foreach ($port in $ports) {
      if ($localAddress -match "(:|\])$port$") {
        $processId
        break
      }
    }
  } |
  Sort-Object -Unique)

$processesByPort = @($portProcessIds |
  ForEach-Object {
    $process = Get-Process -Id $_ -ErrorAction SilentlyContinue
    if ($process -and $process.Id -ne $currentProcessId -and $process.ProcessName -eq "node") {
      [pscustomobject]@{
        ProcessId = $process.Id
        Name = "$($process.ProcessName).exe"
        CommandLine = "listening on Next.js port"
      }
    }
  })

$processes = @($processesByCommand + $processesByPort |
  Group-Object ProcessId |
  ForEach-Object { $_.Group[0] })

if (-not $processes) {
  Write-Host "No running Next.js processes found."
  exit 0
}

$processes | ForEach-Object {
  Write-Host "Killing PID $($_.ProcessId): $($_.Name) $($_.CommandLine)"
  Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
}

Write-Host "Killed $($processes.Count) Next.js process(es)."

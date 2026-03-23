$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeExecutable = (Get-Command node).Source

Start-Process -FilePath $nodeExecutable `
  -ArgumentList "scripts\kanban-orchestrator.js", "start" `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden

$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeExecutable = (Get-Command node).Source

& $nodeExecutable "scripts\kanban-orchestrator.js" "stop"

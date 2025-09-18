Param(
    [string] $Url = $(if ($env:DP_URL) { $env:DP_URL } else { 'about:blank' }),
    [switch] $Listen,
    [switch] $NoInject,
    [string] $Chrome = $(if ($env:DP_CHROME) { $env:DP_CHROME } else { (Join-Path $PSScriptRoot 'chrome\Chrome-bin\chrome.exe') }),
    [switch] $LoadPlugins,
    [string] $Config = $(
        $defaultCfg = Join-Path $PSScriptRoot 'config\dp_debug.json';
        if (Test-Path $defaultCfg) { $defaultCfg } else { '' }
    )
)

$ErrorActionPreference = 'Stop'

function Start-DpDebug {
    param(
        [string] $Url,
        [bool] $Inject,
        [bool] $Listen,
        [string] $Chrome,
        [bool] $LoadPlugins
    )

    $py = 'python'
    $script = Join-Path $PSScriptRoot 'dp_debug.py'
    if (-not (Test-Path $script)) { throw "dp_debug.py not found: $script" }

    $argsList = @('--url', $Url, '--chrome', $Chrome)
    if ($Listen) { $argsList += '--listen' }
    if (-not $Inject) { $argsList += '--no-inject' }
    if ($LoadPlugins) { $argsList += '--load-plugins' }
    if ($Config -and (Test-Path $Config)) { $argsList += @('--config', $Config) }

    Write-Information "[DP] Launching: $py $script $($argsList -join ' ')" -InformationAction Continue
    & $py $script @argsList
}

try {
    $inject = -not $NoInject.IsPresent
    Start-DpDebug -Url $Url -Inject $inject -Listen $Listen.IsPresent -Chrome $Chrome -LoadPlugins $LoadPlugins.IsPresent
}
catch {
    Write-Error "[DP] Failed: $_"
    exit 1
}

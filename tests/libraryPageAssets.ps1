$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetDirectory = Join-Path $PSScriptRoot '../src/features/beach-library/assets/pages'
$names = @('book1', 'book2', 'book3', 'book4', 'text')
foreach ($name in $names) {
    $bitmap = [System.Drawing.Bitmap]::new((Join-Path $assetDirectory "$name.png"))
    try {
        $clear = 0
        $opaque = 0
        $minX = $bitmap.Width
        $minY = $bitmap.Height
        $maxX = 0
        $maxY = 0
        # Stay away from the torn outer edges: transparent pixels here are actual holes.
        for ($y = [int]($bitmap.Height * .1); $y -lt $bitmap.Height * .9; $y += 4) {
            for ($x = [int]($bitmap.Width * .1); $x -lt $bitmap.Width * .9; $x += 4) {
                $alpha = $bitmap.GetPixel($x, $y).A
                if ($alpha -eq 0) {
                    $clear++
                    $minX = [Math]::Min($x, $minX)
                    $minY = [Math]::Min($y, $minY)
                    $maxX = [Math]::Max($x, $maxX)
                    $maxY = [Math]::Max($y, $maxY)
                }
                if ($alpha -ge 245) { $opaque++ }
            }
        }
        if ($opaque -lt 1000) { throw "$name has no substantial opaque paper body" }
        if ($name.StartsWith('book') -and $clear -lt 50) { throw "$name has no real transparent interior cutout" }
        if (-not $name.StartsWith('book') -and $clear -gt 0) { throw "$name contains unexpected transparent holes" }
        [pscustomobject]@{
            Image = "$name.png"
            Dimensions = "$($bitmap.Width)x$($bitmap.Height)"
            TransparentInteriorSamples = $clear
            HoleCenterPercent = if ($clear) { '{0:N1}, {1:N1}' -f (($minX + $maxX) * 50 / $bitmap.Width), (($minY + $maxY) * 50 / $bitmap.Height) } else { '-' }
        }
    }
    finally { $bitmap.Dispose() }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $scriptRoot 'sections\portfolio.json'
$imagesRoot = Join-Path $scriptRoot 'images'

if (-not (Test-Path $jsonPath)) {
    Write-Error "No se encontró el archivo: $jsonPath"
    exit 1
}

if (-not (Test-Path $imagesRoot)) {
    Write-Error "No se encontró la carpeta de imágenes: $imagesRoot"
    exit 1
}

$imageExtensions = @('.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp', '.bmp', '.tiff')
$excludedFolders = @('edicion', 'ediciones')

$items = Get-ChildItem -Path $imagesRoot -Directory | Where-Object {
    $excludedFolders -notcontains $_.Name.ToLower()
} | ForEach-Object {
    $category = $_.Name
    Get-ChildItem -Path $_.FullName -File -Recurse | Where-Object {
        $imageExtensions -contains $_.Extension.ToLower()
    } | ForEach-Object {
        $relativePath = $_.FullName.Substring($imagesRoot.Length + 1).TrimStart('\', '/')
        [PSCustomObject]@{
            src = 'images/' + ($relativePath -replace '\\','/')
            alt = [IO.Path]::GetFileNameWithoutExtension($_.Name)
            category = $category
        }
    }
}

$portfolio = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json
$portfolio.items = $items | Sort-Object category, src

$portfolio | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath -Encoding UTF8

Write-Host "Se actualizó '$jsonPath' con $($portfolio.items.Count) elementos de galería."
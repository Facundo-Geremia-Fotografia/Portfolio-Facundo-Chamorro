$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptRoot
$jsonPath = Join-Path $projectRoot 'sections/portfolio.json'
$imagesRoot = Join-Path $projectRoot 'images'

if (-not (Test-Path $jsonPath -PathType Leaf)) {
    Write-Error "No se encontró el archivo: $jsonPath"
    exit 1
}

if (-not (Test-Path $imagesRoot -PathType Container)) {
    Write-Error "No se encontró la carpeta de imágenes: $imagesRoot"
    exit 1
}

$imageExtensions = @('.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp', '.bmp', '.tiff')
$excludedFolderNames = @('ediciones', 'ediciones-fotograficas')
$categoryMap = @{
    'deportes' = 'deportes'
    'fotografia-inmobiliaria' = 'inmobiliaria'
    'produccto-comercial' = 'comercial'
    'producto-comercial' = 'comercial'
    'sesiones-personalizadas' = 'sesiones'
    'sesiones' = 'sesiones'
}

function Convert-ToWebPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$BasePath
    )

    $fullBasePath = [System.IO.Path]::GetFullPath($BasePath)
    $fullPath = [System.IO.Path]::GetFullPath($Path)

    $baseUri = [System.Uri]($fullBasePath.TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar)
    $fileUri = [System.Uri]$fullPath
    $relativeUri = $baseUri.MakeRelativeUri($fileUri)
    $relativePath = [System.Uri]::UnescapeDataString($relativeUri.ToString())

    return 'images/' + ($relativePath -replace '\\', '/')
}

$portfolio = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json
$items = @()

$subfolders = Get-ChildItem -Path $imagesRoot -Directory | Where-Object {
    $folderName = $_.Name.ToLowerInvariant()
    -not ($excludedFolderNames -contains $folderName)
}

foreach ($folder in $subfolders) {
    $folderKey = $folder.Name.ToLowerInvariant()
    $category = if ($categoryMap.ContainsKey($folderKey)) { $categoryMap[$folderKey] } else { $folderKey }

    $files = Get-ChildItem -Path $folder.FullName -File -Recurse | Where-Object {
        $imageExtensions -contains $_.Extension.ToLowerInvariant()
    }

    foreach ($file in $files) {
        $items += [PSCustomObject]@{
            src = Convert-ToWebPath -Path $file.FullName -BasePath $imagesRoot
            alt = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
            category = $category
        }
    }
}

$portfolio.items = $items | Sort-Object category, src
$portfolio | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath -Encoding UTF8

Write-Host "Se actualizó '$jsonPath' con $($portfolio.items.Count) elementos de galería."
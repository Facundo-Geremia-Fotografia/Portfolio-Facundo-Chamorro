$root = Get-Location
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()
Write-Host "Serving $root at http://localhost:8000/"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $resp = $ctx.Response
  $path = $req.RawUrl
  if ($path -eq "/" -or [string]::IsNullOrEmpty($path)) { $path = "/index.html" }
  $filePath = Join-Path $root ($path.TrimStart('/') -replace '/','\\')
  if (Test-Path $filePath) {
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
    switch ($ext) {
      ".html" { $resp.ContentType = "text/html" }
      ".css" { $resp.ContentType = "text/css" }
      ".js" { $resp.ContentType = "application/javascript" }
      ".json" { $resp.ContentType = "application/json" }
      ".svg" { $resp.ContentType = "image/svg+xml" }
      ".png" { $resp.ContentType = "image/png" }
      ".jpg" { $resp.ContentType = "image/jpeg" }
      ".jpeg" { $resp.ContentType = "image/jpeg" }
      ".gif" { $resp.ContentType = "image/gif" }
      default { $resp.ContentType = "application/octet-stream" }
    }
    $resp.ContentLength64 = $bytes.Length
    $resp.OutputStream.Write($bytes,0,$bytes.Length)
  } else {
    $resp.StatusCode = 404
    $resp.StatusDescription = "Not Found"
  }
  $resp.Close()
}

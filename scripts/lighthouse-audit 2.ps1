$ErrorActionPreference = "Stop"

$PORT = 3000
$URL = "http://localhost:$PORT/sign-in"
$OUTPUT_DIR = "lighthouse-reports"
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$REPORT_FILE = "$OUTPUT_DIR\lighthouse-report-$TIMESTAMP"

# Create reports directory
if (-not (Test-Path $OUTPUT_DIR)) {
    New-Item -ItemType Directory -Path $OUTPUT_DIR | Out-Null
}

# Check if the development server is running
Write-Host "?? Checking if development server is running on $URL..."
try {
    $response = Invoke-WebRequest -Uri $URL -UseBasicParsing -Method Head
    if ($response.StatusCode -ne 200) {
        Write-Host "? Development server returned status $($response.StatusCode) on $URL" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "? Development server is not running on $URL" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the development server first:"
    Write-Host "  npm run dev"
    exit 1
}

Write-Host "? Development server is running" -ForegroundColor Green
Write-Host ""

# Run Lighthouse audit
Write-Host "?? Running Lighthouse audit..."
Write-Host "?? URL: $URL"
Write-Host "?? Reports will be saved to: $OUTPUT_DIR\"
Write-Host ""

# Run Lighthouse
# We use cmd /c to run npx to avoid some powershell wrapping issues, and we allow it to fail (EPERM) as long as report is generated
$lighthouseCmd = "npx lighthouse ""$URL"" --output=html --output=json --output-path=""$REPORT_FILE"" --chrome-flags=""--headless --no-sandbox --disable-gpu"" --quiet --view=false"
Invoke-Expression $lighthouseCmd

# Check if reports were generated
$jsonFile = $null
$htmlFile = $null

if (Test-Path "$REPORT_FILE.json") {
    $jsonFile = "$REPORT_FILE.json"
    $htmlFile = "$REPORT_FILE.html"
}
elseif (Test-Path "$REPORT_FILE.report.json") {
    $jsonFile = "$REPORT_FILE.report.json"
    $htmlFile = "$REPORT_FILE.report.html"
}

if ($jsonFile) {
    Write-Host ""
    Write-Host "? Lighthouse audit completed!" -ForegroundColor Green
    
    # Parse and display key metrics using Node.js
    node scripts/parse-lighthouse-report.js "$jsonFile"

    Write-Host ""
    Write-Host "?? REPORTS GENERATED:"
    Write-Host "===================="
    Write-Host "� HTML Report: $htmlFile"
    Write-Host "� JSON Report: $jsonFile"
    
}
else {
    Write-Host "? Lighthouse audit failed to generate report" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "?? Lighthouse audit completed successfully!" -ForegroundColor Green

Write-Host "=== Buscando secrets hardcoded ===" -ForegroundColor Cyan

# Padrões que NUNCA devem aparecer no código
$patterns = @(
    "supabase\.co",
    "eyJ",
    "sk_live",
    "sk_test",
    "password\s*=\s*['""][^'"" ]{4,}",
    "WOOVI_APP_ID\s*="
)

foreach ($pattern in $patterns) {
    Write-Host "Buscando padrão: $pattern" -ForegroundColor Gray
    Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern $pattern | Where-Object { 
        $_.Line -notmatch "process\.env" -and $_.Line -notmatch "// "
    } | ForEach-Object {
        Write-Host "⚠️ Padrão encontrado em $($_.Path):$($_.LineNumber)" -ForegroundColor Yellow
        Write-Host "   Conteúdo: $($_.Line.Trim())"
    }
}

Write-Host "=== Auditoria concluída ===" -ForegroundColor Cyan

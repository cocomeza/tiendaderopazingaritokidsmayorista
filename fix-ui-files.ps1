# Script to ensure all UI files are lowercase
$files = Get-ChildItem -Path "components/ui" -Filter "*.tsx"
foreach ($file in $files) {
    if ($file.Name -cmatch '^[A-Z]') {
        $newName = $file.Name.Substring(0,1).ToLower() + $file.Name.Substring(1)
        Write-Host "Would rename: $($file.Name) -> $newName"
        git mv "components/ui/$($file.Name)" "components/ui/$newName"
    }
}

git status


#!/bin/bash

echo "Commandline options are not harmonised."

years=("2011" "2021" "2024")
tools=("openalex-cli" "scopus-cli" "scite-cli" "scholarly-cli")

for tool in "${tools[@]}"; do
    echo "------------------------ ${tool} -----------------------------------------------------"
    for year in "${years[@]}"; do
        echo "------------------------ ${year} -----------------------------------------------------"
        case $tool in
            "openalex-cli")
                $tool search --title-abs techhighV1... AND settingV1... --count --year_low $year --year_high 2025
                ;;
            "scopus-cli")
                $tool search --title-abs techhighV1... AND settingV1... --date $year-2025 --count
                ;;
            "scite-cli")
                $tool search techhighV1... AND settingV1... --date-from $year --date-to 2025 --count
                ;;
            "scholarly-cli")
                $tool --search 'techhighV1... AND settingV1...'  --year_low $year --year_high 2025 --count
                ;;
        esac
    done
done
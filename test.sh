#!/bin/bash
set -x
tools=("openalex-cli" "scopus-cli" "scite-cli" "scholarly-cli")

for tool in "${tools[@]}"
do
    echo "------------------------ ${tool} -----------------------------------------------------"
    $tool search --count --title-abs EdTech OR "educational technology" OR "education technology"
    $tool search --count --title-abs EdTech OR "\"educational technology\"" OR "\"education technology\""
    $tool search --count --title-abs test_quote_1...
    $tool search --count --title-abs test_quote_2...
done
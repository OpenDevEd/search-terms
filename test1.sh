#!/bin/bash
set -x

tool="openalex-cli"
echo "------------------------ ${tool} -----------------------------------------------------"
$tool search --count --title-abs EdTech OR "educational technology" OR "education technology"
$tool search --count --title-abs EdTech OR "\"educational technology\"" OR "\"education technology\""
$tool search --count --title-abs test_quote_1...
$tool search --count --title-abs test_quote_2...

tool="scopus-cli"
echo "------------------------ ${tool} -----------------------------------------------------"
$tool search --count --title-abs EdTech OR "educational technology" OR "education technology"
$tool search --count --title-abs EdTech OR "\"educational technology\"" OR "\"education technology\""
$tool search --count --title-abs test_quote_1...
$tool search --count --title-abs test_quote_2...

tool="scite-cli"
echo "------------------------ ${tool} -----------------------------------------------------"
$tool search --count --title --abstract EdTech OR "educational technology" OR "education technology"
$tool search --count --title --abstract EdTech OR "\"educational technology\"" OR "\"education technology\""
$tool search --count --title --abstract test_quote_1...
$tool search --count --title --abstract test_quote_2...

$tool search --count --title EdTech OR "educational technology" OR "education technology"
$tool search --count --title EdTech OR "\"educational technology\"" OR "\"education technology\""
$tool search --count --title test_quote_1...
$tool search --count --title test_quote_2...


tool="scholarly-cli"
echo "------------------------ ${tool} -----------------------------------------------------"
$tool --count --search "EdTech OR \"educational technology\" OR \"education technology\""
$tool --count --search test_quote_1...
$tool --count --search test_quote_2...

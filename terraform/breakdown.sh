#!/usr/bin/env bash
# breakdown.sh — Converts infracost breakdown.json to CSV

set -euo pipefail

INPUT_JSON="${1:-breakdown.json}"
OUTPUT_CSV="breakdown.csv"

if [[ ! -f "$INPUT_JSON" ]]; then
  echo "Error: '$INPUT_JSON' not found"
  exit 1
fi

echo "project,resource_name,resource_type,component_name,unit,monthly_quantity,price,monthly_cost,usage_based" > "$OUTPUT_CSV"

jq -r '
  .projects[] as $proj |
  $proj.name as $project |
  (
    $proj.pastBreakdown.resources[]? |
    (
      # flatten both direct and nested cost components
      [ (.costComponents? // []), (.subresources[]?.costComponents? // []) ] | add | .[]
    )? |
    [
      $project,
      (.name // ""),
      (.resourceType // ""),
      (.name // ""),
      (.unit // ""),
      (.monthlyQuantity // ""),
      (.price // ""),
      (.monthlyCost // ""),
      (.usageBased // false)
    ] | @csv
  )
' "$INPUT_JSON" >> "$OUTPUT_CSV"

echo "✅ CSV generated successfully: $OUTPUT_CSV"

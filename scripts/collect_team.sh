#!/bin/bash

# Collect GitHub usernames from openteams and quansight and write to team.json
# Usage: ./scripts/collect_team.sh [output_file]
#
# Output format:
#   {"users": [{"name": "<github login>", "org": "openteams|quansight"}, ...]}
#
# Users who belong to both organizations are listed once, under the first
# organization in ORGS below.

set -e

OUTPUT_FILE="${1:-team.json}"

# GitHub org => org label used in team.json
ORGS=(
    "openteams-ai:openteams"
    "quansight:quansight"
)

echo "Fetching team members from GitHub organizations..."

{
    for entry in "${ORGS[@]}"; do
        gh_org="${entry%%:*}"
        label="${entry##*:}"
        echo "Fetching from /orgs/$gh_org/members" >&2
        gh api --paginate "/orgs/$gh_org/members" \
            --jq ".[] | {name: .login, org: \"$label\"}" 2>/dev/null \
            || echo "Failed to fetch $gh_org members" >&2
    done
} | jq -s '{users: (reduce .[] as $u ([]; if any(.[]; .name == $u.name) then . else . + [$u] end))}' > "$OUTPUT_FILE"

echo "✓ Wrote $(jq '.users | length' "$OUTPUT_FILE") unique team members to $OUTPUT_FILE"

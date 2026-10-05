#!/bin/zsh
# install_scholar_job.sh · set up (or repair) the twice-weekly Google Scholar job.
#
#   zsh tools/install_scholar_job.sh
#
# What it does, safe to run again at any time:
#   1. keeps a clone of the site in ~/Library/Application Support/ScholarlyBrightMinds,
#      outside Desktop, because macOS blocks background jobs from the Desktop folder;
#   2. copies tools/scholar_runner.sh next to it (launchd runs that copy, so a
#      git pull inside the clone never rewrites a script while it is running);
#   3. writes the launchd job: Mondays and Thursdays at 10:12, and at the next
#      wake if the Mac was asleep then;
#   4. reloads the job.
#
# Run it now:   launchctl kickstart gui/$(id -u)/com.scholarlybrightminds.scholar
# What it did:  ~/Library/Logs/ScholarlyBrightMinds/scholar.log
# Remove it:    launchctl bootout gui/$(id -u)/com.scholarlybrightminds.scholar
#               rm ~/Library/LaunchAgents/com.scholarlybrightminds.scholar.plist

set -eu
LABEL="com.scholarlybrightminds.scholar"
APP="$HOME/Library/Application Support/ScholarlyBrightMinds"
CLONE="$APP/abdallahabouhajal"
LOGDIR="$HOME/Library/Logs/ScholarlyBrightMinds"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
HERE="${0:A:h}"

mkdir -p "$APP" "$LOGDIR" "$HOME/Library/LaunchAgents"
if [[ ! -d "$CLONE/.git" ]]; then
    git clone --quiet https://github.com/ScholarlyBrightMinds/abdallahabouhajal.git "$CLONE"
    echo "cloned the site into $CLONE"
fi
cp "$HERE/scholar_runner.sh" "$APP/scholar_runner.sh"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!-- Reads Google Scholar on Mondays and Thursdays and pushes the new numbers.
     Written by tools/install_scholar_job.sh in the abdallahabouhajal repo; edit there. -->
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/zsh</string>
        <string>$APP/scholar_runner.sh</string>
        <string>--runner</string>
        <string>$CLONE</string>
    </array>
    <key>StartCalendarInterval</key>
    <array>
        <dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>10</integer><key>Minute</key><integer>12</integer></dict>
        <dict><key>Weekday</key><integer>4</integer><key>Hour</key><integer>10</integer><key>Minute</key><integer>12</integer></dict>
    </array>
    <key>RunAtLoad</key>
    <false/>
    <key>StandardOutPath</key>
    <string>$LOGDIR/scholar.out.log</string>
    <key>StandardErrorPath</key>
    <string>$LOGDIR/scholar.out.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "installed $LABEL: Mondays and Thursdays at 10:12, log in $LOGDIR/scholar.log"

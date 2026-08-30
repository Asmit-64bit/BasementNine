#!/bin/bash
git filter-branch -f --env-filter '
if [ "$GIT_AUTHOR_NAME" = "Antigravity" ]; then
    export GIT_AUTHOR_NAME="Asmit-64bit"
    export GIT_AUTHOR_EMAIL="asmit9324@gmail.com"
fi
if [ "$GIT_COMMITTER_NAME" = "Antigravity" ]; then
    export GIT_COMMITTER_NAME="Asmit-64bit"
    export GIT_COMMITTER_EMAIL="asmit9324@gmail.com"
fi
' --msg-filter 'sed "/Co-Authored-By: Claude Sonnet 5/d"' -- --all

#!/bin/bash
cd /home/kavia/workspace/code-generation/channelinsight-59712-b4c0b26b/channel_insight_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


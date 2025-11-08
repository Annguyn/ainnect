#!/bin/bash

# Ainnect CDN Sync Script
# This script syncs uploaded files from backend to Nginx CDN directory

set -e

# Configuration
SOURCE_DIR="${UPLOAD_DIR:-./uploads}"
DEST_DIR="${CDN_DIR:-/var/www/cdn}"
SYNC_MODE="${SYNC_MODE:-rsync}"  # rsync, cp, or s3

echo "🚀 Ainnect CDN Sync Starting..."
echo "   Source: $SOURCE_DIR"
echo "   Destination: $DEST_DIR"
echo "   Mode: $SYNC_MODE"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source directory $SOURCE_DIR does not exist"
    exit 1
fi

# Create destination directory if not exists
mkdir -p "$DEST_DIR"

case $SYNC_MODE in
    rsync)
        echo "📦 Using rsync..."
        rsync -av --delete "$SOURCE_DIR/" "$DEST_DIR/"
        ;;
    
    cp)
        echo "📦 Using cp..."
        cp -r "$SOURCE_DIR/"* "$DEST_DIR/"
        ;;
    
    s3)
        echo "📦 Syncing to AWS S3..."
        if [ -z "$AWS_S3_BUCKET" ]; then
            echo "❌ Error: AWS_S3_BUCKET not set"
            exit 1
        fi
        aws s3 sync "$SOURCE_DIR" "s3://$AWS_S3_BUCKET/" --delete
        ;;
    
    *)
        echo "❌ Error: Unknown sync mode: $SYNC_MODE"
        echo "   Valid modes: rsync, cp, s3"
        exit 1
        ;;
esac

# Set proper permissions (for local/nginx mode)
if [ "$SYNC_MODE" != "s3" ]; then
    echo "🔒 Setting permissions..."
    find "$DEST_DIR" -type d -exec chmod 755 {} \;
    find "$DEST_DIR" -type f -exec chmod 644 {} \;
fi

echo "✅ Sync completed successfully!"

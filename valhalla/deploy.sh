#!/bin/sh
set -e

ng build

aws s3 cp --recursive dist/valhalla/ s3://kestrel-valhalla
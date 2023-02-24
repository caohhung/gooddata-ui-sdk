#!/bin/bash

# Absolute root directory - for volumes
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../.. && pwd -P))

IMAGE="node:16.13.0-bullseye"

echo "Running \"$*\" using ${IMAGE} in root directory ${ROOT_DIR}"

#
# Environment variables to propagate to docker
#
export CI=true

PROJECT="$1"
shift

echo "-----------------------------------------------------------------------"
echo "--- starting in project ${PROJECT}: $*"
echo "-----------------------------------------------------------------------"

#
# Execute `rushx` using dockerized node - all heavy lifting is done against SDK sources mounted as a volume onto the
# /workspace directory
#

if [ -z $WIREMOCK_NET ]; then
  net_param=""
else
  net_param="--net ${WIREMOCK_NET} --net-alias tests"
fi

if [ -n $JENKINS_URL ] && [ -n $CACHE_DIR ] ; then
  rush_temp_param="--volume $CACHE_DIR:/workspace/common/temp"
else
  rush_temp_param=""
fi

echo "rush_temp_param=$rush_temp_param"

docker run \
  --env CI \
  --env WIREMOCK_NET \
  --env EXAMPLES_BUILD_TYPE \
  --env EXAMPLE_MAPBOX_ACCESS_TOKEN \
  --env BROWSERSLIST_IGNORE_OLD_DATA=true \
  --env HOME="/workspace" \
  --rm \
  ${net_param} \
  --volume ${ROOT_DIR}:/workspace:Z \
  ${rush_temp_param} \
  -u $(id -u ${USER}):$(id -g ${USER}) \
  -w /workspace \
  ${IMAGE} \
  /bin/bash -c "cd ${PROJECT} && node \"../../common/scripts/install-run-rushx.js\" $*"

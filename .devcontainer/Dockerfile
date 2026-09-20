# No language or framework detected. Using a generic base image.
# You can add language-specific tools and configurations to this Dockerfile.
FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

RUN apt-get update
RUN apt-get install -y curl git unzip xz-utils zip libglu1-mesa python3 python3-pip gh jq
RUN apt-get clean

# Install opencode
RUN curl -fsSL https://opencode.ai/install | bash

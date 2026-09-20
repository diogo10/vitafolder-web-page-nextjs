# Next.js devcontainer image (Node 22 + npm)
ARG VARIANT="1-22-bookworm"
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# Install additional OS packages + common CLIs
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        curl \
        git \
        gh \
        jq \
        python3 \
        python3-pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install opencode (used by bakehub-setup.sh).
# postStartCommand runs as `node` via non-interactive /bin/sh, so a .bashrc
# PATH entry is not enough: install as `node` and expose via ENV + symlink.
ENV PATH="/home/node/.opencode/bin:${PATH}"
RUN HOME=/home/node su node -c "curl -fsSL https://opencode.ai/v2/install | bash -s -- --no-modify-path" \
    && ln -sf /home/node/.opencode/bin/opencode /usr/local/bin/opencode \
    && opencode --version

# Next.js / npm tweaks: enable telemetry opt-out by default, speed up installs
ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false

EXPOSE 3000

# Default user is `node` (or `vscode` on older variants) — devcontainers handles this.
# Keep container running via sleep so vscode can attach.
CMD ["sleep", "infinity"]

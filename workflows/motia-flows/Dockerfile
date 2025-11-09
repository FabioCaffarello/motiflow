# syntax=docker/dockerfile:1
FROM python:3.12-slim-bullseye as builder

# Environment variables
ENV NODE_VERSION=22.17.1\
    NPM_VERSION=10.9.2\
    NODE_HOME=/usr/local/node\
    MOTIA_DOCKER=true

# System packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    zlib1g-dev \
    libncurses5-dev \
    libgdbm-dev \
    libnss3-dev \
    libssl-dev \
    libreadline-dev \
    libffi-dev \
    libsqlite3-dev \
    libbz2-dev \
    git \
    wget \
    curl \
    ca-certificates \
    xz-utils \
    ruby-full \
    build-essential \
    openjdk-11-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME for PySpark
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64

# Setup Ruby bundler
RUN gem install bundler

# Create directory for Node
RUN mkdir -p ${NODE_HOME}

# Build argument for platform (automatically set by Docker buildx)
ARG TARGETPLATFORM
ARG BUILDPLATFORM

# Setup Node
RUN set -ex \
    && echo "Building for platform: ${TARGETPLATFORM:-unknown}" \
    && echo "Building for build platform: ${BUILDPLATFORM:-unknown}" \
    && ARCH=$(uname -m) \
    && if [ "$ARCH" = "x86_64" ]; then \
    NODE_ARCH="x64"; \
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
    NODE_ARCH="arm64"; \
    else \
    echo "Unsupported architecture: $ARCH"; exit 1; \
    fi \
    && echo "Installing Node.js for ${NODE_ARCH} architecture" \
    && cd /tmp \
    && NODE_TAR="node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" \
    && curl -fsSLO --compressed "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_TAR}" \
    && tar -xJf "${NODE_TAR}" -C "${NODE_HOME}" --strip-components=1 --no-same-owner \
    && rm "${NODE_TAR}" \
    && ln -s "${NODE_HOME}/bin/node" /usr/local/bin/node \
    && ln -s "${NODE_HOME}/bin/npm" /usr/local/bin/npm \
    && ln -s "${NODE_HOME}/bin/npx" /usr/local/bin/npx \
    && npm install -g "npm@${NPM_VERSION}" \
    && npm cache clean --force

# Install UV for faster Python package installation
RUN pip install uv

# Working directory
WORKDIR /app

## Default command which will be overwritten in the Dockerfile implementing this image
CMD ["echo", "Please implement a Dockerfile using this image as a base"]


FROM --platform=linux/amd64 builder as runner

# Install Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Move application files
COPY . .

# Create Python virtual environment and install dependencies
RUN python -m venv python_modules
RUN python_modules/bin/pip install -r requirements.txt

# Alternative with UV (faster):
# RUN python_modules/bin/pip install uv && python_modules/bin/uv pip install --no-cache -r requirements.txt

# Expose outside access to the motia project
EXPOSE 3000

# Run your application
CMD ["npm", "run", "dev"]
FROM node:8.4-alpine
ENV LOG_LEVEL "info"

COPY . /home/container/oauth2-server
RUN chmod +x /home/container/oauth2-server/docker-entrypoint.sh
RUN deluser --remove-home node && \
    addgroup -g 1000 container && \
    adduser -u 1000 -G container -s /bin/sh -D container && \
    cd /home/container/oauth2-server && npm install && \
    rm -rf /home/container/.config /home/container/.node-gyp /home/container/.npm && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/cache/apk/*

# Run as the container user ID.
USER container

# Add global container modules to the path.
ENV PATH /home/container/.npm-global/bin:$PATH

WORKDIR /home/container/oauth2-server

EXPOSE 3000

ENTRYPOINT [ "./docker-entrypoint.sh" ]

CMD ["npm","start"]
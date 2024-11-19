FROM node:22-bookworm-slim

RUN apt update
RUN apt install -y python3 python3-pip python3-venv

# create users
ARG UID=1000
ARG GID=1000

RUN userdel node
RUN groupadd -f -g $GID criticalmaas && useradd -ms /bin/bash criticalmaas -u $UID -g $GID

USER criticalmaas

ENV PATH="/home/criticalmaas/kg/.venv/bin:${PATH}"

# install libraries
RUN mkdir -p /home/criticalmaas/kg/minmod_editor && \
    touch /home/criticalmaas/kg/minmod_editor/__init__.py

ADD pyproject.toml /home/criticalmaas/kg/
ADD poetry.lock /home/criticalmaas/kg/
ADD README.md /home/criticalmaas/kg/

RUN cd /home/criticalmaas/kg && python3 -m venv .venv && pip install .

RUN mkdir -p /home/criticalmaas/kg/www
ADD --chown=criticalmaas:criticalmaas www/package.json /home/criticalmaas/kg/www/
ADD --chown=criticalmaas:criticalmaas www/yarn.lock /home/criticalmaas/kg/www/
# RUN cd /home/criticalmaas/kg/www && yarn install

# add python code
ADD --chown=criticalmaas:criticalmaas minmod_editor /home/criticalmaas/kg/minmod_editor

# add www code
# ADD --chown=criticalmaas:criticalmaas www /home/criticalmaas/kg/www

# RUN cd /home/criticalmaas/kg/www && yarn build:macos

WORKDIR /home/criticalmaas/kg/

CMD [ "python", "-m", "minmod_editor" ]

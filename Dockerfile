FROM node:16

RUN useradd -m user

COPY . /app
RUN chown -R user:user /app

USER user
WORKDIR /app

RUN yarn
RUN ./node_modules/@quasar/app/bin/quasar build

#RUN git clone https://github.com/aleph-im/aleph-js.git
#WORKDIR /app/aleph-js
#RUN yarn link
#
#WORKDIR /app
#RUN yarn link aleph-js

CMD ["./node_modules/@quasar/app/bin/quasar", "dev"]

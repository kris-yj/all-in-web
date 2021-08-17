FROM alpine:latest

ADD dist /tmp/dist

CMD cd /opt/project \
  && rm -rf `ls /tmp/dist/modules` \
  && cp -r /tmp/dist/modules/* /opt/project \
  && rm -rf /opt/project/all-in \
  && cp -r /tmp/dist/all-in/* /opt/project \
  && rm -rf /tmp/dist/modules/*  /tmp/dist/all-in

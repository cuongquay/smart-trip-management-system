import { SERVICE_SOCKET_IO_URL } from './index';

export const Events = {
  CONNECT: 'connect',
  CREATE_CONNECTION: 'create-new-connection',
  SEND_MESSAGE: 'send-message',
  NEW_MESSAGE: 'new-message'
};

export const getSocket = authToken => {
  return require('socket.io-client/dist/socket.io')(SERVICE_SOCKET_IO_URL, {
    query: 'token=' + authToken
  });
};

import fastify from 'fastify';
import fastifyFormBody from '@fastify/formbody';
import fastifySecureSession from '@fastify/secure-session';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import ejs from 'ejs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

import { createPost, listsPosts, showPost } from './actions/posts.js';
import { loginAction, logoutAction } from './actions/auth.js';
import { RecordNotFoundError } from './errors/RecordNotFoundError.js';
import { NotAuthenticatedError } from './errors/NotAuthenticatedError.js';

const app = fastify();
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

app.register(fastifyView, {
  engine: {
    ejs,
  },
});

app.register(fastifySecureSession, {
  sessionName: 'session',
  cookieName: 'my-session-cookie',
  key: readFileSync(join(rootDir, 'secret-key')),
  expiry: 24 * 60 * 60,
  cookie: {
    path: '/',
  },
});

app.register(fastifyFormBody);
app.register(fastifyStatic, {
  root: join(rootDir, 'public'),
});

app.get('/', listsPosts);
app.post('/', createPost);
app.get('/login', loginAction);
app.post('/login', loginAction);
app.post('/logout', logoutAction);
app.get('/article/:id', showPost);
app.setErrorHandler((error, req, res) => {
  if (error instanceof RecordNotFoundError) {
    res.statusCode = 404;
    return res.view('templates/404.ejs', {
      error: "Cet enregistrement n'existe pas",
    });
  } else if (error instanceof NotAuthenticatedError) {
    return res.redirect('/login');
  }
  console.error(error);
  res.statusCode = 500;

  return {
    error: error.message,
  };
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

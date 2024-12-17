import { db } from '../database.js';
import { RecordNotFoundError } from '../errors/RecordNotFoundError.js';
import { verifyUser } from '../functions/authFunction.js';

export const listsPosts = (req, res) => {
  const posts = db.prepare('SELECT * FROM posts').all();
  return res.view('templates/index.ejs', {
    posts,
    user: req.session.get('user'),
  });
};

export const showPost = (req, res) => {
  const post = db
    .prepare('SELECT * FROM posts WHERE id = ?')
    .get(req.params.id);
  if (post === undefined) {
    throw new RecordNotFoundError(
      `Impossible de trouver l'article avec l'id ${req.params.id}`
    );
  }
  return res.view('templates/single.ejs', {
    post,
  });
};

export const createPost = (req, res) => {
  verifyUser(req);
  const post = req.body;
  db.prepare(
    'INSERT INTO posts (title, content, created_at) VALUES (?, ?, ?)'
  ).run(post.title, post.content, new Date() / 1000);
  if (post === undefined) {
    throw new RecordNotFoundError(
      `Impossible de récupérer le contenu de l'article`
    );
  }

  return res.redirect('/');
};

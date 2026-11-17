# GitHub OAuth Login

This is a small Express app where you log in with your GitHub account instead of making a username and password. I built it as an off-platform project for Codecademy's Full-Stack Engineer path, right after the OAuth 2.0 lessons.

There's no live site for this one. It runs locally in the terminal, since GitHub has to send you back to `localhost:3000` after you log in.

## What it does

When you click Log In, the app sends you to GitHub, GitHub asks if you want to let the app see your profile, and then it sends you back logged in. The home page says hello using your GitHub name. The account page shows your username, ID, name, bio, a link to your profile, and your avatar. That page is protected, so if you're logged out and try to open it, you get sent to the login page. Log Out clears the session.

Under the hood it uses Passport with the passport-github2 strategy, and express-session to keep you logged in between pages. There's no database. The GitHub profile just gets stored in the session.

## How to run it

1. Register an OAuth app on GitHub (Settings > Developer settings > OAuth Apps > New OAuth App) with:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/auth/github/callback`
2. Make a `.env` file in this folder with your own values:

```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

3. Install and start it:

```
npm install
npm start
```

The terminal should show:

```
Listening on 3000
```

Then open `http://localhost:3000`, click Log In, and approve the app on GitHub. When I logged in, the home page said "Hello, KT Forge." and the account page pulled in my ktforge profile and logo.

## What I learned

The order of the middleware matters. `session()` has to come before `passport.session()`, or Passport has nowhere to keep the login.

The project instructions had a couple of spelling traps. They say `saveUnitialized` and `clientId`, but the real option names are `saveUninitialized` and `clientID`. The first one would just get ignored without an error, so it's easy to miss.

GitHub only shows the client secret once, so I had to copy it right away. It lives in `.env`, which is in `.gitignore` so it never ends up on GitHub.

When I approved the app, GitHub said it wanted "Full access" to my personal user data. That's because the scope is `user`. For an app that only needs to read your profile, `read:user` would ask for less, and it's a good habit to only ask for what you need.

It was also cool to see the OAuth roles from the lessons in a real app. I'm the resource owner, this app is the client, GitHub's login screen is the authorization server, and GitHub's API is the resource server that hands over the profile.

Built by DeVante Bush

{
  "version": 2,
  "name": "meta-ai-md",
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/pair",
      "dest": "/index.js"
    },
    {
      "src": "/status",
      "dest": "/index.js"
    },
    {
      "src": "/health",
      "dest": "/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}

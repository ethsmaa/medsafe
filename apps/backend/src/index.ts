import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./features/auth/index.js";
import { createTRPCConextForHono } from "./features/trpc/index.js";
import { appRouter } from "./features/trpc/router.js";

export type { AppRouter } from "./features/trpc/router.js";

const app = new Hono();

// Global CORS Middleware
app.use(
    "*",
    cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    }),
);

app.get("/", (c) => {
    return c.text("Hello World from MedSafe Backend!");
});

app.get("/login", (c) => {
    return c.html(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>MedSafe Login Test</title>
            <style>
                body { font-family: sans-serif; max-width: 400px; margin: 2rem auto; padding: 1rem; }
                .form-group { margin-bottom: 1rem; }
                label { display: block; margin-bottom: .5rem; }
                input { width: 100%; padding: .5rem; margin-bottom: .5rem; }
                button { padding: .5rem 1rem; background: #0070f3; color: white; border: none; cursor: pointer; }
                button.secondary { background: #666; }
                #status { margin-top: 1rem; padding: 1rem; background: #f0f0f0; border-radius: 4px; }
                pre { white-space: pre-wrap; word-wrap: break-word; }
            </style>
        </head>
        <body>
            <h1>Login Test</h1>
            
            <div id="auth-forms">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" placeholder="test@example.com" value="test@example.com">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" placeholder="password" value="password123">
                </div>
                 <div class="form-group">
                    <label>Name (for Sign Up)</label>
                    <input type="text" id="name" placeholder="Test User" value="Test User">
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button onclick="handleSignIn()">Sign In</button>
                    <button class="secondary" onclick="handleSignUp()">Sign Up</button>
                    <button class="secondary" onclick="handleSignOut()" style="background: #d00;">Sign Out</button>
                </div>
            </div>

            <div id="status">Checking session...</div>

            <script>
                const statusEl = document.getElementById('status');

                async function checkSession() {
                    try {
                        const res = await fetch('/api/auth/get-session', {
                            credentials: 'include'
                         });
                        const data = await res.json();
                        // Better Auth typically returns null data if not signed in, but let's check
                        if (data) {
                            statusEl.innerHTML = '<strong>Logged In:</strong><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                        } else {
                            statusEl.innerHTML = '<strong>Not Logged In</strong>';
                        }
                    } catch (e) {
                         // A 404 from the server might mean routing issue, but if it is Better Auth saying "null" session, it should be 200 OK.
                        statusEl.innerText = 'Error checking session: ' + e.message;
                    }
                }

// ... (omitting unchanged parts for brevity if possible, but replace_file_content needs contiguous block)
// I will split this into two edits if needed, or target carefully.
// The checkSession is around line 59.
// The logs are around line 168.
// I'll do two separate replacements for safety.

                async function handleSignIn() {
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    
                    try {
                        const res = await fetch('/api/auth/sign-in/email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password }),
                            credentials: 'include' // Important for setting cookie
                        });
                        const data = await res.json();
                        if (res.ok) {
                            alert('Sign in success!');
                            checkSession();
                        } else {
                            alert('Sign in failed: ' + JSON.stringify(data));
                        }
                    } catch (e) {
                         alert('Error: ' + e.message);
                    }
                }

                async function handleSignUp() {
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    const name = document.getElementById('name').value;
                    
                    try {
                        const res = await fetch('/api/auth/sign-up/email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password, name }),
                            // Usually sign up also logs in, so include credentials
                            credentials: 'include'
                        });
                        const data = await res.json();
                         if (res.ok) {
                            alert('Sign up success! Converting to auto-login...');
                            checkSession();
                        } else {
                            alert('Sign up failed: ' + JSON.stringify(data));
                        }
                    } catch (e) {
                        alert('Error: ' + e.message);
                    }
                }

                async function handleSignOut() {
                    try {
                        const res = await fetch('/api/auth/sign-out', { 
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({}),
                            credentials: 'include'
                        });
                         if (res.ok) {
                            alert('Signed out');
                            checkSession();
                        } else {
                             const d = await res.json();
                             alert('Error signing out: ' + JSON.stringify(d));
                        }
                    } catch (e) {
                        alert('Error signing out: ' + e.message);
                    }
                }

                // Check on load
                checkSession();
            </script>
        </body>
        </html>
    `);
});

app.all("/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
});

app.use(
    "/trpc/*",
    trpcServer({
        router: appRouter,
        createContext: createTRPCConextForHono,
    }),
);

const port = 3001;
// biome-ignore lint/suspicious/noConsole: Server startup message
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
    hostname: "0.0.0.0"
});

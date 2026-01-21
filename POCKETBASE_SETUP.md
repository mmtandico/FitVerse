# PocketBase Setup Guide

This guide will help you set up PocketBase for the FitVerse application.

## Step 1: Download PocketBase

1. Go to [PocketBase Releases](https://github.com/pocketbase/pocketbase/releases)
2. Download the appropriate version for your operating system:
   - **Windows**: `pocketbase_X.X.X_windows_amd64.zip`
   - **macOS**: `pocketbase_X.X.X_darwin_amd64.zip` or `pocketbase_X.X.X_darwin_arm64.zip` (for Apple Silicon)
   - **Linux**: `pocketbase_X.X.X_linux_amd64.zip`

3. Extract the `pocketbase` executable (or `pocketbase.exe` on Windows) to your project root directory

## Step 2: Start PocketBase Server

### Windows:
```powershell
.\pocketbase.exe serve
```

### macOS/Linux:
```bash
./pocketbase serve
```

The server will start on `http://127.0.0.1:8090`

## Step 3: Create Admin Account

1. Open your browser and go to `http://127.0.0.1:8090/_/`
2. You'll be prompted to create an admin account
3. Enter your email and password

## Step 4: Create Collections

### Create "avatars" Collection

1. In the PocketBase admin panel, click **"New collection"**
2. Name it: `avatars`
3. Add the following fields:

   | Field Name | Type | Options |
   |------------|------|---------|
   | `user` | Relation | Collection: `users`, Max select: `1`, Required: `true` |
   | `height` | Number | Min: `140`, Max: `200`, Required: `true` |
   | `weight` | Number | Min: `40`, Max: `120`, Required: `true` |
   | `skinColor` | Text | Required: `true` |
   | `hairType` | Text | Required: `true` |
   | `bmi` | Number | Required: `true` |

4. Go to **"API rules"** tab and set:
   - **List/Search rule**: `@request.auth.id != "" && user = @request.auth.id`
   - **View rule**: `@request.auth.id != "" && user = @request.auth.id`
   - **Create rule**: `@request.auth.id != "" && user = @request.auth.id`
   - **Update rule**: `@request.auth.id != "" && user = @request.auth.id`
   - **Delete rule**: `@request.auth.id != "" && user = @request.auth.id`

5. Save the collection

## Step 5: Configure Users Collection (if needed)

The `users` collection is created automatically. You may want to verify the API rules:

1. Go to **Collections** → **users**
2. Go to **API rules** tab
3. Ensure users can only access their own records

## Step 6: Test the Setup

1. Make sure PocketBase is running (`http://127.0.0.1:8090`)
2. Start your React app: `npm run dev`
3. Try to:
   - Sign up for a new account
   - Login
   - Customize an avatar
   - Save the avatar
   - Logout and login again
   - Load the saved avatar

## Troubleshooting

### Port Already in Use
If port 8090 is already in use, you can change it:
```bash
./pocketbase serve --http=127.0.0.1:8091
```
Then update `.env` file:
```
VITE_POCKETBASE_URL=http://127.0.0.1:8091
```

### CORS Issues
If you encounter CORS errors, you may need to configure PocketBase CORS settings in the admin panel under Settings → API.

### Database Location
PocketBase stores its data in a `pb_data` folder in the same directory as the executable. This folder is already in `.gitignore`.

## Production Deployment

For production, you'll need to:
1. Deploy PocketBase to a server
2. Update `VITE_POCKETBASE_URL` in your production environment
3. Set up proper authentication and security rules
4. Configure HTTPS

For more information, visit: https://pocketbase.io/docs/

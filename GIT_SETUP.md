# Git Setup Instructions

Follow these steps to push your code to GitHub:

## Option 1: Run the Setup Script

```bash
cd "/Users/roberteisenberg/Downloads/AI Assisted Products/FinalProject"
chmod +x setup-git.sh
./setup-git.sh
```

## Option 2: Manual Setup

Run these commands one by one:

```bash
# Navigate to project directory
cd "/Users/roberteisenberg/Downloads/AI Assisted Products/FinalProject"

# Initialize git repository
git init

# Add remote repository
git remote add origin https://github.com/jeisenberg24/FinalProject.git

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Service Quote Calculator full-stack application"

# Set main branch
git branch -M main

# Push to GitHub and set upstream
git push -u origin main
```

## Verify Setup

After pushing, verify the remote is set correctly:

```bash
git remote -v
```

You should see:
```
origin  https://github.com/jeisenberg24/FinalProject.git (fetch)
origin  https://github.com/jeisenberg24/FinalProject.git (push)
```

## Future Pushes

After the initial setup, you can push changes with:

```bash
git add .
git commit -m "Your commit message"
git push
```

The `-u origin main` flag sets the upstream, so future `git push` commands will automatically push to the main branch.




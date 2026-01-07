#!/bin/bash

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

echo "✅ Code pushed to GitHub successfully!"
echo "Repository: https://github.com/jeisenberg24/FinalProject.git"




# Simple Text Editor - Deployment Guide

## Vercel Deployment Instructions

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)

### Option 1: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI globally:
```bash
bun add -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project root:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? (Select your account)
   - Link to existing project? **N**
   - Project name? (Press Enter for default or enter custom name)
   - In which directory is your code located? **./
   - Want to modify settings? **N**

5. For production deployment:
```bash
vercel --prod
```

### Option 2: Deploy via GitHub + Vercel Dashboard

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

2. Go to https://vercel.com/new

3. Import your GitHub repository

4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: **./
   - Build Command: `bun run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

5. Click **Deploy**

### Environment Variables (if needed)
No environment variables are currently required for this project.

### Post-Deployment

Your app will be available at:
- Production: `https://your-project-name.vercel.app`
- Preview: Automatic preview URLs for each git push

### Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you push to any other branch or open a PR

### Custom Domain (Optional)

1. Go to your project settings in Vercel Dashboard
2. Navigate to "Domains"
3. Add your custom domain
4. Update your domain's DNS records as instructed

---

## Build Information

- Framework: Next.js 16
- Node Version: 18.x or higher
- Package Manager: Bun
- Build Command: `bun run build`
- Output Directory: `.next`

## Features

✅ Simple Text Editor with print and download
✅ Rich Text Editor with:
  - 13 Bengali fonts support
  - Text formatting (bold, italic, underline, etc.)
  - Color pickers with opacity control
  - Headings, lists, quotes
  - Text alignment
  - PDF export with Bengali font rendering
  - Keyboard typing sound
✅ Dark/Light theme toggle
✅ Collapsible tab navigation
✅ Responsive design

## Troubleshooting

### Build Fails
- Ensure all dependencies are in `package.json`
- Run `bun run build` locally to test
- Check Node.js version (use 18.x or higher)

### Fonts Not Loading
- Fonts are in `/public/fonts` - they deploy automatically
- Verify font paths in `globals.css`

### PDF Export Issues
- PDF export works client-side (no server required)
- Uses html2canvas + jsPDF libraries

---

**Repository**: BanglaPDFGeneratorWithMultipleFonts  
**Author**: Abdullah Al Maksud  
**License**: All rights reserved

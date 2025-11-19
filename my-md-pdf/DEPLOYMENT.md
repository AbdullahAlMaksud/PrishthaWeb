# Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AbdullahAlMaksud/BanglaPDFGeneratorWithMultipleFonts)

## Manual Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New Project"
4. Import your GitHub repository: `AbdullahAlMaksud/BanglaPDFGeneratorWithMultipleFonts`
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd my-md-pdf
vercel

# For production deployment
vercel --prod
```

## Environment Configuration

No environment variables needed for this project. Everything runs client-side!

## Build Settings

- **Framework**: Next.js 16
- **Node Version**: 20.x (automatic)
- **Install Command**: `npm install`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## Font Files

✅ All 14 Bangla fonts are included in `/public/fonts/` and will be deployed automatically.

## Post-Deployment

After successful deployment, you'll get a URL like:
- `https://your-project.vercel.app`

The application will be live with:
- ✅ Markdown editor
- ✅ Live preview
- ✅ 14 Bangla fonts
- ✅ PDF generation
- ✅ All features working client-side

## Troubleshooting

### Build Errors

If build fails, check:
1. All dependencies are installed: `npm install`
2. Build works locally: `npm run build`
3. No TypeScript errors: `npm run lint`

### Font Loading Issues

Fonts are in `/public/fonts/` which maps to `/fonts/` in production.
No changes needed - this works automatically on Vercel.

## Custom Domain (Optional)

After deployment:
1. Go to your project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Performance

Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Image optimization
- ✅ Edge caching
- ✅ Fast font delivery

Enjoy your deployed Bangla PDF Generator! 🎉

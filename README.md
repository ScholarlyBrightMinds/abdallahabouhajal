# ScholarSite 2.0

A fully responsive, modern website template designed for academic researchers to showcase their research, publications, and accomplishments. This template is perfect for creating a personal academic website to share your work with the world.

![GitHub Stars](https://img.shields.io/github/stars/muhammedrashidx/ScholarSite_2.0?style=social)
![GitHub Forks](https://img.shields.io/github/forks/muhammedrashidx/ScholarSite_2.0?style=social)

## ✨ Features

- **Responsive Design**: Adapts to different screen sizes (mobile, tablet, desktop)
- **Easy to Customize**: Well-commented CSS and HTML for easy edits
- **Modern Look**: Clean and minimal design perfect for academic profiles
- **Complete Pages**: About page (index.html), Research Project page (projects.html), Publications page (publications.html), About page (about.html), Blog page (blog.html)
- **Fast Loading**: Optimized for speed and performance
- **SEO Friendly**: Structured for search engine optimization

## 🚀 Complete Setup Guide for Beginners

### Step 1: Install Required Software

Before we start, you need to install the following software on your computer:

#### 1.1 Install Git
- **Windows**: Download from [git-scm.com](https://git-scm.com/download/win) and run the installer
- **Mac**: Install via Homebrew: `brew install git` or download from [git-scm.com](https://git-scm.com/download/mac)
- **Linux**: Use your package manager: `sudo apt install git` (Ubuntu/Debian) or `sudo yum install git` (CentOS/RHEL)

#### 1.2 Install Visual Studio Code
- Download from [code.visualstudio.com](https://code.visualstudio.com/)
- Install the downloaded file
- Open VS Code after installation

#### 1.3 Install Live Server Extension (for VS Code)
1. Open VS Code
2. Click on the Extensions icon in the sidebar (or press `Ctrl+Shift+X`)
3. Search for "Live Server"
4. Install the extension by Ritwick Dey

### Step 2: Set Up Git (First Time Only)

If this is your first time using Git, you need to configure it with your details:

1. Open Terminal (Mac/Linux) or Command Prompt/PowerShell (Windows)
2. Run these commands (replace with your actual name and email):

```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"
```

**Important**: Use the same email address that you use for your GitHub account.

### Step 3: Create a GitHub Account

1. Go to [github.com](https://github.com)
2. Click "Sign up" and create your account
3. Verify your email address
4. Choose a username that's professional (you'll use this in your website URL)

### Step 4: Fork the ScholarSite Repository

1. Go to the [ScholarSite repository](https://github.com/muhammedrashidx/ScholarSite_2.0)
2. Click the **Fork** button in the top-right corner
3. This creates your own copy of the repository

[![Fork the Repository](https://img.shields.io/badge/Fork%20The%20Repository-blue?style=for-the-badge)](https://github.com/muhammedrashidx/ScholarSite_2.0/fork)

### Step 5: Clone Your Repository

Now you'll download your forked repository to your computer:

#### Option A: Using VS Code (Recommended for beginners)
1. Open VS Code
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type "Git: Clone" and select it
4. Enter your repository URL: `https://github.com/YOUR-USERNAME/ScholarSite.git`
5. Choose a folder on your computer to save the project
6. Click "Open" when VS Code asks if you want to open the cloned repository

#### Option B: Using Command Line
1. Open Terminal/Command Prompt
2. Navigate to where you want to save the project:
   ```bash
   cd Desktop  # or wherever you want to save it
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ScholarSite.git
   ```
4. Open the project in VS Code:
   ```bash
   cd ScholarSite
   code .
   ```

### Step 6: Customize Your Website

Now comes the fun part - making it yours!

#### 6.1 Edit Your Profile (index.html)
1. Open `index.html` in VS Code
2. Replace placeholder text with your information:
   - Your name
   - Your bio/description
   - Your profile picture (add your photo to the `images` folder)
   - Your contact information
   - Links to your social media/professional profiles

#### 6.2 Add Your Research Projects (projects.html)
1. Open `research.html`
2. Add your research projects with:
   - Project titles
   - Descriptions
   - Images (if any)
   - Links to papers or project pages

#### 6.3 List Your Publications (publications.html)
1. Open `publications.html`
2. Add your published works:
   - Paper titles
   - Journal/Conference names
   - Publication dates
   - Links to full text or abstracts

#### 6.4 Add About (about.html)
1. Open `gallery.html`
2. Add images of:
   - Your research work
   - Conference presentations
   - Lab photos
   - Academic events

#### 6.5 Customize Styling (style.css)(projects.css)(publications.css)(blog.css)
1. Open `style.css` / `projects.css` / `publications.css` / `blog.css` /
2. The CSS is well-commented - you can easily change:
   - Colors
   - Fonts
   - Layout spacing
   - Background images

### Step 7: Preview Your Website Locally

Before publishing, test your website:

1. Right-click on `index.html` in VS Code
2. Select "Open with Live Server"
3. Your website will open in your browser
4. Any changes you make will automatically refresh the page

### Step 8: Save Your Changes to GitHub

Once you're happy with your changes:

1. In VS Code, open the Terminal (`Ctrl+` ` or View > Terminal)
2. Run these commands:

```bash
# Add all your changes
git add .

# Commit your changes with a message
git commit -m "Customize website with my information"

# Push changes to GitHub
git push origin main
```

**Note**: The first time you push, you might be asked to authenticate with GitHub. Follow the prompts to sign in.

### Step 9: Publish Your Website with GitHub Pages

Now let's make your website live on the internet:

#### 9.1 Rename Your Repository (Recommended)
1. Go to your repository on GitHub
2. Click on "Settings" (in your repository, not your profile)
3. Scroll down to "Repository name"
4. Rename it to: `YOUR-USERNAME.github.io`
   - For example, if your username is `janedoe`, rename it to `janedoe.github.io`
5. Click "Rename"

#### 9.2 Enable GitHub Pages
1. Still in Settings, scroll down to "Pages" in the left sidebar
2. Under "Source", select "Deploy from a branch"
3. Choose "main" branch and "/ (root)" folder
4. Click "Save"

[![Enable GitHub Pages](https://img.shields.io/badge/Enable%20GitHub%20Pages-blue?style=for-the-badge)](https://docs.github.com/en/pages/getting-started-with-github-pages)

#### 9.3 Access Your Live Website
- After 5-10 minutes, your website will be live at: `https://YOUR-USERNAME.github.io`
- You can share this URL with anyone!

## 🔧 Advanced Customization

### Adding Google Analytics
1. Create a Google Analytics account
2. Get your tracking code
3. Add it to the `<head>` section of all HTML files

### Custom Domain (Optional)
1. Buy a domain name
2. In your repository settings, go to Pages
3. Add your custom domain in the "Custom domain" field
4. Update your domain's DNS settings to point to GitHub Pages

### Adding a Contact Form
You can integrate services like:
- Formspree
- Netlify Forms
- Google Forms

## 📱 Mobile Optimization

Your ScholarSite is already mobile-responsive, but you can further optimize:
- Test on different devices using browser developer tools
- Optimize images for faster loading
- Consider implementing Progressive Web App features

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m "Add new feature"`
6. Push: `git push origin feature-name`
7. Create a Pull Request

## 🆘 Troubleshooting

### Common Issues

**Git authentication problems**:
- GitHub now requires personal access tokens instead of passwords
- Go to GitHub Settings > Developer settings > Personal access tokens
- Generate a new token and use it as your password

**Website not updating**:
- Changes can take 5-10 minutes to appear on GitHub Pages
- Clear your browser cache
- Check that you pushed your changes: `git status`

**Images not showing**:
- Make sure image paths are correct
- Use forward slashes (/) in paths, even on Windows
- Check image file extensions match what's in your HTML

**CSS not applying**:
- Check that the CSS file path is correct in your HTML
- Clear browser cache
- Validate your CSS for syntax errors

### Getting Help

- Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
- Visit [Stack Overflow](https://stackoverflow.com) for coding questions
- Create an issue in the repository for bugs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Show Your Support

If ScholarSite helped you create your academic website, please:

[![Star the Repository](https://img.shields.io/badge/Star%20The%20Repository-yellow?style=for-the-badge)](https://github.com/muhammedrashidx/ScholarSite_2.0/stargazers)
[![Fork the Repository](https://img.shields.io/badge/Fork%20The%20Repository-blue?style=for-the-badge)](https://github.com/muhammedrashidx/ScholarSite_2.0/fork)

---

### 🎉 Congratulations! You now have your own professional academic website!

Share your website URL with colleagues, include it in your email signature, add it to your CV, and let the world see your amazing research work!

**Need help?** Open an issue in the repository, and we'll help you get your website up and running.

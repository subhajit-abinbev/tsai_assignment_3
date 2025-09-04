# Creative Story & Poem Generator 🎭✨

A lightweight AI-powered web application that generates creative stories and poems using Google Gemini API. Perfect for hosting on AWS EC2 free tier!

## Features

- **🎨 Creative Content Generation**: Generate stories and poems with different styles
- **🎭 Multiple Styles**: Funny, Scary, Romantic, Mysterious, Adventurous, Heartwarming
- **📖 Dual Content Types**: Both stories and poems
- **🔄 Regenerate Function**: Get multiple versions of the same prompt
- **📱 Responsive Design**: Works on desktop and mobile
- **✨ Smooth Animations**: Beautiful UI with particle effects and transitions
- **⚡ Lightweight**: Optimized for AWS EC2 free tier

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI**: Google Gemini API
- **Deployment**: Designed for AWS EC2

## Quick Start

### 1. Prerequisites

- Python 3.8+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd tsai_assignment_3

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Configuration

Edit the `.env` file:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=8000
```

### 4. Run Locally

```bash
# Start the server
python main.py

# Or use uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000` to use the application!

## AWS EC2 Deployment (Free Tier)

### 1. Launch EC2 Instance

- Choose **Ubuntu 22.04 LTS** (Free tier eligible)
- Instance type: **t2.micro** (Free tier)
- Configure security group to allow HTTP (port 80) and SSH (port 22)

### 2. Connect and Setup

```bash
# Connect to your instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip git nginx -y

# Clone your repository
git clone <your-repo-url>
cd tsai_assignment_3

# Install dependencies
pip3 install -r requirements.txt
```

### 3. Configure Environment

```bash
# Create .env file
nano .env
# Add your GEMINI_API_KEY and set PORT=8000
```

### 4. Create Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/story-generator.service
```

Add this content:
```ini
[Unit]
Description=Creative Story Generator
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/tsai_assignment_3
Environment=PATH=/home/ubuntu/.local/bin
ExecStart=/home/ubuntu/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

### 5. Configure Nginx

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/story-generator
```

Add this content:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 public IP

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. Start Services

```bash
# Enable and start the application
sudo systemctl enable story-generator
sudo systemctl start story-generator

# Enable nginx site
sudo ln -s /etc/nginx/sites-available/story-generator /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Check status
sudo systemctl status story-generator
sudo systemctl status nginx
```

## API Endpoints

### Health Check
```
GET /health
```

### Generate Content
```
POST /generate
Content-Type: application/json

{
    "topic": "space adventure",
    "style": "funny",
    "content_type": "story"
}
```

## Project Structure

```
tsai_assignment_3/
├── main.py              # FastAPI backend
├── requirements.txt     # Python dependencies
├── .env.example        # Environment template
├── static/             # Frontend files
│   ├── index.html      # Main HTML page
│   ├── style.css       # Styles and animations
│   └── script.js       # JavaScript functionality
└── README.md           # This file
```

## Customization

### Adding New Styles
1. Update the `style` options in `static/index.html`
2. Add corresponding emoji in `script.js` `getStyleEmoji()` function
3. Optionally adjust prompts in `main.py`

### Modifying UI
- Edit `static/style.css` for styling changes
- Modify `static/script.js` for functionality updates
- Update `static/index.html` for structure changes

## Cost Optimization for AWS Free Tier

- **EC2**: t2.micro instance (750 hours/month free)
- **Data Transfer**: 15 GB outbound free
- **Storage**: 30 GB EBS free
- **Gemini API**: Pay-per-use (very cost-effective for moderate usage)

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your Gemini API key is correctly set in `.env`
2. **Port Issues**: Ensure port 8000 is not blocked by firewall
3. **Permission Errors**: Check file permissions and user ownership
4. **Service Won't Start**: Check logs with `sudo journalctl -u story-generator -f`

### Logs

```bash
# Check application logs
sudo journalctl -u story-generator -f

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Performance Tips

- The application is optimized for low resource usage
- Gemini API calls are cached on the frontend to avoid duplicates
- Static files are served efficiently by nginx
- Animations use CSS transforms for better performance

## Security Considerations

- API key is server-side only (not exposed to frontend)
- CORS is configured for your domain
- Input validation on both frontend and backend
- Rate limiting can be added if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

---

**Enjoy creating amazing stories and poems with AI! ✨🎭**

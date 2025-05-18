// API configuration
export const API_BASE_URL = 'http://localhost:8000';

// Social media platform configuration
export const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E1306C',
    enabled: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    enabled: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'tiktok',
    color: '#000000',
    enabled: false,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    enabled: false,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: '#4267B2',
    enabled: false,
  },
];

// Video processing configuration
export const VIDEO_CONFIG = {
  maxFileSize: 1000 * 1024 * 1024, // 1000MB
  allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  allowedExtensions: ['.mp4', '.mov', '.avi'],
};

// Video player configuration
export const PLAYER_CONFIG = {
  controls: true,
  autoplay: false,
  fluid: true,
  responsive: true,
  preload: 'auto',
};
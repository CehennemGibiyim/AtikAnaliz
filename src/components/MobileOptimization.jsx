// Mobile Optimization Component
// Touch gestures, theme switching, mobile UI enhancements

import React, { useState, useEffect, useRef } from 'react';

const MobileOptimization = ({ 
  onThemeChange, 
  onGestureAction,
  isMobile 
}) => {
  const [theme, setTheme] = useState('dark');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [pinchZoom, setPinchZoom] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [compactMode, setCompactMode] = useState(false);
  
  const touchStartRef = useRef(null);
  const lastTouchRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return isMobileDevice || window.innerWidth < 768;
    };

    const mobile = checkMobile();
    if (onGestureAction) {
      onGestureAction({ type: 'device_detected', isMobile: mobile });
    }
  }, [onGestureAction]);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('atik_theme') || 'dark';
    setTheme(savedTheme);
    setIsDarkMode(savedTheme === 'dark');
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (selectedTheme) => {
    const root = document.documentElement;
    
    if (selectedTheme === 'dark') {
      root.style.setProperty('--bg0', '#0b0e17');
      root.style.setProperty('--bg1', '#111520');
      root.style.setProperty('--bg2', '#161b2e');
      root.style.setProperty('--bg3', '#1c2340');
      root.style.setProperty('--text-primary', '#eaecef');
      root.style.setProperty('--text-secondary', '#848e9c');
      root.style.setProperty('--border-color', '#2b3158');
      root.style.setProperty('--accent-green', '#0ecb81');
      root.style.setProperty('--accent-red', '#f6465d');
      root.style.setProperty('--accent-yellow', '#f0b90b');
    } else if (selectedTheme === 'light') {
      root.style.setProperty('--bg0', '#ffffff');
      root.style.setProperty('--bg1', '#f7f8fa');
      root.style.setProperty('--bg2', '#e9ecef');
      root.style.setProperty('--bg3', '#dee2e6');
      root.style.setProperty('--text-primary', '#1a1a1a');
      root.style.setProperty('--text-secondary', '#6c757d');
      root.style.setProperty('--border-color', '#dee2e6');
      root.style.setProperty('--accent-green', '#28a745');
      root.style.setProperty('--accent-red', '#dc3545');
      root.style.setProperty('--accent-yellow', '#ffc107');
    } else if (selectedTheme === 'blue') {
      root.style.setProperty('--bg0', '#0a0e27');
      root.style.setProperty('--bg1', '#151932');
      root.style.setProperty('--bg2', '#1e2139');
      root.style.setProperty('--bg3', '#272b47');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#8892b0');
      root.style.setProperty('--border-color', '#2f3656');
      root.style.setProperty('--accent-green', '#00d4aa');
      root.style.setProperty('--accent-red', '#ff4757');
      root.style.setProperty('--accent-yellow', '#ffa502');
    }

    localStorage.setItem('atik_theme', selectedTheme);
    if (onThemeChange) {
      onThemeChange(selectedTheme);
    }
  };

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    setTouchStart(touchStartRef.current);
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    
    // Detect pinch zoom
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (lastTouchRef.current && lastTouchRef.current.distance) {
        const scale = distance / lastTouchRef.current.distance;
        setPinchZoom(prev => Math.max(0.5, Math.min(3, prev * scale)));
      }
      
      lastTouchRef.current = { distance };
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    const deltaTime = endTime - touchStartRef.current.time;

    // Determine swipe direction
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    if (Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime) {
      const direction = deltaX > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      
      if (onGestureAction) {
        onGestureAction({ 
          type: 'swipe', 
          direction,
          velocity: Math.abs(deltaX) / deltaTime
        });
      }
    }

    // Detect tap
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200) {
      if (onGestureAction) {
        onGestureAction({ type: 'tap', x: endX, y: endY });
      }
    }

    // Reset
    touchStartRef.current = null;
    lastTouchRef.current = null;
    setTouchStart(null);
    setTouchEnd({ x: endX, y: endY });
  };

  // Font size management
  const changeFontSize = (size) => {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };

    document.documentElement.style.fontSize = sizes[size];
    setFontSize(size);
    localStorage.setItem('atik_fontsize', size);
  };

  // Load saved preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem('atik_fontsize') || 'medium';
    const savedCompactMode = localStorage.getItem('atik_compact') === 'true';
    
    changeFontSize(savedFontSize);
    setCompactMode(savedCompactMode);
  }, []);

  // Mobile viewport optimization
  useEffect(() => {
    const handleViewportChange = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleViewportChange();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, []);

  // Haptic feedback (if available)
  const triggerHaptic = (type) => {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'success':
          navigator.vibrate([10, 50, 10]);
          break;
        case 'error':
          navigator.vibrate([100, 50, 100]);
          break;
        default:
          navigator.vibrate(25);
      }
    }
  };

  const themeOptions = [
    { key: 'dark', label: '🌙 Dark', colors: '#0b0e17,#111520,#161b2e' },
    { key: 'light', label: '☀️ Light', colors: '#ffffff,#f7f8fa,#e9ecef' },
    { key: 'blue', label: '🌊 Ocean', colors: '#0a0e27,#151932,#1e2139' }
  ];

  const fontSizeOptions = [
    { key: 'small', label: 'Küçük', size: '14px' },
    { key: 'medium', label: 'Orta', size: '16px' },
    { key: 'large', label: 'Büyük', size: '18px' },
    { key: 'xlarge', label: 'Çok Büyük', size: '20px' }
  ];

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border-color)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <div style={{
          fontSize: 10,
          color: 'var(--text-secondary)',
          letterSpacing: 2,
          fontWeight: 700
        }}>
          📱 MOBİL OPTİMİZASYON
        </div>
        <div style={{
          background: isMobile ? '#0ecb8115' : '#f6465d15',
          border: `1px solid ${isMobile ? '#0ecb8140' : '#f6465d40'}`,
          borderRadius: 8,
          padding: '4px 8px',
          fontSize: 9,
          fontWeight: 700,
          color: isMobile ? '#0ecb81' : '#f6465d'
        }}>
          {isMobile ? 'MOBİL' : 'DESKTOP'}
        </div>
      </div>

      {/* Theme Selection */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 9,
          color: 'var(--text-secondary)',
          marginBottom: 6,
          fontWeight: 700
        }}>
          🎨 TEMA SEÇİMİ
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {themeOptions.map(themeOption => (
            <button
              key={themeOption.key}
              onClick={() => {
                applyTheme(themeOption.key);
                triggerHaptic('light');
              }}
              style={{
                padding: '12px 8px',
                borderRadius: 10,
                border: `2px solid ${theme === themeOption.key ? 'var(--accent-green)' : 'var(--border-color)'}`,
                background: `linear-gradient(135deg, ${themeOption.colors.split(',')[0]}, ${themeOption.colors.split(',')[1]})`,
                color: themeOption.key === 'dark' ? '#ffffff' : themeOption.key === 'light' ? '#1a1a1a' : '#ffffff',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: theme === themeOption.key ? '0 4px 20px var(--accent-green)40' : 'none'
              }}
            >
              {themeOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 9,
          color: 'var(--text-secondary)',
          marginBottom: 6,
          fontWeight: 700
        }}>
          📝 YAZI BOYUTU
        </div>
        
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {fontSizeOptions.map(fontOption => (
            <button
              key={fontOption.key}
              onClick={() => {
                changeFontSize(fontOption.key);
                triggerHaptic('light');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${fontSize === fontOption.key ? 'var(--accent-green)' : 'var(--border-color)'}`,
                background: fontSize === fontOption.key ? 'var(--accent-green)15' : 'transparent',
                color: fontSize === fontOption.key ? 'var(--accent-green)' : 'var(--text-secondary)',
                fontSize: 9,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {fontOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Specific Options */}
      {isMobile && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 9,
            color: 'var(--text-secondary)',
            marginBottom: 6,
            fontWeight: 700
          }}>
            👆 DOKUNMATİK JESTLER
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              fontSize: 9, 
              color: 'var(--text-secondary)', 
              cursor: 'pointer' 
            }}>
              <input
                type="checkbox"
                checked={compactMode}
                onChange={(e) => {
                  setCompactMode(e.target.checked);
                  localStorage.setItem('atik_compact', e.target.checked);
                  triggerHaptic('light');
                }}
                style={{ accentColor: 'var(--accent-green)' }}
              />
              <span>Sıkışık Mod</span>
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              fontSize: 9, 
              color: 'var(--text-secondary)', 
              cursor: 'pointer' 
            }}>
              <input
                type="checkbox"
                checked={pinchZoom > 1}
                onChange={(e) => {
                  setPinchZoom(e.target.checked ? 1.5 : 1);
                  triggerHaptic('light');
                }}
                style={{ accentColor: 'var(--accent-green)' }}
              />
              <span>Yakınlaştırma</span>
            </label>
          </div>
        </div>
      )}

      {/* Gesture Status */}
      {isMobile && (
        <div style={{
          background: 'var(--bg1)',
          borderRadius: 10,
          padding: 12,
          fontSize: 9,
          color: 'var(--text-secondary)',
          lineHeight: 1.6
        }}>
          <div style={{ marginBottom: 6 }}>
            <strong>👆 Jest Durumu:</strong>
          </div>
          <div>Son Kaydırma: {swipeDirection || 'Yok'}</div>
          <div>Başlangıç: {touchStart ? `(${touchStart.x}, ${touchStart.y})` : 'Yok'}</div>
          <div>Bitiş: {touchEnd ? `(${touchEnd.x}, ${touchEnd.y})` : 'Yok'}</div>
          <div>Yakınlaştırma: {pinchZoom.toFixed(2)}x</div>
        </div>
      )}

      {/* Touch Event Handlers */}
      {isMobile && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Info Panel */}
      <div style={{
        background: 'var(--bg1)',
        borderRadius: 10,
        padding: 12,
        fontSize: 9,
        color: 'var(--text-secondary)',
        lineHeight: 1.6
      }}>
        <div style={{ marginBottom: 6 }}>
          <strong>💡 Mobil Özellikler:</strong>
        </div>
        <div>• 🎨 3 farklı tema seçeneği</div>
        <div>• 📝 Ayarlanabilir yazı boyutu</div>
        <div>• 👆 Dokunmatik jest desteği</div>
        <div>• 📱 Mobil uyumlu arayüz</div>
        <div>• 🔄 Otomatik yön değişimi</div>
        <div>• 🎳 Titreşim geri bildirimi</div>
      </div>
    </div>
  );
};

export default MobileOptimization;

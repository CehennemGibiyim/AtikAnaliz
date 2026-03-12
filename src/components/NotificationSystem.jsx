// Advanced Notification System
// Web push notifications, email alerts, and in-app notifications

import React, { useState, useEffect, useCallback } from 'react';

const NotificationSystem = ({ 
  onNotification, 
  isAuthenticated,
  telegramEnabled,
  emailEnabled 
}) => {
  const [notifications, setNotifications] = useState([]);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const [emailSettings, setEmailSettings] = useState({
    enabled: false,
    address: '',
    priceAlerts: true,
    positionAlerts: true,
    riskAlerts: true
  });
  const [pushSettings, setPushSettings] = useState({
    enabled: false,
    priceAlerts: true,
    positionAlerts: true,
    riskAlerts: true,
    signalAlerts: true
  });

  // Initialize push notifications
  useEffect(() => {
    if ('Notification' in window) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
    }

    // Load saved settings
    const savedEmailSettings = localStorage.getItem('email_settings');
    const savedPushSettings = localStorage.getItem('push_settings');
    
    if (savedEmailSettings) {
      setEmailSettings(JSON.parse(savedEmailSettings));
    }
    if (savedPushSettings) {
      setPushSettings(JSON.parse(savedPushSettings));
    }
  }, []);

  // Request push permission
  const requestPushPermission = async () => {
    if (!pushSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Push permission error:', error);
      return false;
    }
  };

  // Show browser notification
  const showBrowserNotification = useCallback((title, body, icon = null, url = null) => {
    if (!pushSupported || pushPermission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body: body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: `atik-${Date.now()}`,
        requireInteraction: false,
        silent: false
      });

      notification.onclick = () => {
        if (url) window.open(url, '_blank');
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

    } catch (error) {
      console.error('Browser notification error:', error);
    }
  }, [pushSupported, pushPermission]);

  // Send email notification (mock implementation)
  const sendEmailNotification = async (subject, message, priority = 'normal') => {
    if (!emailSettings.enabled || !emailSettings.address) return;

    try {
      // In a real implementation, you would integrate with an email service
      // like SendGrid, Mailgun, or AWS SES
      console.log('Email notification:', {
        to: emailSettings.address,
        subject: `🦅 AtikAnaliz: ${subject}`,
        message,
        priority
      });

      // Mock email send
      return true;
    } catch (error) {
      console.error('Email notification error:', error);
      return false;
    }
  };

  // Add notification to system
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50));

    // Show browser notification if enabled
    if (pushSettings.enabled && pushSettings[notification.type + 'Alerts']) {
      showBrowserNotification(
        notification.title,
        notification.message,
        notification.icon,
        notification.url
      );
    }

    // Send email if enabled
    if (emailSettings.enabled && emailSettings[notification.type + 'Alerts']) {
      sendEmailNotification(
        notification.subject || notification.title,
        notification.message,
        notification.priority
      );
    }

    // Call parent callback
    if (onNotification) {
      onNotification(newNotification);
    }
  }, [pushSettings, emailSettings, showBrowserNotification, sendEmailNotification, onNotification]);

  // Price alert notification
  const notifyPriceAlert = useCallback((coin, currentPrice, targetPrice, direction) => {
    const isAbove = direction === 'above';
    const title = `📈 ${coin} Hedef Fiyata Ulaştı!`;
    const message = `${coin} ${isAbove ? 'üzerine' : 'altına'} çıktı!\nHedef: $${targetPrice.toFixed(4)}\nMevcut: $${currentPrice.toFixed(4)}`;
    
    addNotification({
      type: 'price',
      title,
      message,
      icon: '/favicon.ico',
      url: `/#chart?coin=${coin}`,
      priority: 'high',
      data: { coin, currentPrice, targetPrice, direction }
    });
  }, [addNotification]);

  // Position alert notification
  const notifyPositionAlert = useCallback((position, action, pnl = 0) => {
    const actionText = action === 'opened' ? 'Açıldı' : 'Kapatıldı';
    const pnlText = pnl !== 0 ? ` (PnL: $${pnl.toFixed(2)})` : '';
    const title = `📊 Pozisyon ${actionText}`;
    const message = `${position.symbol} ${position.side} pozisyonu ${actionText}${pnlText}\nFiyat: $${position.entryPrice}`;
    
    addNotification({
      type: 'position',
      title,
      message,
      icon: '/favicon.ico',
      url: `/#portfolio`,
      priority: action === 'opened' ? 'normal' : 'high',
      data: { position, action, pnl }
    });
  }, [addNotification]);

  // Risk alert notification
  const notifyRiskAlert = useCallback((riskScore, riskLevel, message) => {
    const title = `⚠️ Risk Uyarısı`;
    const riskEmoji = riskLevel === 'critical' ? '🚨' : riskLevel === 'high' ? '⚠️' : '⚡';
    
    addNotification({
      type: 'risk',
      title,
      message: `${riskEmoji} Risk Skoru: ${riskScore}/100\n${message}`,
      icon: '/favicon.ico',
      url: `/#settings`,
      priority: riskLevel === 'critical' ? 'critical' : 'high',
      data: { riskScore, riskLevel, message }
    });
  }, [addNotification]);

  // Signal alert notification
  const notifySignalAlert = useCallback((signal) => {
    const title = `🎯 Yüksek Güvenilir Sinyal!`;
    const message = `${signal.symbol} ${signal.direction}\nGüven: ${signal.confidence}%\nFiyat: $${signal.price}`;
    
    addNotification({
      type: 'signal',
      title,
      message,
      icon: '/favicon.ico',
      url: `/#chart?coin=${signal.symbol}`,
      priority: 'normal',
      data: { signal }
    });
  }, [addNotification]);

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Update settings
  const updateEmailSettings = (key, value) => {
    const newSettings = { ...emailSettings, [key]: value };
    setEmailSettings(newSettings);
    localStorage.setItem('email_settings', JSON.stringify(newSettings));
  };

  const updatePushSettings = (key, value) => {
    const newSettings = { ...pushSettings, [key]: value };
    setPushSettings(newSettings);
    localStorage.setItem('push_settings', JSON.stringify(newSettings));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{
      background: '#161b2e',
      border: '1px solid #2b3158',
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
          color: '#848e9c',
          letterSpacing: 2,
          fontWeight: 700
        }}>
          🔔 BİLDİRİM SİSTEMİ
        </div>
        {unreadCount > 0 && (
          <div style={{
            background: '#f6465d',
            color: '#fff',
            borderRadius: 10,
            padding: '2px 8px',
            fontSize: 9,
            fontWeight: 700
          }}>
            {unreadCount} YENİ
          </div>
        )}
      </div>

      {/* Push Notifications */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 9,
          color: '#848e9c',
          marginBottom: 6,
          fontWeight: 700
        }}>
          📱 TARAYICI BİLDİRİMLERİ
        </div>
        
        {!pushSupported ? (
          <div style={{
            background: '#f6465d10',
            border: '1px solid #f6465d33',
            borderRadius: 8,
            padding: 10,
            fontSize: 10,
            color: '#f6465d'
          }}>
            ⚠️ Tarayıcınız bildirimleri desteklemiyor
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <button
              onClick={requestPushPermission}
              disabled={pushPermission === 'granted'}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${pushPermission === 'granted' ? '#0ecb81' : '#2b3158'}`,
                background: pushPermission === 'granted' ? '#0ecb8115' : 'transparent',
                color: pushPermission === 'granted' ? '#0ecb81' : '#848e9c',
                fontSize: 9,
                fontWeight: 700,
                cursor: pushPermission === 'granted' ? 'default' : 'pointer'
              }}
            >
              {pushPermission === 'granted' ? '✅ İzin Verildi' : '📩 İzin İste'}
            </button>
            <span style={{ fontSize: 9, color: '#848e9c' }}>
              Durum: {pushPermission === 'granted' ? 'Aktif' : pushPermission === 'denied' ? 'Reddedildi' : 'Bekleniyor'}
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['priceAlerts', 'positionAlerts', 'riskAlerts', 'signalAlerts'].map(alertType => (
            <label key={alertType} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#848e9c', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={pushSettings[alertType]}
                onChange={(e) => updatePushSettings(alertType, e.target.checked)}
                disabled={pushPermission !== 'granted'}
                style={{ accentColor: '#0ecb81' }}
              />
              <span>
                {alertType === 'priceAlerts' ? 'Fiyat Uyarıları' :
                 alertType === 'positionAlerts' ? 'Pozisyon Uyarıları' :
                 alertType === 'riskAlerts' ? 'Risk Uyarıları' :
                 'Sinyal Uyarıları'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Email Notifications */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 9,
          color: '#848e9c',
          marginBottom: 6,
          fontWeight: 700
        }}>
          📧 E-MAİL BİLDİRİMLERİ
        </div>
        
        <div style={{ marginBottom: 8 }}>
          <input
            type="email"
            value={emailSettings.address}
            onChange={(e) => updateEmailSettings('address', e.target.value)}
            placeholder="email@example.com"
            style={{
              width: '100%',
              background: '#0b0e17',
              border: '1px solid #2b3158',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#eaecef',
              fontSize: 10,
              marginBottom: 8
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['priceAlerts', 'positionAlerts', 'riskAlerts'].map(alertType => (
            <label key={alertType} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#848e9c', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailSettings[alertType]}
                onChange={(e) => updateEmailSettings(alertType, e.target.checked)}
                disabled={!emailSettings.address}
                style={{ accentColor: '#0ecb81' }}
              />
              <span>
                {alertType === 'priceAlerts' ? 'Fiyat Uyarıları' :
                 alertType === 'positionAlerts' ? 'Pozisyon Uyarıları' :
                 'Risk Uyarıları'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8
          }}>
            <div style={{
              fontSize: 9,
              color: '#848e9c',
              fontWeight: 700
            }}>
              📋 SON BİLDİRİMLER
            </div>
            <button
              onClick={clearAll}
              style={{
                background: 'none',
                border: '1px solid #f6465d44',
                borderRadius: 6,
                padding: '4px 8px',
                color: '#f6465d',
                fontSize: 8,
                cursor: 'pointer'
              }}
            >
              Temizle
            </button>
          </div>
          
          <div style={{
            background: '#0b0e17',
            borderRadius: 10,
            maxHeight: 200,
            overflowY: 'auto'
          }}>
            {notifications.slice(0, 10).map(notification => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                style={{
                  background: notification.read ? 'transparent' : '#0ecb8110',
                  border: notification.read ? 'none' : '1px solid #0ecb8133',
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 4
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#eaecef',
                      marginBottom: 2
                    }}>
                      {notification.title}
                    </div>
                    <div style={{
                      fontSize: 9,
                      color: '#848e9c',
                      lineHeight: 1.4
                    }}>
                      {notification.message}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 8,
                    color: '#848e9c',
                    marginLeft: 8
                  }}>
                    {new Date(notification.timestamp).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export notification functions */}
      <div style={{
        background: '#0b0e17',
        borderRadius: 10,
        padding: 12,
        fontSize: 9,
        color: '#848e9c',
        lineHeight: 1.6
      }}>
        <div style={{ marginBottom: 6 }}>
          <strong>💡 Kullanım:</strong>
        </div>
        <div>• Tarayıcı bildirimleri için izin verin</div>
        <div>• Email ile önemli uyarıları alın</div>
        <div>• Tüm bildirimler geçmişe kaydedilir</div>
        <div>• Bildirimler özelleştirilebilir</div>
      </div>
    </div>
  );
};

// Export notification functions for global use
export const NotificationAPI = {
  notifyPriceAlert: (coin, currentPrice, targetPrice, direction) => {
    // This would be called from other components
    console.log('Price alert:', { coin, currentPrice, targetPrice, direction });
  },
  notifyPositionAlert: (position, action, pnl) => {
    console.log('Position alert:', { position, action, pnl });
  },
  notifyRiskAlert: (riskScore, riskLevel, message) => {
    console.log('Risk alert:', { riskScore, riskLevel, message });
  },
  notifySignalAlert: (signal) => {
    console.log('Signal alert:', signal);
  }
};

export default NotificationSystem;

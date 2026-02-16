import { useState } from 'react';
import { Button, Drawer, Grid, Space, Typography } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { BRANDING, NAV_LINKS, type LandingSectionId } from '../../config/branding';

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

type LandingNavbarProps = {
  onSectionClick: (sectionId: LandingSectionId) => void;
  onGetStarted: () => void;
};

/**
 * Sticky top navigation for landing page.
 */
const LandingNavbar = ({ onSectionClick, onGetStarted }: LandingNavbarProps) => {
  const screens = useBreakpoint();
  const isDesktop = Boolean(screens.md);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (sectionId: LandingSectionId) => {
    onSectionClick(sectionId);
    setMobileOpen(false);
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backdropFilter: 'blur(8px)',
          background: 'rgba(255, 255, 255, 0.86)',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top"
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: BRANDING.primaryColor,
                  display: 'inline-block',
                }}
              />
              <Title level={4} style={{ margin: 0 }}>
                {BRANDING.appName}
              </Title>
            </button>

            {isDesktop ? (
              <Space size={20} align="center">
                {NAV_LINKS.map((item) => (
                  <button
                    key={item.sectionId}
                    type="button"
                    onClick={() => handleNav(item.sectionId)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    aria-label={`Go to ${item.label}`}
                  >
                    <Text style={{ fontSize: 15 }}>{item.label}</Text>
                  </button>
                ))}
                <Button type="primary" onClick={onGetStarted}>
                  Get Started
                </Button>
              </Space>
            ) : (
              <Button
                shape="circle"
                icon={<MenuOutlined />}
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
              />
            )}
          </div>
        </div>
      </header>

      <Drawer
        title={BRANDING.appName}
        placement="right"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
      >
        <Space direction="vertical" size={14} style={{ width: '100%' }}>
          {NAV_LINKS.map((item) => (
            <Button
              key={item.sectionId}
              type="text"
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
              onClick={() => handleNav(item.sectionId)}
            >
              {item.label}
            </Button>
          ))}
          <Button type="primary" onClick={onGetStarted}>
            Get Started
          </Button>
        </Space>
      </Drawer>
    </>
  );
};

export default LandingNavbar;


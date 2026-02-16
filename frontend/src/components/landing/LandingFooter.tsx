import { Divider, Space, Typography } from 'antd';
import { BRANDING, LANDING_SECTION_IDS, NAV_LINKS, type LandingSectionId } from '../../config/branding';

const { Text } = Typography;

type LandingFooterProps = {
  onSectionClick: (sectionId: LandingSectionId) => void;
};

/**
 * Landing footer with quick links.
 */
const LandingFooter = ({ onSectionClick }: LandingFooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id={LANDING_SECTION_IDS.contact}
      style={{ background: '#101010', color: '#fff', padding: '38px 20px 26px' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>{BRANDING.appName}</Text>
          <Text style={{ color: 'rgba(255, 255, 255, 0.78)' }}>{BRANDING.oneLineDescription}</Text>
          <Text style={{ color: 'rgba(255, 255, 255, 0.78)' }}>Contact: {BRANDING.contactEmail}</Text>

          <Space size={16} wrap>
            {NAV_LINKS.map((item) => (
              <button
                key={item.sectionId}
                type="button"
                onClick={() => onSectionClick(item.sectionId)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.88)',
                  cursor: 'pointer',
                  padding: 0,
                }}
                aria-label={`Go to ${item.label}`}
              >
                {item.label}
              </button>
            ))}
          </Space>
        </Space>

        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.18)' }} />
        <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          (c) {currentYear} {BRANDING.appName}. All rights reserved.
        </Text>
      </div>
    </footer>
  );
};

export default LandingFooter;


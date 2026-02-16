import { Card, Col, Row, Typography } from 'antd';
import { SOCIAL_PROOF_ITEMS } from '../../config/branding';

const { Text } = Typography;

/**
 * Lightweight trusted-by strip.
 */
const SocialProofStrip = () => {
  return (
    <section aria-label="Trusted by teams" style={{ padding: '10px 20px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Card bordered={false} style={{ background: '#fafafa' }} styles={{ body: { padding: 16 } }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={6}>
              <Text type="secondary">Trusted by teams like:</Text>
            </Col>
            {SOCIAL_PROOF_ITEMS.map((item) => (
              <Col xs={12} md={3} key={item}>
                <div
                  style={{
                    border: '1px solid #f0f0f0',
                    borderRadius: 10,
                    padding: '8px 10px',
                    background: '#fff',
                    textAlign: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13 }}>{item}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </section>
  );
};

export default SocialProofStrip;


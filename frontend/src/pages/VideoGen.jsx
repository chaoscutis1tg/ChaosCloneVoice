import { motion } from 'framer-motion';
import { Video } from 'lucide-react';

export default function VideoGen() {
  return (
    <motion.div
      className="glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center', padding: '4rem 2rem' }}
    >
      <Video size={64} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
      <h1 className="title-gradient">Tạo Video AI</h1>
      <p className="subtitle">Tính năng đang được phát triển. Sắp ra mắt trong phiên bản tiếp theo!</p>
    </motion.div>
  );
}

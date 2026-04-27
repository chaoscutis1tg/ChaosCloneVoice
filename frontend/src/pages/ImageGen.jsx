import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';

export default function ImageGen() {
  return (
    <motion.div
      className="glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center', padding: '4rem 2rem' }}
    >
      <ImageIcon size={64} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
      <h1 className="title-gradient">Tạo Ảnh AI</h1>
      <p className="subtitle">Tính năng đang được phát triển. Sắp ra mắt trong phiên bản tiếp theo!</p>
    </motion.div>
  );
}

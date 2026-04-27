import { motion } from 'framer-motion';
import { Settings2 } from 'lucide-react';

export default function Settings() {
  return (
    <motion.div
      className="glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Settings2 size={32} color="var(--primary)" />
        <h1 className="title-gradient" style={{ margin: 0 }}>Cấu hình Hệ thống</h1>
      </div>
      
      <div className="input-group">
        <label className="input-label">Mô hình mặc định</label>
        <select className="textarea-custom" style={{ height: '50px', minHeight: 'auto' }}>
          <option>OmniVoice</option>
          <option>viXTTS</option>
        </select>
      </div>
      
      <div className="input-group">
        <label className="input-label">Thư mục lưu trữ</label>
        <input type="text" className="textarea-custom" style={{ height: '50px', minHeight: 'auto' }} value="./samples" readOnly />
      </div>

    </motion.div>
  );
}

import { motion } from 'framer-motion';
import VoiceCloner from './components/VoiceCloner';
import './index.css';

function App() {
  return (
    <div style={{ width: '100vw', maxWidth: '800px', padding: '20px' }}>
      <motion.div
        className="glass-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="title-gradient">Clone Giọng Nói</h1>
        <p className="subtitle">Công nghệ Voice Cloning & Lồng tiếng AI tức thì</p>

        <VoiceCloner />
      </motion.div>
    </div>
  );
}

export default App;

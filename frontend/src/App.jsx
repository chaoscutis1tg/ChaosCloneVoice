import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import VoiceStudio from './pages/VoiceStudio';
import ImageGen from './pages/ImageGen';
import VideoGen from './pages/VideoGen';
import Settings from './pages/Settings';
import './index.css';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<VoiceStudio />} />
          <Route path="/image-gen" element={<ImageGen />} />
          <Route path="/video-gen" element={<VideoGen />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Mic, Loader2, PlayCircle, Settings2, LayoutList, Cpu, DownloadCloud, Save, FolderOpen, Sliders } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const EMOTIONS = [
  { id: 'normal', label: ' Bình thường' },
  { id: 'happy', label: 'Vui vẻ' },
  { id: 'angry', label: 'Tức giận' },
  { id: 'sad', label: 'Buồn bã' },
  { id: 'surprised', label: 'Ngạc nhiên' }
];

export default function VoiceStudio() {

  const [renderDevice, setRenderDevice] = useState('auto');
  const [isBatch, setIsBatch] = useState(false);

  const [profiles, setProfiles] = useState({});
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('normal');

  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmotion, setNewProfileEmotion] = useState('normal');
  const [file, setFile] = useState(null);
  const [isSavingSample, setIsSavingSample] = useState(false);

  // Tuning Parameters
  const [speed, setSpeed] = useState(1.0);
  const [temperature, setTemperature] = useState(0.75);

  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/profiles`);
      const data = await res.json();
      if (data.profiles) {
        setProfiles(data.profiles);
        const profileKeys = Object.keys(data.profiles);
        if (profileKeys.length > 0 && !selectedProfile) {
          setSelectedProfile(profileKeys[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch profiles:", e);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const saveNewProfile = async () => {
    if (!file || !newProfileName.trim()) return alert("Vui lòng tải file và nhập tên nhân vật!");
    setIsSavingSample(true);
    const formData = new FormData();
    formData.append('name', newProfileName.trim());
    formData.append('emotion', newProfileEmotion);
    formData.append('file', file);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/profiles`, { method: 'POST', body: formData });
      if (res.ok) {
        alert("Đã lưu cảm xúc nhân vật vào Kho Tổng!");
        await fetchProfiles();
        setSelectedProfile(newProfileName.trim());
        setSelectedEmotion(newProfileEmotion);
        setIsCreatingProfile(false);
        setFile(null);
      }
    } catch (e) {
      alert("Lỗi khi lưu nhân vật.");
    } finally {
      setIsSavingSample(false);
    }
  };

  const getApiUrl = () => {
    return `http://${window.location.hostname}:8000/api/clone`;
  };

  const downloadZip = async () => {
    if (batchResults.length === 0) return;
    const zip = new JSZip();

    for (let i = 0; i < batchResults.length; i++) {
      const item = batchResults[i];
      if (item.success && item.url) {
        const res = await fetch(item.url);
        const blob = await res.blob();
        let safeName = item.line.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
        if (!safeName) safeName = `audio_${i + 1}`;
        zip.file(`${i + 1}_${safeName}.wav`, blob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'DubAIVoices_Batch.zip');
  };

  const callCloneApi = async (sentence) => {
    const formData = new FormData();
    formData.append('text', sentence);
    formData.append('speed', speed);
    formData.append('temperature', temperature);
    formData.append('render_device', renderDevice);

    if (isCreatingProfile && file) {
      formData.append('file', file);
      // For temporary generation without saving profile, use normal emotion
      formData.append('emotion', newProfileEmotion);
    } else {
      formData.append('sample_name', selectedProfile);
      formData.append('emotion', selectedEmotion);
    }

    const res = await fetch(getApiUrl(), { method: 'POST', body: formData });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.detail || 'Lỗi hệ thống từ Backend' };
    }
    const blob = await res.blob();
    return { url: URL.createObjectURL(blob) };
  };

  const generateVoice = async () => {
    if (!text || (!isCreatingProfile && !selectedProfile) || (isCreatingProfile && !file)) return;
    setIsGenerating(true);

    try {
      if (!isBatch) {
        setSingleResult(null);
        const result = await callCloneApi(text);
        if (result.error) {
          throw new Error(result.error);
        }
        setSingleResult(result.url);
      } else {
        setBatchResults([]);
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let results = [];

        for (let i = 0; i < lines.length; i++) {
          setCurrentBatchIndex(i + 1);
          try {
            const result = await callCloneApi(lines[i]);
            if (result.error) throw new Error(result.error);
            results.push({ line: lines[i], url: result.url, success: true });
          } catch (e) {
            results.push({ line: lines[i], url: null, success: false, error: e.message });
          }
          setBatchResults([...results]);
        }
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi: ' + (error.message || 'Có lỗi xảy ra khi gọi AI, hãy chắc chắn backend đang chạy đúng cổng!'));
    } finally {
      setIsGenerating(false);
      setCurrentBatchIndex(0);
    }
  };

  return (
    <motion.div
      className="glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <div>
        <h1 className="title-gradient">Chaos Studio</h1>
        <p className="subtitle">Thu âm, Tinh chỉnh và Lồng tiếng AI tức thì</p>
      </div>


      {/* Render Device Selection */}
      <div className="input-group">
        <label className="input-label">
          <Cpu size={18} />
          Thiết bị Render (Render Device)
        </label>
        <select
          value={renderDevice}
          onChange={(e) => setRenderDevice(e.target.value)}
          className="textarea-custom"
          style={{ height: '50px', minHeight: 'auto', color: 'white' }}
        >
          <option value="auto" style={{ color: 'black' }}>Tự động (Khuyên dùng - Ưu tiên GPU nếu có)</option>
          <option value="cpu" style={{ color: 'black' }}>CPU (Chậm hơn, dành cho máy không có Card rời)</option>
          <option value="gpu" style={{ color: 'black' }}>GPU (Nhanh, cần Card đồ họa NVIDIA rời)</option>
        </select>
      </div>

      {/* Voice Library Section */}
      <div className="input-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>
            {isCreatingProfile ? <UploadCloud size={18} /> : <FolderOpen size={18} />}
            Hồ sơ Nhân vật (Voice Profiles)
          </label>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '8px', display: 'flex', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="radio" checked={!isCreatingProfile} onChange={() => setIsCreatingProfile(false)} /> Từ Thư Viện
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="radio" checked={isCreatingProfile} onChange={() => setIsCreatingProfile(true)} /> Tạo Mới / Upload
            </label>
          </div>
        </div>

        {!isCreatingProfile ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select
              value={selectedProfile}
              onChange={(e) => {
                setSelectedProfile(e.target.value);
                setSelectedEmotion('normal');
              }}
              className="textarea-custom"
              style={{ height: '50px', minHeight: 'auto', flex: 1 }}
            >
              {Object.keys(profiles).length === 0 ? <option style={{ color: 'black' }} value="">(Chưa có nhân vật nào)</option>
                : Object.keys(profiles).map(p => <option style={{ color: 'black' }} key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="textarea-custom"
              style={{ height: '50px', minHeight: 'auto', flex: 1 }}
              disabled={!selectedProfile}
            >
              {EMOTIONS.map(e => {
                const hasEmotionFile = profiles[selectedProfile]?.emotions[e.id];
                return <option style={{ color: 'black' }} key={e.id} value={e.id}>
                  {e.label} {hasEmotionFile ? '(Sẵn sàng)' : '(Dùng AI Giả lập)'}
                </option>
              })}
            </select>
          </div>
        ) : (
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Tên nhân vật (VD: Chaos)"
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                className="textarea-custom"
                style={{ height: '40px', minHeight: 'auto', padding: '0.5rem', flex: 1 }}
              />
              <select
                value={newProfileEmotion}
                onChange={e => setNewProfileEmotion(e.target.value)}
                className="textarea-custom"
                style={{ height: '40px', minHeight: 'auto', padding: '0.5rem', flex: 1 }}
              >
                {EMOTIONS.map(e => <option style={{ color: 'black' }} key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </div>

            <div
              className={`upload-area ${file ? 'active' : ''}`}
              onClick={() => fileInputRef.current.click()}
              style={{ padding: '1rem' }}
            >
              <UploadCloud className="upload-icon" style={{ marginBottom: 0 }} />
              <p style={{ fontSize: '0.9rem' }}>{file ? file.name : 'Nhấn để tải file ghi âm cho cảm xúc này (.wav)'}</p>
            </div>
            <input type="file" accept="audio/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

            {file && (
              <button onClick={saveNewProfile} disabled={isSavingSample} style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', border: 'none', borderRadius: '6px', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                {isSavingSample ? <Loader2 className="loader" size={16} /> : <Save size={16} />} Lưu Vào Hồ Sơ "{newProfileName || 'Mới'}"
              </button>
            )}
          </div>
        )}
      </div>

      {/* Voice Tuning Parameters */}
      <div className="input-group">
        <label className="input-label" style={{ color: 'var(--accent)' }}>
          <Sliders size={18} />
          Tinh chỉnh Giọng nói (Voice Tuning)
        </label>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Speed Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <span>Tốc độ (Speed): {speed}x</span>
              <span>{speed > 1 ? 'Nhanh' : speed < 1 ? 'Chậm' : 'Bình thường'}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
            />
          </div>

          {/* Temperature Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <span>Độ sáng tạo (Temperature): {temperature}</span>
              <span>{temperature > 0.8 ? 'Cảm xúc mạnh/Ngẫu nhiên' : temperature < 0.5 ? 'Đều đều/Chính xác' : 'Cân bằng'}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Script Input */}
      <div className="input-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>
            {isBatch ? <LayoutList size={18} /> : <Mic size={18} />}
            Kịch bản lồng tiếng
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <input type="checkbox" checked={isBatch} onChange={(e) => setIsBatch(e.target.checked)} />
            Chế độ hàng loạt (Mỗi dòng 1 câu)
          </label>
        </div>
        <textarea
          className="textarea-custom"
          placeholder={isBatch ? "Nhập kịch bản ở đây.\nMỗi câu một dòng.\nHệ thống sẽ xuất ra nhiều file." : "Nhập câu thoại bạn muốn nhân vật nói ở đây..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ height: isBatch ? '200px' : '120px' }}
        />
      </div>

      {/* Generate Button */}
      <motion.button
        className="btn-primary"
        onClick={generateVoice}
        disabled={isGenerating || !text || (!isCreatingProfile && !selectedProfile) || (isCreatingProfile && !file)}
        whileTap={{ scale: 0.98 }}
      >
        {isGenerating ? (
          <>
            <Loader2 className="loader" size={20} />
            Đang tổng hợp AI... {isBatch ? `(Câu ${currentBatchIndex}/${text.split('\n').filter(l => l.trim()).length})` : ''}
          </>
        ) : (
          <>
            <PlayCircle size={20} />
            {isBatch ? 'Chạy lồng tiếng Hàng Loạt' : 'Bắt đầu Lồng tiếng'}
          </>
        )}
      </motion.button>

      {/* Results Rendering */}
      <AnimatePresence>
        {!isBatch && singleResult && (
          <motion.div className="audio-result-container" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <label className="input-label" style={{ marginBottom: '1rem', color: 'var(--primary-hover)' }}>
              <Settings2 size={18} />
              Kết quả Lồng tiếng:
            </label>
            <audio controls src={singleResult} autoPlay />
          </motion.div>
        )}

        {isBatch && batchResults.length > 0 && (
          <motion.div className="audio-result-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label" style={{ color: 'var(--primary-hover)', margin: 0 }}>
                <LayoutList size={18} />
                Kết quả Hàng Loạt:
              </label>
              <button
                onClick={downloadZip}
                style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', borderRadius: '6px', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <DownloadCloud size={16} /> Tải xuống tất cả (ZIP)
              </button>
            </div>
            {batchResults.map((r, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>{i + 1}. "{r.line}"</p>
                {r.success ? <audio controls src={r.url} style={{ height: '30px', width: '100%' }} /> : <p style={{ color: '#ff6b6b', margin: 0 }}>❌ Bị lỗi khi tạo</p>}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

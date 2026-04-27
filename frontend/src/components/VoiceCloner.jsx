import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Mic, Loader2, PlayCircle, Settings2, LayoutList, Cpu, DownloadCloud, Save, FolderOpen } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function VoiceCloner() {
  const [model, setModel] = useState('omnivoice'); 
  const [isBatch, setIsBatch] = useState(false);
  const [useSampleLib, setUseSampleLib] = useState(false);
  
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState('');
  const [newSampleName, setNewSampleName] = useState('');
  const [isSavingSample, setIsSavingSample] = useState(false);

  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Fetch Voice Library on Mount
  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/samples');
      const data = await res.json();
      if (data.samples) {
        setSamples(data.samples);
        if (data.samples.length > 0 && !selectedSample) {
          setSelectedSample(data.samples[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch samples:", e);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const saveNewSample = async () => {
    if (!file || !newSampleName.trim()) return alert("Vui lòng tải file và nhập tên nhân vật!");
    setIsSavingSample(true);
    const formData = new FormData();
    formData.append('name', newSampleName.trim());
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:8000/api/samples', { method: 'POST', body: formData });
      if (res.ok) {
        alert("Đã lưu nhân vật vào Kho Tổng!");
        setNewSampleName('');
        await fetchSamples();
        setUseSampleLib(true);
      }
    } catch (e) {
      alert("Lỗi khi lưu nhân vật.");
    } finally {
      setIsSavingSample(false);
    }
  };

  const getApiUrl = () => {
    return model === 'omnivoice' ? 'http://localhost:8001/api/clone' : 'http://localhost:8000/api/clone';
  };

  const downloadZip = async () => {
    if (batchResults.length === 0) return;
    const zip = new JSZip();
    
    // Process each result
    for (let i = 0; i < batchResults.length; i++) {
        const item = batchResults[i];
        if (item.success && item.url) {
            // Fetch blob from Blob URL
            const res = await fetch(item.url);
            const blob = await res.blob();
            // Sanitize filename
            let safeName = item.line.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
            if (!safeName) safeName = `audio_${i+1}`;
            zip.file(`${i+1}_${safeName}.wav`, blob);
        }
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'DubAIVoices_Batch.zip');
  };

  const callCloneApi = async (sentence) => {
    const formData = new FormData();
    formData.append('text', sentence);
    if (useSampleLib) {
      formData.append('sample_name', selectedSample);
    } else {
      formData.append('file', file);
    }
    const res = await fetch(getApiUrl(), { method: 'POST', body: formData });
    if (!res.ok) throw new Error('API Error');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  };

  const generateVoice = async () => {
    if (!text || (!useSampleLib && !file)) return;
    setIsGenerating(true);
    
    try {
      if (!isBatch) {
        setSingleResult(null);
        const url = await callCloneApi(text);
        setSingleResult(url);
      } else {
        setBatchResults([]);
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let results = [];
        
        for (let i = 0; i < lines.length; i++) {
          setCurrentBatchIndex(i + 1);
          try {
            const url = await callCloneApi(lines[i]);
            results.push({ line: lines[i], url, success: true });
          } catch (e) {
            results.push({ line: lines[i], url: null, success: false });
          }
          setBatchResults([...results]); 
        }
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi gọi AI, hãy chắc chắn backend đang chạy đúng cổng!');
    } finally {
      setIsGenerating(false);
      setCurrentBatchIndex(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Model Selection */}
      <div className="input-group">
        <label className="input-label">
          <Cpu size={18} />
          Lõi Trí Tuệ Nhân Tạo (AI Model)
        </label>
        <select 
          value={model} 
          onChange={(e) => setModel(e.target.value)}
          style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}
        >
          <option value="omnivoice" style={{ color: 'black' }}>OmniVoice (Khuyên dùng - Nhanh, Đa ngôn ngữ siêu việt)</option>
          <option value="vixtts" style={{ color: 'black' }}>viXTTS (Cổ điển - Tối ưu cho Tiếng Việt bản địa)</option>
        </select>
      </div>

      {/* Voice Library Section */}
      <div className="input-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>
            {useSampleLib ? <FolderOpen size={18} /> : <UploadCloud size={18} />}
            1. Chọn Giọng Nhân Vật
          </label>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '8px', display: 'flex', gap: '10px' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="radio" checked={!useSampleLib} onChange={() => setUseSampleLib(false)} /> Tải File Lên
             </label>
             <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="radio" checked={useSampleLib} onChange={() => { fetchSamples(); setUseSampleLib(true); }} /> Chọn Từ Kho
             </label>
          </div>
        </div>

        {useSampleLib ? (
          <select value={selectedSample} onChange={(e) => setSelectedSample(e.target.value)} style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', width: '100%', fontSize: '1rem' }}>
            {samples.length === 0 ? <option style={{ color: 'black' }} value="">(Kho đang trống, vui lòng tải file lên và Lưu)</option> 
                                  : samples.map(s => <option style={{ color: 'black' }} key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <>
            <div 
              className={`upload-area ${file ? 'active' : ''}`}
              onClick={() => fileInputRef.current.click()}
            >
              <UploadCloud className="upload-icon" />
              <p>{file ? file.name : 'Nhấn để tải file (.wav, .mp3) lên'}</p>
            </div>
            <input type="file" accept="audio/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            
            {/* Quick Save feature */}
            {file && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input type="text" placeholder="Tên nhân vật (VD: Goku)" value={newSampleName} onChange={e => setNewSampleName(e.target.value)} className="textarea-custom" style={{ height: '40px', padding: '0.5rem', flex: 1 }} />
                <button onClick={saveNewSample} disabled={isSavingSample} style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', borderRadius: '6px', background: 'var(--primary-hover)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                   {isSavingSample ? <Loader2 className="loader" size={16}/> : <Save size={16}/>} Lưu Vào Kho
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="input-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>
            {isBatch ? <LayoutList size={18} /> : <Mic size={18} />}
            2. Kịch bản lồng tiếng
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
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

      <motion.button 
        className="btn-primary"
        onClick={generateVoice}
        disabled={isGenerating || !text || (!useSampleLib && !file) || (useSampleLib && !selectedSample && samples.length === 0)}
        whileTap={{ scale: 0.98 }}
      >
        {isGenerating ? (
          <>
            <Loader2 className="loader" size={20} />
            Đang tổng hợp AI... {isBatch ? `(Câu ${currentBatchIndex}/${text.split('\n').filter(l=>l.trim()).length})` : ''}
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
        {/* Single Mode Result */}
        {!isBatch && singleResult && (
          <motion.div className="audio-result-container" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <label className="input-label" style={{ marginBottom: '1rem', color: 'var(--primary-hover)' }}>
              <Settings2 size={18} />
              Kết quả Lồng tiếng:
            </label>
            <audio controls src={singleResult} autoPlay />
          </motion.div>
        )}

        {/* Batch Mode Result */}
        {isBatch && batchResults.length > 0 && (
          <motion.div className="audio-result-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label" style={{ color: 'var(--primary-hover)', margin: 0 }}>
                <LayoutList size={18} />
                Kết quả Lồng tiếng Hàng Loạt:
              </label>
              <button 
                onClick={downloadZip}
                style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', borderRadius: '6px', background: 'var(--primary-color)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <DownloadCloud size={16}/> Tải xuống tất cả (ZIP)
              </button>
            </div>
            {batchResults.map((r, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>{i+1}. "{r.line}"</p>
                {r.success ? <audio controls src={r.url} style={{ height: '30px', width: '100%' }} /> : <p style={{ color: '#ff6b6b', margin: 0 }}>❌ Bị lỗi khi tạo</p>}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

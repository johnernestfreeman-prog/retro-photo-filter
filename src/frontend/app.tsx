import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:3001';

interface HistoryEntry {
  Id: number;
  OriginalFilename: string;
  FileSizeBytes: number;
  Brightness: number;
  Desaturation: number;
  ProcessedAt: string;
  ResultFilename: string;
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [brightness, setBrightness] = useState(1.35);
  const [desaturation, setDesaturation] = useState(0.1);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const response = await fetch(`${BACKEND_URL}/history`);
      if (!response.ok) return;
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResultUrl(null);
    setError(null);
  }

  async function handleApplyFilter() {
    if (!selectedFile) {
      setError('Please choose an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('brightness', brightness.toString());
      formData.append('desaturation', desaturation.toString());

      const response = await fetch(`${BACKEND_URL}/filter`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      fetchHistory();
    } catch (err) {
      console.error('Error applying filter:', err);
      setError('Something went wrong while processing the image. Is the backend server running?');
    } finally {
      setIsLoading(false);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 500, margin: '40px auto', padding: 20 }}>
      <h1>Retro Photo Filter</h1>

      <div style={{ marginBottom: 16 }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>
          Brightness: {brightness.toFixed(2)}
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.05}
            value={brightness}
            onChange={(e) => setBrightness(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>
          Desaturation: {desaturation.toFixed(2)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={desaturation}
            onChange={(e) => setDesaturation(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <button onClick={handleApplyFilter} disabled={isLoading || !selectedFile}>
        {isLoading ? 'Processing...' : 'Apply Retro Filter'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {resultUrl && (
        <div style={{ marginTop: 24 }}>
          <h2>Result</h2>
          <img src={resultUrl} alt="Retro filtered result" style={{ maxWidth: '100%' }} />
          <br />
          <a href={resultUrl} download="retro-photo.png">
            Download
          </a>
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <h2>Recent Uploads</h2>
        {history.length === 0 ? (
          <p style={{ color: '#666' }}>No history yet — apply a filter to see it appear here.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '4px 8px' }}>Image</th>
                <th style={{ padding: '4px 8px' }}>File</th>
                <th style={{ padding: '4px 8px' }}>Size</th>
                <th style={{ padding: '4px 8px' }}>Brightness</th>
                <th style={{ padding: '4px 8px' }}>Desaturation</th>
                <th style={{ padding: '4px 8px' }}>When</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.Id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '4px 8px' }}>
                    {entry.ResultFilename ? (
                      <img
                        src={`${BACKEND_URL}/outputs/${entry.ResultFilename}`}
                        alt={entry.OriginalFilename}
                        style={{ width: 60, height: 'auto', borderRadius: 4, display: 'block' }}
                      />
                    ) : (
                      <span style={{ color: '#999' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '4px 8px' }}>{entry.OriginalFilename}</td>
                  <td style={{ padding: '4px 8px' }}>{formatBytes(entry.FileSizeBytes)}</td>
                  <td style={{ padding: '4px 8px' }}>{entry.Brightness.toFixed(2)}</td>
                  <td style={{ padding: '4px 8px' }}>{entry.Desaturation.toFixed(2)}</td>
                  <td style={{ padding: '4px 8px' }}>{formatDate(entry.ProcessedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
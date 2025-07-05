import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function SignPage() {
  const router = useRouter();
  const { token } = router.query;
  const sigCanvas = useRef(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!sigCanvas.current || !name || !token) {
      setMessage('Please enter your name and signature.');
      return;
    }

    const signature = (sigCanvas.current as any).getTrimmedCanvas().toDataURL('image/png');

    setLoading(true);
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name, signature }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      window.location.href = data.pdfUrl;
    } else {
      setMessage(data.error || 'Error signing NDA.');
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Sign NDA</h1>
      <input
        type="text"
        placeholder="Your full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{ width: 400, height: 200, className: 'sigCanvas', style: { border: '1px solid black' } }}
      />
      <br />
      <button onClick={() => (sigCanvas.current as any).clear()}>Clear</button>
      <button onClick={handleSubmit} style={{ marginLeft: '1rem' }}>
        {loading ? 'Submitting...' : 'Submit Signature'}
      </button>
      <br />
      {message && <p>{message}</p>}
    </main>
  );
}

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !email) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    const res = await fetch('/api/send', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setMessage(data.message || 'NDA sent!');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Send NDA</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Recipient's Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <br /><br />
        <button type="submit">Send NDA</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

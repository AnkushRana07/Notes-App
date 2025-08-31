import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { api } from "./api";

export default function Dashboard({ onSignOut, user }) {
  console.log('Dashboard received user:', user); // Debug log
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    api('/api/notes')
      .then((d) => setNotes(d.notes))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const addNote = async () => {
    if (!title.trim() || !text.trim()) return;
    try {
      const { note } = await api('/api/notes', { method: 'POST', body: JSON.stringify({ title, text }) });
      setNotes((prev) => [note, ...prev]);
      setTitle("");
      setText("");
      setShowForm(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteNote = async (id) => {
    try {
      await api(`/api/notes/${id}`, { method: 'DELETE' });
      setNotes((prev) => prev.filter((n) => n._id !== id)); // Use _id instead of id
      if (selectedNote && selectedNote._id === id) { // Use _id instead of id
        setSelectedNote(null);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
  };

  const closeNoteView = () => {
    setSelectedNote(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Notes App */}
      <div className="w-[375px] min-h-screen bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="w-full flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 200"
                className="w-8 h-8 text-blue-500"
                fill="currentColor"
              >
                <circle cx="100" cy="100" r="40" fill="white" />
                {Array.from({ length: 12 }).map((_, i) => (
                  <rect
                    key={i}
                    x={95}
                    y={20}
                    width="10"
                    height="40"
                    transform={`rotate(${i * 30} 100 100)`}
                    fill="currentColor"
                  />
                ))}
              </svg>
            </div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onSignOut} 
            className="text-blue-600 font-medium hover:underline text-sm"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome Card */}
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">Welcome{user?.name ? `, ${user.name}` : ''}!</h2>
          <p className="text-gray-600 text-sm mt-1">Email: {user?.email || '—'}</p>
         
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Create Note */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium mb-4"
            >
              Create Note
            </button>
          )}

          {showForm && (
            <div className="w-full mb-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 mb-2"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your note..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2 h-24"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={addNote} className="flex-1 bg-blue-600 text-white py-2 rounded-xl">Save</button>
                <button onClick={() => { setShowForm(false); setTitle(""); setText(""); }} className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-xl">Cancel</button>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold mb-3">Notes</h3>
            {loading && <p className="text-sm text-gray-500">Loading…</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !notes.length && (
              <p className="text-sm text-gray-500">No notes yet</p>
            )}
            <div className="overflow-y-auto h-full">
              {notes.map((n) => (
                <div key={n.id} className="bg-white shadow rounded-xl p-3 mb-3 cursor-pointer hover:bg-gray-50" onClick={() => handleNoteClick(n)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{n.title}</span>
                    <button 
                      className="text-gray-500 hover:text-red-500 z-10" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(n.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{selectedNote.title}</h2>
              <button 
                onClick={closeNoteView}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedNote.text}</p>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
              <button 
                onClick={() => {
                  deleteNote(selectedNote.id);
                  closeNoteView();
                }}
                className="text-red-500 hover:text-red-700"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Side Image - Desktop Only */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center relative overflow-hidden">
        {/* Background Image */}
        <img 
          src="/image/desktopimage.jpg" 
          alt="Abstract blue waves background"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
      </div>
    </div>
  );
}

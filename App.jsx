import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [repos, setRepos] = useState([]);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("stars");
  const [language, setLanguage] = useState("");
  const [bookmarks, setBookmarks] = useState(JSON.parse(localStorage.getItem("bookmarks") || "[]"));
  const [notes, setNotes] = useState(JSON.parse(localStorage.getItem("notes") || "{}"));

  useEffect(() => {
    fetch("https://api.github.com/search/repositories?q=stars:>1000&sort=stars&order=desc")
      .then(res => res.json())
      .then(data => setRepos(data.items));
  }, []);

  const filteredRepos = repos
    .filter(repo => repo.name.toLowerCase().includes(search.toLowerCase()))
    .filter(repo => (language ? repo.language === language : true))
    .sort((a, b) => {
      if (sortType === "stars") return b.stargazers_count - a.stargazers_count;
      if (sortType === "forks") return b.forks_count - a.forks_count;
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

  const chartData = {
    labels: filteredRepos.slice(0, 5).map(r => r.name),
    datasets: [
      {
        label: "Stars",
        data: filteredRepos.slice(0, 5).map(r => r.stargazers_count),
        backgroundColor: "rgba(75,192,192,0.6)"
      }
    ]
  };

  const toggleBookmark = (repo) => {
    let updated = bookmarks.includes(repo.id)
      ? bookmarks.filter(id => id !== repo.id)
      : [...bookmarks, repo.id];
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const updateNote = (repoId, text) => {
    const updatedNotes = { ...notes, [repoId]: text };
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  return (
    <div className="p-4 font-sans">
      <h1 className="text-3xl mb-4 font-bold text-center">GitHub Explorer</h1>
      <div className="flex flex-wrap gap-4 mb-4 justify-center">
        <input type="text" placeholder="Search..." className="border p-2" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={sortType} onChange={e => setSortType(e.target.value)} className="border p-2">
          <option value="stars">Stars</option>
          <option value="forks">Forks</option>
          <option value="updated">Last Updated</option>
        </select>
        <select value={language} onChange={e => setLanguage(e.target.value)} className="border p-2">
          <option value="">All Languages</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Python">Python</option>
          <option value="Java">Java</option>
          <option value="TypeScript">TypeScript</option>
          <option value="C++">C++</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRepos.map(repo => (
          <div key={repo.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-bold">{repo.name}</h2>
            <p>{repo.description}</p>
            <p>⭐ {repo.stargazers_count} | Forks: {repo.forks_count}</p>
            <p>Language: {repo.language}</p>
            <button onClick={() => toggleBookmark(repo)} className="bg-blue-500 text-white px-2 py-1 rounded mt-2">
              {bookmarks.includes(repo.id) ? "Remove Bookmark" : "Bookmark"}
            </button>
            <textarea
              placeholder="Add note..."
              value={notes[repo.id] || ""}
              onChange={e => updateNote(repo.id, e.target.value)}
              className="border p-2 mt-2 w-full"
            />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">Top 5 Repositories by Stars</h2>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

export default App;
import { useEffect, useState } from "react";
import "./App.css";

const ADMIN_PASSWORD = "1234";

const GENRES = [
  { name: "파티", cls: "party" },
  { name: "전략", cls: "strategy" },
  { name: "추리", cls: "deduction" },
  { name: "가족", cls: "family" }
];

export default function App() {
  /* 🔐 관리자 */
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("isAdmin") === "true"
  );
  const [password, setPassword] = useState("");

  /* 🎲 데이터 */
  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem("boardgames");
    return saved ? JSON.parse(saved) : [];
  });

  /* 🔍 검색 (관리자 여부 무관) */
  const [searchType, setSearchType] = useState("all");
  const [keyword, setKeyword] = useState("");

  /* ✏️ 입력 */
  const [title, setTitle] = useState("");
  const [min, setMin] = useState(2);
  const [max, setMax] = useState(4);
  const [genre, setGenre] = useState("");
  const [owner, setOwner] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    localStorage.setItem("boardgames", JSON.stringify(games));
  }, [games]);

  /* 🔐 로그인 */
  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
      setPassword("");
    } else alert("비밀번호가 틀렸어요");
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  /* ✏️ CRUD */
  const reset = () => {
    setTitle("");
    setMin(2);
    setMax(4);
    setGenre("");
    setOwner("");
    setEditId(null);
  };

  const submit = () => {
    if (!title || !genre) return;
    if (editId) {
      setGames(games.map(g =>
        g.id === editId ? { ...g, title, min, max, genre, owner } : g
      ));
    } else {
      setGames([...games, {
        id: Date.now(),
        title, min, max, genre, owner
      }]);
    }
    reset();
  };

  const edit = (g) => {
    setEditId(g.id);
    setTitle(g.title);
    setMin(g.min);
    setMax(g.max);
    setGenre(g.genre);
    setOwner(g.owner);
  };

  const remove = (id) => {
    if (window.confirm("삭제할까요?")) {
      setGames(games.filter(g => g.id !== id));
    }
  };

  /* 🔍 필터링 */
  const filteredGames = games.filter(g => {
    if (!keyword) return true;

    if (searchType === "title")
      return g.title.includes(keyword);

    if (searchType === "genre")
      return g.genre === keyword;

    if (searchType === "owner")
      return g.owner?.includes(keyword);

    if (searchType === "players") {
      const n = Number(keyword);
      if (isNaN(n)) return true;
      return g.min <= n && g.max >= n;
    }

    return true;
  });

  return (
    <div className="container">
      <header className="header">
        <h1>🎲 디코드 보드게임 서랍</h1>
        <p>쉽고 빠른 검색은 여기서!</p>
      </header>

      {/* 🔍 검색 (항상 표시) */}
      <div className="card search-card">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="all">전체</option>
          <option value="title">게임 이름</option>
          <option value="players">인원수</option>
          <option value="genre">장르</option>
          <option value="owner">게임 주인</option>
        </select>

        <input
          placeholder="검색어 입력"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 🔐 관리자 로그인 */}
      {!isAdmin && (
        <div className="card">
          <input
            type="password"
            placeholder="관리자 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={login}>관리자 모드</button>
        </div>
      )}

      {isAdmin && (
        <div className="card">
          <button onClick={logout}>관리자 로그아웃</button>
        </div>
      )}

      {/* ➕ 관리자 전용 */}
      {isAdmin && (
        <div className="card">
          <h3>{editId ? "게임 수정" : "게임 추가"}</h3>

          <input
            placeholder="게임 이름"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>👥 {min} ~ {max}명</label>
          <input type="range" min="1" max="13" value={min}
            onChange={(e) => setMin(+e.target.value)} />
          <input type="range" min="1" max="13" value={max}
            onChange={(e) => setMax(+e.target.value)} />

          <div className="genre-buttons">
            {GENRES.map(g => (
              <button
                key={g.name}
                className={`genre-btn ${g.cls} ${genre === g.name ? "active" : ""}`}
                onClick={() => setGenre(g.name)}
              >
                {g.name}
              </button>
            ))}
          </div>

          <input
            placeholder="게임 주인"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />

          <button onClick={submit}>
            {editId ? "수정 완료" : "추가"}
          </button>
        </div>
      )}

      {/* 📚 목록 */}
      <section className="list">
        {filteredGames.map(g => (
          <div key={g.id} className="game-row">
            {isAdmin && (
              <div className="side-actions">
                <button onClick={() => edit(g)}>✏️</button>
                <button onClick={() => remove(g.id)}>🗑</button>
              </div>
            )}

            <div
              className={`game-card ${g.genre}`}
              title={`👥 ${g.min}~${g.max}명 | 🎭 ${g.genre} | 👤 ${g.owner}`}
            >
              {g.title}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

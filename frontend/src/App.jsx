import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { 
  getDivisions, 
  getGroups, 
  getSubjects, 
  getQuestionSets, 
  getQuestionSetDetail 
} from './api';
import { 
  ChevronRight, BookOpen, GraduationCap, Users, FileText, 
  CheckCircle2, HelpCircle, ArrowLeft, Home 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Components ---

const Loading = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="text-gray-500 font-medium">Loading data...</p>
  </div>
);

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto py-2">
      <Link to="/" className="hover:text-blue-600 flex items-center gap-1">
        <Home className="w-4 h-4" />
        Home
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <React.Fragment key={name}>
            <ChevronRight className="w-4 h-4 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-blue-600 truncate max-w-[150px]">
                {decodeURIComponent(name)}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-blue-600 truncate max-w-[100px]">
                {decodeURIComponent(name)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// --- Page Views ---

const DivisionList = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDivisions().then(res => {
      setDivisions(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {divisions.map((div) => (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          key={div.id}
          onClick={() => navigate(`/${encodeURIComponent(div.name)}/${div.id}`)}
          className="card hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col items-center justify-center gap-4 py-12"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <GraduationCap className="w-10 h-10" />
          </div>
          <span className="text-xl font-bold">{div.name}</span>
          <span className="text-sm text-gray-400">Select Division</span>
        </motion.button>
      ))}
    </div>
  );
};

const GroupList = () => {
  const { divName, divId } = useParams();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getGroups().then(res => {
      setGroups(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {groups.map((grp) => (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          key={grp.id}
          onClick={() => navigate(`/${divName}/${divId}/${encodeURIComponent(grp.name)}/${grp.id}`)}
          className="card hover:border-green-500 hover:shadow-md transition-all text-left flex flex-col items-center justify-center gap-4 py-10"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <Users className="w-8 h-8" />
          </div>
          <span className="text-lg font-bold">{grp.name}</span>
        </motion.button>
      ))}
    </div>
  );
};

const SubjectList = () => {
  const { divName, divId, grpName, grpId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getSubjects(divId, grpId).then(res => {
      setSubjects(res.data);
      setLoading(false);
    });
  }, [divId, grpId]);

  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.length > 0 ? subjects.map((sub) => (
        <motion.button
          whileHover={{ x: 5 }}
          key={sub.id}
          onClick={() => navigate(`/${divName}/${divId}/${grpName}/${grpId}/${encodeURIComponent(sub.name)}/${sub.id}`)}
          className="card hover:border-purple-500 hover:shadow-sm transition-all text-left flex items-center gap-4 py-5"
        >
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="font-bold text-gray-700">{sub.name}</span>
        </motion.button>
      )) : (
        <div className="col-span-full text-center py-20 card bg-gray-50 border-dashed">
          <p className="text-gray-500">No subjects found for this selection.</p>
        </div>
      )}
    </div>
  );
};

const QuestionSetList = () => {
  const { divName, divId, grpName, grpId, subName, subId } = useParams();
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getQuestionSets(subId).then(res => {
      setSets(res.data);
      setLoading(false);
    });
  }, [subId]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="text-orange-500" />
        Available Question Sets
      </h2>
      <div className="grid gap-4">
        {sets.map((set) => (
          <motion.button
            whileHover={{ scale: 1.01 }}
            key={set.id}
            onClick={() => navigate(`/${divName}/${divId}/${grpName}/${grpId}/${subName}/${subId}/${encodeURIComponent(set.title)}/${set.id}`)}
            className="card w-full hover:border-orange-500 hover:shadow-md transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors">
                  {set.title}
                </span>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {set.question_count} Questions
                  </span>
                  {set.read_id && (
                    <span className="text-xs text-gray-400 font-mono">ID: {set.read_id}</span>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const QuestionDetail = () => {
  const { setId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getQuestionSetDetail(setId).then(res => {
      setDetail(res.data);
      setLoading(false);
    });
  }, [setId]);

  if (loading) return <Loading />;
  if (!detail) return <div>Not found</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900">{detail.title}</h2>
          <p className="text-gray-500 font-medium mt-1">{detail.subject_name} • {detail.question_count} Questions</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="btn-secondary flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>
      </div>

      <div className="space-y-8">
        {detail.questions.map((q, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={q.id} 
            className="card overflow-hidden !p-0"
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Question {idx + 1}</span>
              {q.tag && <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">{q.tag}</span>}
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-xl font-bold leading-relaxed text-gray-800">{q.question_text}</p>
              
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map(opt => (
                    <div 
                      key={opt.id}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        opt.is_correct 
                          ? 'bg-green-50 border-green-500 text-green-900 shadow-sm' 
                          : 'bg-white border-gray-100 text-gray-600'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                        opt.is_correct ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {opt.label}
                      </span>
                      <span className="font-medium">{opt.option_text}</span>
                      {opt.is_correct && <CheckCircle2 className="w-5 h-5 ml-auto text-green-600" />}
                    </div>
                  ))}
                </div>
              )}

              {q.explanation && (
                <div className="mt-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="flex items-center gap-2 text-blue-700 font-black mb-3 uppercase tracking-wider text-xs">
                    <HelpCircle className="w-4 h-4" />
                    <span>Explanation & Answer</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-black text-blue-600 flex items-center gap-2 tracking-tighter">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              CHORCHA
            </Link>
            <div className="hidden md:block">
              <Breadcrumbs />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-10">
        <div className="md:hidden mb-6">
          <Breadcrumbs />
        </div>
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<DivisionList />} />
            <Route path="/:divName/:divId" element={<GroupList />} />
            <Route path="/:divName/:divId/:grpName/:grpId" element={<SubjectList />} />
            <Route path="/:divName/:divId/:grpName/:grpId/:subName/:subId" element={<QuestionSetList />} />
            <Route path="/:divName/:divId/:grpName/:grpId/:subName/:subId/:setName/:setId" element={<QuestionDetail />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;

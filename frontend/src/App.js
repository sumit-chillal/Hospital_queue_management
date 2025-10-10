import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// New Landing Page Component
function LandingPage({ onEnter, setLanguage, language }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const translations = {
    en: {
      welcome: 'Welcome to',
      systemName: 'Smart Hospital Queue Management',
      tagline: 'Experience healthcare without the wait',
      features: [
        { icon: '⚡', title: 'Instant Token', desc: 'Get your queue number instantly' },
        { icon: '📱', title: 'SMS Alerts', desc: 'Real-time notifications on your phone' },
        { icon: '🎯', title: 'Track Position', desc: 'Know your exact queue position' },
        { icon: '🏥', title: 'Multiple Departments', desc: 'All specialties under one roof' }
      ],
      stats: [
        { value: '50K+', label: 'Patients Served' },
        { value: '15+', label: 'Departments' },
        { value: '100+', label: 'Doctors' },
        { value: '4.8★', label: 'Patient Rating' }
      ],
      cta: 'Enter System',
      chooseLang: 'Choose Language'
    },
    hi: {
      welcome: 'स्वागत है',
      systemName: 'स्मार्ट अस्पताल कतार प्रबंधन',
      tagline: 'प्रतीक्षा के बिना स्वास्थ्य सेवा का अनुभव करें',
      features: [
        { icon: '⚡', title: 'तत्काल टोकन', desc: 'तुरंत अपना कतार नंबर प्राप्त करें' },
        { icon: '📱', title: 'SMS अलर्ट', desc: 'आपके फोन पर रियल-टाइम सूचनाएं' },
        { icon: '🎯', title: 'स्थिति ट्रैक करें', desc: 'अपनी सटीक कतार स्थिति जानें' },
        { icon: '🏥', title: 'कई विभाग', desc: 'एक छत के नीचे सभी विशेषताएं' }
      ],
      stats: [
        { value: '50K+', label: 'मरीज़ों की सेवा की' },
        { value: '15+', label: 'विभाग' },
        { value: '100+', label: 'डॉक्टर' },
        { value: '4.8★', label: 'मरीज़ रेटिंग' }
      ],
      cta: 'सिस्टम में प्रवेश करें',
      chooseLang: 'भाषा चुनें'
    }
  };

  const t = translations[language];

  return (
    <div className={`landing-page ${isVisible ? 'visible' : ''}`}>
      <div className="landing-gradient"></div>
      
      {/* Language Toggle */}
      <div className="landing-lang-toggle">
        <button 
          className={`landing-lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          English
        </button>
        <button 
          className={`landing-lang-btn ${language === 'hi' ? 'active' : ''}`}
          onClick={() => setLanguage('hi')}
        >
          हिंदी
        </button>
      </div>

      {/* Hero Section */}
      <div className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">🏥 {t.welcome}</div>
          <h1 className="landing-title">{t.systemName}</h1>
          <p className="landing-tagline">{t.tagline}</p>
          <button className="landing-cta" onClick={onEnter}>
            {t.cta}
            <span className="landing-arrow">→</span>
          </button>
        </div>

        {/* Animated Illustration */}
        <div className="landing-illustration">
          <div className="illustration-card card-1">
            <div className="card-icon">👨‍⚕️</div>
            <div className="card-text">Doctor</div>
          </div>
          <div className="illustration-card card-2">
            <div className="card-icon">📱</div>
            <div className="card-text">Token #42</div>
          </div>
          <div className="illustration-card card-3">
            <div className="card-icon">✅</div>
            <div className="card-text">Ready</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="landing-stats">
        {t.stats.map((stat, idx) => (
          <div key={idx} className="landing-stat">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="landing-features">
        {t.features.map((feature, idx) => (
          <div key={idx} className="landing-feature">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Floating Elements */}
      <div className="floating-element float-1">+</div>
      <div className="floating-element float-2">○</div>
      <div className="floating-element float-3">△</div>
    </div>
  );
}

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [language, setLanguage] = useState('en');
  const [view, setView] = useState('home');
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenId, setTokenId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [queueTokens, setQueueTokens] = useState([]);
  const [stats, setStats] = useState({});
  const [peakHours, setPeakHours] = useState([]);
  const [loadBalancing, setLoadBalancing] = useState([]);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const [showFeedback, setShowFeedback] = useState(false);
  const [adminSelectedDept, setAdminSelectedDept] = useState('');
  const [adminQueue, setAdminQueue] = useState([]);

  const translations = {
    en: {
      title: 'Hospital Queue Management System',
      subtitle: 'Smart Queue Management for Modern Healthcare',
      patient: 'Patient Portal',
      admin: 'Admin Dashboard',
      doctor: 'Doctor Interface',
      generateToken: 'Generate Token',
      checkStatus: 'Check Token Status',
      yourName: 'Your Name',
      phoneNumber: 'Phone Number (+91...)',
      selectDepartment: 'Select Department',
      selectDoctor: 'Select Doctor',
      submit: 'Generate Token',
      tokenGenerated: 'Token Generated Successfully!',
      tokenNumber: 'Token Number',
      position: 'Position in Queue',
      department: 'Department',
      doctorName: 'Doctor',
      waitingPatients: 'Patients Ahead',
      yourQRCode: 'Your QR Code',
      notifications: 'You will receive SMS alerts when your turn approaches.',
      checkToken: 'Check Token',
      enterTokenId: 'Enter Token ID',
      currentStatus: 'Current Status',
      waiting: 'Waiting',
      inProgress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      backToHome: 'Back to Home',
      totalPatients: 'Total Patients Today',
      waitingNow: 'Currently Waiting',
      completedToday: 'Completed Today',
      activeDepartments: 'Active Departments',
      departmentOverview: 'Department Overview',
      activeCounters: 'Active Counters',
      avgWaitTime: 'Avg Wait Time',
      peakHoursAnalysis: 'Peak Hours Analysis',
      loadBalancingSuggestions: 'Load Balancing Suggestions',
      noSuggestions: 'All departments are operating efficiently!',
      priority: 'Priority',
      currentQueue: 'Current Queue',
      callNext: 'Call Next Patient',
      markComplete: 'Mark Complete',
      todayStats: 'Today\'s Statistics',
      patientsSeen: 'Patients Seen',
      avgTimePerPatient: 'Avg Time/Patient',
      waitingInQueue: 'Waiting in Queue',
      selectDept: 'Select Your Department',
      feedbackTitle: 'How was your experience?',
      submitFeedback: 'Submit Feedback',
      thankYou: 'Thank you for your feedback!',
      optional: 'Optional',
      cancelAppointment: 'Cancel Appointment',
      appointmentCancelled: 'Your appointment has been cancelled.',
      livePatientQueues: 'Live Patient Queues',
      selectDeptToView: 'Select a department to view the live queue',
      remove: 'Remove'
    },
    hi: {
      title: 'अस्पताल कतार प्रबंधन प्रणाली',
      subtitle: 'आधुनिक स्वास्थ्य सेवा के लिए स्मार्ट कतार प्रबंधन',
      patient: 'रोगी पोर्टल',
      admin: 'प्रशासन डैशबोर्ड',
      doctor: 'डॉक्टर इंटरफ़ेस',
      generateToken: 'टोकन बनाएं',
      checkStatus: 'टोकन स्थिति जांचें',
      yourName: 'आपका नाम',
      phoneNumber: 'फ़ोन नंबर (+91...)',
      selectDepartment: 'विभाग चुनें',
      selectDoctor: 'डॉक्टर चुनें',
      submit: 'टोकन बनाएं',
      tokenGenerated: 'टोकन सफलतापूर्वक बनाया गया!',
      tokenNumber: 'टोकन नंबर',
      position: 'कतार में स्थिति',
      department: 'विभाग',
      doctorName: 'डॉक्टर',
      waitingPatients: 'आगे के मरीज़',
      yourQRCode: 'आपका QR कोड',
      notifications: 'जब आपकी बारी आएगी तो आपको SMS अलर्ट प्राप्त होंगे।',
      checkToken: 'टोकन जांचें',
      enterTokenId: 'टोकन ID दर्ज करें',
      currentStatus: 'वर्तमान स्थिति',
      waiting: 'प्रतीक्षा में',
      inProgress: 'प्रगति में',
      completed: 'पूर्ण',
      cancelled: 'रद्द',
      backToHome: 'होम पर वापस जाएं',
      totalPatients: 'आज कुल मरीज़',
      waitingNow: 'वर्तमान में प्रतीक्षा में',
      completedToday: 'आज पूर्ण',
      activeDepartments: 'सक्रिय विभाग',
      departmentOverview: 'विभाग अवलोकन',
      activeCounters: 'सक्रिय काउंटर',
      avgWaitTime: 'औसत प्रतीक्षा समय',
      peakHoursAnalysis: 'पीक घंटे विश्लेषण',
      loadBalancingSuggestions: 'लोड बैलेंसिंग सुझाव',
      noSuggestions: 'सभी विभाग कुशलता से काम कर रहे हैं!',
      priority: 'प्राथमिकता',
      currentQueue: 'वर्तमान कतार',
      callNext: 'अगले मरीज़ को बुलाएं',
      markComplete: 'पूर्ण चिह्नित करें',
      todayStats: 'आज के आंकड़े',
      patientsSeen: 'देखे गए मरीज़',
      avgTimePerPatient: 'औसत समय/मरीज़',
      waitingInQueue: 'कतार में प्रतीक्षा',
      selectDept: 'अपना विभाग चुनें',
      feedbackTitle: 'आपका अनुभव कैसा रहा?',
      submitFeedback: 'प्रतिक्रिया जमा करें',
      thankYou: 'आपकी प्रतिक्रिया के लिए धन्यवाद!',
      optional: 'वैकल्पिक',
      cancelAppointment: 'अपॉइंटमेंट रद्द करें',
      appointmentCancelled: 'आपकी अपॉइंटमेंट रद्द कर दी गई है।',
      livePatientQueues: 'लाइव रोगी कतारें',
      selectDeptToView: 'लाइव कतार देखने के लिए एक विभाग चुनें',
      remove: 'हटाएं'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (!showLanding) fetchDepartments();
  }, [showLanding]);

  useEffect(() => {
    if (selectedDepartment) fetchDoctors(selectedDepartment);
  }, [selectedDepartment]);

  useEffect(() => {
    if (view === 'admin') fetchAdminData();
  }, [view]);
  
  useEffect(() => {
    if (view === 'doctor' && selectedDepartment) fetchQueueTokens();
  }, [view, selectedDepartment]);

  useEffect(() => {
    if (view === 'admin' && adminSelectedDept) {
      fetchAdminQueue(adminSelectedDept);
    } else {
      setAdminQueue([]);
    }
  }, [view, adminSelectedDept]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/departments`);
      setDepartments(await response.json());
    } catch (error) { console.error('Error fetching departments:', error); }
  };

  const fetchDoctors = async (deptId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/doctors?department_id=${deptId}`);
      setDoctors(await response.json());
    } catch (error) { console.error('Error fetching doctors:', error); }
  };

  const fetchAdminData = async () => {
    try {
      const [statsRes, peakRes, loadRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/stats/overview`),
        fetch(`${BACKEND_URL}/api/analytics/peak-hours`),
        fetch(`${BACKEND_URL}/api/analytics/load-balancing`)
      ]);
      setStats(await statsRes.json());
      setPeakHours(await peakRes.json());
      setLoadBalancing(await loadRes.json());
    } catch (error) { console.error('Error fetching admin data:', error); }
  };

  const fetchQueueTokens = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tokens/department/${selectedDepartment}`);
      setQueueTokens(await response.json());
    } catch (error) { console.error('Error fetching queue tokens:', error); }
  };

  const fetchAdminQueue = async (deptId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tokens/department/${deptId}`);
      setAdminQueue(await response.json());
    } catch (error) { console.error('Error fetching admin queue:', error); }
  };

  const generateToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/tokens?patient_name=${encodeURIComponent(patientName)}&patient_phone=${encodeURIComponent(patientPhone)}&department_id=${selectedDepartment}&doctor_id=${selectedDoctor}`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Token generation failed');
      const data = await response.json();
      setToken(data);
      setPatientName('');
      setPatientPhone('');
    } catch (error) {
      console.error('Error generating token:', error);
      alert('Error generating token. Please try again.');
    }
    setLoading(false);
  };

  const checkTokenStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/tokens/${tokenId}`);
      if (!response.ok) throw new Error('Token not found');
      const data = await response.json();
      setToken(data);
      if (data.status === 'completed') {
        setShowFeedback(true);
      }
    } catch (error) {
      console.error('Error checking token:', error);
      alert('Token not found. Please check the ID.');
    }
    setLoading(false);
  };

  const callNextPatient = async (tokenId) => {
    try {
      await fetch(`${BACKEND_URL}/api/tokens/${tokenId}/call`, { method: 'POST' });
      fetchQueueTokens();
    } catch (error) { console.error('Error calling patient:', error); }
  };

  const markComplete = async (tokenId) => {
    try {
      await fetch(`${BACKEND_URL}/api/tokens/${tokenId}/complete`, { method: 'POST' });
      fetchQueueTokens();
    } catch (error) { console.error('Error marking complete:', error); }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await fetch(
        `${BACKEND_URL}/api/feedback?token_id=${token.id}&rating=${feedback.rating}&comment=${encodeURIComponent(feedback.comment || '')}`,
        { method: 'POST' }
      );
      alert(t.thankYou);
      setShowFeedback(false);
      setToken(null);
    } catch (error) { console.error('Error submitting feedback:', error); }
  };

  const cancelToken = async (tokenIdToCancel) => {
    if (!window.confirm(language === 'en' ? 'Are you sure you want to cancel this appointment?' : 'क्या आप वाकई इस अपॉइंटमेंट को रद्द करना चाहते हैं?')) {
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/tokens/${tokenIdToCancel}`, { method: 'DELETE' }); 
      if (!response.ok) throw new Error('Cancellation failed');
      
      if (token && token.id === tokenIdToCancel) {
        alert(t.appointmentCancelled);
        setToken(null);
        setView('home');
      }
      
      if (view === 'admin' && adminSelectedDept) {
        fetchAdminQueue(adminSelectedDept);
      }

    } catch (error) {
      console.error('Error cancelling token:', error);
      alert('Error cancelling token. Please try again.');
    }
  };

  const getStatusComponent = (status) => {
    const statusMap = {
      waiting: t.waiting,
      in_progress: t.inProgress,
      completed: t.completed,
      cancelled: t.cancelled,
    };
    return (
      <div className={`status-badge ${status}`}>
        {statusMap[status] || status}
      </div>
    );
  };

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} setLanguage={setLanguage} language={language} />;
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1 className="logo">🏥 {t.title}</h1>
          <div className="header-actions">
            <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>English</button>
            <button className={`lang-btn ${language === 'hi' ? 'active' : ''}`} onClick={() => setLanguage('hi')}>हिंदी</button>
          </div>
        </div>
      </header>

      {view === 'home' && (
        <div className="home-view">
          <div className="hero">
            <h2 className="hero-title">{t.subtitle}</h2>
            <div className="card-grid">
              <div className="card" onClick={() => setView('patient')}>
                <div className="card-icon">👤</div>
                <h3>{t.patient}</h3>
                <p>{language === 'en' ? 'Generate tokens and track your queue position' : 'टोकन बनाएं और अपनी कतार की स्थिति ट्रैक करें'}</p>
              </div>
              <div className="card" onClick={() => setView('admin')}>
                <div className="card-icon">📊</div>
                <h3>{t.admin}</h3>
                <p>{language === 'en' ? 'Monitor queues and manage departments' : 'कतारों की निगरानी करें और विभागों को प्रबंधित करें'}</p>
              </div>
              <div className="card" onClick={() => setView('doctor')}>
                <div className="card-icon">⚕️</div>
                <h3>{t.doctor}</h3>
                <p>{language === 'en' ? 'Call patients and manage consultations' : 'मरीज़ों को बुलाएं और परामर्श प्रबंधित करें'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'patient' && (
        <div className="patient-view">
          <button className="back-btn" onClick={() => { setView('home'); setToken(null); }}>← {t.backToHome}</button>
          
          {!token ? (
            <div className="patient-forms">
              <div className="form-card">
                <h2>🎫 {t.generateToken}</h2>
                <form onSubmit={generateToken}>
                  <input type="text" placeholder={t.yourName} value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
                  <input type="tel" placeholder={t.phoneNumber} value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} required />
                  <select value={selectedDepartment || ''} onChange={(e) => setSelectedDepartment(e.target.value)} required >
                    <option value="">{t.selectDepartment}</option>
                    {departments.map(dept => (<option key={dept.id} value={dept.id}>{language === 'en' ? dept.name_en : dept.name_hi}</option>))}
                  </select>
                  {selectedDepartment && (
                    <select value={selectedDoctor || ''} onChange={(e) => setSelectedDoctor(e.target.value)} required >
                      <option value="">{t.selectDoctor}</option>
                      {doctors.map(doc => (<option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>))}
                    </select>
                  )}
                  <button type="submit" disabled={loading}>{loading ? '⏳' : '✓'} {t.submit}</button>
                </form>
              </div>

              <div className="form-card">
                <h2>🔍 {t.checkStatus}</h2>
                <form onSubmit={checkTokenStatus}>
                  <input type="text" placeholder={t.enterTokenId} value={tokenId} onChange={(e) => setTokenId(e.target.value)} required />
                  <button type="submit" disabled={loading}>{loading ? '⏳' : '🔍'} {t.checkToken}</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="token-display">
              {!showFeedback ? (
                <>
                  <div className="success-banner">✅ {t.tokenGenerated}</div>
                  <div className="token-card">
                    <div className="token-header">
                      <h1 className="token-number">{token.token_number}</h1>
                      {getStatusComponent(token.status)}
                    </div>
                    <div className="token-details">
                      <div className="detail-row"><span className="label">{t.department}:</span><span className="value">{language === 'en' ? token.department_name_en : token.department_name_hi}</span></div>
                      <div className="detail-row"><span className="label">{t.doctorName}:</span><span className="value">{token.doctor_name}</span></div>
                      {token.status === 'waiting' && (
                        <>
                          <div className="detail-row highlight"><span className="label">{t.position}:</span><span className="value large">{token.current_position || token.position}</span></div>
                          <div className="detail-row"><span className="label">{t.waitingPatients}:</span><span className="value">{(token.current_position || token.position) - 1}</span></div>
                        </>
                      )}
                    </div>
                    {token.qr_code && (
                      <div className="qr-section">
                        <p className="qr-label">{t.yourQRCode}</p>
                        <img src={`data:image/png;base64,${token.qr_code}`} alt="QR Code" className="qr-image" />
                        <p className="qr-id">ID: {token.id}</p>
                      </div>
                    )}
                    <div className="notification-info"><span className="notification-icon">📱</span><p>{t.notifications}</p></div>
                    {token.status === 'waiting' && (
                        <button className="cancel-btn" onClick={() => cancelToken(token.id)}>
                            ❌ {t.cancelAppointment}
                        </button>
                    )}
                  </div>
                  <button className="new-token-btn" onClick={() => setToken(null)}>← {t.checkStatus}</button>
                </>
              ) : (
                <div className="feedback-form">
                  <h2>⭐ {t.feedbackTitle}</h2>
                  <form onSubmit={submitFeedback}>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (<span key={star} className={`star ${feedback.rating >= star ? 'filled' : ''}`} onClick={() => setFeedback({ ...feedback, rating: star })}>⭐</span>))}
                    </div>
                    <textarea placeholder={`${language === 'en' ? 'Your comments' : 'आपकी टिप्पणियां'} (${t.optional})`} value={feedback.comment} onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })} rows={4} />
                    <button type="submit" disabled={feedback.rating === 0}>{t.submitFeedback}</button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'admin' && (
        <div className="admin-view">
          <button className="back-btn" onClick={() => setView('home')}>← {t.backToHome}</button>
          <div className="admin-header"><h2>📊 {t.admin}</h2></div>

          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{stats.total_tokens || 0}</div><div className="stat-label">{t.totalPatients}</div></div>
            <div className="stat-card"><div className="stat-icon">⏳</div><div className="stat-value">{stats.waiting_tokens || 0}</div><div className="stat-label">{t.waitingNow}</div></div>
            <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{stats.completed_tokens || 0}</div><div className="stat-label">{t.completedToday}</div></div>
            <div className="stat-card"><div className="stat-icon">🏥</div><div className="stat-value">{stats.active_departments || 0}</div><div className="stat-label">{t.activeDepartments}</div></div>
          </div>

          <div className="section">
            <h3>{t.departmentOverview}</h3>
            <div className="department-grid">
              {departments.map(dept => (
                <div key={dept.id} className="dept-card">
                  <h4>{language === 'en' ? dept.name_en : dept.name_hi}</h4>
                  <div className="dept-stats">
                    <div className="dept-stat"><span className="dept-label">{t.waitingNow}:</span><span className="dept-value">{dept.total_waiting || 0}</span></div>
                    <div className="dept-stat"><span className="dept-label">{t.activeCounters}:</span><span className="dept-value">{dept.active_counters || 1}</span></div>
                    <div className="dept-stat"><span className="dept-label">{t.avgWaitTime}:</span><span className="dept-value">{dept.avg_wait_time || 0} min</span></div>
                    <div className="dept-stat"><span className="dept-label">{t.completedToday}:</span><span className="dept-value">{dept.total_completed || 0}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="section">
        <h3>📋 {t.livePatientQueues}</h3>
        <select className="dept-select-admin" value={adminSelectedDept} onChange={(e) => setAdminSelectedDept(e.target.value)}>
            <option value="">{t.selectDeptToView}</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {language === 'en' ? dept.name_en : dept.name_hi}
              </option>
            ))}
        </select>
        {adminSelectedDept && (
          <div className="admin-queue-list">
            {adminQueue.length > 0 ? adminQueue.map(tkn => (
              <div key={tkn.id} className="admin-queue-item">
                <div className="patient-info">
                  <span className="patient-name">{tkn.patient_name}</span>
                  <span className="token-num">{tkn.token_number}</span>
                  <span className="patient-phone">{tkn.patient_phone}</span>
                </div>
                <div className="queue-item-status">
                    {getStatusComponent(tkn.status)}
                    {tkn.status === 'waiting' && <span className="position-badge"># {tkn.current_position}</span>}
                </div>
                <div className="admin-actions">
                  {tkn.status === 'waiting' && (
                    <button className="remove-btn" onClick={() => cancelToken(tkn.id)}>
                      🗑️ {t.remove}
                    </button>
                  )}
                </div>
              </div>
            )) : <p>{language === 'en' ? 'No patients in this queue.' : 'इस कतार में कोई मरीज़ नहीं है।'}</p>}
          </div>
        )}
      </div>

      <div className="section">
        <h3>📈 {t.peakHoursAnalysis}</h3>
        <div className="chart-container">
          {peakHours.filter(h => h.hour >= 9 && h.hour <= 16).map(hour => (
            <div key={hour.hour} className="chart-bar">
              <div className="bar" style={{ height: `${(hour.patients / Math.max(...peakHours.map(h => h.patients), 1)) * 200}px` }}><span className="bar-value">{hour.patients}</span></div>
              <div className="bar-label">{hour.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>⚖️ {t.loadBalancingSuggestions}</h3>
        {loadBalancing.length > 0 ? (
          <div className="suggestions-list">
            {loadBalancing.map((suggestion, idx) => (
              <div key={idx} className={`suggestion-card ${suggestion.priority}`}>
                <div className="suggestion-header"><h4>{suggestion.department_name}</h4><span className={`priority-badge ${suggestion.priority}`}>{suggestion.priority.toUpperCase()}</span></div>
                <p className="suggestion-text">{suggestion.suggestion}</p>
                <div className="suggestion-stats"><span>{t.waitingNow}: {suggestion.current_waiting}</span><span>{t.activeCounters}: {suggestion.active_counters}</span></div>
              </div>
            ))}
          </div>
        ) : (<div className="no-suggestions"><span className="success-icon">✅</span><p>{t.noSuggestions}</p></div>)}
      </div>
    </div>
  )}

  {view === 'doctor' && (
    <div className="doctor-view">
      <button className="back-btn" onClick={() => setView('home')}>← {t.backToHome}</button>
      <div className="doctor-header">
        <h2>⚕️ {t.doctor}</h2>
        <select value={selectedDepartment || ''} onChange={(e) => setSelectedDepartment(e.target.value)} className="dept-select">
          <option value="">{t.selectDept}</option>
          {departments.map(dept => (<option key={dept.id} value={dept.id}>{language === 'en' ? dept.name_en : dept.name_hi}</option>))}
        </select>
      </div>
      {selectedDepartment && (
        <>
          <div className="doctor-stats">
            <div className="doc-stat-card"><div className="doc-stat-icon">👥</div><div className="doc-stat-value">{queueTokens.filter(t => t.status === 'completed').length}</div><div className="doc-stat-label">{t.patientsSeen}</div></div>
            <div className="doc-stat-card"><div className="doc-stat-icon">⏱️</div><div className="doc-stat-value">{doctors.find(d => d.department_id === selectedDepartment)?.avg_time_per_patient || 0}</div><div className="doc-stat-label">{t.avgTimePerPatient}</div></div>
            <div className="doc-stat-card"><div className="doc-stat-icon">⏳</div><div className="doc-stat-value">{queueTokens.filter(t => t.status === 'waiting').length}</div><div className="doc-stat-label">{t.waitingInQueue}</div></div>
          </div>
          <div className="queue-section">
            <h3>{t.currentQueue}</h3>
            {queueTokens.length > 0 ? (
              <div className="queue-list">
                {queueTokens.map(token => (
                  <div key={token.id} className={`queue-item ${token.status}`}>
                    <div className="queue-item-header">
                      <div className="patient-avatar">{token.patient_name.charAt(0).toUpperCase()}</div>
                      <div className="patient-info"><h4>{token.patient_name}</h4><p className="token-num">{token.token_number}</p></div>
                      {getStatusComponent(token.status)}
                    </div>
                    <div className="queue-item-details">
                      <span>📞 {token.patient_phone}</span><span>⚕️ {token.doctor_name}</span>
                      {token.status === 'waiting' && (<span className="position-badge">#{token.current_position || token.position}</span>)}
                    </div>
                    <div className="queue-actions">
                      {token.status === 'waiting' && (<button className="action-btn call" onClick={() => callNextPatient(token.id)}>📞 {t.callNext}</button>)}
                      {token.status === 'in_progress' && (<button className="action-btn complete" onClick={() => markComplete(token.id)}>✓ {t.markComplete}</button>)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (<div className="empty-queue"><span className="empty-icon">🔭</span><p>{language === 'en' ? 'No patients in queue' : 'कतार में कोई मरीज़ नहीं'}</p></div>)}
          </div>
        </>
      )}
    </div>
  )}
</div>
);
}
export default App;

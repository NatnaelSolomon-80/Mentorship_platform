import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { apiGetContacts, apiGetConversation, apiSendMessage, apiGetMySessions, apiDirectScheduleSession } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Send, MessageCircle, Video, Paperclip, Smile, Search, CheckCheck, MoreVertical, Calendar, Clock, X } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('chat');

  // Scheduling & Meeting State
  const [mySessions, setMySessions] = useState([]);
  const [upcomingSession, setUpcomingSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => {
    const loadContactsAndSessions = async () => {
      try {
        const [contactsRes, sessionsRes] = await Promise.all([
          apiGetContacts(),
          apiGetMySessions()
        ]);
        setContacts(contactsRes.data.data || []);
        setMySessions(sessionsRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadContactsAndSessions();
  }, []);

  useEffect(() => {
    if (activeContact) {
      loadMessages();
      const interval = setInterval(() => {
        loadMessages(true);
      }, 3000);
      
      // Compute if there's an upcoming session
      const getActiveSession = () => {
        const now = new Date();
        const relevantSessions = mySessions.filter(s => 
          (s.mentorId?._id === activeContact.user._id || s.studentId?._id === activeContact.user._id) &&
          s.status === 'scheduled' &&
          new Date(s.scheduledAt).getTime() > now.getTime() - 60 * 60 * 1000 // up to 1 hour past start time
        );
        relevantSessions.sort((a,b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
        setUpcomingSession(relevantSessions[0] || null);
      }
      getActiveSession();
      
      return () => clearInterval(interval);
    } else {
      setUpcomingSession(null);
    }
  }, [activeContact, mySessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Countdown Timer Logic
  useEffect(() => {
    if (!upcomingSession) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(upcomingSession.scheduledAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeRemaining('Now');
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [upcomingSession]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleDate) return toast.error("Please pick a date and time");
    
    try {
      const res = await apiDirectScheduleSession({
        targetUserId: activeContact.user._id,
        scheduledAt: scheduleDate,
        durationMinutes: 60
      });
      setMySessions(prev => [...prev, res.data.data]);
      setShowScheduleModal(false);
      toast.success("Meeting scheduled!");
      
      // Auto-send a message into chat to mimic calendar invite
      const msgRes = await apiSendMessage({ 
        receiverId: activeContact.user._id, 
        text: `🗓️ I have scheduled a video call for ${new Date(scheduleDate).toLocaleString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })}. See you then!` 
      });
      setMessages((prev) => [...prev, msgRes.data.data]);
      
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to schedule");
    }
  };

  const loadMessages = async (isPolling = false) => {
    try {
      const res = await apiGetConversation(activeContact.user._id);
      const newMessages = res.data.data || [];
      setMessages(prev => {
        if (prev.length !== newMessages.length) return newMessages;
        return prev;
      });
    } catch { 
      if (!isPolling) toast.error('Failed to load messages'); 
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await apiSendMessage({ receiverId: activeContact.user._id, text });
      setMessages((prev) => [...prev, res.data.data]);
      setText('');
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Messages" subtitle="Chat with your mentors and students" />

      <div className="glass flex rounded-2xl overflow-hidden border border-slate-200 shadow-xl relative" style={{ height: '75vh' }}>
        
        {/* Contacts panel (30%) */}
        <div className="w-[30%] min-w-[280px] bg-white border-r border-slate-200 flex flex-col relative z-10">
          {/* Contacts Header & Tabs */}
          <div className="border-b border-slate-100 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
            <div className="p-4 pb-2 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Messages</h2>
              <div className="flex items-center gap-3">
                <Search size={18} className="text-slate-400 cursor-pointer hover:text-slate-700 transition-colors" />
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 shadow-inner">
                  {user.name?.[0]}
                </div>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex px-4 gap-6 mb-1 mt-1">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`pb-2 text-sm font-semibold transition-all border-b-2 ${activeTab === 'chat' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Chat
              </button>
              <button 
                onClick={() => setActiveTab('video')}
                className={`pb-2 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${activeTab === 'video' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Video <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </button>
            </div>
          </div>
          
          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-4 bg-slate-50/50">
            {contacts.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center opacity-70">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 shadow-inner">
                  <MessageCircle size={28} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No conversations yet</p>
                <p className="text-xs text-slate-400 mt-1">When you match, they will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col pt-2 px-2 gap-1 bg-white">
                {contacts.map(({ user: contact, lastMessage }) => {
                  const isActive = activeContact?.user._id === contact._id;
                  return (
                    <button
                      key={contact._id}
                      onClick={() => setActiveContact({ user: contact })}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 text-left relative group
                        ${isActive 
                           ? 'bg-emerald-50 shadow-[0_2px_8px_rgba(16,185,129,0.08)] border border-emerald-100/50' 
                           : 'hover:bg-slate-50 border border-transparent'}
                        `}
                    >
                      {/* Avatar with Online Dot */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm transition-all 
                          ${isActive ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}`}>
                          {contact.name?.[0]}
                        </div>
                        {/* Fake Online Indicator for demo effect */}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className={`text-[15px] font-bold truncate ${isActive ? 'text-emerald-950' : 'text-slate-700 group-hover:text-slate-900'}`}>
                            {contact.name}
                          </p>
                          <p className={`text-[10px] pl-2 flex-shrink-0 font-medium ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'New'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {lastMessage && lastMessage.senderId === user._id && (
                            <CheckCheck size={14} className={isActive ? "text-emerald-500" : "text-slate-400"} />
                          )}
                          <p className={`text-[13px] truncate ${isActive ? 'text-emerald-700/80 font-medium' : 'text-slate-500'}`}>
                            {lastMessage?.text || `Start a conversation...`}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content panel (70%) */}
        {activeContact ? (
          <div className="flex-1 flex flex-col bg-[#f8faf9] relative w-[70%]">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            
            {/* Header */}
            <div className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between shadow-sm z-10 sticky top-0">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 text-lg font-bold shadow-sm border border-indigo-200">
                    {activeContact.user.name?.[0]}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-800 tracking-wide leading-tight">{activeContact.user.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                    <span className="text-[12px] font-medium text-emerald-600">Online</span>
                    <span className="text-[11px] text-slate-400 mx-1">•</span>
                    <span className="text-[11px] text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded flex items-center">{activeContact.user.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Content Swapper */}
            {activeTab === 'chat' ? (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10 custom-scrollbar scroll-smooth">
                  {messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="bg-white border border-slate-100 px-6 py-5 rounded-2xl flex flex-col items-center gap-3 shadow-lg transform transition-all duration-500 animate-[fadeInUp_0.4s_ease-out]">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 shadow-inner">
                          <Smile size={28} />
                        </div>
                        <div className="text-center">
                          <p className="text-[15px] font-semibold text-slate-800">Start the conversation</p>
                          <p className="text-[13px] text-slate-500 mt-1">Say hi to {activeContact.user.name}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId?._id === user._id || msg.senderId === user._id;
                      const prevMsg = idx > 0 ? messages[idx - 1] : null;
                      const prevIsMine = prevMsg && (prevMsg.senderId?._id === user._id || prevMsg.senderId === user._id);
                      const isChained = prevMsg && isMine === prevIsMine;
                      
                      return (
                        <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} ${isChained ? '-mt-2' : 'mt-4'} animate-[fadeInUp_0.3s_ease-out]`}>
                          <div className={`max-w-[70%] relative group`}>
                            <div className={`px-4 py-2.5 shadow-sm backdrop-blur-sm
                              ${isMine ? `bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl ${!isChained ? 'rounded-tr-sm' : ''} shadow-emerald-200` : `bg-white text-slate-700 rounded-2xl ${!isChained ? 'rounded-tl-sm' : ''} border border-slate-200 shadow-slate-100`}`}
                            >
                              <p className={`text-[14.5px] leading-relaxed break-words whitespace-pre-wrap ${!isMine && 'font-medium'}`}>{msg.text}</p>
                              <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-end opacity-70'}`}>
                                <p className={`text-[10px] font-medium ${isMine ? 'text-emerald-100' : 'text-slate-400'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {isMine && <CheckCheck size={12} className="text-emerald-200" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} className="h-4" />
                </div>

                <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-10 w-full mt-auto">
                  <form onSubmit={handleSend} className="max-w-[95%] lg:max-w-4xl mx-auto flex items-end gap-3 relative">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl flex items-end focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all shadow-inner overflow-hidden">
                      <button type="button" className="p-3.5 pl-4 text-slate-400 hover:text-emerald-500 transition-colors bg-transparent border-none outline-none self-end">
                        <Smile size={22} className="opacity-80 hover:opacity-100 transition-opacity" />
                      </button>
                      <button type="button" className="py-3.5 pr-2 text-slate-400 hover:text-emerald-500 transition-colors bg-transparent border-none outline-none self-end">
                        <Paperclip size={20} className="opacity-80 hover:opacity-100 transition-opacity" />
                      </button>
                      <textarea
                        className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 py-3.5 px-3 resize-none max-h-32 text-[15px] custom-scrollbar self-center font-medium"
                        placeholder="Type a message..."
                        rows={1}
                        value={text}
                        onChange={(e) => {
                          setText(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = (e.target.scrollHeight < 120 ? e.target.scrollHeight : 120) + 'px';
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e);
                            e.target.style.height = 'auto';
                          }
                        }}
                      />
                    </div>
                    <button type="submit" disabled={sending || !text.trim()} className={`p-3.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-md shrink-0 self-end mb-0.5 ${text.trim() && !sending ? 'bg-emerald-500 text-white hover:bg-emerald-400 hover:scale-105 shadow-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed hidden sm:flex'}`}>
                      <Send size={20} className={text.trim() && !sending ? "-mt-0.5 -ml-0.5 translate-x-0.5 translate-y-0.5 transition-transform" : ""} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Dedicated Video Management View */
              <div className="flex-1 flex items-center justify-center p-8 z-10 animate-[fadeInUp_0.4s_ease-out] w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-50 to-[#f0fdf4]">
                
                {/* Premium Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                   <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-[100px]"></div>
                   <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-50/60 blur-[120px]"></div>
                   <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-50/40 blur-[80px]"></div>
                </div>

                {/* Main Card Container */}
                <div className="w-full max-w-2xl bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] relative z-10 flex flex-col items-center">
                   
                   {/* Shared Icon Header */}
                   <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-[1.5rem] rotate-3 flex items-center justify-center mb-8 shadow-inner border border-emerald-50 relative group">
                     <div className="absolute inset-0 bg-white/40 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <Video size={42} strokeWidth={1.5} className="text-emerald-600 -rotate-3 drop-shadow-md" />
                     {upcomingSession && <div className="absolute top-[-4px] right-[-4px] w-6 h-6 bg-emerald-500 border-4 border-white rounded-full animate-pulse shadow-sm"></div>}
                   </div>

                   {upcomingSession ? (
                      <div className="w-full relative z-10 flex flex-col items-center">
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight text-center">Video Session Scheduled</h2>
                        <p className="text-slate-500 font-medium tracking-wide mb-8 text-center text-[15px]">
                          {new Date(upcomingSession.scheduledAt).toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} <span className="mx-2 text-slate-300">|</span> <span className="font-bold text-slate-600">{new Date(upcomingSession.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                        
                        <div className="w-full bg-white/60 border border-slate-200/60 backdrop-blur-md rounded-2xl py-8 px-6 shadow-sm mb-10 flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="absolute left-0 top-0 w-1 h-full bg-emerald-400"></div>
                          {timeRemaining === 'Now' ? (
                            <div className="text-center animate-[fadeInUp_0.3s_ease-out]">
                              <p className="text-emerald-500 font-black text-4xl tracking-widest uppercase animate-pulse drop-shadow-sm">It's Time!</p>
                              <p className="text-slate-500 mt-2 font-medium">Your protected video room is unlocked.</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <p className="text-[12px] uppercase font-bold text-emerald-600/70 tracking-[0.25em] mb-3">Meeting Starts In</p>
                              <p className="text-6xl sm:text-7xl font-black text-slate-800 font-mono tracking-tighter drop-shadow-sm tabular-nums">{timeRemaining}</p>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => navigate(`/meeting/${upcomingSession.jitsiRoom}`)}
                          className="w-full max-w-md py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all duration-300 bg-emerald-600 text-white shadow-[0_10px_20px_rgba(16,185,129,0.25)] hover:scale-105 hover:bg-emerald-500 hover:shadow-[0_15px_30px_rgba(16,185,129,0.35)]"
                        >
                          <Video size={24} /> {timeRemaining === 'Now' ? 'JOIN CALL NOW' : 'JOIN CALL EARLY'}
                        </button>
                      </div>
                    ) : (
                      <div className="w-full relative z-10 flex flex-col items-center">
                        <div className="text-center mb-10">
                          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-3">Schedule Video Call</h2>
                          <p className="text-slate-500 text-[15px] leading-relaxed max-w-md mx-auto">
                            Choose the perfect time to connect with <span className="font-bold text-slate-700">{activeContact.user.name}</span>. We'll secure the room and send them a notification instantly.
                          </p>
                        </div>
                        
                        <form onSubmit={handleScheduleSubmit} className="w-full max-w-md">
                          <div className="mb-8">
                            <label className="block text-[13px] uppercase tracking-wider font-bold text-slate-500 mb-3 ml-1 flex items-center gap-2">
                              <Clock size={16} className="text-emerald-500"/> Select Date & Time
                            </label>
                            <div className="relative group">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                              <input 
                                type="datetime-local" 
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className="relative w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all shadow-sm font-semibold text-[15px] cursor-pointer"
                                required
                              />
                            </div>
                          </div>
                          <button type="submit" className="w-full group bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold tracking-wide shadow-xl hover:shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                            <span className="relative z-10 flex items-center gap-2">
                              <Calendar size={20} /> Schedule Meeting
                            </span>
                          </button>
                        </form>

                        <div className="mt-8 flex items-center justify-center gap-4 w-full max-w-md">
                          <div className="h-px bg-slate-200 flex-1"></div>
                          <span className="text-xs uppercase font-bold text-slate-400 tracking-widest">OR</span>
                          <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        <button 
                          onClick={() => {
                            const roomName = `SkillBridge-${user._id.slice(-6)}-${activeContact.user._id.slice(-6)}`;
                            navigate(`/meeting/${roomName}`);
                          }}
                          className="w-full max-w-md mt-6 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3"
                        >
                          <Video size={20} /> Start Instant Call
                        </button>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#f8faf9] to-[#f0fdf4] relative z-10 w-[70%]">
            {/* Subtle pattern background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            
            {/* Floating decorative blobs */}
            <div className="absolute top-20 right-20 w-40 h-40 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-20 left-20 w-32 h-32 bg-teal-400/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 p-12 rounded-[2rem] text-center max-w-md z-10 relative overflow-hidden">
              {/* Top accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300"></div>
              
              {/* Illustration */}
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 rotate-3">
                  <MessageCircle size={42} className="text-emerald-400/70" strokeWidth={1.5} />
                </div>
                <div className="absolute top-0 right-[calc(50%-52px)] w-5 h-5 bg-emerald-500 border-[3px] border-white rounded-full shadow-md"></div>
                {/* Floating mini icons */}
                <div className="absolute -top-2 -right-[calc(50%-68px)] w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center shadow-md text-white rotate-12">
                  <Send size={12} />
                </div>
              </div>
              
              <h3 className="text-2xl font-extrabold text-slate-800 mb-3">SkillBridge Connect</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                Connect with your mentors and students instantly. Select a conversation from the left to start chatting.
              </p>
              
              {/* Feature pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-100">💬 Instant Chat</span>
                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">📹 Video Calls</span>
                <span className="px-3 py-1.5 bg-purple-50 text-purple-600 text-xs font-bold rounded-lg border border-purple-100">📎 File Sharing</span>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ready to Connect</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Chat;

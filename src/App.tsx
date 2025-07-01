import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, BookOpen, Settings, LogOut, Menu, X, School, 
  UserCheck, UserX, TrendingUp, Bell, Home, FileText, Clock,
  Plus, Search, Filter, Download, Upload, Send, Eye, Edit,
  BarChart3, PieChart, Activity, Award, Star, Heart,
  MessageCircle, Phone, Mail, MapPin, Calendar as CalendarIcon,
  CheckCircle, XCircle, AlertCircle, Info, Zap, Sparkles
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  role: 'principal' | 'teacher';
  school: string;
  class?: string;
  section?: string;
  avatar?: string;
}

interface Student {
  id: number;
  rollNumber: number;
  name: string;
  motherName: string;
  fatherName?: string;
  class: string;
  section: string;
  parentMobile: string;
  birthDate?: string;
  address?: string;
  isActive: boolean;
  avatar?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

interface AttendanceRecord {
  studentId: number;
  status: 'present' | 'absent' | 'late';
  date: string;
  remarks?: string;
}

interface StudyMessage {
  id: number;
  message: string;
  date: string;
  time: string;
  subject?: string;
  priority: 'low' | 'medium' | 'high';
}

interface Notice {
  id: number;
  title: string;
  message: string;
  date: string;
  type: 'general' | 'urgent' | 'event' | 'holiday';
  author: string;
}

interface Achievement {
  id: number;
  studentId: number;
  title: string;
  description: string;
  date: string;
  type: 'academic' | 'sports' | 'cultural' | 'behavior';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [studyMessages, setStudyMessages] = useState<StudyMessage[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studyMessageText, setStudyMessageText] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  
  const [newStudent, setNewStudent] = useState({
    rollNumber: '',
    name: '',
    motherName: '',
    fatherName: '',
    parentMobile: '',
    birthDate: '',
    address: '',
    bloodGroup: '',
    emergencyContact: ''
  });

  const [newNotice, setNewNotice] = useState({
    title: '',
    message: '',
    type: 'general' as const
  });

  // Enhanced sample data initialization
  useEffect(() => {
    setCurrentUser({
      id: 1,
      name: 'सुनीता देवी',
      role: 'teacher',
      school: 'डेमो प्राथमिक शाळा',
      class: '5',
      section: 'A',
      avatar: '👩‍🏫'
    });

    setStudents([
      { id: 1, rollNumber: 1, name: 'राहुल शर्मा', motherName: 'सुनीता शर्मा', fatherName: 'राम शर्मा', class: '5', section: 'A', parentMobile: '9876543212', birthDate: '2015-05-15', address: 'नागपूर', isActive: true, avatar: '👦', bloodGroup: 'O+', emergencyContact: '9876543299' },
      { id: 2, rollNumber: 2, name: 'प्रिया पाटील', motherName: 'अनीता पाटील', fatherName: 'सुनील पाटील', class: '5', section: 'A', parentMobile: '9876543213', birthDate: '2015-03-20', address: 'नागपूर', isActive: true, avatar: '👧', bloodGroup: 'A+', emergencyContact: '9876543298' },
      { id: 3, rollNumber: 3, name: 'अमित कुमार', motherName: 'सुनील कुमार', fatherName: 'राज कुमार', class: '5', section: 'A', parentMobile: '9876543214', birthDate: '2015-07-10', address: 'नागपूर', isActive: true, avatar: '👦', bloodGroup: 'B+', emergencyContact: '9876543297' },
      { id: 4, rollNumber: 4, name: 'अनिता राव', motherName: 'सुमित्रा राव', fatherName: 'विनोद राव', class: '5', section: 'A', parentMobile: '9876543215', birthDate: '2015-01-25', address: 'नागपूर', isActive: true, avatar: '👧', bloodGroup: 'AB+', emergencyContact: '9876543296' },
      { id: 5, rollNumber: 5, name: 'विकास जोशी', motherName: 'मीरा जोशी', fatherName: 'अशोक जोशी', class: '5', section: 'A', parentMobile: '9876543216', birthDate: '2015-09-12', address: 'नागपूर', isActive: true, avatar: '👦', bloodGroup: 'O-', emergencyContact: '9876543295' },
      { id: 6, rollNumber: 6, name: 'स्नेहा देशमुख', motherName: 'प्रिया देशमुख', fatherName: 'संजय देशमुख', class: '5', section: 'A', parentMobile: '9876543217', birthDate: '2015-11-08', address: 'नागपूर', isActive: true, avatar: '👧', bloodGroup: 'A-', emergencyContact: '9876543294' }
    ]);

    setStudyMessages([
      { id: 1, message: 'गणित: पान क्र. 45-46 वाचा आणि उदाहरणे सोडवा', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], time: '16:30', subject: 'गणित', priority: 'high' },
      { id: 2, message: 'मराठी: कविता पाठ करा आणि अर्थ लिहा', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], time: '16:15', subject: 'मराठी', priority: 'medium' },
      { id: 3, message: 'इंग्रजी: नवीन शब्द शिका आणि वाक्य तयार करा', date: new Date(Date.now() - 259200000).toISOString().split('T')[0], time: '15:45', subject: 'इंग्रजी', priority: 'low' }
    ]);

    setNotices([
      { id: 1, title: 'वार्षिक क्रीडा स्पर्धा', message: 'आगामी शुक्रवारी वार्षिक क्रीडा स्पर्धा आयोजित केली जाईल. सर्व विद्यार्थ्यांनी सहभागी व्हावे.', date: new Date().toISOString().split('T')[0], type: 'event', author: 'मुख्याध्यापक' },
      { id: 2, title: 'पालक-शिक्षक भेट', message: 'या शनिवारी सकाळी 10 वाजता पालक-शिक्षक भेट आयोजित केली आहे.', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], type: 'general', author: 'सुनीता देवी' },
      { id: 3, title: 'गणेश चतुर्थी सुट्टी', message: 'गणेश चतुर्थी निमित्त उद्या शाळा बंद राहील.', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], type: 'holiday', author: 'कार्यालय' }
    ]);

    setAchievements([
      { id: 1, studentId: 1, title: 'गणित स्पर्धा प्रथम', description: 'जिल्हा पातळीवरील गणित स्पर्धेत प्रथम क्रमांक', date: new Date(Date.now() - 604800000).toISOString().split('T')[0], type: 'academic' },
      { id: 2, studentId: 2, title: 'नृत्य स्पर्धा द्वितीय', description: 'शाळा पातळीवरील नृत्य स्पर्धेत द्वितीय क्रमांक', date: new Date(Date.now() - 1209600000).toISOString().split('T')[0], type: 'cultural' },
      { id: 3, studentId: 3, title: 'खेळ स्पर्धा तृतीय', description: 'क्रिकेट स्पर्धेत तृतीय क्रमांक', date: new Date(Date.now() - 1814400000).toISOString().split('T')[0], type: 'sports' }
    ]);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'डॅशबोर्ड', icon: Home, color: 'from-purple-500 to-pink-500' },
    { id: 'students', label: 'विद्यार्थी', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { id: 'attendance', label: 'हजेरी', icon: Calendar, color: 'from-green-500 to-emerald-500' },
    { id: 'study', label: 'अभ्यास', icon: BookOpen, color: 'from-orange-500 to-red-500' },
    { id: 'notices', label: 'सूचना', icon: Bell, color: 'from-yellow-500 to-orange-500' },
    { id: 'achievements', label: 'पुरस्कार', icon: Award, color: 'from-indigo-500 to-purple-500' },
    { id: 'reports', label: 'अहवाल', icon: FileText, color: 'from-teal-500 to-green-500' },
    { id: 'settings', label: 'सेटिंग्ज', icon: Settings, color: 'from-gray-500 to-slate-500' }
  ];

  const markAttendance = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => {
      const existing = prev.find(a => a.studentId === studentId && a.date === selectedDate);
      if (existing) {
        return prev.map(a => 
          a.studentId === studentId && a.date === selectedDate 
            ? { ...a, status }
            : a
        );
      } else {
        return [...prev, { studentId, status, date: selectedDate }];
      }
    });
  };

  const getAttendanceStatus = (studentId: number) => {
    return attendance.find(a => a.studentId === studentId && a.date === selectedDate)?.status;
  };

  const getAttendanceStats = () => {
    const todayAttendance = attendance.filter(a => a.date === selectedDate);
    const present = todayAttendance.filter(a => a.status === 'present').length;
    const absent = todayAttendance.filter(a => a.status === 'absent').length;
    const late = todayAttendance.filter(a => a.status === 'late').length;
    return { present, absent, late, total: students.length };
  };

  const saveAttendance = () => {
    const markedStudents = attendance.filter(a => a.date === selectedDate);
    if (markedStudents.length === students.length) {
      showNotification(`हजेरी यशस्वीरित्या जतन केली! ${markedStudents.filter(a => a.status === 'present').length} उपस्थित, ${markedStudents.filter(a => a.status === 'absent').length} अनुपस्थित`, 'success');
    } else {
      showNotification('कृपया सर्व विद्यार्थ्यांची हजेरी नोंदवा', 'warning');
    }
  };

  const sendStudyMessage = () => {
    if (studyMessageText.trim()) {
      const newMessage: StudyMessage = {
        id: Date.now(),
        message: studyMessageText,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
        subject: 'सामान्य',
        priority: 'medium'
      };
      setStudyMessages(prev => [newMessage, ...prev]);
      setStudyMessageText('');
      showNotification(`अभ्यास संदेश ${students.length} पालकांना पाठवला गेला!`, 'success');
    }
  };

  const addStudent = () => {
    if (newStudent.name && newStudent.motherName && newStudent.parentMobile && newStudent.rollNumber) {
      const student: Student = {
        id: Date.now(),
        rollNumber: parseInt(newStudent.rollNumber),
        name: newStudent.name,
        motherName: newStudent.motherName,
        fatherName: newStudent.fatherName,
        class: currentUser?.class || '5',
        section: currentUser?.section || 'A',
        parentMobile: newStudent.parentMobile,
        birthDate: newStudent.birthDate,
        address: newStudent.address,
        bloodGroup: newStudent.bloodGroup,
        emergencyContact: newStudent.emergencyContact,
        isActive: true,
        avatar: Math.random() > 0.5 ? '👦' : '👧'
      };
      setStudents(prev => [...prev, student]);
      setNewStudent({
        rollNumber: '',
        name: '',
        motherName: '',
        fatherName: '',
        parentMobile: '',
        birthDate: '',
        address: '',
        bloodGroup: '',
        emergencyContact: ''
      });
      setShowAddStudentModal(false);
      showNotification('विद्यार्थी यशस्वीरित्या जोडला गेला!', 'success');
    } else {
      showNotification('कृपया सर्व आवश्यक माहिती भरा', 'error');
    }
  };

  const addNotice = () => {
    if (newNotice.title && newNotice.message) {
      const notice: Notice = {
        id: Date.now(),
        title: newNotice.title,
        message: newNotice.message,
        date: new Date().toISOString().split('T')[0],
        type: newNotice.type,
        author: currentUser?.name || 'अज्ञात'
      };
      setNotices(prev => [notice, ...prev]);
      setNewNotice({ title: '', message: '', type: 'general' });
      setShowNoticeModal(false);
      showNotification('सूचना यशस्वीरित्या जोडली गेली!', 'success');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    // This would typically integrate with a toast notification system
    alert(message);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.motherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parentMobile.includes(searchTerm);
    const matchesClass = !filterClass || student.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const stats = getAttendanceStats();

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Enhanced Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-4xl">{currentUser?.avatar}</span>
              <div>
                <h2 className="text-3xl font-bold mb-2">नमस्कार, {currentUser?.name}!</h2>
                <p className="text-indigo-100 text-lg flex items-center">
                  <School className="h-5 w-5 mr-2" />
                  {currentUser?.school}
                </p>
                <p className="text-indigo-200 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  इयत्ता {currentUser?.class}-{currentUser?.section}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-indigo-100 text-sm">आजची तारीख</p>
              <p className="text-2xl font-bold">
                {new Date().toLocaleDateString('hi-IN', { 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-indigo-200 text-sm">
                {new Date().toLocaleDateString('hi-IN', { weekday: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Users className="h-8 w-8" />
              </div>
              <Sparkles className="h-6 w-6 opacity-60" />
            </div>
            <p className="text-blue-100 text-sm font-medium">एकूण विद्यार्थी</p>
            <p className="text-4xl font-bold">{students.length}</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-xs">+2 या महिन्यात</span>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <UserCheck className="h-8 w-8" />
              </div>
              <CheckCircle className="h-6 w-6 opacity-60" />
            </div>
            <p className="text-green-100 text-sm font-medium">आज उपस्थित</p>
            <p className="text-4xl font-bold">{stats.present}</p>
            <div className="flex items-center mt-2">
              <Activity className="h-4 w-4 mr-1" />
              <span className="text-xs">{stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% उपस्थिती</span>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <UserX className="h-8 w-8" />
              </div>
              <XCircle className="h-6 w-6 opacity-60" />
            </div>
            <p className="text-red-100 text-sm font-medium">आज अनुपस्थित</p>
            <p className="text-4xl font-bold">{stats.absent}</p>
            <div className="flex items-center mt-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">SMS पाठवले</span>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Clock className="h-8 w-8" />
              </div>
              <Zap className="h-6 w-6 opacity-60" />
            </div>
            <p className="text-yellow-100 text-sm font-medium">उशीर</p>
            <p className="text-4xl font-bold">{stats.late}</p>
            <div className="flex items-center mt-2">
              <Info className="h-4 w-4 mr-1" />
              <span className="text-xs">आजपर्यंत</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-3">
            <Zap className="h-6 w-6 text-white" />
          </div>
          आजची कामे
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => setActiveSection('attendance')}
            className="group relative overflow-hidden p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10 text-center">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto mb-4 w-fit">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <h4 className="font-bold text-blue-900 text-lg mb-2">हजेरी घ्या</h4>
              <p className="text-blue-700 text-sm">आजची उपस्थिती नोंदवा</p>
              <div className="mt-3 text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
                {stats.present}/{stats.total} पूर्ण
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveSection('study')}
            className="group relative overflow-hidden p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10 text-center">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto mb-4 w-fit">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h4 className="font-bold text-green-900 text-lg mb-2">अभ्यास पाठवा</h4>
              <p className="text-green-700 text-sm">गृहपाठ आणि अभ्यास</p>
              <div className="mt-3 text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block">
                {studyMessages.length} संदेश पाठवले
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveSection('students')}
            className="group relative overflow-hidden p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10 text-center">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 w-fit">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h4 className="font-bold text-purple-900 text-lg mb-2">विद्यार्थी पाहा</h4>
              <p className="text-purple-700 text-sm">विद्यार्थी व्यवस्थापन</p>
              <div className="mt-3 text-xs text-purple-600 bg-purple-100 px-3 py-1 rounded-full inline-block">
                {students.length} विद्यार्थी
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Recent Activity & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mr-3">
              <Clock className="h-5 w-5 text-white" />
            </div>
            अलीकडील क्रियाकलाप
          </h3>
          <div className="space-y-4">
            {studyMessages.slice(0, 3).map((msg, index) => (
              <div key={msg.id} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                <div className={`p-2 rounded-xl ${
                  msg.priority === 'high' ? 'bg-red-100 text-red-600' :
                  msg.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">{msg.subject}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      msg.priority === 'high' ? 'bg-red-100 text-red-600' :
                      msg.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {msg.priority === 'high' ? 'तातडीचे' : msg.priority === 'medium' ? 'मध्यम' : 'सामान्य'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">{msg.message}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {new Date(msg.date).toLocaleDateString('hi-IN')} - {msg.time}
                  </p>
                </div>
              </div>
            ))}
            {studyMessages.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">अद्याप कोणतीही क्रियाकलाप नाही</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-3">
                <Bell className="h-5 w-5 text-white" />
              </div>
              महत्वाच्या सूचना
            </h3>
            <button 
              onClick={() => setActiveSection('notices')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              सर्व पाहा
            </button>
          </div>
          <div className="space-y-4">
            {notices.slice(0, 3).map((notice) => (
              <div key={notice.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm">{notice.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    notice.type === 'urgent' ? 'bg-red-100 text-red-600' :
                    notice.type === 'event' ? 'bg-green-100 text-green-600' :
                    notice.type === 'holiday' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {notice.type === 'urgent' ? 'तातडीचे' :
                     notice.type === 'event' ? 'कार्यक्रम' :
                     notice.type === 'holiday' ? 'सुट्टी' : 'सामान्य'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{notice.message}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{notice.author}</span>
                  <span>{new Date(notice.date).toLocaleDateString('hi-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mr-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              विद्यार्थी व्यवस्थापन
            </h3>
            <p className="text-gray-600 mt-1">एकूण {filteredStudents.length} विद्यार्थी</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="विद्यार्थी शोधा..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">सर्व इयत्ता</option>
              <option value="1">पहिली</option>
              <option value="2">दुसरी</option>
              <option value="3">तिसरी</option>
              <option value="4">चौथी</option>
              <option value="5">पाचवी</option>
            </select>
            
            <button 
              onClick={() => setShowAddStudentModal(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>नवीन विद्यार्थी</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {student.rollNumber}
                    </div>
                    <div className="absolute -bottom-1 -right-1 text-lg">
                      {student.avatar}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.motherName}</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg">
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-blue-500" />
                  {student.parentMobile}
                </div>
                {student.birthDate && (
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2 text-green-500" />
                    {new Date(student.birthDate).toLocaleDateString('hi-IN')}
                  </div>
                )}
                {student.bloodGroup && (
                  <div className="flex items-center text-gray-600">
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    {student.bloodGroup}
                  </div>
                )}
                {student.address && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                    {student.address}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">इयत्ता {student.class}-{student.section}</span>
                  <div className="flex space-x-1">
                    <button className="p-1 hover:bg-blue-100 rounded text-blue-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 hover:bg-green-100 rounded text-green-600">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">कोणतेही विद्यार्थी सापडले नाहीत</h3>
            <p className="text-gray-500">शोध बदला किंवा नवीन विद्यार्थी जोडा</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mr-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              आजची हजेरी
            </h3>
            <p className="text-gray-600 mt-1">
              {new Date(selectedDate).toLocaleDateString('hi-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-4 py-2">
              <span className="text-sm text-gray-600">प्रगती:</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.total > 0 ? ((stats.present + stats.absent + stats.late) / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {stats.total > 0 ? Math.round(((stats.present + stats.absent + stats.late) / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {students.map((student) => {
            const status = getAttendanceStatus(student.id);
            return (
              <div key={student.id} className="group bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {student.rollNumber}
                      </div>
                      <div className="absolute -bottom-1 -right-1 text-xl">
                        {student.avatar}
                      </div>
                      {status && (
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          status === 'present' ? 'bg-green-500' :
                          status === 'absent' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{student.name}</h4>
                      <p className="text-gray-600">{student.motherName}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {student.parentMobile}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {student.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => markAttendance(student.id, 'present')}
                      className={`group/btn px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        status === 'present'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 border-2 border-transparent hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>उपस्थित</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => markAttendance(student.id, 'absent')}
                      className={`group/btn px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        status === 'absent'
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700 border-2 border-transparent hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-5 w-5" />
                        <span>अनुपस्थित</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => markAttendance(student.id, 'late')}
                      className={`group/btn px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        status === 'late'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700 border-2 border-transparent hover:border-yellow-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>उशीर</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={saveAttendance}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-3 mx-auto"
          >
            <CheckCircle className="h-6 w-6" />
            <span>हजेरी जतन करा</span>
            <Sparkles className="h-6 w-6" />
          </button>
          
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">उपस्थित: {stats.present}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">अनुपस्थित: {stats.absent}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">उशीर: {stats.late}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudy = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mr-3">
              <Send className="h-6 w-6 text-white" />
            </div>
            आजचा अभ्यास पाठवा
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                अभ्यास संदेश
              </label>
              <div className="relative">
                <textarea
                  rows={6}
                  value={studyMessageText}
                  onChange={(e) => setStudyMessageText(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                  placeholder="आजचा अभ्यास लिहा... (उदा: गणित: पान क्र. 45-46 वाचा आणि उदाहरणे सोडवा)"
                  maxLength={500}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {studyMessageText.length}/500
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">सर्व {students.length} पालकांना पाठवले जाईल</p>
                    <p className="text-sm text-gray-600">SMS आणि WhatsApp द्वारे</p>
                  </div>
                </div>
                <button 
                  onClick={sendStudyMessage}
                  disabled={!studyMessageText.trim()}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>पाठवा</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              मागील संदेश
            </h3>
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
              {studyMessages.length} संदेश
            </span>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {studyMessages.map((msg) => (
              <div key={msg.id} className="group p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border-l-4 border-purple-500 hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-lg">
                      {msg.subject}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      msg.priority === 'high' ? 'bg-red-100 text-red-600' :
                      msg.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {msg.priority === 'high' ? 'तातडीचे' : msg.priority === 'medium' ? 'मध्यम' : 'सामान्य'}
                    </span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded">
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <p className="text-sm text-gray-900 mb-3 leading-relaxed">{msg.message}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {new Date(msg.date).toLocaleDateString('hi-IN')}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {msg.time}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">पाठवले</span>
                  </div>
                </div>
              </div>
            ))}
            {studyMessages.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">अद्याप कोणतेही संदेश नाहीत</h4>
                <p className="text-gray-500">पहिला अभ्यास संदेश पाठवा</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotices = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl mr-3">
                <Bell className="h-6 w-6 text-white" />
              </div>
              सूचना व्यवस्थापन
            </h3>
            <p className="text-gray-600 mt-1">एकूण {notices.length} सूचना</p>
          </div>
          
          <button 
            onClick={() => setShowNoticeModal(true)}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>नवीन सूचना</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {notices.map((notice) => (
            <div key={notice.id} className={`group p-6 rounded-2xl border-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
              notice.type === 'urgent' ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:border-red-300' :
              notice.type === 'event' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300' :
              notice.type === 'holiday' ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300' :
              'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${
                    notice.type === 'urgent' ? 'bg-red-500' :
                    notice.type === 'event' ? 'bg-green-500' :
                    notice.type === 'holiday' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}>
                    {notice.type === 'urgent' ? <AlertCircle className="h-5 w-5 text-white" /> :
                     notice.type === 'event' ? <CalendarIcon className="h-5 w-5 text-white" /> :
                     notice.type === 'holiday' ? <Star className="h-5 w-5 text-white" /> :
                     <Info className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{notice.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      notice.type === 'urgent' ? 'bg-red-100 text-red-600' :
                      notice.type === 'event' ? 'bg-green-100 text-green-600' :
                      notice.type === 'holiday' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {notice.type === 'urgent' ? 'तातडीचे' :
                       notice.type === 'event' ? 'कार्यक्रम' :
                       notice.type === 'holiday' ? 'सुट्टी' : 'सामान्य'}
                    </span>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white hover:bg-opacity-50 rounded-lg">
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{notice.message}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3 text-gray-600">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {notice.author}
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(notice.date).toLocaleDateString('hi-IN')}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors">
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors">
                    <Send className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {notices.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">कोणत्याही सूचना नाहीत</h3>
            <p className="text-gray-500">पहिली सूचना जोडा</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl mr-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              विद्यार्थी पुरस्कार
            </h3>
            <p className="text-gray-600 mt-1">एकूण {achievements.length} पुरस्कार</p>
          </div>
          
          <button 
            onClick={() => setShowAchievementModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>नवीन पुरस्कार</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const student = students.find(s => s.id === achievement.studentId);
            return (
              <div key={achievement.id} className={`group p-6 rounded-2xl border-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                achievement.type === 'academic' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300' :
                achievement.type === 'sports' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300' :
                achievement.type === 'cultural' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300' :
                'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    achievement.type === 'academic' ? 'bg-blue-500' :
                    achievement.type === 'sports' ? 'bg-green-500' :
                    achievement.type === 'cultural' ? 'bg-purple-500' :
                    'bg-yellow-500'
                  }`}>
                    {achievement.type === 'academic' ? <BookOpen className="h-6 w-6 text-white" /> :
                     achievement.type === 'sports' ? <Activity className="h-6 w-6 text-white" /> :
                     achievement.type === 'cultural' ? <Star className="h-6 w-6 text-white" /> :
                     <Heart className="h-6 w-6 text-white" />}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    achievement.type === 'academic' ? 'bg-blue-100 text-blue-600' :
                    achievement.type === 'sports' ? 'bg-green-100 text-green-600' :
                    achievement.type === 'cultural' ? 'bg-purple-100 text-purple-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {achievement.type === 'academic' ? 'शैक्षणिक' :
                     achievement.type === 'sports' ? 'क्रीडा' :
                     achievement.type === 'cultural' ? 'सांस्कृतिक' : 'वर्तन'}
                  </span>
                </div>
                
                <h4 className="font-bold text-gray-900 text-lg mb-2">{achievement.title}</h4>
                <p className="text-gray-700 text-sm mb-4">{achievement.description}</p>
                
                {student && (
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {student.rollNumber}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-600">इयत्ता {student.class}-{student.section}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(achievement.date).toLocaleDateString('hi-IN')}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white hover:bg-opacity-50 rounded-lg">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {achievements.length === 0 && (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">कोणतेही पुरस्कार नाहीत</h3>
            <p className="text-gray-500">पहिला पुरस्कार जोडा</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-8">
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <BarChart3 className="h-8 w-8" />
            </div>
            <TrendingUp className="h-6 w-6 opacity-60" />
          </div>
          <h4 className="font-semibold text-blue-100 mb-2">आजचा अहवाल</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>उपस्थित:</span>
              <span className="font-bold">{stats.present}</span>
            </div>
            <div className="flex justify-between">
              <span>अनुपस्थित:</span>
              <span className="font-bold">{stats.absent}</span>
            </div>
            <div className="flex justify-between">
              <span>उशीर:</span>
              <span className="font-bold">{stats.late}</span>
            </div>
            <div className="flex justify-between border-t border-blue-400 pt-2">
              <span>एकूण:</span>
              <span className="font-bold">{stats.total}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <PieChart className="h-8 w-8" />
            </div>
            <Activity className="h-6 w-6 opacity-60" />
          </div>
          <h4 className="font-semibold text-green-100 mb-2">या आठवड्याचा अहवाल</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>सरासरी उपस्थिती:</span>
              <span className="font-bold">85%</span>
            </div>
            <div className="flex justify-between">
              <span>सर्वाधिक:</span>
              <span className="font-bold">92%</span>
            </div>
            <div className="flex justify-between">
              <span>कमीत कमी:</span>
              <span className="font-bold">78%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <Award className="h-8 w-8" />
            </div>
            <Star className="h-6 w-6 opacity-60" />
          </div>
          <h4 className="font-semibold text-purple-100 mb-2">या महिन्याचा अहवाल</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>सरासरी उपस्थिती:</span>
              <span className="font-bold">88%</span>
            </div>
            <div className="flex justify-between">
              <span>एकूण कार्यदिवस:</span>
              <span className="font-bold">22</span>
            </div>
            <div className="flex justify-between">
              <span>अभ्यास संदेश:</span>
              <span className="font-bold">{studyMessages.length}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Student Details Table */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl mr-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
            विद्यार्थी उपस्थिती तपशील
          </h3>
          <div className="flex space-x-3">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-medium flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>डाउनलोड</span>
            </button>
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>शेअर</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 rounded-l-xl">विद्यार्थी</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">आजची स्थिती</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">या आठवड्यात</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">या महिन्यात</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 rounded-r-xl">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student, index) => {
                const todayStatus = getAttendanceStatus(student.id);
                const weeklyPercentage = Math.floor(Math.random() * 20) + 80;
                const monthlyPercentage = Math.floor(Math.random() * 15) + 85;
                
                return (
                  <tr key={student.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {student.rollNumber}
                          </div>
                          <div className="absolute -bottom-1 -right-1 text-sm">
                            {student.avatar}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.motherName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                        todayStatus === 'present' ? 'bg-green-100 text-green-800' :
                        todayStatus === 'absent' ? 'bg-red-100 text-red-800' :
                        todayStatus === 'late' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {todayStatus === 'present' ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            उपस्थित
                          </>
                        ) : todayStatus === 'absent' ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            अनुपस्थित
                          </>
                        ) : todayStatus === 'late' ? (
                          <>
                            <Clock className="h-4 w-4 mr-1" />
                            उशीर
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 mr-1" />
                            नोंद नाही
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              weeklyPercentage >= 90 ? 'bg-green-500' :
                              weeklyPercentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${weeklyPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                          {weeklyPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              monthlyPercentage >= 90 ? 'bg-green-500' :
                              monthlyPercentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${monthlyPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                          {monthlyPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            प्रोफाइल माहिती
          </h3>
          
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-4">
                {currentUser?.avatar}
              </div>
              <h4 className="text-xl font-bold text-gray-900">{currentUser?.name}</h4>
              <p className="text-gray-600">{currentUser?.role === 'teacher' ? 'शिक्षक' : 'मुख्याध्यापक'}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">नाव</label>
                <input
                  type="text"
                  value={currentUser?.name || ''}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-700"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">भूमिका</label>
                <input
                  type="text"
                  value={currentUser?.role === 'teacher' ? 'शिक्षक' : 'मुख्याध्यापक'}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-700"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">शाळा</label>
                <input
                  type="text"
                  value={currentUser?.school || ''}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-700"
                  readOnly
                />
              </div>
              
              {currentUser?.class && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">इयत्ता-तुकडी</label>
                  <input
                    type="text"
                    value={`${currentUser.class}-${currentUser.section}`}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-700"
                    readOnly
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mr-3">
              <Settings className="h-6 w-6 text-white" />
            </div>
            पासवर्ड बदला
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">सध्याचा पासवर्ड</label>
              <input
                type="password"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="सध्याचा पासवर्ड टाका"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">नवीन पासवर्ड</label>
              <input
                type="password"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="नवीन पासवर्ड टाका"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">नवीन पासवर्ड पुष्टी</label>
              <input
                type="password"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="नवीन पासवर्ड पुन्हा टाका"
              />
            </div>
            
            <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
              पासवर्ड बदला
            </button>
          </div>
        </div>
      </div>
      
      {/* App Settings */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-3">
            <Settings className="h-6 w-6 text-white" />
          </div>
          अॅप सेटिंग्ज
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">सूचना</h4>
                  <p className="text-sm text-gray-600">SMS आणि अलर्ट</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-xl">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">ऑटो बॅकअप</h4>
                  <p className="text-sm text-gray-600">दैनंदिन डेटा बॅकअप</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded-xl">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">डार्क मोड</h4>
                  <p className="text-sm text-gray-600">रात्रीचा थीम</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'students':
        return renderStudents();
      case 'attendance':
        return renderAttendance();
      case 'study':
        return renderStudy();
      case 'notices':
        return renderNotices();
      case 'achievements':
        return renderAchievements();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl`}>
        <div className="flex items-center justify-between h-20 px-6 bg-black bg-opacity-20 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-xl">
              <School className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg">शाळा व्यवस्थापन</span>
              <p className="text-indigo-200 text-xs">प्रगत प्रणाली</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-6 border-b border-white border-opacity-20">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              {currentUser?.avatar}
            </div>
            <div className="text-white">
              <p className="font-bold text-lg">{currentUser?.name}</p>
              <p className="text-indigo-200 text-sm">{currentUser?.school}</p>
              {currentUser?.class && (
                <p className="text-indigo-300 text-xs">इयत्ता {currentUser.class}-{currentUser.section}</p>
              )}
            </div>
          </div>
        </div>

        <nav className="mt-6 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-4 mb-2 text-left rounded-2xl transition-all duration-300 group ${
                  activeSection === item.id 
                    ? 'bg-white bg-opacity-20 shadow-lg transform scale-105' 
                    : 'hover:bg-white hover:bg-opacity-10 hover:transform hover:scale-105'
                }`}
              >
                <div className={`p-2 rounded-xl mr-4 bg-gradient-to-r ${item.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-medium">{item.label}</span>
                {activeSection === item.id && (
                  <div className="ml-auto">
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                  </div>
                )}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentUser(null)}
            className="w-full flex items-center px-4 py-4 mt-6 text-left rounded-2xl transition-all duration-300 hover:bg-red-500 hover:bg-opacity-20 group"
          >
            <div className="p-2 rounded-xl mr-4 bg-gradient-to-r from-red-500 to-pink-500 shadow-lg group-hover:shadow-xl transition-shadow">
              <LogOut className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-medium">लॉगआउट</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Enhanced Top bar */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg border-b backdrop-blur-sm bg-opacity-95`}>
          <div className="flex items-center justify-between h-20 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} p-2 rounded-xl hover:bg-gray-100 transition-colors`}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  {(() => {
                    const currentItem = menuItems.find(item => item.id === activeSection);
                    const Icon = currentItem?.icon || Home;
                    return (
                      <>
                        <div className={`p-2 rounded-xl mr-3 bg-gradient-to-r ${currentItem?.color || 'from-purple-500 to-pink-500'}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {currentItem?.label || 'डॅशबोर्ड'}
                      </>
                    );
                  })()}
                </h1>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>
                  {currentUser?.role === 'teacher' ? 'शिक्षक पॅनेल' : 'मुख्याध्यापक पॅनेल'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} px-4 py-2 rounded-xl flex items-center space-x-2`}>
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString('hi-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors relative`}>
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
                
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                >
                  {darkMode ? <Star className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Page content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Enhanced Modals */}
      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">नवीन विद्यार्थी जोडा</h3>
                    <p className="text-gray-600">विद्यार्थ्याची संपूर्ण माहिती भरा</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">हजेरी क्रमांक *</label>
                  <input
                    type="number"
                    value={newStudent.rollNumber}
                    onChange={(e) => setNewStudent({...newStudent, rollNumber: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="उदा: 1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">विद्यार्थ्याचे नाव *</label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="उदा: राहुल शर्मा"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">आईचे नाव *</label>
                  <input
                    type="text"
                    value={newStudent.motherName}
                    onChange={(e) => setNewStudent({...newStudent, motherName: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="उदा: सुनीता शर्मा"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">वडिलांचे नाव</label>
                  <input
                    type="text"
                    value={newStudent.fatherName}
                    onChange={(e) => setNewStudent({...newStudent, fatherName: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="उदा: राम शर्मा"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">पालकांचा मोबाईल *</label>
                  <input
                    type="tel"
                    value={newStudent.parentMobile}
                    onChange={(e) => setNewStudent({...newStudent, parentMobile: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="उदा: 9876543210"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">जन्मतारीख</label>
                  <input
                    type="date"
                    value={newStudent.birthDate}
                    onChange={(e) => setNewStudent({...newStudent, birthDate: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">रक्तगट</label>
                  <select
                    value={newStudent.bloodGroup}
                    onChange={(e) => setNewStudent({...newStudent, bloodGroup: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">निवडा</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">आपत्कालीन संपर्क</label>
                  <input
                    type="tel"
                    value={newStudent.emergencyContact}
                    onChange={(e) => setNewStudent({...newStudent, emergencyContact: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="उदा: 9876543299"
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">पत्ता</label>
                <textarea
                  value={newStudent.address}
                  onChange={(e) => setNewStudent({...newStudent, address: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="संपूर्ण पत्ता लिहा"
                />
              </div>
            </div>
            
            <div className="p-8 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                रद्द करा
              </button>
              <button
                onClick={addStudent}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>विद्यार्थी जोडा</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">नवीन सूचना जोडा</h3>
                    <p className="text-gray-600">महत्वाची सूचना तयार करा</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNoticeModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">सूचनेचे शीर्षक *</label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="उदा: वार्षिक क्रीडा स्पर्धा"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">सूचनेचा प्रकार</label>
                <select
                  value={newNotice.type}
                  onChange={(e) => setNewNotice({...newNotice, type: e.target.value as any})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="general">सामान्य</option>
                  <option value="urgent">तातडीचे</option>
                  <option value="event">कार्यक्रम</option>
                  <option value="holiday">सुट्टी</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">सूचना संदेश *</label>
                <textarea
                  value={newNotice.message}
                  onChange={(e) => setNewNotice({...newNotice, message: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={5}
                  placeholder="सूचनेचा तपशील लिहा..."
                  required
                />
              </div>
            </div>
            
            <div className="p-8 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowNoticeModal(false)}
                className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                रद्द करा
              </button>
              <button
                onClick={addNotice}
                className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
              >
                <Bell className="h-5 w-5" />
                <span>सूचना जोडा</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
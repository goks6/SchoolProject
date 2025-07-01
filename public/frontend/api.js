// API Configuration and Helper Functions

const API_BASE_URL = 'http://localhost:3000/api';

// Get stored token
function getToken() {
    return localStorage.getItem('token');
}

// Get stored user
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// API Request Helper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// Auth APIs
const authAPI = {
    register: (data) => apiRequest('/auth/register-school', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    login: (data) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    verify: () => apiRequest('/auth/verify'),

    changePassword: (data) => apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};

// School APIs
const schoolAPI = {
    getDetails: () => apiRequest('/school/details'),

    addTeacher: (data) => apiRequest('/school/add-teacher', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    getTeachers: () => apiRequest('/school/teachers'),

    deleteTeacher: (id) => apiRequest(`/school/teacher/${id}`, {
        method: 'DELETE'
    }),

    resetTeacherPassword: (teacherId) => apiRequest('/school/reset-teacher-password', {
        method: 'POST',
        body: JSON.stringify({ teacherId })
    }),

    setHolidays: (dates, reason) => apiRequest('/school/holidays', {
        method: 'POST',
        body: JSON.stringify({ dates, reason })
    }),

    getHolidays: (year, month) => {
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        if (month) params.append('month', month);
        return apiRequest(`/school/holidays?${params}`);
    },

    getAttendanceSummary: (date) => {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        return apiRequest(`/school/attendance-summary?${params}`);
    }
};

// Student APIs
const studentAPI = {
    add: (data) => apiRequest('/student/add', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    list: (params = {}) => {
        const queryParams = new URLSearchParams(params);
        return apiRequest(`/student/list?${queryParams}`);
    },

    get: (id) => apiRequest(`/student/${id}`),

    update: (id, data) => apiRequest(`/student/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiRequest(`/student/delete/${id}`, {
        method: 'DELETE'
    }),

    bulkImport: (students) => apiRequest('/student/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ students })
    }),

    getStats: () => apiRequest('/student/stats/summary')
};

// Attendance APIs
const attendanceAPI = {
    getList: (date, className, division) => {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (className) params.append('class', className);
        if (division) params.append('division', division);
        return apiRequest(`/attendance/list?${params}`);
    },

    mark: (date, attendance) => apiRequest('/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({ date, attendance })
    }),

    sendStudyMessage: (message, date) => apiRequest('/attendance/study-message', {
        method: 'POST',
        body: JSON.stringify({ message, date })
    }),

    sendNotice: (message, targetType, selectedStudents) => apiRequest('/attendance/notice', {
        method: 'POST',
        body: JSON.stringify({ message, targetType, selectedStudents })
    }),

    getMonthlyReport: (year, month, className, division) => {
        const params = new URLSearchParams();
        params.append('year', year);
        params.append('month', month);
        if (className) params.append('class', className);
        if (division) params.append('division', division);
        return apiRequest(`/attendance/monthly-report?${params}`);
    },

    getYearlyReport: (academicYear, className, division) => {
        const params = new URLSearchParams();
        params.append('academicYear', academicYear);
        if (className) params.append('class', className);
        if (division) params.append('division', division);
        return apiRequest(`/attendance/yearly-report?${params}`);
    },

    getStatistics: (startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return apiRequest(`/attendance/statistics?${params}`);
    },

    getStudyMessages: (startDate, endDate, limit = 50) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('limit', limit);
        return apiRequest(`/attendance/study-messages?${params}`);
    }
};

// UI Helper Functions
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'flex';
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'none';
}

function showToast(message, type = 'success') {
    // Create toast element if not exists
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        margin-bottom: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('mr-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Format time for display
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('mr-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Check authentication
function checkAuth() {
    const token = getToken();
    const user = getUser();
    
    if (!token || !user) {
        window.location.href = '/index.html';
        return false;
    }
    
    return true;
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Export APIs
window.authAPI = authAPI;
window.schoolAPI = schoolAPI;
window.studentAPI = studentAPI;
window.attendanceAPI = attendanceAPI;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.checkAuth = checkAuth;
window.logout = logout;
window.getUser = getUser;
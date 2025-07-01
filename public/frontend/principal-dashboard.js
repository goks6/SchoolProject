<!DOCTYPE html>
<html lang="mr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>मुख्याध्यापक डॅशबोर्ड - शाळा व्यवस्थापन</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-header">
                <h3 id="schoolName">शाळेचे नाव</h3>
                <p id="userName">मुख्याध्यापक नाव</p>
            </div>
            
            <ul class="sidebar-menu">
                <li><a href="#" onclick="showSection('overview')" class="active">
                    <i class="bi bi-speedometer2"></i> डॅशबोर्ड
                </a></li>
                <li><a href="#" onclick="showSection('teachers')">
                    <i class="bi bi-people"></i> शिक्षक व्यवस्थापन
                </a></li>
                <li><a href="#" onclick="showSection('students')">
                    <i class="bi bi-person-lines-fill"></i> विद्यार्थी व्यवस्थापन
                </a></li>
                <li><a href="#" onclick="showSection('attendance')">
                    <i class="bi bi-calendar-check"></i> हजेरी पाहा
                </a></li>
                <li><a href="#" onclick="showSection('calendar')">
                    <i class="bi bi-calendar3"></i> कॅलेंडर
                </a></li>
                <li><a href="#" onclick="showSection('reports')">
                    <i class="bi bi-graph-up"></i> अहवाल
                </a></li>
                <li><a href="#" onclick="showSection('settings')">
                    <i class="bi bi-gear"></i> सेटिंग्ज
                </a></li>
                <li><a href="#" onclick="logout()">
                    <i class="bi bi-box-arrow-right"></i> लॉगआउट
                </a></li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <div class="top-bar">
                <div>
                    <h1 class="page-title">डॅशबोर्ड</h1>
                    <div class="breadcrumb">मुख्याध्यापक पॅनेल</div>
                </div>
                <div>
                    <span id="todayDate"></span>
                </div>
            </div>

            <!-- Overview Section -->
            <div id="overview-section" class="content-section">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="bi bi-people"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="totalStudents">0</h3>
                            <p>एकूण विद्यार्थी</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="bi bi-person-check"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="totalTeachers">0</h3>
                            <p>एकूण शिक्षक</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="bi bi-calendar-check"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="presentToday">0</h3>
                            <p>आज उपस्थित</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon danger">
                            <i class="bi bi-calendar-x"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="absentToday">0</h3>
                            <p>आज अनुपस्थित</p>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">आजचा हजेरी सारांश</h4>
                    </div>
                    <div id="todaysSummary">
                        <p class="text-center text-muted">डेटा लोड होत आहे...</p>
                    </div>
                </div>
            </div>

            <!-- Teachers Section -->
            <div id="teachers-section" class="content-section" style="display: none;">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">शिक्षक व्यवस्थापन</h4>
                        <button class="btn btn-primary" onclick="openAddTeacherModal()">
                            <i class="bi bi-plus"></i> नवीन शिक्षक जोडा
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>अ.क्र.</th>
                                    <th>नाव</th>
                                    <th>मोबाईल</th>
                                    <th>इयत्ता</th>
                                    <th>तुकडी</th>
                                    <th>कृती</th>
                                </tr>
                            </thead>
                            <tbody id="teachersList">
                                <tr>
                                    <td colspan="6" class="text-center">डेटा लोड होत आहे...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Students Section -->
            <div id="students-section" class="content-section" style="display: none;">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">विद्यार्थी व्यवस्थापन</h4>
                        <div>
                            <button class="btn btn-primary me-2" onclick="openAddStudentModal()">
                                <i class="bi bi-plus"></i> नवीन विद्यार्थी जोडा
                            </button>
                            <button class="btn btn-secondary" onclick="openBulkImportModal()">
                                <i class="bi bi-upload"></i> बल्क इम्पोर्ट
                            </button>
                        </div>
                    </div>
                    
                    <!-- Filters -->
                    <div class="row mb-3">
                        <div class="col-md-3">
                            <select class="form-control" id="filterClass" onchange="filterStudents()">
                                <option value="">सर्व इयत्ता</option>
                                <option value="1">पहिली</option>
                                <option value="2">दुसरी</option>
                                <option value="3">तिसरी</option>
                                <option value="4">चौथी</option>
                                <option value="5">पाचवी</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select class="form-control" id="filterSection" onchange="filterStudents()">
                                <option value="">सर्व तुकडी</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <input type="text" class="form-control" id="searchStudent" placeholder="विद्यार्थी शोधा..." onkeyup="filterStudents()">
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>हजेरी क्र.</th>
                                    <th>नाव</th>
                                    <th>इयत्ता</th>
                                    <th>तुकडी</th>
                                    <th>पालकांचा मोबाईल</th>
                                    <th>कृती</th>
                                </tr>
                            </thead>
                            <tbody id="studentsList">
                                <tr>
                                    <td colspan="6" class="text-center">डेटा लोड होत आहे...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Attendance Section -->
            <div id="attendance-section" class="content-section" style="display: none;">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">हजेरी पाहा</h4>
                        <input type="date" class="form-control" id="attendanceDatePicker" onchange="loadAttendanceSummary()" style="width: auto;">
                    </div>
                    <h5>तारीख: <span id="attendanceDate"></span></h5>
                    <div id="attendanceSummary">
                        <p class="text-center text-muted">डेटा लोड होत आहे...</p>
                    </div>
                </div>
            </div>

            <!-- Calendar Section -->
            <div id="calendar-section" class="content-section" style="display: none;">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">कॅलेंडर</h4>
                        <button class="btn btn-primary" onclick="openHolidayModal()">
                            <i class="bi bi-plus"></i> सुट्टी जोडा
                        </button>
                    </div>
                    <div class="calendar-container">
                        <div class="calendar-header">
                            <button class="btn btn-outline-primary" onclick="previousMonth()">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <h4 id="currentMonth">महिना वर्ष</h4>
                            <button class="btn btn-outline-primary" onclick="nextMonth()">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>
                        <div class="calendar-grid" id="calendarGrid">
                            <!-- Calendar will be generated here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reports Section -->
            <div id="reports-section" class="content-section" style="display: none;">
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">मासिक अहवाल</h4>
                            </div>
                            <div class="form-group">
                                <label>महिना निवडा:</label>
                                <input type="month" class="form-control" id="monthlyReportMonth">
                            </div>
                            <button class="btn btn-primary" onclick="generateMonthlyReport()">
                                अहवाल तयार करा
                            </button>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">वार्षिक अहवाल</h4>
                            </div>
                            <div class="form-group">
                                <label>शैक्षणिक वर्ष:</label>
                                <select class="form-control" id="yearlyReportYear">
                                    <option value="2024-25">2024-25</option>
                                    <option value="2023-24">2023-24</option>
                                </select>
                            </div>
                            <button class="btn btn-primary" onclick="generateYearlyReport()">
                                अहवाल तयार करा
                            </button>
                        </div>
                    </div>
                </div>

                <div id="reportContent" class="card mt-4" style="display: none;">
                    <div class="card-header">
                        <h4 id="reportTitle" class="card-title">अहवाल</h4>
                        <button class="btn btn-secondary" onclick="printReport()">
                            <i class="bi bi-printer"></i> प्रिंट करा
                        </button>
                    </div>
                    <div id="reportData">
                        <!-- Report data will be displayed here -->
                    </div>
                </div>
            </div>

            <!-- Settings Section -->
            <div id="settings-section" class="content-section" style="display: none;">
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">पासवर्ड बदला</h4>
                            </div>
                            <form id="changePasswordForm">
                                <div class="form-group">
                                    <label>सध्याचा पासवर्ड:</label>
                                    <input type="password" class="form-control" id="oldPassword" required>
                                </div>
                                <div class="form-group">
                                    <label>नवीन पासवर्ड:</label>
                                    <input type="password" class="form-control" id="newPassword" required>
                                </div>
                                <div class="form-group">
                                    <label>नवीन पासवर्ड पुन्हा टाका:</label>
                                    <input type="password" class="form-control" id="confirmPassword" required>
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    पासवर्ड बदला
                                </button>
                            </form>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">शिक्षक पासवर्ड रीसेट</h4>
                            </div>
                            <div id="teacherResetList">
                                <!-- Teacher list for password reset -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <!-- Add Teacher Modal -->
    <div id="addTeacherModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h4>नवीन शिक्षक जोडा</h4>
                <button class="modal-close" onclick="closeModal('addTeacherModal')">&times;</button>
            </div>
            <form id="addTeacherForm">
                <div class="form-group">
                    <label>शिक्षकाचे नाव:</label>
                    <input type="text" class="form-control" id="teacherName" required>
                </div>
                <div class="form-group">
                    <label>मोबाईल नंबर:</label>
                    <input type="tel" class="form-control" id="teacherMobile" pattern="[0-9]{10}" required>
                </div>
                <div class="form-group">
                    <label>ईमेल (वैकल्पिक):</label>
                    <input type="email" class="form-control" id="teacherEmail">
                </div>
                <div class="form-group">
                    <label>इयत्ता:</label>
                    <select class="form-control" id="teacherClass" required>
                        <option value="">निवडा</option>
                        <option value="1">पहिली</option>
                        <option value="2">दुसरी</option>
                        <option value="3">तिसरी</option>
                        <option value="4">चौथी</option>
                        <option value="5">पाचवी</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>तुकडी:</label>
                    <select class="form-control" id="teacherSection" required>
                        <option value="">निवडा</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">शिक्षक जोडा</button>
            </form>
        </div>
    </div>

    <!-- Holiday Modal -->
    <div id="holidayModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h4>सुट्टी जोडा</h4>
                <button class="modal-close" onclick="closeModal('holidayModal')">&times;</button>
            </div>
            <div class="form-group">
                <label>सुट्टीचे कारण:</label>
                <input type="text" class="form-control" id="holidayReason" placeholder="उदा: गणेश चतुर्थी">
            </div>
            <div class="form-group">
                <label>तारखा निवडा:</label>
                <div id="holidayDatesList" class="calendar-grid">
                    <!-- Dates will be populated here -->
                </div>
            </div>
            <button class="btn btn-primary" onclick="saveHolidays()">सुट्ट्या जतन करा</button>
        </div>
    </div>

    <!-- Loading Spinner -->
    <div id="loadingSpinner" class="spinner-overlay" style="display: none;">
        <div class="spinner"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../api.js"></script>
    <script src="../principal-dashboard.js"></script>
</body>
</html>
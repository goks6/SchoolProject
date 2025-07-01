<!DOCTYPE html>
<html lang="mr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>शिक्षक डॅशबोर्ड - शाळा व्यवस्थापन</title>
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
                <p id="userName">शिक्षक नाव</p>
                <small id="teacherClassInfo">इयत्ता-तुकडी</small>
            </div>
            
            <ul class="sidebar-menu">
                <li><a href="#" onclick="showSection('overview')" class="active">
                    <i class="bi bi-speedometer2"></i> डॅशबोर्ड
                </a></li>
                <li><a href="#" onclick="showSection('students')">
                    <i class="bi bi-people"></i> विद्यार्थी व्यवस्थापन
                </a></li>
                <li><a href="#" onclick="showSection('attendance')">
                    <i class="bi bi-calendar-check"></i> आजची हजेरी
                </a></li>
                <li><a href="#" onclick="showSection('study')">
                    <i class="bi bi-book"></i> आजचा अभ्यास
                </a></li>
                <li><a href="#" onclick="showSection('notice')">
                    <i class="bi bi-megaphone"></i> सूचना
                </a></li>
                <li><a href="#" onclick="showSection('calendar')">
                    <i class="bi bi-calendar3"></i> कॅलेंडर
                </a></li>
                <li><a href="#" onclick="showSection('reports')">
                    <i class="bi bi-graph-up"></i> अहवाल
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
                    <div class="breadcrumb">शिक्षक पॅनेल</div>
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
                            <i class="bi bi-check-circle"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="attendanceMarked">× बाकी</h3>
                            <p>आजची हजेरी</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="bi bi-chat-text"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="studyMessageSent">× बाकी</h3>
                            <p>अभ्यास संदेश</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon danger">
                            <i class="bi bi-calendar-event"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="todayDate2"></h3>
                            <p>आजची तारीख</p>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">आजची कामे</h4>
                    </div>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="feature-card text-center">
                                <div class="feature-icon mx-auto">
                                    <i class="bi bi-calendar-check"></i>
                                </div>
                                <h5>हजेरी घ्या</h5>
                                <button class="btn btn-primary" onclick="showSection('attendance')">
                                    हजेरी घ्या
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="feature-card text-center">
                                <div class="feature-icon mx-auto">
                                    <i class="bi bi-book"></i>
                                </div>
                                <h5>अभ्यास पाठवा</h5>
                                <button class="btn btn-primary" onclick="showSection('study')">
                                    अभ्यास पाठवा
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="feature-card text-center">
                                <div class="feature-icon mx-auto">
                                    <i class="bi bi-megaphone"></i>
                                </div>
                                <h5>सूचना पाठवा</h5>
                                <button class="btn btn-primary" onclick="showSection('notice')">
                                    सूचना पाठवा
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Students Section -->
            <div id="students-section" class="content-section" style="display: none;">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">विद्यार्थी व्यवस्थापन</h4>
                        <button class="btn btn-primary" onclick="openAddStudentModal()">
                            <i class="bi bi-plus"></i> नवीन विद्यार्थी जोडा
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>हजेरी क्र.</th>
                                    <th>नाव</th>
                                    <th>आईचे नाव</th>
                                    <th>पालकांचा मोबाईल</th>
                                    <th>जन्मतारीख</th>
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
                        <h4 class="card-title">आजची हजेरी</h4>
                        <h5>तारीख: <span id="attendanceDate"></span></h5>
                    </div>
                    <div id="attendanceList" class="attendance-list">
                        <!-- Attendance list will be populated here -->
                    </div>
                    <div class="text-center mt-4">
                        <button class="btn btn-success btn-lg" onclick="submitAttendance()">
                            <i class="bi bi-check-circle"></i> हजेरी जतन करा
                        </button>
                    </div>
                </div>
            </div>

            <!-- Study Section -->
            <div id="study-section" class="content-section" style="display: none;">
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">आजचा अभ्यास पाठवा</h4>
                            </div>
                            <form id="studyMessageForm">
                                <div class="form-group">
                                    <label>अभ्यास संदेश:</label>
                                    <textarea class="form-control" id="studyMessage" rows="5" maxlength="500" placeholder="आजचा अभ्यास लिहा..." required></textarea>
                                    <small class="text-muted"><span id="charCount">0</span>/500 अक्षरे</small>
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-send"></i> सर्व पालकांना पाठवा
                                </button>
                            </form>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">मागील अभ्यास संदेश</h4>
                            </div>
                            <div id="previousStudyMessages">
                                <!-- Previous messages will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notice Section -->
            <div id="notice-section" class="content-section" style="display: none;">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">सूचना पाठवा</h4>
                    </div>
                    <form id="noticeForm">
                        <div class="form-group">
                            <label>सूचना कोणाला पाठवायची:</label>
                            <select class="form-control" id="noticeTarget" onchange="toggleStudentSelection()">
                                <option value="all">सर्व पालकांना</option>
                                <option value="selected">निवडक विद्यार्थ्यांना</option>
                            </select>
                        </div>
                        
                        <div id="studentSelection" style="display: none;">
                            <label>विद्यार्थी निवडा:</label>
                            <div id="studentCheckboxList" class="mb-3">
                                <!-- Student checkboxes will be populated here -->
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>सूचना संदेश:</label>
                            <textarea class="form-control" id="noticeMessage" rows="4" placeholder="सूचना लिहा..." required></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-megaphone"></i> सूचना पाठवा
                        </button>
                    </form>
                </div>
            </div>

            <!-- Calendar Section -->
            <div id="calendar-section" class="content-section" style="display: none;">
                <div class="row">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">कॅलेंडर</h4>
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
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">नोट्स जोडा</h4>
                            </div>
                            <form id="reminderForm">
                                <div class="form-group">
                                    <label>तारीख:</label>
                                    <input type="date" class="form-control" id="reminderDate" required>
                                </div>
                                <div class="form-group">
                                    <label>नोट:</label>
                                    <textarea class="form-control" id="reminderText" rows="3" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">नोट जतन करा</button>
                            </form>
                            
                            <div class="mt-4">
                                <h5>माझ्या नोट्स</h5>
                                <div id="remindersList">
                                    <!-- Reminders will be loaded here -->
                                </div>
                            </div>
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
                                <h4 class="card-title">हजेरी आकडेवारी</h4>
                            </div>
                            <div id="attendanceStats">
                                <!-- Statistics will be loaded here -->
                            </div>
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
        </div>
    </div>

    <!-- Modals -->
    <!-- Add Student Modal -->
    <div id="addStudentModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h4>नवीन विद्यार्थी जोडा</h4>
                <button class="modal-close" onclick="closeModal('addStudentModal')">&times;</button>
            </div>
            <form id="addStudentForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>हजेरी क्रमांक:</label>
                            <input type="number" class="form-control" id="rollNumber" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>विद्यार्थ्याचे नाव:</label>
                            <input type="text" class="form-control" id="studentName" required>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>आईचे नाव:</label>
                            <input type="text" class="form-control" id="motherName" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>जन्मतारीख:</label>
                            <input type="date" class="form-control" id="birthDate">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>पत्ता:</label>
                    <textarea class="form-control" id="address" rows="2"></textarea>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>पालकांचा मोबाईल:</label>
                            <input type="tel" class="form-control" id="parentMobile" pattern="[0-9]{10}" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>आधार नंबर (वैकल्पिक):</label>
                            <input type="text" class="form-control" id="aadharNumber" pattern="[0-9]{12}">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>विद्यार्थी ID (वैकल्पिक):</label>
                    <input type="text" class="form-control" id="studentId">
                </div>
                <button type="submit" class="btn btn-primary">विद्यार्थी जोडा</button>
            </form>
        </div>
    </div>

    <!-- Loading Spinner -->
    <div id="loadingSpinner" class="spinner-overlay" style="display: none;">
        <div class="spinner"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../api.js"></script>
    <script src="../teacher-dashboard.js"></script>
</body>
</html>
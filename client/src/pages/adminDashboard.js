import React from 'react'

function adminDashboard() {
            const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mainContent = document.getElementById('mainContent');
        const overlay = document.getElementById('overlay');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');

        let isCollapsed = false;
        let isMobile = window.innerWidth <= 768;

        function updateLayout() {
            isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('sidebar-collapsed');
                mainContent.classList.add('sidebar-hidden');
            } else {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                mainContent.classList.remove('sidebar-hidden');
                
                if (isCollapsed) {
                    sidebar.classList.add('collapsed');
                    mainContent.classList.add('sidebar-collapsed');
                } else {
                    sidebar.classList.remove('collapsed');
                    mainContent.classList.remove('sidebar-collapsed');
                }
            }
        }

        sidebarToggle.addEventListener('click', function() {
            if (!isMobile) {
                isCollapsed = !isCollapsed;
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('sidebar-collapsed');
                
                const arrow = sidebarToggle.querySelector('span');
                arrow.textContent = isCollapsed ? '→' : '←';
            }
        });

        mobileMenuBtn.addEventListener('click', function() {
            if (isMobile) {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
            }
        });

        overlay.addEventListener('click', function() {
            if (isMobile) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });

        // Close mobile menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                if (isMobile) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                }
                
                // Update active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });

        window.addEventListener('resize', updateLayout);
        updateLayout();

        // Add interactive effects to cards
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Add hover effects to bars in chart
        document.querySelectorAll('.bar').forEach((bar, index) => {
            bar.addEventListener('mouseenter', function() {
                this.style.transform = 'scaleY(1.1)';
                this.style.background = 'linear-gradient(to top, #2563eb, #3b82f6)';
            });
            
            bar.addEventListener('mouseleave', function() {
                this.style.transform = 'scaleY(1)';
                this.style.background = 'linear-gradient(to top, #3b82f6, #60a5fa)';
            });
        });
  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      minHeight: '100vh',
    }}>
    <style>{`
                * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #C3D2D2;
            display: flex;
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* Sidebar Styles */
        .sidebar {
            width: 280px;
            background: white;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 1000;
            transform: translateX(0);
        }

        .sidebar.hidden {
            transform: translateX(-100%);
        }

        .sidebar.collapsed {
            width: 80px;
            transform: translateX(0);
        }

        .sidebar.collapsed.hidden {
            transform: translateX(-100%);
        }

        .sidebar-header {
            padding: 30px 25px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 18px;
            flex-shrink: 0;
        }

        .sidebar-title {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            opacity: 1;
            transition: opacity 0.3s ease;
            white-space: nowrap;
        }

        .sidebar.collapsed .sidebar-title {
            opacity: 0;
            width: 0;
            overflow: hidden;
        }

        .sidebar-toggle {
            position: absolute;
            top: 20px;
            right: -15px;
            width: 30px;
            height: 30px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }

        .sidebar-toggle:hover {
            background: #f8fafc;
        }

        .sidebar-nav {
            padding: 20px 0;
        }

        .nav-item {
            margin: 5px 15px;
            border-radius: 12px;
            transition: all 0.3s ease;
        }

        .nav-link {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 12px 15px;
            color: #64748b;
            text-decoration: none;
            font-weight: 500;
            border-radius: 12px;
            transition: all 0.3s ease;
        }

        .nav-link:hover {
            background: #f1f5f9;
            color: #1e293b;
        }

        .nav-link.active {
            background: #3b82f6;
            color: white;
        }

        .nav-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .nav-text {
            transition: opacity 0.3s ease;
            white-space: nowrap;
        }

        .sidebar.collapsed .nav-text {
            opacity: 0;
            width: 0;
            overflow: hidden;
        }

        .sidebar.collapsed .nav-link {
            justify-content: center;
            padding: 12px;
        }

        .nav-section {
            margin: 30px 0 15px 0;
            padding: 0 30px;
        }

        .nav-section-title {
            font-size: 12px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: opacity 0.3s ease;
        }

        .sidebar.collapsed .nav-section-title {
            opacity: 0;
            height: 0;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        /* Main Content Styles */
        .main-content {
            flex: 1;
            padding: 30px;
            overflow-y: auto;
            transition: margin-left 0.3s ease;
            margin-left: 280px;
        }

        .main-content.sidebar-hidden {
            margin-left: 0;
        }

        .main-content.sidebar-collapsed {
            margin-left: 80px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
        }

        .title-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .header h1 {
            font-size: 35px;
            font-weight: 700;
            color: #1e293b;
        }

        .header h2 {
            font-size: 45px;
            font-weight: bold;
            color: #475569;
        }

        .dashboard-text {
            font-size: 50px;
            font-weight: bold;
            color: #475569;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .icons {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .icon {
            width: 40px;
            height: 40px;
            background: #F7FAF0;
            border: none;
            border-radius: 50%;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .icon:hover {
            transform: scale(1.1);
        }

        .search-bar {
            position: relative;
        }

        .search-bar input {
            width: 300px;
            padding: 12px 20px 12px 45px;
            border: 1px solid #e2e8f0;
            border-radius: 25px;
            font-size: 14px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .search-bar::before {
            content: '🔍';
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
        }

        .profile {
            width: 40px;
            height: 40px;
            background: #F7FAF0;
            border: none;
            border-radius: 50%;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .profile:hover {
            transform: scale(1.1);
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }

        .card {
            background: white;
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            border: 1px solid #f1f5f9;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .card-title {
            font-size: 16px;
            font-weight: 600;
            color: #64748b;
        }

        .card-value {
            font-size: 36px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
        }

        .card-change {
            font-size: 14px;
            color: #64748b;
        }

        .card-change.positive {
            color: #10b981;
        }

        .card-change.negative {
            color: #ef4444;
        }

        .tasks-card {
            grid-column: 1;
            grid-row: 1 / 3;
            background: #758070;
            color: white;
        }

        .tasks-card .card-title,
        .tasks-card .card-value {
            color: white;
        }

        .task-item {
            background: rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid rgba(255,255,255,0.3);
            transition: all 0.3s ease;
        }

        .task-item:hover {
            background: rgba(255,255,255,0.2);
            transform: translateX(5px);
        }

        .task-date {
            font-size: 12px;
            opacity: 0.8;
            margin-bottom: 5px;
        }

        .task-title {
            font-weight: 600;
            margin-bottom: 5px;
        }

        .task-description {
            font-size: 14px;
            opacity: 0.9;
        }

        .transactions-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }

        .transaction-item {
            display: flex;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: #f8fafc;
            border-radius: 12px;
            transition: all 0.3s ease;
        }

        .transaction-item:hover {
            background: #e2e8f0;
            transform: translateX(5px);
        }

        .transaction-icon {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            background: #3b82f6;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: white;
        }

        .transaction-details h4 {
            font-weight: 600;
            margin-bottom: 5px;
        }

        .transaction-details p {
            font-size: 14px;
            color: #64748b;
        }

        .transaction-type {
            margin-left: auto;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .payment {
            background: #dcfce7;
            color: #166534;
        }

        .maintenance {
            background: #fef3c7;
            color: #92400e;
        }

        .maintenance-requests {
            margin-top: 20px;
        }

        .maintenance-item {
            display: flex;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: #f8fafc;
            border-radius: 12px;
            transition: all 0.3s ease;
        }

        .maintenance-item:hover {
            background: #e2e8f0;
            transform: translateX(5px);
        }

        .maintenance-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-left: auto;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 14px;
        }

        .chart-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
        }

        .chart-container {
            height: 300px;
            position: relative;
        }

        .bar-chart {
            display: flex;
            align-items: end;
            height: 200px;
            gap: 15px;
            margin: 20px 0;
        }

        .bar {
            flex: 1;
            background: linear-gradient(to top, #3b82f6, #60a5fa);
            border-radius: 6px 6px 0 0;
            min-height: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .bar:hover {
            transform: scaleY(1.1);
            background: linear-gradient(to top, #2563eb, #3b82f6);
        }

        .chart-labels {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #64748b;
        }

        .pie-chart {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: conic-gradient(
                #10b981 0deg 120deg,
                #f59e0b 120deg 200deg,
                #3b82f6 200deg 280deg,
                #8b5cf6 280deg 360deg
            );
            margin: 0 auto;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .pie-chart::before {
            content: '';
            width: 120px;
            height: 120px;
            background: white;
            border-radius: 50%;
            position: absolute;
        }

        .pie-center {
            position: relative;
            z-index: 1;
            text-align: center;
        }

        .pie-amount {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
        }

        .legend {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 20px;
            justify-content: center;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
        }

        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }

        .see-all {
            color: #3b82f6;
            font-size: 14px;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .see-all:hover {
            color: #2563eb;
        }

        .no-records {
            text-align: center;
            color: #64748b;
            font-style: italic;
            padding: 40px;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .card {
            animation: fadeInUp 0.6s ease forwards;
        }

        .card:nth-child(1) { animation-delay: 0.1s; }
        .card:nth-child(2) { animation-delay: 0.2s; }
        .card:nth-child(3) { animation-delay: 0.3s; }

        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .overlay.active {
            opacity: 1;
            visibility: visible;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
            display: none;
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1001;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* Mobile Responsiveness */
        @media (max-width: 1200px) {
            .dashboard-grid {
                grid-template-columns: 1fr 1fr;
            }
            
            .chart-section {
                grid-template-columns: 1fr 1fr;
            }
        }

        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: block;
            }

            .sidebar {
                width: 280px;
                transform: translateX(-100%);
            }

            .sidebar.open {
                transform: translateX(0);
            }

            .sidebar.collapsed {
                width: 280px;
                transform: translateX(-100%);
            }

            .sidebar.collapsed.open {
                transform: translateX(0);
            }

            .main-content {
                margin-left: 0;
                padding: 20px;
                padding-top: 80px;
            }

            .main-content.sidebar-hidden,
            .main-content.sidebar-collapsed {
                margin-left: 0;
            }

            .dashboard-grid,
            .transactions-section,
            .chart-section {
                grid-template-columns: 1fr;
            }
            
            .search-bar input {
                width: 200px;
            }

            .sidebar-toggle {
                display: none;
            }

            .header {
                flex-direction: column;
                gap: 20px;
                align-items: flex-start;
            }

            .header-right {
                width: 100%;
                justify-content: space-between;
            }
        }
    `}</style>

        <div className="overlay" id="overlay"></div>
    
    <button className="mobile-menu-btn" id="mobileMenuBtn">
        <span>☰</span>
    </button>
    
    <div className="sidebar" id="sidebar">
        <div className="sidebar-header">
            <div className="sidebar-title">Ambulo Properties</div>
        </div>
        
        <div className="sidebar-toggle" id="sidebarToggle">
            <span>←</span>
        </div>
        
        <nav className="sidebar-nav">
            <div className="nav-item">
                <a href="#" className="nav-link active">
                    <div className="nav-icon">📊</div>
                    <span className="nav-text">Dashboard</span>
                </a>
            </div>
            
            <div className="nav-section">
                <div className="nav-section-title">Property Management</div>
            </div>
            
            <div className="nav-item">
                <a href="#" className="nav-link">
                    <div className="nav-icon">🏠</div>
                    <span className="nav-text">Properties</span>
                </a>
            </div>
            
            <div className="nav-item">
                <a href="#" className="nav-link">
                    <div className="nav-icon">👥</div>
                    <span className="nav-text">Tenants</span>
                </a>
            </div>
            
            <div className="nav-item">
                <a href="#" className="nav-link">
                    <div className="nav-icon">📋</div>
                    <span className="nav-text">Leases</span>
                </a>
            </div>
            
            <div className="nav-section">
                <div className="nav-section-title">Operations</div>
            </div>
            
            <div className="nav-item">
                <a href="#" className="nav-link">
                    <div className="nav-icon">🔧</div>
                    <span className="nav-text">Maintenance</span>
                </a>
            </div>
            
            <div className="nav-item">
                <a href="#" className="nav-link">
                    <div className="nav-icon">💰</div>
                    <span className="nav-text">Payments</span>
                </a>
            </div>
            
            <div className="nav-item">
                <a href="#" className="nav-link">
                    <div className="nav-icon">📊</div>
                    <span className="nav-text">Reports</span>
                </a>
            </div>
            
            <div className="nav-section">
                <div className="nav-section-title">Settings</div>
            </div>
            
            <div className="nav-item">
                <a href="#" className="nav-link">
                    <div className="nav-icon">⚙️</div>
                    <span className="nav-text">Settings</span>
                </a>
            </div>
            
            <div className="nav-item">
                <a href="#" className="nav-link">
                    <div className="nav-icon">👤</div>
                    <span className="nav-text">Profile</span>
                </a>
            </div>
        </nav>
    </div>

    <div className="main-content" id="mainContent">
        <div className="header">
            <div className="title-section">
                <div>
                    <h1>Hello, Kei!</h1>
                    <h2>Dashboard</h2>
                </div>
            </div>

            <div className="header-right">
                <div className="search-bar">
                    <input type="text" placeholder="Search Anything..."/>
                </div>
                <button className="icon notification">🔔</button>
                <button className="icon inbox">✉️</button>
                <button className="profile">K</button>
            </div>
        </div>

        <div className="dashboard-grid">
            <div className="card tasks-card">
                <div className="card-header">
                    <h3 className="card-title">Tasks 📋</h3>
                </div>
                <div className="task-item">
                    <div className="task-date">📅 May 13, 2025 at 1:00 PM</div>
                    <div className="task-title">Property Checking at STI</div>
                </div>
                <div className="task-item">
                    <div className="task-date">📅 May 14, 2025 at 12:00 PM</div>
                    <div className="task-title">List Unit 9 - Silong, Cavite</div>
                </div>
                <div className="task-item">
                    <div className="task-date">📅 May 15, 2025 at 09:00 AM</div>
                    <div className="task-title">New Tenant welcoming</div>
                </div>
                <div className="task-item">
                    <div className="task-date">📅 May 20, 2025 at 3:00 PM</div>
                    <div className="task-title">Maintenance at Unit 11 103</div>
                </div>
                <div className="task-item">
                    <div className="task-date">📅 May 22, 2025 at 07:00 PM</div>
                    <div className="task-title">Meralco Bill Due Date</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Total Property</h3>
                </div>
                <div className="card-value">12</div>
                <div className="card-change negative">📉 20% Last month total 12</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Total number of Transaction</h3>
                </div>
                <div className="card-value">36</div>
                <div className="card-change negative">📉 20% Last month total 24</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Last Transaction</h3>
                    <a href="#" className="see-all">See All</a>
                </div>
                <div className="transaction-item">
                    <div className="transaction-icon">🏠</div>
                    <div className="transaction-details">
                        <h4>Unit 1, 101</h4>
                        <p>12 April 2025, 9:24</p>
                    </div>
                    <span className="transaction-type payment">Payment</span>
                </div>
                <div className="transaction-item">
                    <div className="transaction-icon">🔧</div>
                    <div className="transaction-details">
                        <h4>Unit 3, 102</h4>
                        <p>12 April 2025, 9:20</p>
                    </div>
                    <span className="transaction-type maintenance">Maintenance</span>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Total Income</h3>
                </div>
                <div className="card-value">₱150k</div>
                <div className="card-change positive">📈 30% Last month total ₱90k</div>
            </div>
        </div>

        <div className="transactions-section">
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Maintenance Request</h3>
                    <a href="#" className="see-all">See All</a>
                </div>
                <div className="maintenance-requests">
                    <div className="maintenance-item">
                        <div className="transaction-icon">🔧</div>
                        <div className="transaction-details">
                            <h4>Plumbing | Unit 3, 102</h4>
                            <p>Broken Garbage</p>
                            <small>Request ID: MR-2025</small>
                        </div>
                        <div className="maintenance-avatar">KL</div>
                    </div>
                    <div className="maintenance-item">
                        <div className="transaction-icon">⚡</div>
                        <div className="transaction-details">
                            <h4>Electrical | Unit 2, 101</h4>
                            <p>Broken Switch</p>
                            <small>Request ID: MR-2025</small>
                        </div>
                        <div className="maintenance-avatar">JD</div>
                    </div>
                    <div className="maintenance-item">
                        <div className="transaction-icon">❄️</div>
                        <div className="transaction-details">
                            <h4>HVAC | Unit 2, 103</h4>
                            <p>Non Functional Fan</p>
                        </div>
                        <div className="maintenance-avatar">RB</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Late Payments</h3>
                </div>
                <div className="no-records">No Records</div>
            </div>
        </div>

        <div className="chart-section">
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Report Monthly Sales</h3>
                    <select style={{border: 'none', background: 'transparent', color: '#64748b'}}>
                        <option>📅 Weekday</option>
                    </select>
                </div>
                <div className="chart-container">
                    <div className="bar-chart">
                        <div className="bar" style={{height: '60%'}}></div>
                        <div className="bar" style={{height: '80%'}}></div>
                        <div className="bar" style={{height: '70%'}}></div>
                        <div className="bar" style={{height: '40%'}}></div>
                        <div className="bar" style={{height: '90%'}}></div>
                        <div className="bar" style={{height: '85%'}}></div>
                        <div className="bar" style={{height: '95%'}}></div>
                    </div>
                    <div className="chart-labels">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Cost Breakdown</h3>
                    <a href="#" className="see-all">See Details</a>
                </div>
                <div className="chart-container">
                    <div className="pie-chart">
                        <div className="pie-center">
                            <div className="pie-amount">₱40,750</div>
                            <div style={{fontSize: '12px', color: '#64748b'}}>Total</div>
                        </div>
                    </div>
                    <div className="legend">
                        <div className="legend-item">
                        <div className="legend-color" style={{background: '#10b981'}}></div>
                        <span>Maintenance</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{background: '#f59e0b'}}></div>
                            <span>Utilities</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{background: '#8b5cf6'}}></div>
                            <span>Other</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Property Overview</h3>
                </div>
                <div className="chart-container">
                    <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '200px'}}>
                        <div style={{textAlign: 'center'}}>
                            <div style={{fontSize: '48px', fontWeight: 700, color: '#10b981'}}>85%</div>
                            <div style={{fontSize: '14px', color: '#64748b'}}>Occupied</div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <div style={{fontSize: '48px', fontWeight: 700, color: '#ef4444'}}>15%</div>
                            <div style={{fontSize: '14px', color: '#64748b'}}>Vacant</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
  )
}

export default adminDashboard
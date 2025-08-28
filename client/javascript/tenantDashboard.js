        // Calendar functionality with proper date handling
        const currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        function getDaysInMonth(month, year) {
            return new Date(year, month + 1, 0).getDate();
        }

        function getFirstDayOfMonth(month, year) {
            const firstDay = new Date(year, month, 1).getDay();
            return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday (0) to be last (6)
        }

        function generateCalendar(month, year) {
            const daysInMonth = getDaysInMonth(month, year);
            const firstDay = getFirstDayOfMonth(month, year);
            const calendarGrid = document.querySelector('.calendar-grid');
            
            // Clear existing days (keep headers)
            const dayHeaders = calendarGrid.querySelectorAll('.day-header');
            calendarGrid.innerHTML = '';
            dayHeaders.forEach(header => calendarGrid.appendChild(header));

            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDay; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'day';
                calendarGrid.appendChild(emptyDay);
            }

            // Add days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'day';
                dayElement.textContent = day;
                
                // Highlight today
                const today = new Date();
                if (day === today.getDate() && 
                    month === today.getMonth() && 
                    year === today.getFullYear()) {
                    dayElement.classList.add('today');
                }

                // Add click functionality
                dayElement.addEventListener('click', function() {
                    // Remove previous selection
                    document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    // You could add functionality here to show events for selected date
                    console.log(`Selected date: ${month + 1}/${day}/${year}`);
                });

                calendarGrid.appendChild(dayElement);
            }
        }

        function updateCalendar() {
            const monthTitle = document.querySelector('.month-title');
            monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
            generateCalendar(currentMonth, currentYear);
        }

        // Calendar navigation
        document.querySelectorAll('.nav-btn').forEach((btn, index) => {
            btn.addEventListener('click', function() {
                if (index === 0) {
                    currentMonth--;
                    if (currentMonth < 0) {
                        currentMonth = 11;
                        currentYear--;
                    }
                } else {
                    currentMonth++;
                    if (currentMonth > 11) {
                        currentMonth = 0;
                        currentYear++;
                    }
                }
                updateCalendar();
            });
        });

        // Enhanced responsive card interactions
        function setupCardInteractions() {
            document.querySelectorAll('.card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    if (window.innerWidth > 768) { // Only on desktop
                        this.style.transform = 'translateY(-8px)';
                    }
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        }

        // Maintenance request interactions
        document.querySelectorAll('.maintenance-item').forEach(item => {
            item.addEventListener('click', function() {
                const requestId = this.querySelector('.maintenance-id').textContent;
                const status = this.querySelector('.status').textContent;
                
                // Mock functionality - would open detailed view
                showNotification(`Viewing details for ${requestId} - Status: ${status}`);
            });
        });

        // Transaction interactions
        document.querySelectorAll('.transaction-item').forEach(item => {
            item.addEventListener('click', function() {
                const type = this.querySelector('.transaction-type').textContent;
                const date = this.querySelector('.transaction-date').textContent;
                
                showNotification(`Transaction: ${type} on ${date}`);
            });
        });

        // Pay Now button with loading state
        document.querySelector('.pay-now-btn').addEventListener('click', function() {
            const btn = this;
            const originalText = btn.textContent;
            
            // Show loading state
            btn.textContent = 'Processing...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
            
            // Mock payment processing
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';
                showNotification('Payment gateway would open here in a real application');
            }, 1500);
        });

        // Notification system
        function showNotification(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 12px;
                padding: 16px 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                max-width: 300px;
                word-wrap: break-word;
                animation: slideInRight 0.3s ease;
                color: #1f2937;
                font-weight: 500;
            `;
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        // Add notification animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .day.selected {
                background: linear-gradient(135deg, #f59e0b, #d97706) !important;
                color: white !important;
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);

        // See All links with enhanced functionality
        document.querySelectorAll('.see-all').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const cardTitle = this.closest('.card').querySelector('.card-title').textContent;
                showNotification(`Opening detailed view for ${cardTitle}`);
            });
        });

        // Responsive behavior
        function handleResize() {
            const width = window.innerWidth;
            
            // Adjust calendar on smaller screens
            if (width <= 480) {
                document.querySelectorAll('.day').forEach(day => {
                    day.style.fontSize = '12px';
                });
            } else if (width <= 768) {
                document.querySelectorAll('.day').forEach(day => {
                    day.style.fontSize = '14px';
                });
            } else {
                document.querySelectorAll('.day').forEach(day => {
                    day.style.fontSize = '';
                });
            }
        }

        // Touch support for mobile devices
        function addTouchSupport() {
            document.querySelectorAll('.card, .maintenance-item, .transaction-item').forEach(element => {
                element.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.98)';
                });
                
                element.addEventListener('touchend', function() {
                    this.style.transform = '';
                });
            });
        }

        // Keyboard navigation for accessibility
        function setupKeyboardNavigation() {
            document.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowLeft' && e.ctrlKey) {
                    document.querySelectorAll('.nav-btn')[0].click();
                } else if (e.key === 'ArrowRight' && e.ctrlKey) {
                    document.querySelectorAll('.nav-btn')[1].click();
                }
            });
        }

        // Initialize everything
        document.addEventListener('DOMContentLoaded', function() {
            updateCalendar();
            setupCardInteractions();
            addTouchSupport();
            setupKeyboardNavigation();
            handleResize();
            
            // Add resize listener
            window.addEventListener('resize', handleResize);
            
            // Show welcome notification
            setTimeout(() => {
                showNotification('Welcome to your Tenant Dashboard!');
            }, 1000);
        });

        // Add smooth scrolling for better UX
        document.documentElement.style.scrollBehavior = 'smooth';
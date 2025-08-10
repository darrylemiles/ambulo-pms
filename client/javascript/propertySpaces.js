        document.addEventListener('DOMContentLoaded', () => {
            fetch('/components/navbar.html')
                .then(res => res.text())
                .then(data => {
                    document.getElementById('navbar-placeholder').innerHTML = data;
                    setupNavbarFeatures();
                });

            function setupNavbarFeatures() {
                const navbar = document.querySelector('header') || document.getElementById('navbar');
                const revealElements = document.querySelectorAll('.reveal-element');

                const revealOnScroll = () => {
                    revealElements.forEach(element => {
                        const elementTop = element.getBoundingClientRect().top;
                        const elementVisible = 150;

                        if (elementTop < window.innerHeight - elementVisible) {
                            element.classList.add('revealed');
                        }
                    });
                };

                // Sticky navbar
                const handleScroll = () => {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                    if (navbar) {
                        if (scrollTop > 50) {
                            navbar.classList.add('scrolled');
                        } else {
                            navbar.classList.remove('scrolled');
                        }
                    }

                    revealOnScroll();
                };

                // Smooth scrolling
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const target = document.querySelector(this.getAttribute('href'));
                        if (target) {
                            const offsetTop = target.offsetTop - 80;
                            window.scrollTo({
                                top: offsetTop,
                                behavior: 'smooth'
                            });
                        }
                    });
                });

                // Event listeners
                window.addEventListener('scroll', handleScroll);
                window.addEventListener('load', revealOnScroll);
                revealOnScroll(); // Initial reveal
            }

            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.reveal-element').forEach(el => {
                observer.observe(el);
            });

            const elementsInView = document.querySelectorAll('.reveal-element');
            elementsInView.forEach((el, index) => {
                setTimeout(() => {
                    if (el.getBoundingClientRect().top < window.innerHeight) {
                        el.classList.add('revealed');
                    }
                }, index * 100);
            });
        });

            //interactive hover effects
            document.querySelectorAll('.property-card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-12px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
            
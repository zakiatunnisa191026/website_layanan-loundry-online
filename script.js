/**
 * FreshKlin Laundry Online - Main JavaScript
 * Handles navigation, interactive calculator, real-time tracking,
 * booking form processing, FAQ accordion, and modal dialogs.
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initServiceFilters();
    initCalculator();
    initTracking();
    initBookingForm();
    initAccordion();
    initDatePicker();
});

/* ========================================================
   1. NAVIGATION & SCROLL HIGHLIGHT
   ======================================================== */
function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navItems = document.querySelectorAll('.nav-links .nav-item');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });
    }

    // Close menu when clicking any nav item
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        });
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section[id], header[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.pageYOffset + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href === `#${current}`) {
                item.classList.add('active');
            }
        });
    });
}

/* ========================================================
   2. SERVICE CARDS & CATEGORY FILTERS
   ======================================================== */
function initServiceFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            serviceCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // "Pilih Layanan Ini" click handler
    const selectButtons = document.querySelectorAll('.select-service-btn');
    const calcServiceSelect = document.getElementById('calcService');
    const orderFormService = document.getElementById('orderService');

    selectButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const serviceName = e.target.getAttribute('data-service');
            const targetSection = document.getElementById('kalkulator');

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });

                // Select matching option in calculator
                if (calcServiceSelect) {
                    for (let option of calcServiceSelect.options) {
                        const optName = option.getAttribute('data-name') || option.text;
                        if (optName.toLowerCase().includes(serviceName.toLowerCase()) || 
                            serviceName.toLowerCase().includes(optName.toLowerCase())) {
                            calcServiceSelect.value = option.value;
                            calcServiceSelect.dispatchEvent(new Event('change'));
                            break;
                        }
                    }
                }

                showToast(`Layanan "${serviceName}" dipilih. Cek estimasi biaya di bawah!`, 'info');
            }
        });
    });
}

/* ========================================================
   3. SMART COST CALCULATOR
   ======================================================== */
function initCalculator() {
    const calcService = document.getElementById('calcService');
    const calcWeight = document.getElementById('calcWeight');
    const weightDisplay = document.getElementById('weightDisplay');
    const calcSpeedInputs = document.querySelectorAll('input[name="calcSpeed"]');
    const calcFragrance = document.getElementById('calcFragrance');

    // Summary Elements
    const summaryServiceName = document.getElementById('summaryServiceName');
    const summaryQty = document.getElementById('summaryQty');
    const summaryRate = document.getElementById('summaryRate');
    const summarySpeed = document.getElementById('summarySpeed');
    const summaryFragrance = document.getElementById('summaryFragrance');
    const calcTotalPrice = document.getElementById('calcTotalPrice');
    const btnApplyToBooking = document.getElementById('btnApplyToBooking');

    function calculate() {
        if (!calcService || !calcWeight) return;

        const selectedOption = calcService.options[calcService.selectedIndex];
        const unitPrice = parseInt(calcService.value) || 0;
        const serviceFullName = selectedOption.getAttribute('data-name') || selectedOption.text;
        const minQty = parseInt(selectedOption.getAttribute('data-min')) || 1;
        const isKg = !serviceFullName.toLowerCase().includes('sepatu') && 
                     !serviceFullName.toLowerCase().includes('bed cover') && 
                     !serviceFullName.toLowerCase().includes('jas');

        const qty = parseInt(calcWeight.value) || 1;
        const effectiveQty = Math.max(qty, minQty);
        const unitSuffix = isKg ? 'Kg' : 'Pcs';

        // Update slider label
        weightDisplay.textContent = `${qty} ${unitSuffix}`;

        // Speed surcharge
        let speedSurcharge = 0;
        let speedLabel = 'Reguler (2-3 Hari)';
        calcSpeedInputs.forEach(radio => {
            if (radio.checked) {
                speedSurcharge = parseInt(radio.value) || 0;
                if (speedSurcharge > 0) {
                    speedLabel = 'Kilat 1 Hari (+Rp 5.000/kg)';
                }
            }
        });

        // Fragrance
        const fragranceVal = calcFragrance ? calcFragrance.value : 'Ocean Fresh';

        // Total computation
        const total = (effectiveQty * unitPrice) + (isKg ? effectiveQty * speedSurcharge : speedSurcharge);

        // Update UI summary
        if (summaryServiceName) summaryServiceName.textContent = serviceFullName;
        if (summaryQty) summaryQty.textContent = `${qty} ${unitSuffix}` + (qty < minQty ? ` (Min. ${minQty} ${unitSuffix})` : '');
        if (summaryRate) summaryRate.textContent = formatRupiah(unitPrice) + ` / ${unitSuffix}`;
        if (summarySpeed) summarySpeed.textContent = speedLabel;
        if (summaryFragrance) summaryFragrance.textContent = fragranceVal.split(' ')[0];
        if (calcTotalPrice) calcTotalPrice.textContent = formatRupiah(total);
    }

    if (calcService) calcService.addEventListener('change', calculate);
    if (calcWeight) calcWeight.addEventListener('input', calculate);
    calcSpeedInputs.forEach(radio => radio.addEventListener('change', calculate));
    if (calcFragrance) calcFragrance.addEventListener('change', calculate);

    // Initial calculation
    calculate();

    // Button to transfer calculated data to booking form
    if (btnApplyToBooking) {
        btnApplyToBooking.addEventListener('click', () => {
            const bookingSection = document.getElementById('pesan');
            const orderService = document.getElementById('orderService');
            const orderWeight = document.getElementById('orderWeight');
            const orderFragrance = document.getElementById('orderFragrance');

            const selectedOption = calcService.options[calcService.selectedIndex];
            const serviceFullName = selectedOption.getAttribute('data-name') || selectedOption.text;
            const qty = calcWeight.value;
            const isKg = !serviceFullName.toLowerCase().includes('sepatu') && 
                         !serviceFullName.toLowerCase().includes('bed cover') && 
                         !serviceFullName.toLowerCase().includes('jas');

            // Pre-fill Order Form
            if (orderWeight) {
                orderWeight.value = `${qty} ${isKg ? 'Kg' : 'Pcs'}`;
            }

            if (orderService) {
                for (let opt of orderService.options) {
                    if (opt.text.toLowerCase().includes(serviceFullName.substring(0, 10).toLowerCase())) {
                        orderService.value = opt.value;
                        break;
                    }
                }
            }

            if (orderFragrance && calcFragrance) {
                const selectedFragrance = calcFragrance.value.split(' ')[0];
                for (let opt of orderFragrance.options) {
                    if (opt.value.includes(selectedFragrance)) {
                        orderFragrance.value = opt.value;
                        break;
                    }
                }
            }

            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: 'smooth' });
                showToast('Estimasi berhasil diterapkan ke Formulir Pemesanan!', 'success');
            }
        });
    }
}

/* ========================================================
   4. LIVE ORDER TRACKING
   ======================================================== */
function initTracking() {
    const trackInput = document.getElementById('trackInput');
    const btnTrack = document.getElementById('btnTrack');
    const trackingResult = document.getElementById('trackingResult');
    const hintButtons = document.querySelectorAll('.badge-hint');

    // Mock Sample Data
    const mockOrders = {
        'FK-88210': {
            id: 'FK-88210',
            name: 'Budi Santoso',
            service: 'Cuci Komplit (5 Kg)',
            date: '09 Nov 2026',
            statusText: 'Sedang Dicuci & Kering',
            statusType: 'progress',
            currentStep: 3,
            time1: '08:30 WIB',
            time2: '09:15 WIB',
            time3: '10:00 WIB',
            time4: 'Estimasi 13:00 WIB',
            time5: 'Estimasi 15:00 WIB',
            note: 'Cucian sedang dalam tahap proses pencucian higienis dan sterilisasi anti-bakteri.'
        },
        'FK-99342': {
            id: 'FK-99342',
            name: 'Siti Rahma',
            service: 'Express 4 Jam (3 Kg)',
            date: '09 Nov 2026',
            statusText: 'Sedang Diantar Kurir',
            statusType: 'progress',
            currentStep: 5,
            time1: '07:00 WIB',
            time2: '07:30 WIB',
            time3: '08:15 WIB',
            time4: '09:45 WIB',
            time5: '10:20 WIB (Dalam Perjalanan)',
            note: 'Kurir (Mas Dani) sedang dalam perjalanan menuju alamat Anda. Harap pastikan HP aktif.'
        },
        'FK-77105': {
            id: 'FK-77105',
            name: 'Hendra Wijaya',
            service: 'Cuci Sepatu Deep Clean (2 Psg)',
            date: '08 Nov 2026',
            statusText: 'Selesai & Diterima',
            statusType: 'completed',
            currentStep: 5,
            isFinished: true,
            time1: '08 Nov 10:00 WIB',
            time2: '08 Nov 11:30 WIB',
            time3: '08 Nov 14:00 WIB',
            time4: '09 Nov 08:30 WIB',
            time5: '09 Nov 09:15 WIB (Selesai)',
            note: 'Pesanan telah selesai diantar dan diterima dengan baik. Terima kasih atas kepercayaan Anda!'
        }
    };

    function executeTracking(query) {
        const cleanQuery = query.trim().toUpperCase();
        if (!cleanQuery) {
            showToast('Silakan masukkan nomor resi atau no. WhatsApp Anda.', 'info');
            return;
        }

        // Check local storage for orders placed by user in this browser
        let localOrders = [];
        try {
            localOrders = JSON.parse(localStorage.getItem('freshklin_orders')) || [];
        } catch (e) {
            localOrders = [];
        }

        let orderData = mockOrders[cleanQuery];

        // Search in local stored orders
        if (!orderData) {
            const foundLocal = localOrders.find(ord => 
                ord.id.toUpperCase() === cleanQuery || 
                (ord.phone && ord.phone.replace(/[^0-9]/g, '') === cleanQuery.replace(/[^0-9]/g, ''))
            );

            if (foundLocal) {
                orderData = {
                    id: foundLocal.id,
                    name: foundLocal.name,
                    service: `${foundLocal.service} (${foundLocal.weight})`,
                    date: foundLocal.date,
                    statusText: 'Pesanan Diterima - Menunggu Kurir',
                    statusType: 'progress',
                    currentStep: 1,
                    time1: `${foundLocal.scheduleTime}`,
                    time2: 'Estimasi Menyesuaikan',
                    time3: 'Menunggu Cucian Tiba',
                    time4: 'Menunggu Proses Cuci',
                    time5: 'Menunggu Selesai',
                    note: 'Pesanan Anda telah masuk antrian. Kurir kami akan mengonfirmasi via WhatsApp sebelum penjemputan.'
                };
            }
        }

        // If not found in mock or storage, generate a realistic active response
        if (!orderData) {
            orderData = {
                id: cleanQuery.startsWith('FK-') ? cleanQuery : `FK-${Math.floor(10000 + Math.random() * 90000)}`,
                name: 'Pelanggan FreshKlin',
                service: 'Cuci Komplit Reguler',
                date: 'Hari ini',
                statusText: 'Proses Pencucian',
                statusType: 'progress',
                currentStep: 3,
                time1: '08:00 WIB',
                time2: '09:00 WIB',
                time3: '10:30 WIB',
                time4: 'Estimasi 14:00 WIB',
                time5: 'Estimasi 16:30 WIB',
                note: 'Cucian Anda saat ini sedang dalam proses pembersihan higienis di mesin cuci.'
            };
        }

        renderTrackingView(orderData);
    }

    function renderTrackingView(data) {
        document.getElementById('resOrderId').textContent = data.id;
        document.getElementById('resCustomerName').textContent = `Pesanan: ${data.name}`;
        document.getElementById('resOrderMeta').textContent = `Layanan: ${data.service} | Tanggal: ${data.date}`;
        
        const resStatusText = document.getElementById('resStatusText');
        const resStatusBadge = document.getElementById('resStatusBadge');
        resStatusText.textContent = data.statusText;

        if (data.statusType === 'completed' || data.isFinished) {
            resStatusBadge.className = 'track-status-pill status-completed';
            resStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>' + data.statusText + '</span>';
        } else {
            resStatusBadge.className = 'track-status-pill status-in-progress';
            resStatusBadge.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> <span>' + data.statusText + '</span>';
        }

        // Update timestamps
        document.getElementById('timeStep1').textContent = data.time1;
        document.getElementById('timeStep2').textContent = data.time2;
        document.getElementById('timeStep3').textContent = data.time3;
        document.getElementById('timeStep4').textContent = data.time4;
        document.getElementById('timeStep5').textContent = data.time5;

        // Update stepper step classes (1 to 5)
        for (let i = 1; i <= 5; i++) {
            const stepEl = document.getElementById(`step${i}`);
            stepEl.classList.remove('completed', 'active');

            if (data.isFinished) {
                stepEl.classList.add('completed');
            } else if (i < data.currentStep) {
                stepEl.classList.add('completed');
            } else if (i === data.currentStep) {
                stepEl.classList.add('active');
            }
        }

        document.getElementById('resNotes').innerHTML = `<i class="fa-solid fa-circle-info"></i> ${data.note}`;

        trackingResult.classList.remove('hidden');
        trackingResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        showToast(`Status pesanan ${data.id} berhasil dimuat!`, 'success');
    }

    if (btnTrack && trackInput) {
        btnTrack.addEventListener('click', () => {
            executeTracking(trackInput.value);
        });

        trackInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeTracking(trackInput.value);
            }
        });
    }

    // Hint buttons click
    hintButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sampleId = btn.getAttribute('data-sample');
            trackInput.value = sampleId;
            executeTracking(sampleId);
        });
    });
}

/* ========================================================
   5. BOOKING FORM & WHATSAPP INTEGRATION
   ======================================================== */
function initBookingForm() {
    const orderForm = document.getElementById('orderForm');
    const orderModal = document.getElementById('orderModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalDoneBtn = document.getElementById('modalDoneBtn');
    const modalWaBtn = document.getElementById('modalWaBtn');

    if (!orderForm) return;

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get Form Values
        const name = document.getElementById('orderName').value.trim();
        const phone = document.getElementById('orderPhone').value.trim();
        const address = document.getElementById('orderAddress').value.trim();
        const service = document.getElementById('orderService').value;
        const weight = document.getElementById('orderWeight').value.trim();
        const date = document.getElementById('orderDate').value;
        const time = document.getElementById('orderTime').value;
        const fragrance = document.getElementById('orderFragrance').value;
        const payment = document.getElementById('orderPayment').value;
        const notes = document.getElementById('orderNotes').value.trim() || 'Tidak ada catatan khusus';

        // Validation
        if (!name || !phone || !address || !date) {
            showToast('Harap lengkapi semua data wajib bertanda bintang (*)', 'info');
            return;
        }

        // Generate Order ID
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const orderId = `FK-${randomNum}`;

        // Save order in localStorage
        const newOrder = {
            id: orderId,
            name: name,
            phone: phone,
            address: address,
            service: service,
            weight: weight,
            date: date,
            scheduleTime: time,
            fragrance: fragrance,
            payment: payment,
            notes: notes,
            createdAt: new Date().toISOString()
        };

        try {
            let savedOrders = JSON.parse(localStorage.getItem('freshklin_orders')) || [];
            savedOrders.unshift(newOrder);
            localStorage.setItem('freshklin_orders', JSON.stringify(savedOrders.slice(0, 20)));
        } catch (err) {
            console.error('Failed to save order to localStorage', err);
        }

        // Construct WhatsApp Message
        const waMessage = 
`*PESANAN LAUNDRY ONLINE - FRESHKLIN*
---------------------------------------
*No. Resi:* ${orderId}
*Nama:* ${name}
*No. WhatsApp:* ${phone}
*Alamat Jemput:* ${address}

*Paket Layanan:* ${service}
*Perkiraan Berat/Qty:* ${weight}
*Jadwal Jemput:* ${formatTanggalIndo(date)} (${time})
*Pilihan Parfum:* ${fragrance}
*Metode Bayar:* ${payment}
*Catatan Khusus:* ${notes}
---------------------------------------
Halo admin FreshKlin, saya ingin mengonfirmasi jadwal penjemputan cucian ini. Terima kasih!`;

        const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`;

        // Populate Modal Details
        document.getElementById('modalOrderId').textContent = orderId;
        document.getElementById('modalCustomerName').textContent = name;
        document.getElementById('modalPhone').textContent = phone;
        document.getElementById('modalService').textContent = service;
        document.getElementById('modalWeight').textContent = weight;
        document.getElementById('modalSchedule').textContent = `${formatTanggalIndo(date)} (${time})`;
        document.getElementById('modalFragrance').textContent = fragrance;
        document.getElementById('modalPayment').textContent = payment;
        document.getElementById('modalAddress').textContent = address;

        if (modalWaBtn) {
            modalWaBtn.href = waUrl;
        }

        // Open Confirmation Modal
        openModal();

        // Also prefill tracking input with this new order ID
        const trackInput = document.getElementById('trackInput');
        if (trackInput) {
            trackInput.value = orderId;
        }

        // Reset form
        orderForm.reset();
        initDatePicker();
    });

    function openModal() {
        if (orderModal) {
            orderModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (orderModal) {
            orderModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeModal);

    // Close on clicking backdrop
    if (orderModal) {
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) {
                closeModal();
            }
        });
    }
}

/* ========================================================
   6. FAQ ACCORDION
   ======================================================== */
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const body = item.querySelector('.accordion-body');
            const isActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherBody = otherItem.querySelector('.accordion-body');
                if (otherBody) otherBody.style.maxHeight = null;
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                body.style.maxHeight = body.scrollHeight + 40 + 'px';
            }
        });
    });
}

/* ========================================================
   7. DATE PICKER DEFAULTS
   ======================================================== */
function initDatePicker() {
    const dateInput = document.getElementById('orderDate');
    if (!dateInput) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;

    dateInput.min = formattedToday;
    if (!dateInput.value) {
        dateInput.value = formattedToday;
    }
}

/* ========================================================
   8. UTILITY FUNCTIONS (TOAST & CURRENCY)
   ======================================================== */
function formatRupiah(amount) {
    return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatTanggalIndo(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];

    return `${day} ${month} ${year}`;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconClass = type === 'success' ? 'fa-solid fa-circle-check text-success' : 'fa-solid fa-circle-info';
    toast.innerHTML = `<i class="${iconClass}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 4000);
}
